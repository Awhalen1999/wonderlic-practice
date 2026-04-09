'use client'

import { useEffect, useState, useRef } from 'react'
import { Clock } from 'lucide-react'
import { formatTime } from '@/lib/utils'

type Props = {
  totalSeconds: number
  onExpire: () => void
}

export default function Timer({ totalSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          onExpireRef.current()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
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
          : 'text-zinc-600'
      }`}
    >
      <Clock size={14} />
      {formatTime(remaining)}
    </div>
  )
}
