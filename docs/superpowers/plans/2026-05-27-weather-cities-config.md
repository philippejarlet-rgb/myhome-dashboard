# Villes Météo Configurables — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre de configurer la ville principale et les villes de comparaison du widget et du screensaver depuis la page `/weather`.

**Architecture:** On enrichit le type `City` avec `main?` et `favorite?`, on ajoute deux boutons sur chaque carte de la page météo, et on modifie `/api/weather` pour lire la config depuis `data/weather.json` au lieu du code hardcodé. Le widget et le screensaver ne changent pas.

**Tech Stack:** Next.js 16 App Router, React 19, Node.js `fs` (readFileSync/existsSync).

---

## Fichiers

| Fichier | Action |
|---|---|
| `app/api/weather/route.ts` | Modification — lire ville principale et favoris depuis data/weather.json |
| `app/weather/page.tsx` | Modification — type City étendu, boutons Principale/Favori |

---

### Task 1 : Modifier `app/api/weather/route.ts`

**Fichiers :**
- Modifier : `app/api/weather/route.ts`

- [ ] **Étape 1 : Remplacer le contenu complet du fichier**

Le fichier actuel hardcode `MAIN_CITY = 'Louhans'` et `COMPARISON_CITIES = [...]`. Le remplacer entièrement par :

```typescript
import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const BASE = 'https://api.openweathermap.org/data/2.5'

type City = {
  name: string
  main?: boolean
  favorite?: boolean
}

function getWeatherConfig(): { mainCity: string; comparisonCities: string[] } {
  const filePath = path.join(process.cwd(), 'data', 'weather.json')
  if (!existsSync(filePath)) {
    return { mainCity: 'Louhans', comparisonCities: [] }
  }
  try {
    const cities: City[] = JSON.parse(readFileSync(filePath, 'utf-8'))
    const mainCity = cities.find((c) => c.main)?.name ?? 'Louhans'
    const comparisonCities = cities
      .filter((c) => c.favorite)
      .slice(0, 3)
      .map((c) => c.name)
    return { mainCity, comparisonCities }
  } catch {
    return { mainCity: 'Louhans', comparisonCities: [] }
  }
}

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  const { mainCity, comparisonCities } = getWeatherConfig()

  try {
    const [mainRes, forecastRes, ...cityResponses] = await Promise.all([
      fetch(`${BASE}/weather?q=${mainCity}&units=metric&lang=fr&appid=${apiKey}`),
      fetch(`${BASE}/forecast?q=${mainCity}&units=metric&lang=fr&appid=${apiKey}`),
      ...comparisonCities.map((city) =>
        fetch(`${BASE}/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`)
      ),
    ])

    const [main, forecastData, ...cities] = await Promise.all([
      mainRes.json(),
      forecastRes.json(),
      ...cityResponses.map((r) => r.json()),
    ])

    const forecast = (forecastData.list as unknown[])
      .filter((_: unknown, i: number) => i % 8 === 0)
      .slice(0, 5)

    return NextResponse.json({ main, forecast, cities })
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération météo' },
      { status: 500 }
    )
  }
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add app/api/weather/route.ts
git commit -m "feat: weather API reads city config from data/weather.json"
```

---

### Task 2 : Modifier `app/weather/page.tsx`

**Fichiers :**
- Modifier : `app/weather/page.tsx`

- [ ] **Étape 1 : Mettre à jour le type `City`**

Remplacer :
```typescript
type City = {
  name: string
  temp: string
  weather: string
  icon: string
}
```

Par :
```typescript
type City = {
  name: string
  temp: string
  weather: string
  icon: string
  main?: boolean
  favorite?: boolean
}
```

- [ ] **Étape 2 : Ajouter les fonctions `toggleMain` et `toggleFavorite`**

Après la fonction `deleteCity` (après la ligne `setCities(updated)` et le `}`), ajouter :

```typescript
  // TOGGLE MAIN

  const toggleMain = (index: number) => {
    const updated = cities.map((city, i) => ({
      ...city,
      main: i === index ? !city.main : false,
    }))
    setCities(updated)
  }

  // TOGGLE FAVORITE

  const toggleFavorite = (index: number) => {
    const city = cities[index]
    const favoriteCount = cities.filter((c) => c.favorite).length
    if (!city.favorite && favoriteCount >= 3) return
    const updated = cities.map((c, i) => ({
      ...c,
      favorite: i === index ? !c.favorite : c.favorite,
    }))
    setCities(updated)
  }
```

- [ ] **Étape 3 : Mettre à jour les cartes ville dans le JSX**

Remplacer le bloc de la grille (le `div` de chaque carte, de `<div key={index}` jusqu'au `</div>` fermant, lignes 203-235) par :

```typescript
          <div
            key={index}
            className="glass-card rounded-3xl p-8 relative flex flex-col"
          >

            <button
              onClick={() => deleteCity(index)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-300"
            >
              ✕
            </button>

            <h2 className="text-2xl">
              {city.name}
            </h2>

            <p className="text-7xl mt-6 font-thin">
              {city.temp}
            </p>

            <div className="flex items-center gap-3 mt-4">

              <div className="text-4xl">
                {city.icon}
              </div>

              <p className="text-zinc-300 capitalize">
                {city.weather}
              </p>

            </div>

            <div className="flex gap-2 mt-4">

              <button
                onClick={() => toggleMain(index)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all ${
                  city.main
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                ⭐ Principale
              </button>

              <button
                onClick={() => toggleFavorite(index)}
                disabled={!city.favorite && cities.filter((c) => c.favorite).length >= 3}
                className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all ${
                  city.favorite
                    ? 'bg-cyan-500 text-white'
                    : !city.favorite && cities.filter((c) => c.favorite).length >= 3
                    ? 'opacity-40 cursor-not-allowed bg-white/10 text-zinc-300'
                    : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                ♥ Favori
              </button>

            </div>

          </div>
```

Note : le `h-64` (hauteur fixe) est retiré — les boutons ajoutent de la hauteur, `flex flex-col` remplace.

- [ ] **Étape 4 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 5 : Commit**

```bash
git add app/weather/page.tsx
git commit -m "feat: weather page allows setting main city and favorites"
```

---

### Task 3 : Déployer sur Infomaniak

- [ ] **Étape 1 : Push**
```bash
git push
```

- [ ] **Étape 2 : SSH Infomaniak**
```bash
cd ~/sites/myhome.lpj.ch && git pull && npm run build
```

- [ ] **Étape 3 : Redémarrer** depuis le dashboard Infomaniak

- [ ] **Étape 4 : Vérifier**

Ouvrir `https://myhome.lpj.ch/weather`. Ajouter quelques villes. Marquer une ville comme "Principale" et jusqu'à 3 comme "Favori". Retourner sur la page d'accueil → le widget météo doit afficher la nouvelle ville principale et les favoris.
