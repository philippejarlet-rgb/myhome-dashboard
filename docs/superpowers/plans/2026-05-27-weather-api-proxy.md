# Weather API Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déplacer la clé OpenWeatherMap côté serveur via une route API proxy, supprimer toute trace de la clé dans le code client.

**Architecture:** Deux routes serveur Next.js (`/api/weather` et `/api/weather/city`) lisent la clé depuis `process.env.OPENWEATHER_API_KEY`. `WeatherWidget` fait 1 appel au lieu de 5. `weather/page.tsx` proxie la recherche de ville.

**Tech Stack:** Next.js 16 App Router, TypeScript, `process.env`, `NextRequest`/`NextResponse`

---

## Fichiers

| Fichier | Action | Rôle |
|---|---|---|
| `app/api/weather/route.ts` | Création | Retourne toutes les données dashboard (Louhans + forecast + 3 villes) en 1 appel |
| `app/api/weather/city/route.ts` | Création | Recherche dynamique d'une ville (pour weather/page.tsx) |
| `components/WeatherWidget.tsx` | Modification | Remplace 5 fetches directs OWM → 1 fetch `/api/weather` |
| `app/weather/page.tsx` | Modification | Remplace fetch direct OWM → fetch `/api/weather/city?q=...` |
| `.env.local` | Création locale | Contient `OPENWEATHER_API_KEY` pour le dev local |

---

### Task 1 : Créer `.env.local` en local

**Fichiers :**
- Créer : `.env.local` (à la racine du projet)

- [ ] **Étape 1 : Créer le fichier `.env.local`**

Créer à la racine du projet `c:\Users\LPJ\myhome-dashboard\.env.local` avec ce contenu exact :

```
OPENWEATHER_API_KEY=85311cc10563ad5a64b50621bb4db25e
```

- [ ] **Étape 2 : Vérifier que `.gitignore` l'exclut**

Le fichier `.gitignore` contient déjà `.env*` à la ligne 34 — aucune action requise.

---

### Task 2 : Créer la route dashboard `/api/weather`

**Fichiers :**
- Créer : `app/api/weather/route.ts`

- [ ] **Étape 1 : Créer le fichier `app/api/weather/route.ts`**

```typescript
import { NextResponse } from 'next/server'

const MAIN_CITY = 'Louhans'
const COMPARISON_CITIES = ['Bali', 'Grez-Doiceau', 'Barcelone']
const BASE = 'https://api.openweathermap.org/data/2.5'

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  try {
    const [mainRes, forecastRes, ...cityResponses] = await Promise.all([
      fetch(`${BASE}/weather?q=${MAIN_CITY}&units=metric&lang=fr&appid=${apiKey}`),
      fetch(`${BASE}/forecast?q=${MAIN_CITY}&units=metric&lang=fr&appid=${apiKey}`),
      ...COMPARISON_CITIES.map((city) =>
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

- [ ] **Étape 2 : Vérifier la route manuellement**

Démarrer le serveur dev : `npm run dev`

Ouvrir dans le navigateur : `http://localhost:3000/api/weather`

Résultat attendu : un JSON avec les clés `main`, `forecast` (5 éléments), `cities` (3 éléments).

- [ ] **Étape 3 : Commit**

```bash
git add app/api/weather/route.ts .env.local
git commit -m "feat: add server-side weather proxy route"
```

Note : `.env.local` sera ignoré par git (`.gitignore`), seul `route.ts` sera commité.

---

### Task 3 : Créer la route ville `/api/weather/city`

**Fichiers :**
- Créer : `app/api/weather/city/route.ts`

- [ ] **Étape 1 : Créer le fichier `app/api/weather/city/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  const q = request.nextUrl.searchParams.get('q')

  if (!q) {
    return NextResponse.json(
      { error: 'Paramètre q manquant' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=metric&lang=fr&appid=${apiKey}`
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération météo' },
      { status: 500 }
    )
  }
}
```

- [ ] **Étape 2 : Vérifier la route manuellement**

Ouvrir dans le navigateur : `http://localhost:3000/api/weather/city?q=Paris`

Résultat attendu : JSON OpenWeatherMap avec `cod: 200`, `name: "Paris"`, `main.temp`, etc.

