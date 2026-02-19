'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, UserProgress, TestResult, ActiveSession, QuestionCategory } from './types'

const defaultCategoryStats = (): UserProgress['categoryStats'] => ({
  verbal: { answered: 0, correct: 0 },
  math: { answered: 0, correct: 0 },
  logic: { answered: 0, correct: 0 },
  spatial: { answered: 0, correct: 0 },
  general: { answered: 0, correct: 0 },
})

const defaultProgress = (): UserProgress => ({
  name: '',
  practiceIndex: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  categoryStats: defaultCategoryStats(),
  sessionsCompleted: 0,
  testHistory: [],
  lastActive: new Date().toISOString(),
})

type Store = {
  // Persisted progress
  progress: UserProgress

  // Active session (not persisted)
  session: ActiveSession | null

  // Progress actions
  setName: (name: string) => void
  recordAnswer: (questionId: number, category: QuestionCategory, correct: boolean) => void
  advancePracticeIndex: () => void
  resetPractice: () => void
  saveTestResult: (result: TestResult) => void
  clearAllData: () => void

  // Session actions
  startSession: (session: ActiveSession) => void
  setAnswer: (questionId: number, optionIndex: number) => void
  advanceSession: () => void
  endSession: () => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      progress: defaultProgress(),
      session: null,

      setName: (name) =>
        set((s) => ({ progress: { ...s.progress, name } })),

      recordAnswer: (questionId, category, correct) =>
        set((s) => {
          const p = s.progress
          return {
            progress: {
              ...p,
              totalAnswered: p.totalAnswered + 1,
              totalCorrect: p.totalCorrect + (correct ? 1 : 0),
              categoryStats: {
                ...p.categoryStats,
                [category]: {
                  answered: p.categoryStats[category].answered + 1,
                  correct: p.categoryStats[category].correct + (correct ? 1 : 0),
                },
              },
              lastActive: new Date().toISOString(),
            },
          }
        }),

      advancePracticeIndex: () =>
        set((s) => ({
          progress: {
            ...s.progress,
            practiceIndex: s.progress.practiceIndex + 1,
          },
        })),

      resetPractice: () =>
        set((s) => ({
          progress: { ...s.progress, practiceIndex: 0 },
        })),

      saveTestResult: (result) =>
        set((s) => ({
          progress: {
            ...s.progress,
            sessionsCompleted: s.progress.sessionsCompleted + 1,
            testHistory: [result, ...s.progress.testHistory].slice(0, 20),
            lastActive: new Date().toISOString(),
          },
        })),

      clearAllData: () =>
        set({ progress: defaultProgress(), session: null }),

      startSession: (session) => set({ session }),

      setAnswer: (questionId, optionIndex) =>
        set((s) => {
          if (!s.session) return s
          return {
            session: {
              ...s.session,
              answers: { ...s.session.answers, [questionId]: optionIndex },
              locked: s.session.mode === 'test' ? true : s.session.locked,
            },
          }
        }),

      advanceSession: () =>
        set((s) => {
          if (!s.session) return s
          return {
            session: {
              ...s.session,
              currentIndex: s.session.currentIndex + 1,
              locked: false,
            },
          }
        }),

      endSession: () => set({ session: null }),
    }),
    {
      name: 'wonderlic-progress',
      // Only persist the progress slice, not the active session
      partialize: (state) => ({ progress: state.progress }),
    }
  )
)
