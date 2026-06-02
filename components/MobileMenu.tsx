'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Menu, X, CloudSun, ListTodo, ShoppingCart, Music2,
  Globe, Newspaper, Camera, RefreshCw, LogOut
} from 'lucide-react'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [recetteLoading, setRecetteLoading] = useState(false)
  const router = useRouter()

  const handleRecetteMonde = async () => {
    if (recetteLoading) return
    setRecetteLoading(true)
    try {
      const res = await fetch('/api/cuisine/random')
      if (!res.ok) return
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

  const linkClass = "flex items-center gap-4 text-lg text-zinc-200 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 transition-all"

  return (
    <>
      {/* Header bar mobile — logo + titre + hamburger */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden glass-card px-4 py-2 flex items-center justify-between">
        <Image
          src="/android-chrome-192x192.png"
          alt="MyHome"
          width={40}
          height={40}
          className="rounded-xl"
        />
        <span className="text-white font-bold text-xl tracking-widest">MYHOME</span>
        <button
          onClick={() => setOpen(true)}
          className="text-white p-2 rounded-xl hover:bg-white/10 transition-all"
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Panel slide-in depuis la droite */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-zinc-900/95 backdrop-blur border-l border-white/10 md:hidden flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold text-lg">Menu</span>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          <button
            onClick={() => window.location.reload()}
            className={linkClass}
          >
            <RefreshCw size={22} />
            <span>Refresh</span>
          </button>
          <Link href="/weather" onClick={() => setOpen(false)} className={linkClass}>
            <CloudSun size={22} />
            <span>Météo</span>
          </Link>
          <Link href="/todo" onClick={() => setOpen(false)} className={linkClass}>
            <ListTodo size={22} />
            <span>Todo</span>
          </Link>
          <Link href="/courses" onClick={() => setOpen(false)} className={linkClass}>
            <ShoppingCart size={22} />
            <span>Courses</span>
          </Link>
          <Link href="/radios" onClick={() => setOpen(false)} className={linkClass}>
            <Music2 size={22} />
            <span>Radios</span>
          </Link>
          <Link href="/cuisine" onClick={() => setOpen(false)} className={linkClass}>
            <Globe size={22} />
            <span>Atlas Culinaire</span>
          </Link>
          <button onClick={handleRecetteMonde} className={linkClass}>
            <Image
              src="https://atlasculinaire.com/favicon.ico"
              alt="Recettes du Monde"
              width={22}
              height={22}
              className={recetteLoading ? 'opacity-50 animate-pulse' : ''}
              unoptimized
            />
            <span>Recettes du Monde</span>
          </button>
          <Link href="/news" onClick={() => setOpen(false)} className={linkClass}>
            <Newspaper size={22} />
            <span>News</span>
          </Link>
          <Link href="/photos" onClick={() => setOpen(false)} className={linkClass}>
            <Camera size={22} />
            <span>Photos</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-lg text-red-400 hover:text-red-300 py-3 px-4 rounded-xl hover:bg-red-500/10 transition-all mt-4"
          >
            <LogOut size={22} />
            <span>Quitter</span>
          </button>
        </nav>
      </div>
    </>
  )
}
