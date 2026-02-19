'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock, BarChart2, ChevronRight, RotateCcw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getAccuracyPercent } from '@/lib/utils'
import NamePromptModal from '@/components/NamePromptModal'

export default function HomePage() {
  const router = useRouter()
  const { progress, setName } = useStore()
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && progress.name === '') {
      setShowNamePrompt(true)
    }
  }, [mounted, progress.name])

  const handleName = (name: string) => {
    setName(name || 'friend')
    setShowNamePrompt(false)
  }

  const accuracy = getAccuracyPercent(progress.totalCorrect, progress.totalAnswered)
  const hasPracticeProgress = progress.practiceIndex > 0

  if (!mounted) return null

  return (
    <>
      {showNamePrompt && <NamePromptModal onSubmit={handleName} />}

      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-zinc-900">Wonderlic Practice</span>
            </div>
            {progress.name && progress.name !== 'friend' && (
              <span className="text-sm text-zinc-400">
                Hey, {progress.name} 👋
              </span>
            )}
          </div>
        </header>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
          {/* Hero */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              {progress.name && progress.name !== 'friend'
                ? `Ready to practice, ${progress.name}?`
                : 'Wonderlic Practice'}
            </h1>
            <p className="text-zinc-500">
              1,000+ real Wonderlic questions. Two modes. No fluff.
            </p>
          </div>

          {/* Stats row */}
          {progress.totalAnswered > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <div className="text-2xl font-bold text-zinc-900">{progress.totalAnswered}</div>
                <div className="text-xs text-zinc-400 mt-0.5">Questions answered</div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <div className="text-2xl font-bold text-zinc-900">{accuracy}%</div>
                <div className="text-xs text-zinc-400 mt-0.5">Accuracy</div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <div className="text-2xl font-bold text-zinc-900">{progress.sessionsCompleted}</div>
                <div className="text-xs text-zinc-400 mt-0.5">Tests completed</div>
              </div>
            </div>
          )}

          {/* Mode cards */}
          <div className="flex flex-col gap-4">
            {/* Practice Mode */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-indigo-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-indigo-600" />
                </div>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-indigo-400 transition-colors mt-1" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Practice Mode</h2>
              <p className="text-sm text-zinc-500 mb-4">
                No pressure. No timer. Work through questions one at a time with explanations after each answer.
              </p>

              {hasPracticeProgress && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                  <div className="w-full bg-zinc-100 rounded-full h-1">
                    <div
                      className="bg-indigo-400 h-1 rounded-full"
                      style={{ width: `${Math.min((progress.practiceIndex / 115) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0">Q{progress.practiceIndex + 1}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/practice')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
                >
                  {hasPracticeProgress ? 'Continue Practice' : 'Start Practice'}
                </button>
                {hasPracticeProgress && (
                  <button
                    onClick={() => {
                      if (confirm('Start over from question 1?')) {
                        useStore.getState().resetPractice()
                      }
                    }}
                    className="p-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors"
                    title="Start over"
                  >
                    <RotateCcw size={15} className="text-zinc-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Test Mode */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-amber-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-amber-400 transition-colors mt-1" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Test Mode</h2>
              <p className="text-sm text-zinc-500 mb-4">
                Simulate the real Wonderlic. 50 questions. 12 minutes. No explanations until after.
              </p>

              {progress.testHistory.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-4 pb-4 border-b border-zinc-100">
                  <span>Last score:</span>
                  <span className="font-semibold text-zinc-600">
                    {progress.testHistory[0].score}/{progress.testHistory[0].total}
                  </span>
                  <span>·</span>
                  <span>{progress.testHistory[0].date}</span>
                </div>
              )}

              <button
                onClick={() => router.push('/test')}
                className="w-full bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
              >
                Start Test
              </button>
            </div>
          </div>

          {/* Past test results preview */}
          {progress.testHistory.length > 1 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                <BarChart2 size={13} />
                Recent Tests
              </h3>
              <div className="space-y-2">
                {progress.testHistory.slice(0, 5).map((t, i) => (
                  <div key={i} className="bg-white border border-zinc-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-zinc-500">{t.date}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-zinc-900">{t.score}/{t.total}</div>
                      <div className="text-xs text-zinc-400">{Math.round((t.score / t.total) * 100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
