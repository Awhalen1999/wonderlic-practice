import { Lightbulb } from 'lucide-react'

type Props = {
  explanation: string
  visible: boolean
}

export default function ExplanationPanel({ explanation, visible }: Props) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        visible ? 'opacity-100 max-h-96 mt-4' : 'opacity-0 max-h-0 mt-0'
      }`}
    >
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={15} className="text-sky-600 shrink-0" />
          <span className="text-sm font-semibold text-sky-700">Here&apos;s why</span>
        </div>
        <p className="text-sm leading-relaxed text-sky-900">{explanation}</p>
      </div>
    </div>
  )
}
