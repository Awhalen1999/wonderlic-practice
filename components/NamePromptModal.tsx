'use client'

import { useState } from 'react'

type Props = {
  onSubmit: (name: string) => void
  currentName?: string
}

export default function NamePromptModal({ onSubmit, currentName }: Props) {
  const [name, setName] = useState(currentName && currentName !== 'friend' ? currentName : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="bg-white border border-sky-100 rounded-2xl p-8 max-w-sm w-full shadow-xl">
        <h2 className="text-xl font-bold text-zinc-900 mb-1">What&apos;s your name?</h2>
        <p className="text-zinc-500 text-sm mb-6">
          I&apos;ll use it to cheer you on.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={30}
            className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            {name.trim() ? `Save — ${name.trim()}` : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onSubmit('')}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Close
          </button>
        </form>
      </div>
    </div>
  )
}
