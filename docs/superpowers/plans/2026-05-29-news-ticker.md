# News Ticker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le bandeau de news BBC par un ticker style CNews — fond rouge dégradé, label "DERNIÈRE MINUTE" fixe, titres avec heure en défilement horizontal.

**Architecture:** L'API retourne des objets `{ time, title }` au lieu de simples strings. Le composant NewsTicker affiche un label fixe à gauche et un défilement CSS infini à droite.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, RSS via rss2json.com.

---

## File Structure

| Fichier | Action |
|---|---|
| `app/api/news/route.ts` | Modifier — source CNews, retourner `{ time, title }[]` |
| `components/NewsTicker.tsx` | Modifier — design CNews, défilement CSS |

---

### Task 1: Mettre à jour l'API news

**Files:**
- Modify: `app/api/news/route.ts`

- [ ] **Step 1: Remplacer le contenu de `app/api/news/route.ts`**

```typescript
export const dynamic = 'force-dynamic'

type NewsItem = { time: string; title: string }

export async function GET() {
  const customNews: NewsItem[] = [
    { time: '', title: 'MYHOME V2' },
  ]

  try {
    const rssUrl = 'https://www.cnews.fr/rss.xml'
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
    )
    const data = await response.json()

    const rssNews: NewsItem[] = (data.items ?? [])
      .slice(0, 10)
      .map((item: { title: string; pubDate?: string }) => {
        let time = ''
        if (item.pubDate) {
          const d = new Date(item.pubDate)
          time = `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
        }
        return { time, title: item.title }
      })

    return Response.json([...customNews, ...rssNews])
  } catch {
    return Response.json(customNews)
  }
}
```

- [ ] **Step 2: Vérifier l'API dans le browser**

Ouvrir `http://localhost:3000/api/news`  
Expected : tableau JSON de type `[{ time: "", title: "MYHOME V2" }, { time: "14h32", title: "..." }, ...]`

- [ ] **Step 3: Commit**

```bash
git add app/api/news/route.ts
git commit -m "feat: news API returns CNews RSS with time+title objects"
```

---

### Task 2: Redesign du composant NewsTicker

**Files:**
- Modify: `components/NewsTicker.tsx`

- [ ] **Step 1: Remplacer entièrement `components/NewsTicker.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

type NewsItem = { time: string; title: string }

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data: NewsItem[]) => setNews(data))
      .catch(() => {})
  }, [])

  if (news.length === 0) return null

  const items = [...news, ...news] // double pour boucle continue

  return (
    <div className="fixed bottom-36 left-0 w-full z-50 flex items-stretch shadow-2xl overflow-hidden"
         style={{ background: 'linear-gradient(to right, #7f1d1d, #b91c1c)' }}>

      {/* Label fixe */}
      <div className="shrink-0 flex items-center px-4 border-r border-white/30"
           style={{ background: '#7f1d1d' }}>
        <span className="text-white font-bold text-xs tracking-widest uppercase whitespace-nowrap">
          Dernière minute
        </span>
      </div>

      {/* Défilement */}
      <div className="flex-1 overflow-hidden py-2">
        <div className="flex gap-12 animate-news-scroll whitespace-nowrap">
          {items.map((item, i) => (
            <span key={i} className="text-white text-sm inline-flex items-center gap-2 shrink-0">
              {item.time && (
                <span className="text-red-200 font-semibold text-xs">{item.time}</span>
              )}
              <span>{item.title}</span>
              <span className="text-red-300 mx-2">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Ajouter l'animation dans `app/globals.css`**

Ouvrir `app/globals.css` et ajouter avant la dernière accolade ou à la fin du fichier :

```css
@keyframes news-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-news-scroll {
  animation: news-scroll 60s linear infinite;
}
```

- [ ] **Step 3: Vérifier sur `http://localhost:3000`**

- Le bandeau rouge dégradé s'affiche en bas
- "DERNIÈRE MINUTE" est fixe à gauche
- Les titres CNews avec l'heure défilent de droite à gauche
- "MYHOME V2" apparaît sans heure ni emoji

- [ ] **Step 4: Commit**

```bash
git add components/NewsTicker.tsx app/globals.css
git commit -m "feat: redesign news ticker — CNews style with gradient and time"
```

---

### Task 3: Push final

- [ ] **Step 1: Push**

```bash
git push origin main
```

Expected : Vercel rebuilde automatiquement, ticker visible sur `myhome.lpj.ch`.
