'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getCheckpoint, getStreakCheckpoint, getCategoryLabel, getCategoryColor } from '@/lib/utils'
import AnswerOption, { LABELS } from '@/components/AnswerOption'
import type { AnswerState } from '@/components/AnswerOption'
import ProgressBar from '@/components/ProgressBar'
import ExplanationPanel from '@/components/ExplanationPanel'
import CheckpointModal from '@/components/CheckpointModal'
import questions from '@/data/questions.json'
import type { Question } from '@/lib/types'

const allQuestions = questions as Question[]

export default function PracticePage() {
  const router = useRouter()
  const { progress, recordAnswer, advancePracticeIndex } = useStore()

  const [currentIndex, setCurrentIndex] = useState(progress.practiceIndex)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [checkpoint, setCheckpoint] = useState<{ emoji: string; headline: string; message: string } | null>(null)

  const question = allQuestions[currentIndex % allQuestions.length]
  const totalDone = currentIndex + 1

  const handleSelect = (optionIndex: number) => {
    if (submitted) return
    setSelected(optionIndex)
  }

  const handleSubmit = useCallback(() => {
    if (selected === null || submitted) return
    setSubmitted(true)

    const correct = selected === question.answer
    recordAnswer(question.id, question.category, correct)

    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)

    const streakCp = getStreakCheckpoint(newStreak, progress.name)
    if (streakCp) {
      setCheckpoint(streakCp)
    }
  }, [selected, submitted, question, recordAnswer, streak, progress.name])

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    advancePracticeIndex()

    // Check milestone checkpoint (after advancing)
    const questionNumber = nextIndex
    const cp = getCheckpoint(questionNumber, progress.name)
    if (cp) {
      setCheckpoint(cp)
    }

    setCurrentIndex(nextIndex)
    setSelected(null)
    setSubmitted(false)
  }, [currentIndex, advancePracticeIndex, progress.name])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (checkpoint) {
        if (e.key === 'Enter') setCheckpoint(null)
        return
      }
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1
        if (idx < question.options.length) handleSelect(idx)
      }
      if (e.key === 'Enter') {
        if (!submitted) handleSubmit()
        else handleNext()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [checkpoint, question.options.length, submitted, handleSubmit, handleNext])

  const getOptionState = (idx: number): AnswerState => {
    if (!submitted) {
      return selected === idx ? 'selected' : 'default'
    }
    if (idx === question.answer) {
      return selected === idx ? 'correct' : 'revealed-correct'
    }
    if (idx === selected) return 'incorrect'
    return 'default'
  }

  return (
    <>
      {checkpoint && (
        <CheckpointModal
          emoji={checkpoint.emoji}
          headline={checkpoint.headline}
          message={checkpoint.message}
          onContinue={() => setCheckpoint(null)}
        />
      )}

      <main className="min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <ArrowLeft size={15} />
              Home
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">
                Q{totalDone}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(question.category)}`}
              >
                {getCategoryLabel(question.category)}
              </span>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-4 pb-3">
            <ProgressBar current={currentIndex % allQuestions.length} total={allQuestions.length} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8">
            {/* Question */}
            <p className="text-lg font-medium text-zinc-900 leading-relaxed mb-6">
              {question.question}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt, idx) => (
                <AnswerOption
                  key={idx}
                  label={LABELS[idx]}
                  text={opt}
                  state={getOptionState(idx)}
                  disabled={submitted}
                  onClick={() => handleSelect(idx)}
                />
              ))}
            </div>

            {/* Explanation */}
            <ExplanationPanel
              explanation={question.explanation}
              visible={submitted}
            />

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {submitted ? (
                  selected === question.answer ? '✓ Correct' : '✗ Incorrect'
                ) : selected !== null ? (
                  'Press Enter to check'
                ) : (
                  'Select an answer'
                )}
              </span>

              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-5 py-2 transition-colors"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl px-5 py-2 transition-colors"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Streak indicator */}
          {streak >= 3 && (
            <div className="mt-4 text-center text-sm text-zinc-400">
              🔥 {streak} in a row
            </div>
          )}
        </div>
      </main>
    </>
  )
}
