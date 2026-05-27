'use client'

import { useEffect, useState } from 'react'

const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ClockWidget() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))
      setSeconds(now.getSeconds())
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const offset = CIRCUMFERENCE - (seconds / 60) * CIRCUMFERENCE

  return (
    <div className="widget-hover glass-card rounded-3xl p-6 h-full shadow-2xl">

      <div className="flex items-start gap-3">
        <h1 className="text-5xl font-light">{time}</h1>
        <svg width="44" height="44" className="mt-1 -rotate-90 shrink-0">
          <circle cx="22" cy="22" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="22" cy="22" r={RADIUS}
            fill="none"
            stroke="rgba(100,210,255,0.85)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
      </div>

      <p className="text-zinc-400 mt-2">{date}</p>

    </div>
  )
}