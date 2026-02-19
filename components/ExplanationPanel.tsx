import { Lightbulb } from 'lucide-react'

type Props = {
  explanation: string
  visible: boolean
  correct?: boolean
}

export default function ExplanationPanel({ explanation, visible, correct }: Props) {
  const bg = correct ? 'bg-emerald-50' : 'bg-red-50'
  const border = correct ? 'border-emerald-200' : 'border-red-200'
  const icon = correct ? 'text-emerald-600' : 'text-red-500'
  const heading = correct ? 'text-emerald-700' : 'text-red-700'
  const body = correct ? 'text-emerald-900' : 'text-red-900'

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        visible ? 'opacity-100 max-h-96 mt-4' : 'opacity-0 max-h-0 mt-0'
      }`}
    >
      <div className={`${bg} border ${border} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={15} className={`${icon} shrink-0`} />
          <span className={`text-sm font-semibold ${heading}`}>Here&apos;s why</span>
        </div>
        <p className={`text-sm leading-relaxed ${body}`}>{explanation}</p>
      </div>
    </div>
  )
}
