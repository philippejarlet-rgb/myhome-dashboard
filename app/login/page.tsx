'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Mot de passe incorrect')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black flex items-center justify-center text-white">
      <div className="glass-card rounded-3xl p-12 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl font-thin">MYHOME</h1>
          <p className="text-zinc-400 mt-2">Accès privé</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            className="bg-black/20 rounded-2xl px-6 py-4 text-xl outline-none border border-white/10 focus:border-white/30 transition-all"
          />

          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-all rounded-2xl px-8 py-4 text-xl mt-2"
          >
            {loading ? '...' : 'Entrer'}
          </button>
        </form>
      </div>
    </main>
  )
}