Tester une ville invalide : `http://localhost:3000/api/weather/city?q=zzzinvalid`

Résultat attendu : JSON avec `cod: "404"`.

- [ ] **Étape 3 : Commit**

```bash
git add app/api/weather/city/route.ts
git commit -m "feat: add server-side city weather lookup route"
```

---

### Task 4 : Mettre à jour `WeatherWidget.tsx`

**Fichiers :**
- Modifier : `components/WeatherWidget.tsx`

- [ ] **Étape 1 : Remplacer le `useEffect` de fetch**

Remplacer entièrement la fonction `fetchWeather` dans le `useEffect` (lignes 17-71) par :

```typescript
useEffect(() => {
  async function fetchWeather() {
    const response = await fetch('/api/weather')
    if (!response.ok) return
    const data = await response.json()
    setWeather(data.main)
    setCitiesWeather(data.cities)
    setForecast(data.forecast)
  }
  fetchWeather()
}, [])
```

Supprimer également la constante `cities` (lignes 11-15) — elle n'est plus utilisée dans ce composant.

- [ ] **Étape 2 : Vérifier dans le navigateur**

Ouvrir `http://localhost:3000`. Le widget météo doit afficher Louhans, les 3 villes et les prévisions exactement comme avant.

Vérifier dans les DevTools (onglet Network) qu'il n'y a plus qu'**1 seul appel** vers `/api/weather` au lieu de 5 appels vers `openweathermap.org`.

Vérifier que la clé API n'apparaît plus dans les requêtes réseau.

- [ ] **Étape 3 : Commit**

```bash
git add components/WeatherWidget.tsx
git commit -m "feat: WeatherWidget uses server proxy, removes client-side API key"
```

---

### Task 5 : Mettre à jour `app/weather/page.tsx`

**Fichiers :**
- Modifier : `app/weather/page.tsx`

- [ ] **Étape 1 : Remplacer le fetch dans `addCity`**

Remplacer la fonction `addCity` (lignes 60-124) par :

```typescript
const addCity = async () => {
  if (!newCity.trim()) return

  try {
    const response = await fetch(
      `/api/weather/city?q=${encodeURIComponent(newCity)}`
    )
    const data = await response.json()

    if (data.cod !== 200) {
      alert('Ville introuvable 😄')
      return
    }

    setCities([
      ...cities,
      {
        name: data.name,
        temp: `${Math.round(data.main.temp)}°`,
        weather: data.weather[0].description,
        icon: (() => {
          const main = data.weather[0].main.toLowerCase()
          if (main.includes('cloud')) return '☁️'
          if (main.includes('rain')) return '🌧'
          if (main.includes('storm')) return '⛈'
          if (main.includes('snow')) return '❄️'
          return '☀️'
        })(),
      },
    ])

    setNewCity('')
  } catch (error) {
    console.error(error)
    alert('Erreur météo 😄')
  }
}
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Ouvrir `http://localhost:3000/weather`. Ajouter une ville (ex: "Lyon"). Elle doit s'afficher avec sa météo.

Vérifier dans les DevTools (onglet Network) que la requête part vers `/api/weather/city?q=Lyon` et non vers `openweathermap.org` directement.

- [ ] **Étape 3 : Commit**

```bash
git add app/weather/page.tsx
git commit -m "feat: weather page uses server proxy for city lookup"
```

---

### Task 6 : Vérification finale avant déploiement

- [ ] **Étape 1 : Grep de sécurité**

Vérifier qu'il ne reste aucune trace de la clé API dans le code :

```bash
grep -r "85311cc10563ad5a64b50621bb4db25e" app/ components/
```

Résultat attendu : aucun résultat.

- [ ] **Étape 2 : Build de production**

```bash
npm run build
```

Résultat attendu : build réussi sans erreurs TypeScript.

- [ ] **Étape 3 : Test du build en local**

```bash
npm start
```

Ouvrir `http://localhost:3000` et vérifier que la météo s'affiche correctement en mode production.

- [ ] **Étape 4 : Commit final si tout est ok**

```bash
git add -A
git status  # vérifier qu'il ne reste rien de non commité
```
