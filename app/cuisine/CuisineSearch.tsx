'use client'

import { useState, useEffect } from 'react'
import { Utensils } from 'lucide-react'

type Country = { code: string; name: string; flag: string; recipe_count: number }
type Recipe = {
  id: string
  name: string
  subtitle: string
  emoji: string
  photo: string | null
  prep_min: number
  cook_min: number
  difficulty: string
  country: { name: string; code: string; flag: string }
  url: string
}

export default function CuisineSearch() {
  const [q, setQ] = useState('')
  const [country, setCountry] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Chargement des pays
  useEffect(() => {
    fetch('/api/cuisine/countries')
      .then(r => r.json())
      .then(d => setCountries(d.countries ?? []))
      .catch(() => {})
  }, [])

  // Chargement des recettes
  useEffect(() => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (country) p.set('country', country)
    p.set('limit', '24')

    const timer = setTimeout(() => {
      setLoading(true)
      fetch(`/api/cuisine?${p}`)
        .then(r => r.json())
        .then(d => { setRecipes(d.recipes ?? []); setTotal(d.total ?? 0) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [q, country])

  return (
    <>
      {/* Barre de recherche */}
      <div className="flex gap-4 mb-6">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher une recette… (tajine, curry, risotto…)"
          className="glass-card rounded-2xl px-6 py-4 flex-1 bg-transparent text-xl outline-none placeholder:text-zinc-600"
        />
        <div className="relative">
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="glass-card rounded-2xl pl-5 pr-10 py-4 text-base outline-none cursor-pointer appearance-none"
            style={{ background: '#1e293b', color: 'white' }}
          >
            <option value="" style={{ background: '#1e293b', color: 'white' }}>🌍 Tous les pays</option>
            {countries.map(c => (
              <option key={c.code} value={c.code} style={{ background: '#1e293b', color: 'white' }}>
                {c.flag} {c.name} ({c.recipe_count})
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
        </div>
      </div>

      {/* Compteur */}
      {!loading && (
        <p className="text-white text-sm mb-4">
          {total.toLocaleString('fr-FR')} recette{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
          {(q || country) && ' · filtrées'}
        </p>
      )}

      {/* Grille */}
      {loading ? (
        <div className="text-zinc-600 text-center py-16 text-lg">Chargement…</div>
      ) : recipes.length === 0 ? (
        <div className="text-zinc-600 text-center py-16 text-lg">Aucune recette trouvée</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recipes.map(r => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl p-4 hover:scale-[1.02] transition-all block"
            >
              {r.photo ? (
                <img
                  src={r.photo}
                  alt={r.name}
                  className="w-full h-28 object-cover rounded-xl mb-3"
                />
              ) : (
                <div className="w-full h-28 rounded-xl mb-3 bg-white/5 flex items-center justify-center">
                  <Utensils size={36} className="text-zinc-600" />
                </div>
              )}
              <div className="text-sm font-semibold leading-tight">{r.name}</div>
              <div className="text-xs text-zinc-400 mt-1">
                {r.country.flag} {r.country.name}
              </div>
              {(r.prep_min > 0 || r.cook_min > 0) && (
                <div className="text-xs text-zinc-600 mt-1">
                  {r.prep_min + r.cook_min} min · {r.difficulty}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
