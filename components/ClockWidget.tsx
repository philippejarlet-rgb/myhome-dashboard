'use client'

import { useEffect, useState } from 'react'

export default function ClockWidget() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="widget-hover glass-card rounded-3xl p-8 h-full shadow-2xl">
      <h1 className="text-7xl font-light">{time}</h1>

      <p className="text-zinc-400 mt-4">
        {new Date().toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
    </div>
  )
}