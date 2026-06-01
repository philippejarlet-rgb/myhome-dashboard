'use client'

import { useEffect, useState } from 'react'

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

export default function RecetteDuMonde() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/cuisine/random')
      .then(r => r.json())
      .then(data => { setRecipe(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="glass-card rounded-3xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-base">Recettes du monde</h2>
        <button
          onClick={load}
          className="text-zinc-500 hover:text-white transition-all text-lg leading-none"
          title="Autre recette"
        >
          🔀
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">Chargement…</div>
      ) : recipe ? (
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex gap-3 hover:opacity-90 transition-opacity min-h-0"
        >
          {/* Image — 50% largeur */}
          <div className="w-1/2 flex-shrink-0">
            {recipe.photo ? (
              <img
                src={recipe.photo}
                alt={recipe.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center text-4xl">
                {recipe.emoji ?? '🍽️'}
              </div>
            )}
          </div>
          {/* Texte — 50% largeur */}
          <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
            <div className="text-sm font-semibold leading-tight">{recipe.name}</div>
            {recipe.subtitle && (
              <div className="text-xs text-zinc-500 leading-tight line-clamp-2">{recipe.subtitle}</div>
            )}
            <div className="text-xs text-zinc-400 mt-1">
              {recipe.country.flag} {recipe.country.name}
            </div>
            {(recipe.prep_min > 0 || recipe.cook_min > 0) && (
              <div className="text-xs text-zinc-500">⏱ {recipe.prep_min + recipe.cook_min} min · {recipe.difficulty}</div>
            )}
          </div>
        </a>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">Indisponible</div>
      )}
    </div>
  )
}
