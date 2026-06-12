'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NEWS_CATALOG, COUNTRY_LABELS, DEFAULT_SOURCES, logoUrl } from '@/lib/newsCatalog'

const COUNTRIES = ['fr', 'ch', 'be', 'int'] as const

export default function NewsPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [bgImage, setBgImage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/backgrounds')
      .then((r) => r.json())
      .then((data: { selection?: Record<string, string | null> }) => {
        setBgImage(data.selection?.news ?? null)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/data/news_sources')
      .then((r) => r.json())
      .then((data: string[]) => {
        setSelected(Array.isArray(data) && data.length > 0 ? data : DEFAULT_SOURCES)
      })
      .catch(() => { setSelected(DEFAULT_SOURCES) })
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/data/news_sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <main
      className="min-h-screen text-white p-4 md:p-8 relative isolate"
    >
      <div className={`absolute inset-0 -z-10 ${bgImage ? 'bg-black/55' : 'bg-gradient-to-br from-slate-950 via-zinc-900 to-black'}`} />
      {bgImage && <div className="absolute inset-0 -z-20" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}

      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-10">
        <button
          onClick={() => router.push('/')}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>
        <div>
          <h1 className="text-3xl md:text-6xl font-thin">Vos News</h1>
          <p className="text-zinc-400 mt-1 md:mt-2 text-sm md:text-xl">Sélectionnez une ou plusieurs sources d&apos;info</p>
        </div>
      </div>

      {/* SOURCES PAR PAYS */}
      <div className="flex flex-col gap-10 max-w-4xl">
        {COUNTRIES.map((country) => (
          <div key={country}>
            <h2 className="text-xl font-semibold mb-4">{COUNTRY_LABELS[country]}</h2>
            <div className="grid grid-cols-5 gap-4">
              {NEWS_CATALOG.filter((s) => s.country === country).map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggle(source.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                    selected.includes(source.id)
                      ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/20 shadow-lg'
                      : 'glass-card hover:bg-white/10'
                  }`}
                >
                  <img
                    src={logoUrl(source.domain)}
                    alt={source.label}
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                  <span className="text-xs text-center leading-tight">{source.label}</span>
                  {selected.includes(source.id) && (
                    <span className="text-cyan-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SAVE */}
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded-2xl px-8 py-3 font-semibold transition-all"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && <span className="text-cyan-400 text-sm">✓ Sauvegardé</span>}
        <span className="text-zinc-500 text-sm">{selected.length} source{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}</span>
      </div>

      <div className="md:hidden text-center text-xs text-zinc-500 py-4 pb-20 mt-8">
        © {new Date().getFullYear()} MyHome
      </div>

    </main>
  )
}
