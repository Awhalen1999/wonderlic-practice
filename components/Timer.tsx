'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatTime } from '@/lib/utils'

type Props = {
  totalSeconds: number
  onExpire: () => void
}

export default function Timer({ totalSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          onExpire()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isWarning = remaining <= 300 && remaining > 120
  const isDanger = remaining <= 120

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-mono font-medium tabular-nums transition-colors ${
        isDanger
          ? 'text-red-500 animate-pulse'
          : isWarning
          ? 'text-amber-500'
          : 'text-zinc-400'
      }`}
    >
      <Clock size={14} />
      {formatTime(remaining)}
    </div>
  )
}
