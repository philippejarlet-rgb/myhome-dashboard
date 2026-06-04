'use client'

import { useEffect, useState } from 'react'
import { getSaintDuJour } from '@/lib/saintsDuJour'

export default function ClockWidget() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [saint, setSaint] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))
      setSaint(getSaintDuJour())
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="widget-hover glass-card rounded-3xl p-6 h-full shadow-2xl flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-7xl font-light">{time}</h1>
      <p className="text-zinc-300 mt-3 text-sm md:text-xl capitalize">{date}</p>
      {saint && (
        <p className="hidden md:block text-zinc-400 mt-3 text-base">🎉 {saint}</p>
      )}
    </div>
  )
}
