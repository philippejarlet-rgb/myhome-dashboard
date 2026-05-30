# News Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un catalogue de 20 sources news par pays, une page `/news` pour les sélectionner, et mettre à jour le ticker pour utiliser les sources choisies.

**Architecture:** `lib/newsCatalog.ts` contient la liste hardcodée. `app/api/news/route.ts` lit les préférences depuis Supabase et fetche les flux RSS sélectionnés. `app/news/page.tsx` permet de cocher/décocher les sources. Le bottom bar remplace Agenda par News.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Supabase, rss2json.com API.

---

## File Structure

| Fichier | Action |
|---|---|
| `lib/newsCatalog.ts` | Créer — catalogue hardcodé des 20 sources |
| `app/api/news/route.ts` | Modifier — lire sources depuis Supabase, fetcher plusieurs flux |
| `app/news/page.tsx` | Créer — page sélection des sources |
| `components/BottomBar.tsx` | Modifier — ajouter bouton News |

---

### Task 1: Catalogue des sources

**Files:**
- Create: `lib/newsCatalog.ts`

- [ ] **Step 1: Créer `lib/newsCatalog.ts`**

```typescript
export type NewsSource = {
  id: string
  country: 'fr' | 'ch' | 'be' | 'int'
  label: string
  domain: string
  rss: string
}

export const NEWS_CATALOG: NewsSource[] = [
  // France
  { id: 'lemonde', country: 'fr', label: 'Le Monde', domain: 'lemonde.fr', rss: 'https://www.lemonde.fr/rss/une.xml' },
  { id: 'lefigaro', country: 'fr', label: 'Le Figaro', domain: 'lefigaro.fr', rss: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
  { id: 'bfmtv', country: 'fr', label: 'BFM TV', domain: 'bfmtv.com', rss: 'https://www.bfmtv.com/rss/news-24-7/' },
  { id: 'cnews', country: 'fr', label: 'CNews', domain: 'cnews.fr', rss: 'https://www.cnews.fr/rss.xml' },
  { id: '20minutes', country: 'fr', label: '20 Minutes', domain: '20minutes.fr', rss: 'https://www.20minutes.fr/feeds/rss/actu/' },
  // Suisse
  { id: 'rts', country: 'ch', label: 'RTS', domain: 'rts.ch', rss: 'https://www.rts.ch/rss/info/' },
  { id: 'letemps', country: 'ch', label: 'Le Temps', domain: 'letemps.ch', rss: 'https://www.letemps.ch/rss' },
  { id: '20minch', country: 'ch', label: '20min.ch', domain: '20min.ch', rss: 'https://www.20min.ch/rss/rss.tmpl?type=channel&get=1' },
  { id: 'tdg', country: 'ch', label: 'Tribune de Genève', domain: 'tdg.ch', rss: 'https://www.tdg.ch/rss' },
  { id: '24heures', country: 'ch', label: '24heures', domain: '24heures.ch', rss: 'https://www.24heures.ch/rss' },
  // Belgique
  { id: 'rtbf', country: 'be', label: 'RTBF', domain: 'rtbf.be', rss: 'https://www.rtbf.be/api/partner/json/rss?collection=13&partner=rss' },
  { id: 'lesoir', country: 'be', label: 'Le Soir', domain: 'lesoir.be', rss: 'https://www.lesoir.be/feed' },
  { id: 'lalibre', country: 'be', label: 'La Libre', domain: 'lalibre.be', rss: 'https://www.lalibre.be/arc/outboundfeeds/rss/' },
  { id: 'rtlinfo', country: 'be', label: 'RTL Info', domain: 'rtl.be', rss: 'https://feeds.rtl.be/rtlinfo_fr' },
  { id: 'dhnet', country: 'be', label: 'DH Les Sports+', domain: 'dhnet.be', rss: 'https://www.dhnet.be/feed' },
  // International
  { id: 'bbc', country: 'int', label: 'BBC World', domain: 'bbc.co.uk', rss: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'reuters', country: 'int', label: 'Reuters', domain: 'reuters.com', rss: 'https://feeds.reuters.com/reuters/topNews' },
  { id: 'aljazeera', country: 'int', label: 'Al Jazeera', domain: 'aljazeera.com', rss: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'guardian', country: 'int', label: 'The Guardian', domain: 'theguardian.com', rss: 'https://www.theguardian.com/international/rss' },
  { id: 'france24', country: 'int', label: 'France 24', domain: 'france24.com', rss: 'https://www.france24.com/fr/rss' },
]

export const COUNTRY_LABELS: Record<string, string> = {
  fr: '🇫🇷 France',
  ch: '🇨🇭 Suisse',
  be: '🇧🇪 Belgique',
  int: '🌍 International',
}

export const DEFAULT_SOURCES = ['cnews', 'bbc']

export function logoUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/newsCatalog.ts
git commit -m "feat: add news sources catalog"
```

---

### Task 2: Mettre à jour l'API news

**Files:**
- Modify: `app/api/news/route.ts`

