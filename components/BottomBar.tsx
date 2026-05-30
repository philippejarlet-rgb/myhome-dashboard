'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function BottomBar() {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const items = [
    { icon: '🌤️', label: 'Météo', href: '/weather' },
    { icon: '📝', label: 'Todo', href: '/todo' },
    { icon: '🛒', label: 'Courses', href: '/courses' },
    { icon: '🎵', label: 'Radios', href: '/radios' },
    { icon: '🌍', label: 'Atlas', href: 'https://atlasculinaire.com/' },
    { icon: '📸', label: 'Photos', href: '/photos' },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="fixed bottom-0 left-3 right-3 z-50">
      <div className="glass-card rounded-3xl px-8 py-4 flex justify-between items-center">

        <button
          onClick={() => window.location.reload()}
          className="flex flex-col items-center gap-2 text-sm text-zinc-300 hover:text-white hover:scale-110 transition-all"
        >
          <span className="text-2xl">🔄</span>
          <span>Refresh</span>
        </button>

        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            target={item.label === 'Atlas' ? '_blank' : '_self'}
            className="flex flex-col items-center gap-2 text-sm text-zinc-300 hover:text-white hover:scale-110 transition-all"
          >
            <span className="text-2xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={toggleFullscreen}
          className="flex flex-col items-center gap-2 text-sm text-zinc-300 hover:text-white hover:scale-110 transition-all"
        >
          <span className="text-2xl">{isFullscreen ? '⛶' : '⛶'}</span>
          <span>{isFullscreen ? 'Quitter' : 'Plein écran'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-2 text-sm text-zinc-400 hover:text-red-400 hover:scale-110 transition-all"
        >
          <span className="text-2xl">🔒</span>
          <span>Quitter</span>
        </button>

      </div>
    </div>
  )
}