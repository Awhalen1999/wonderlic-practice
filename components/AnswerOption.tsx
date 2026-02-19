import { Check, X } from 'lucide-react'

type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect' | 'revealed-correct'

type Props = {
  label: string
  text: string
  state: AnswerState
  disabled: boolean
  onClick: () => void
}

const LABELS = ['A', 'B', 'C', 'D', 'E']

export default function AnswerOption({ label, text, state, disabled, onClick }: Props) {
  const stateClasses: Record<AnswerState, string> = {
    default:
      'border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50 cursor-pointer',
    selected:
      'border-indigo-500 bg-indigo-50 cursor-pointer',
    correct:
      'border-emerald-500 bg-emerald-50 cursor-default',
    incorrect:
      'border-red-400 bg-red-50 cursor-default',
    'revealed-correct':
      'border-emerald-300 bg-emerald-50/60 cursor-default',
  }

  const labelClasses: Record<AnswerState, string> = {
    default: 'bg-zinc-100 text-zinc-500',
    selected: 'bg-indigo-200 text-indigo-700',
    correct: 'bg-emerald-200 text-emerald-700',
    incorrect: 'bg-red-200 text-red-700',
    'revealed-correct': 'bg-emerald-200 text-emerald-700',
  }

  const textClasses: Record<AnswerState, string> = {
    default: 'text-zinc-800',
    selected: 'text-indigo-900',
    correct: 'text-emerald-900 font-medium',
    incorrect: 'text-red-900',
    'revealed-correct': 'text-emerald-800',
  }

  const icon =
    state === 'correct' || state === 'revealed-correct' ? (
      <Check size={14} className="text-emerald-600 shrink-0" />
    ) : state === 'incorrect' ? (
      <X size={14} className="text-red-500 shrink-0" />
    ) : null

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${stateClasses[state]}`}
    >
      <span
        className={`font-mono text-xs font-semibold w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${labelClasses[state]}`}
      >
        {label}
      </span>
      <span className={`text-sm flex-1 ${textClasses[state]}`}>{text}</span>
      {icon}
    </button>
  )
}

export { LABELS }
export type { AnswerState }