- [ ] **Step 1: Remplacer `app/api/news/route.ts`**

```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NEWS_CATALOG, DEFAULT_SOURCES } from '@/lib/newsCatalog'

export const dynamic = 'force-dynamic'

type NewsItem = { time: string; title: string }

function parseItems(data: { items?: { title: string; pubDate?: string }[] }): NewsItem[] {
  return (data.items ?? []).slice(0, 5).map((item) => {
    let time = ''
    if (item.pubDate) {
      const d = new Date(item.pubDate)
      time = `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
    }
    return { time, title: item.title }
  })
}

export async function GET() {
  const customNews: NewsItem[] = [{ time: '', title: 'MYHOME V2' }]

  // Lire les sources sélectionnées
  let selectedIds: string[] = DEFAULT_SOURCES
  try {
    const { data } = await supabaseAdmin
      .from('app_data')
      .select('data')
      .eq('type', 'news_sources')
      .single()
    if (Array.isArray(data?.data) && data.data.length > 0) {
      selectedIds = data.data as string[]
    }
  } catch {
    // garde les défauts
  }

  // Trouver les sources correspondantes
  const sources = NEWS_CATALOG.filter((s) => selectedIds.includes(s.id))
  if (sources.length === 0) {
    return Response.json(customNews)
  }

  // Fetcher tous les flux en parallèle
  try {
    const results = await Promise.allSettled(
      sources.map((s) =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(s.rss)}`)
          .then((r) => r.json())
          .then(parseItems)
      )
    )

    const allNews: NewsItem[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value)
      }
    }

    // Mélanger les news
    for (let i = allNews.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allNews[i], allNews[j]] = [allNews[j], allNews[i]]
    }

    return Response.json([...customNews, ...allNews.slice(0, 20)])
  } catch {
    return Response.json(customNews)
  }
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 3: Vérifier l'API**

Ouvrir `http://localhost:3000/api/news`  
Expected: tableau JSON avec `{ time, title }` de CNews et BBC mélangés.

- [ ] **Step 4: Commit**

```bash
git add app/api/news/route.ts
git commit -m "feat: news API reads selected sources from Supabase"
```

---

### Task 3: Page de sélection des sources

**Files:**
- Create: `app/news/page.tsx`

- [ ] **Step 1: Créer `app/news/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NEWS_CATALOG, COUNTRY_LABELS, DEFAULT_SOURCES, logoUrl } from '@/lib/newsCatalog'

const COUNTRIES = ['fr', 'ch', 'be', 'int'] as const

export default function NewsPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>(DEFAULT_SOURCES)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/data/news_sources')
      .then((r) => r.json())
      .then((data: string[]) => {
        if (Array.isArray(data) && data.length > 0) setSelected(data)
      })
      .catch(() => {})
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={() => router.push('/')}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>
        <div>
          <h1 className="text-5xl font-thin">Sources d&apos;actualité</h1>
          <p className="text-zinc-400 mt-1">Sélectionne les sources affichées dans le ticker</p>
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

    </main>
  )
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 3: Vérifier sur `http://localhost:3000/news`**

- 4 sections pays avec drapeau
- 5 logos par section
- Clic sur un logo → bordure cyan + coche
- Bouton Enregistrer → "✓ Sauvegardé"

- [ ] **Step 4: Commit**

```bash
git add app/news/page.tsx
git commit -m "feat: add /news page for selecting news sources"
```

---

### Task 4: Bouton News dans le bottom bar

**Files:**
- Modify: `components/BottomBar.tsx`

- [ ] **Step 1: Ajouter News dans la liste `items`**

Dans `components/BottomBar.tsx`, ajouter `{ icon: '📰', label: 'News', href: '/news' }` dans le tableau `items`, après `'📸 Photos'` :

```typescript
const items = [
  { icon: '🌤️', label: 'Météo', href: '/weather' },
  { icon: '🎵', label: 'Radios', href: '/radios' },
  { icon: '🍳', label: 'Recettes', href: '/recipes' },
  { icon: '🌍', label: 'Atlas', href: 'https://atlasculinaire.com/' },
  { icon: '🛒', label: 'Courses', href: '/courses' },
  { icon: '📝', label: 'Todo', href: '/todo' },
  { icon: '📸', label: 'Photos', href: '/photos' },
  { icon: '📰', label: 'News', href: '/news' },
]
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/BottomBar.tsx
git commit -m "feat: add News button to bottom bar"
```

---

### Task 5: Push final

- [ ] **Step 1: Push**

```bash
git push origin main
```

Expected: Vercel rebuilde. Sur `myhome.lpj.ch`, le bouton 📰 News apparaît dans la bottom bar.

- [ ] **Step 2: Vérifier sur le site déployé**

- Aller sur `/news` → sélectionner quelques sources → Enregistrer
- Revenir sur le dashboard → le ticker affiche les news des sources choisies

Note: il faut attendre ~30 secondes pour le rebuild Vercel + rafraîchir la page pour que le ticker utilise les nouvelles sources.
