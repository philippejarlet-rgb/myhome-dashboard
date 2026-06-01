'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  RefreshCw, CloudSun, ListTodo, ShoppingCart, Music2,
  Globe, Newspaper, Camera, Maximize2, Minimize2, LogOut
} from 'lucide-react'

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
    { icon: <CloudSun size={26} />, label: 'Météo', href: '/weather' },
    { icon: <ListTodo size={26} />, label: 'Todo', href: '/todo' },
    { icon: <ShoppingCart size={26} />, label: 'Courses', href: '/courses' },
    { icon: <Music2 size={26} />, label: 'Radios', href: '/radios' },
    { icon: null, label: 'Atlas-Culinaire', href: '/cuisine' },
    { icon: null, label: 'Recettes-Monde', href: null },
    { icon: <Newspaper size={26} />, label: 'News', href: '/news' },
    { icon: <Camera size={26} />, label: 'Photos', href: '/photos' },
  ]

  const [recetteLoading, setRecetteLoading] = useState(false)

  const handleRecetteMonde = async () => {
    if (recetteLoading) return
    setRecetteLoading(true)
    try {
      const res = await fetch('/api/cuisine/random')
      const recipe = await res.json()
      if (recipe?.url) window.open(recipe.url, '_blank', 'noopener,noreferrer')
    } finally {
      setRecetteLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const btnClass = "flex flex-col items-center gap-2 text-sm text-zinc-300 hover:text-white hover:scale-110 transition-all"

  return (
    <div className="fixed bottom-0 left-3 right-3 z-50">
      <div className="glass-card rounded-3xl px-8 py-4 flex justify-between items-center">

        <button onClick={() => window.location.reload()} className={btnClass}>
          <RefreshCw size={26} />
          <span>Refresh</span>
        </button>

        {items.map((item) => {
          if (item.label === 'Recettes-Monde') {
            return (
              <button key={item.label} onClick={handleRecetteMonde} className={btnClass} title="Recette surprise du monde">
                <Image
                  src="https://atlasculinaire.com/favicon.ico"
                  alt="Atlas Culinaire"
                  width={26}
                  height={26}
                  className={recetteLoading ? 'opacity-50 animate-pulse' : ''}
                  unoptimized
                />
                <span>Recettes-Monde</span>
              </button>
            )
          }
          if (item.label === 'Atlas-Culinaire') {
            return (
              <Link key={item.label} href="/cuisine" className={btnClass}>
                <Globe size={26} />
                <span>Atlas-Culinaire</span>
              </Link>
            )
          }
          return (
            <Link key={item.label} href={item.href!} className={btnClass}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}

        <button onClick={toggleFullscreen} className={btnClass}>
          {isFullscreen ? <Minimize2 size={26} /> : <Maximize2 size={26} />}
          <span>{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
        </button>

        <button onClick={handleLogout} className="flex flex-col items-center gap-2 text-sm text-zinc-400 hover:text-red-400 hover:scale-110 transition-all">
          <LogOut size={26} />
          <span>Quitter</span>
        </button>

      </div>
    </div>
  )
}
