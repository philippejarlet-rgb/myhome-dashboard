'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [bgImage, setBgImage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/backgrounds')
      .then((r) => r.json())
      .then((data: { selection?: Record<string, string | null> }) => {
        setBgImage(data.selection?.login ?? null)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur de connexion')
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center relative"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {!bgImage && <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-900 to-black -z-10" />}
      {bgImage && <div className="absolute inset-0 bg-black/55 -z-10" />}
      <div className="glass-card rounded-3xl p-10 w-96 flex flex-col items-center gap-6">
        <img src="/android-chrome-192x192.png" alt="MyHome" className="w-16 h-16" />
        <h1 className="text-3xl font-thin text-white tracking-widest">MYHOME</h1>
        <p className="text-zinc-400 text-sm">Accès privé</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="bg-white/10 text-white rounded-2xl px-4 py-3 outline-none placeholder:text-zinc-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="bg-white/10 text-white rounded-2xl px-4 py-3 outline-none placeholder:text-zinc-500"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl py-3 font-semibold transition-all"
          >
            Entrer
          </button>
        </form>
      </div>
    </main>
  )
}
