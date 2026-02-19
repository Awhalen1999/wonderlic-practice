type Props = {
  emoji: string
  headline: string
  message: string
  onContinue: () => void
}

export default function CheckpointModal({ emoji, headline, message, onContinue }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="text-5xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">{headline}</h2>
        <p className="text-zinc-600 leading-relaxed mb-6">{message}</p>
        <button
          onClick={onContinue}
          className="bg-zinc-900 hover:bg-zinc-700 text-white font-semibold rounded-xl px-8 py-3 transition-colors"
        >
          Keep going →
        </button>
      </div>
    </div>
  )
}
