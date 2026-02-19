'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/lib/store'
import { selectTestQuestions, getCategoryLabel, getCategoryColor, scoreToPercentile } from '@/lib/utils'
import AnswerOption, { LABELS } from '@/components/AnswerOption'
import type { AnswerState } from '@/components/AnswerOption'
import ProgressBar from '@/components/ProgressBar'
import Timer from '@/components/Timer'
import questions from '@/data/questions.json'
import type { Question, QuestionCategory } from '@/lib/types'

const TIME_LIMIT = 720 // 12 minutes in seconds
const TEST_COUNT = 50

export default function TestPage() {
  const router = useRouter()
  const { progress, saveTestResult } = useStore()

  const [testQuestions] = useState<Question[]>(() =>
    selectTestQuestions(questions as Question[], TEST_COUNT)
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [locked, setLocked] = useState(false)
  const [startTime] = useState(Date.now())
  const [confirmed, setConfirmed] = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const question = testQuestions[currentIndex]

  const finishTest = useCallback((finalAnswers: Record<number, number>) => {
    const timeUsed = Math.round((Date.now() - startTime) / 1000)
    let score = 0

    const categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }> = {
      verbal: { correct: 0, total: 0 },
      math: { correct: 0, total: 0 },
      logic: { correct: 0, total: 0 },
      spatial: { correct: 0, total: 0 },
      general: { correct: 0, total: 0 },
    }
    const missed: number[] = []

    testQuestions.forEach((q) => {
      const chosen = finalAnswers[q.id]
      const correct = chosen === q.answer
      categoryBreakdown[q.category].total++
      if (correct) {
        score++
        categoryBreakdown[q.category].correct++
      } else {
        missed.push(q.id)
      }
    })

    const percentile = scoreToPercentile(score)

    saveTestResult({
      date: new Date().toLocaleDateString(),
      score,
      total: testQuestions.length,
      timeUsed,
      categoryBreakdown,
      missedQuestions: missed,
    })

    // Store results temporarily for the results page
    sessionStorage.setItem('lastTestQuestions', JSON.stringify(testQuestions))
    sessionStorage.setItem('lastTestAnswers', JSON.stringify(finalAnswers))
    sessionStorage.setItem('lastTestScore', String(score))
    sessionStorage.setItem('lastTestPercentile', String(percentile))
    sessionStorage.setItem('lastTestTimeUsed', String(timeUsed))

    router.push('/results')
  }, [testQuestions, startTime, saveTestResult, router])

  const handleSelect = useCallback((optionIndex: number) => {
    if (locked) return
    setLocked(true)
    const newAnswers = { ...answers, [question.id]: optionIndex }
    setAnswers(newAnswers)

    // Auto-advance after short delay
    advanceTimer.current = setTimeout(() => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= testQuestions.length) {
        finishTest(newAnswers)
      } else {
        setCurrentIndex(nextIndex)
        setLocked(false)
      }
    }, 400)
  }, [locked, answers, question, currentIndex, testQuestions.length, finishTest])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    if (!confirmed) return
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1
        if (idx < question.options.length) handleSelect(idx)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [confirmed, question?.options.length, handleSelect])

  const handleTimerExpire = useCallback(() => {
    finishTest(answers)
  }, [finishTest, answers])

  const getOptionState = (idx: number): AnswerState => {
    if (!locked) return 'default'
    const chosen = answers[question.id]
    if (idx === chosen) return 'selected'
    return 'default'
  }

  // Pre-test confirmation screen
  if (!confirmed) {
    return (
      <main className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-zinc-200">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>
        </header>
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8">
            <div className="text-3xl mb-4">⏱️</div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Wonderlic Test Simulation</h1>
            <p className="text-zinc-500 mb-6">
              This is a real Wonderlic simulation. The rules:
            </p>
            <ul className="space-y-2.5 mb-8">
              {[
                `${TEST_COUNT} questions, 12-minute time limit`,
                'Once you select an answer, it\'s locked — no changing',
                'No explanations during the test',
                'The timer starts the moment you click "Begin Test"',
                'The test ends when time runs out or all questions are answered',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                  <span className="text-indigo-400 mt-0.5">→</span>
                  {rule}
                </li>
              ))}
            </ul>
            {progress.name && progress.name !== 'friend' && (
              <p className="text-sm text-zinc-400 mb-6">
                Good luck, {progress.name}. You&apos;ve got this.
              </p>
            )}
            <button
              onClick={() => setConfirmed(true)}
              className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              Begin Test →
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500">
              {currentIndex + 1} <span className="text-zinc-300">/</span> {testQuestions.length}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(question.category)}`}
            >
              {getCategoryLabel(question.category)}
            </span>
          </div>
          <Timer totalSeconds={TIME_LIMIT} onExpire={handleTimerExpire} />
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <ProgressBar current={currentIndex} total={testQuestions.length} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8">
          <p className="text-lg font-medium text-zinc-900 leading-relaxed mb-6">
            {question.question}
          </p>

          <div className="flex flex-col gap-2.5">
            {question.options.map((opt, idx) => (
              <AnswerOption
                key={idx}
                label={LABELS[idx]}
                text={opt}
                state={getOptionState(idx)}
                disabled={locked}
                onClick={() => handleSelect(idx)}
              />
            ))}
          </div>

          <p className="mt-6 text-xs text-zinc-400 text-right">
            {answers[question?.id] !== undefined
              ? 'Answer locked — moving on...'
              : 'Tap an answer to select and continue'}
          </p>
        </div>
      </div>
    </main>
  )
}
