import type { Question } from './types'

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getAccuracyPercent(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

// Wonderlic score to approximate percentile (based on published norms)
const PERCENTILE_TABLE: Record<number, number> = {
  10: 5, 12: 10, 14: 15, 16: 20, 18: 25, 20: 30,
  22: 40, 24: 50, 26: 60, 28: 70, 30: 75, 32: 80,
  34: 85, 36: 90, 38: 93, 40: 96, 42: 97, 44: 98,
  46: 99, 48: 99, 50: 99,
}

export function scoreToPercentile(score: number): number {
  const keys = Object.keys(PERCENTILE_TABLE)
    .map(Number)
    .sort((a, b) => a - b)

  for (let i = keys.length - 1; i >= 0; i--) {
    if (score >= keys[i]) return PERCENTILE_TABLE[keys[i]]
  }
  return 1
}

const CHECKPOINT_MILESTONES = [25, 50, 100, 250, 500, 750, 1000]

type Checkpoint = {
  emoji: string
  headline: string
  message: string
}

export function getCheckpoint(questionNumber: number, name: string): Checkpoint | null {
  if (!CHECKPOINT_MILESTONES.includes(questionNumber)) return null

  const checkpoints: Record<number, Checkpoint> = {
    25: {
      emoji: '🔥',
      headline: 'Warm up complete.',
      message: '25 questions in. You\'re just getting started.',
    },
    50: {
      emoji: '💪',
      headline: '50 down.',
      message: `${name || 'You'} mean business. Half a real test done — in practice mode.`,
    },
    100: {
      emoji: '💯',
      headline: 'Triple digits.',
      message: '100 questions. The average person quit at zero.',
    },
    250: {
      emoji: '🧠',
      headline: 'Quarter way through.',
      message: 'Fun fact: the average Wonderlic score is 21 out of 50. You\'re putting in more prep than almost everyone.',
    },
    500: {
      emoji: '🎉',
      headline: 'Halfway there!',
      message: `500 questions, ${name || 'champ'}. That\'s genuinely impressive. Take a breath.`,
    },
    750: {
      emoji: '⚡',
      headline: 'Almost there.',
      message: 'Only 250 to go. Don\'t stop now — you\'re in rare company.',
    },
    1000: {
      emoji: '🏆',
      headline: 'You did it.',
      message: `Every. Single. One. ${name ? `${name}, you` : 'You'} just finished all 1,000+ questions. That\'s unreal.`,
    },
  }

  return checkpoints[questionNumber] ?? null
}

export function getStreakCheckpoint(streak: number, name: string): Checkpoint | null {
  const streakMilestones: Record<number, Checkpoint> = {
    5: {
      emoji: '🎯',
      headline: '5 in a row!',
      message: 'Perfect streak. Keep that energy going.',
    },
    10: {
      emoji: '🔥',
      headline: '10 correct in a row.',
      message: `${name || 'You'}\'re locked in right now. Don\'t break the streak.`,
    },
    20: {
      emoji: '🚀',
      headline: '20 in a row.',
      message: 'Are you even trying at this point? (Please keep going.)',
    },
  }

  return streakMilestones[streak] ?? null
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    verbal: 'Verbal',
    math: 'Math',
    logic: 'Logic',
    spatial: 'Spatial',
    general: 'General',
  }
  return labels[category] ?? category
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    verbal: 'bg-violet-100 text-violet-700',
    math: 'bg-blue-100 text-blue-700',
    logic: 'bg-amber-100 text-amber-700',
    spatial: 'bg-emerald-100 text-emerald-700',
    general: 'bg-zinc-100 text-zinc-600',
  }
  return colors[category] ?? 'bg-zinc-100 text-zinc-600'
}

export function selectTestQuestions(questions: Question[], count = 50): Question[] {
  return shuffle(questions).slice(0, Math.min(count, questions.length))
}
