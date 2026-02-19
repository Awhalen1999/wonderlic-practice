'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shuffle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getCheckpoint, getStreakCheckpoint, getCategoryColor, getCategoryLabel, shuffle } from '@/lib/utils'
import AnswerOption, { LABELS } from '@/components/AnswerOption'
import type { AnswerState } from '@/components/AnswerOption'
import ExplanationPanel from '@/components/ExplanationPanel'
import CheckpointModal from '@/components/CheckpointModal'
import questions from '@/data/questions.json'
import type { Question, QuestionCategory } from '@/lib/types'

const allQuestions = questions as Question[]

const CATEGORIES: { value: QuestionCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all',     label: 'All',     emoji: '⚡' },
  { value: 'math',    label: 'Math',    emoji: '🔢' },
  { value: 'verbal',  label: 'Verbal',  emoji: '📝' },
  { value: 'logic',   label: 'Logic',   emoji: '🧩' },
  { value: 'general', label: 'General', emoji: '🌐' },
]

type Mode = 'pick' | 'session'

export default function PracticePage() {
  const router = useRouter()
  const { progress, recordAnswer, advancePracticeIndex } = useStore()

  const [mode, setMode] = useState<Mode>('pick')
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all')
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [checkpoint, setCheckpoint] = useState<{ emoji: string; headline: string; message: string } | null>(null)
  const [totalAnsweredThisSession, setTotalAnsweredThisSession] = useState(0)

  const question = sessionQuestions[currentIndex]
  const pct = sessionQuestions.length > 0
    ? Math.round((currentIndex / sessionQuestions.length) * 100)
    : 0

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { all: allQuestions.length }
    allQuestions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1
    })
    return counts
  }, [])

  const startSession = useCallback((category: QuestionCategory | 'all') => {
    const filtered = category === 'all'
      ? allQuestions
      : allQuestions.filter((q) => q.category === category)
    const ordered = category === 'all'
      ? filtered.slice(progress.practiceIndex) // resume position for "all"
      : shuffle(filtered) // shuffle when filtering by category
    setSessionQuestions(ordered.length > 0 ? ordered : shuffle(filtered))
    setSelectedCategory(category)
    setCurrentIndex(0)
    setSelected(null)
    setSubmitted(false)
    setTotalAnsweredThisSession(0)
    setMode('session')
  }, [progress.practiceIndex])

  const handleSelect = (idx: number) => {
    if (submitted) return
    setSelected(idx)
  }

  const handleSubmit = useCallback(() => {
    if (selected === null || submitted || !question) return
    setSubmitted(true)
    const correct = selected === question.answer
    recordAnswer(question.id, question.category, correct)
    if (selectedCategory === 'all') advancePracticeIndex()
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    setTotalAnsweredThisSession((n) => n + 1)
    const cp = getStreakCheckpoint(newStreak, progress.name)
    if (cp) setCheckpoint(cp)
  }, [selected, submitted, question, recordAnswer, streak, progress.name, selectedCategory, advancePracticeIndex])

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (selectedCategory === 'all') {
      const cp = getCheckpoint(nextIndex, progress.name)
      if (cp) setCheckpoint(cp)
    }
    if (nextIndex >= sessionQuestions.length) {
      // wrap around for category mode, go back to pick for all
      if (selectedCategory === 'all') {
        setMode('pick')
        return
      }
      setCurrentIndex(0)
    } else {
      setCurrentIndex(nextIndex)
    }
    setSelected(null)
    setSubmitted(false)
  }, [currentIndex, sessionQuestions.length, selectedCategory, progress.name])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (checkpoint) { if (e.key === 'Enter') setCheckpoint(null); return }
      if (mode === 'pick') return
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1
        if (question && idx < question.options.length) handleSelect(idx)
      }
      const letterIdx = ['a', 'b', 'c', 'd', 'e'].indexOf(e.key.toLowerCase())
      if (letterIdx !== -1 && question && letterIdx < question.options.length) handleSelect(letterIdx)
      if (e.key === 'Enter') submitted ? handleNext() : handleSubmit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkpoint, mode, question, submitted, handleSubmit, handleNext])

  const getOptionState = (idx: number): AnswerState => {
    if (!submitted) return selected === idx ? 'selected' : 'default'
    if (!question) return 'default'
    if (idx === question.answer) return selected === idx ? 'correct' : 'revealed-correct'
    if (idx === selected) return 'incorrect'
    return 'default'
  }

  // ── Category picker ──
  if (mode === 'pick') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-8"
          >
            <ArrowLeft size={15} /> Home
          </button>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-900">What do you want to practice?</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {progress.practiceIndex > 0
                ? `You're on Q${progress.practiceIndex + 1} for "All"`
                : 'Pick a category or run through everything.'}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {CATEGORIES.map(({ value, label, emoji }) => {
              const count = categoryCount[value] ?? 0
              const isAll = value === 'all'
              return (
                <button
                  key={value}
                  onClick={() => startSession(value)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] ${
                    isAll
                      ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-600 text-white'
                      : 'bg-white hover:bg-sky-50 border-sky-200 hover:border-sky-400 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    <div>
                      <div className={`font-semibold text-sm ${isAll ? 'text-white' : 'text-zinc-900'}`}>
                        {label}
                      </div>
                      <div className={`text-xs mt-0.5 ${isAll ? 'text-indigo-200' : 'text-zinc-500'}`}>
                        {count} questions{!isAll ? ' · shuffled' : progress.practiceIndex > 0 ? ' · resume' : ''}
                      </div>
                    </div>
                  </div>
                  {isAll && progress.practiceIndex > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-indigo-200 mb-1">Q{progress.practiceIndex + 1}</div>
                      <div className="w-16 bg-indigo-500/40 rounded-full h-1">
                        <div
                          className="bg-white/70 h-1 rounded-full"
                          style={{ width: `${Math.min((progress.practiceIndex / allQuestions.length) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {!isAll && (
                    <Shuffle size={14} className="text-zinc-300" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  // ── Active session ──
  if (!question) return null

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
              onClick={() => setMode('pick')}
              className="text-zinc-500 hover:text-zinc-800 transition-colors p-1 -ml-1"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {streak >= 3 && (
                <span className="text-xs font-semibold text-amber-500">🔥 {streak}</span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(question.category)}`}>
                {getCategoryLabel(question.category)}
              </span>
              <span className="text-xs text-zinc-600 font-medium">
                {currentIndex + 1}/{sessionQuestions.length}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-sky-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Centered question area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
          <p className="text-lg font-semibold text-zinc-900 leading-relaxed text-center mb-8 max-w-lg">
            {question.question}
          </p>

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

          <div className="w-full max-w-md">
            <ExplanationPanel explanation={question.explanation} visible={submitted} />
          </div>

          <div className="mt-6 w-full max-w-md">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-sky-100 disabled:text-sky-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all duration-150 active:scale-[0.98]"
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

        </div>
      </main>
    </>
  )
}
