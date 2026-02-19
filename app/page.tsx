'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getAccuracyPercent } from '@/lib/utils'
import NamePromptModal from '@/components/NamePromptModal'
import { Trash2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { progress, setName, clearAllData, resetPractice } = useStore()
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && progress.name === '') setShowNamePrompt(true)
  }, [mounted, progress.name])

  const handleName = (name: string) => {
    setName(name || 'friend')
    setShowNamePrompt(false)
  }

  const accuracy = getAccuracyPercent(progress.totalCorrect, progress.totalAnswered)
  const hasPractice = progress.practiceIndex > 0
  const lastTest = progress.testHistory[0]

  if (!mounted) return null

  return (
    <>
      {showNamePrompt && <NamePromptModal onSubmit={handleName} />}

      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Greeting */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {progress.name && progress.name !== 'friend'
              ? `Hey ${progress.name}.`
              : 'Wonderlic Practice'}
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            {progress.totalAnswered > 0
              ? `${progress.totalAnswered} answered · ${accuracy}% accuracy`
              : '115 questions. Two modes. Let\'s go.'}
          </p>
        </div>

        {/* Mode buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          {/* Practice */}
          <button
            onClick={() => router.push('/practice')}
            className="relative w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-2xl px-6 py-5 text-left transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-base">Practice</div>
                <div className="text-indigo-100 text-xs mt-0.5 font-medium">
                  {hasPractice ? `Resume · Q${progress.practiceIndex + 1}` : 'Untimed · with explanations'}
                </div>
              </div>
              <span className="text-2xl">📖</span>
            </div>

            {hasPractice && (
              <div className="mt-3 w-full bg-indigo-500/40 rounded-full h-1">
                <div
                  className="bg-white/70 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min((progress.practiceIndex / 115) * 100, 100)}%` }}
                />
              </div>
            )}
          </button>

          {/* Test */}
          <button
            onClick={() => router.push('/test')}
            className="relative w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white rounded-2xl px-6 py-5 text-left transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-base">Test Mode</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  {lastTest
                    ? `Last score: ${lastTest.score}/${lastTest.total}`
                    : '50 questions · 12 minutes'}
                </div>
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
          </button>

          {/* Stats — only if there's something to show */}
          {progress.totalAnswered > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { label: 'Answered', value: progress.totalAnswered },
                { label: 'Correct', value: `${accuracy}%` },
                { label: 'Tests', value: progress.sessionsCompleted },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-sky-100 rounded-xl py-3 text-center">
                  <div className="text-base font-bold text-zinc-900">{value}</div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset controls — clean, unobtrusive */}
        <div className="mt-10 flex items-center gap-4 text-xs text-zinc-500">
          {hasPractice && (
            <button
              onClick={() => {
                if (confirm('Reset practice progress back to Q1?')) resetPractice()
              }}
              className="hover:text-zinc-700 transition-colors"
            >
              Reset practice
            </button>
          )}
          {hasPractice && <span>·</span>}
          <button
            onClick={() => {
              if (confirm('Clear all progress? This cannot be undone.')) clearAllData()
            }}
            className="flex items-center gap-1 hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} />
            Clear all data
          </button>
        </div>
      </main>
    </>
  )
}
