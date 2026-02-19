'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getCheckpoint, getStreakCheckpoint, getCategoryColor, getCategoryLabel } from '@/lib/utils'
import AnswerOption, { LABELS } from '@/components/AnswerOption'
import type { AnswerState } from '@/components/AnswerOption'
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
  const pct = Math.round(((currentIndex % allQuestions.length) / allQuestions.length) * 100)

  const handleSelect = (idx: number) => {
    if (submitted) return
    setSelected(idx)
  }

  const handleSubmit = useCallback(() => {
    if (selected === null || submitted) return
    setSubmitted(true)
    const correct = selected === question.answer
    recordAnswer(question.id, question.category, correct)
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    const cp = getStreakCheckpoint(newStreak, progress.name)
    if (cp) setCheckpoint(cp)
  }, [selected, submitted, question, recordAnswer, streak, progress.name])

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    advancePracticeIndex()
    const cp = getCheckpoint(nextIndex, progress.name)
    if (cp) setCheckpoint(cp)
    setCurrentIndex(nextIndex)
    setSelected(null)
    setSubmitted(false)
  }, [currentIndex, advancePracticeIndex, progress.name])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (checkpoint) { if (e.key === 'Enter') setCheckpoint(null); return }
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1
        if (idx < question.options.length) handleSelect(idx)
      }
      if (e.key === 'Enter') submitted ? handleNext() : handleSubmit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkpoint, question.options.length, submitted, handleSubmit, handleNext])

  const getOptionState = (idx: number): AnswerState => {
    if (!submitted) return selected === idx ? 'selected' : 'default'
    if (idx === question.answer) return selected === idx ? 'correct' : 'revealed-correct'
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
        {/* Slim top bar */}
        <div className="shrink-0 px-4 pt-4 pb-2 max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/')}
              className="text-zinc-500 hover:text-zinc-800 transition-colors p-1 -ml-1"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {streak >= 3 && (
                <span className="text-xs font-semibold text-amber-500">🔥 {streak}</span>
              )}
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(question.category)}`}
              >
                {getCategoryLabel(question.category)}
              </span>
              <span className="text-xs text-zinc-600 font-medium">
                {currentIndex + 1}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-sky-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Centered question area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
          {/* Question */}
          <p className="text-lg font-semibold text-zinc-900 leading-relaxed text-center mb-8 max-w-lg">
            {question.question}
          </p>

          {/* Options */}
          <div className="w-full flex flex-col gap-2.5 max-w-md">
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
          <div className="w-full max-w-md">
            <ExplanationPanel explanation={question.explanation} visible={submitted} />
          </div>

          {/* Action */}
          <div className="mt-6 w-full max-w-md">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all duration-150 active:scale-[0.98]"
              >
                Check
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl py-4 transition-all duration-150 active:scale-[0.98]"
              >
                Continue →
              </button>
            )}
          </div>

          {/* Subtle hint */}
          {!submitted && selected === null && (
            <p className="mt-4 text-xs text-zinc-500 text-center">
              Press 1–4 to select · Enter to check
            </p>
          )}
        </div>
      </main>
    </>
  )
}
