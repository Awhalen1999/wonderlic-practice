export type QuestionCategory = 'verbal' | 'math' | 'logic' | 'spatial' | 'general'

export type Question = {
  id: number
  category: QuestionCategory
  question: string
  options: string[]
  answer: number // 0-based index into options
  explanation: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export type TestResult = {
  date: string
  score: number
  total: number
  timeUsed: number // seconds elapsed
  categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }>
  missedQuestions: number[] // question ids
}

export type UserProgress = {
  name: string
  practiceIndex: number
  totalAnswered: number
  totalCorrect: number
  categoryStats: Record<QuestionCategory, { answered: number; correct: number }>
  sessionsCompleted: number
  testHistory: TestResult[]
  lastActive: string
}

export type SessionMode = 'test' | 'practice'

export type ActiveSession = {
  mode: SessionMode
  questions: Question[]
  currentIndex: number
  answers: Record<number, number | null> // questionId -> chosen option index
  startTime: number // Date.now()
  timeLimit: number | null // seconds, null for practice
  locked: boolean // true after answer selected in test mode
}
