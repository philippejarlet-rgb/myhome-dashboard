# Photos Upload & Screensaver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre l'upload et la suppression de photos depuis la page `/photos`, affichée en grille 3 colonnes, et faire utiliser ces mêmes photos au screensaver de façon dynamique et aléatoire.

**Architecture:** Trois endpoints API Next.js (GET liste, POST upload, DELETE) lisent/écrivent dans `public/photos/`. La page `/photos` devient entièrement dynamique. Le Screensaver charge la liste via l'API et mélange aléatoirement (Fisher-Yates) à chaque activation.

**Tech Stack:** Next.js 16 App Router, TypeScript, Node.js `fs` module, Web API `FormData`/`File`, Tailwind CSS 4.

---

## File Structure

| Fichier | Action |
|---|---|
| `app/api/photos/route.ts` | Créer — GET (liste fichiers) + POST (upload) |
| `app/api/photos/[filename]/route.ts` | Créer — DELETE (suppression) |
| `app/photos/page.tsx` | Modifier — grille 3 col, upload, suppression |
| `components/Screensaver.tsx` | Modifier — liste dynamique + shuffle |

---

### Task 1: API GET + POST `/api/photos`

**Files:**
- Create: `app/api/photos/route.ts`

- [ ] **Step 1: Créer le fichier `app/api/photos/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, mkdirSync, existsSync, writeFileSync } from 'fs'
import path from 'path'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function GET() {
  if (!existsSync(PHOTOS_DIR)) {
    return NextResponse.json([])
  }
  try {
    const files = readdirSync(PHOTOS_DIR).filter((f) =>
      IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
    )
    return NextResponse.json(files)
  } catch {
    return NextResponse.json({ error: 'Erreur lecture répertoire' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Champ "file" manquant' }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
  }

  const filename = path.basename(file.name)
  if (!filename || filename.includes('..')) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
  }

  try {
    mkdirSync(PHOTOS_DIR, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    writeFileSync(path.join(PHOTOS_DIR, filename), Buffer.from(arrayBuffer))
    return NextResponse.json({ success: true, filename })
  } catch {
    return NextResponse.json({ error: 'Erreur sauvegarde fichier' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Vérifier GET en browser**

Ouvrir `http://localhost:3000/api/photos`  
Expected: tableau JSON des noms de fichiers dans `public/photos/` (ex. `["photo1.jpg","photo2.jpg",...]`)

- [ ] **Step 3: Vérifier POST avec curl**

```bash
curl -X POST http://localhost:3000/api/photos \
  -F "file=@/chemin/vers/test.jpg"
```
Expected: `{"success":true,"filename":"test.jpg"}`  
Vérifier que le fichier apparaît dans `public/photos/`.

- [ ] **Step 4: Commit**

```bash
git add app/api/photos/route.ts
git commit -m "feat: add GET/POST /api/photos endpoint"
```

---

### Task 2: API DELETE `/api/photos/[filename]`

**Files:**
- Create: `app/api/photos/[filename]/route.ts`

- [ ] **Step 1: Créer le fichier `app/api/photos/[filename]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { existsSync, unlinkSync } from 'fs'
import path from 'path'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
  }

  const filePath = path.join(PHOTOS_DIR, filename)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }

  try {
    unlinkSync(filePath)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur suppression fichier' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Vérifier DELETE avec curl**

```bash
# Remplacer test.jpg par un fichier existant dans public/photos/
curl -X DELETE http://localhost:3000/api/photos/test.jpg
```
Expected: `{"success":true}`  
Vérifier que le fichier a disparu de `public/photos/`.

- [ ] **Step 3: Vérifier 404 sur fichier inexistant**

```bash
curl -X DELETE http://localhost:3000/api/photos/inexistant.jpg
```
Expected: `{"error":"Fichier introuvable"}` avec status 404.

- [ ] **Step 4: Commit**

```bash
git add app/api/photos/[filename]/route.ts
git commit -m "feat: add DELETE /api/photos/[filename] endpoint"
```

---

### Task 3: Redesign de la page `/photos`

**Files:**
- Modify: `app/photos/page.tsx`

- [ ] **Step 1: Remplacer entièrement `app/photos/page.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PhotosPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = async () => {
    const res = await fetch('/api/photos')
    const data: string[] = await res.json()
    setPhotos(data)
  }

  useEffect(() => { loadPhotos() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const form = new FormData()
      form.append('file', file)
      await fetch('/api/photos', { method: 'POST', body: form })
    }
    await loadPhotos()
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Supprimer "${filename}" ?`)) return
    await fetch(`/api/photos/${encodeURIComponent(filename)}`, { method: 'DELETE' })
    setPhotos((prev) => prev.filter((f) => f !== filename))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/')}
            className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
          >
            ← Retour
          </button>
          <div>
            <h1 className="text-6xl font-thin">Photos</h1>
            <p className="text-zinc-400 mt-2 text-xl">Galerie immersive MYHOME</p>
          </div>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="glass-card rounded-2xl px-6 py-3 hover:scale-105 transition-all disabled:opacity-50"
          >
            {uploading ? 'Envoi en cours...' : '+ Ajouter des photos'}
          </button>
        </div>
      </div>

      {/* GRID */}
      {photos.length === 0 ? (
        <p className="text-zinc-500 text-center mt-20 text-xl">Aucune photo</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[75vh] pr-2">
          {photos.map((filename) => (
            <div key={filename} className="group relative overflow-hidden rounded-3xl h-56">
              <button
                onClick={() => setSelectedImage(`/photos/${filename}`)}
                className="w-full h-full"
              >
                <img
                  src={`/photos/${filename}`}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
              </button>
              <button
                onClick={() => handleDelete(filename)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-xl"
        >
          <img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%] rounded-3xl shadow-2xl"
          />
        </div>
      )}

    </main>
  )
}
```

- [ ] **Step 2: Vérifier sur `http://localhost:3000/photos`**

- Les photos existantes s'affichent en grille 3 colonnes
- Le bouton "+ Ajouter des photos" est visible en haut à droite
- Au hover sur une photo : la croix ✕ apparaît en haut à droite de la photo
- Cliquer une photo ouvre le fullscreen

- [ ] **Step 3: Tester l'upload**

- Cliquer "+ Ajouter des photos", sélectionner 1-2 images
- "Envoi en cours..." s'affiche pendant le transfert
- Les nouvelles photos apparaissent dans la grille après upload

- [ ] **Step 4: Tester la suppression**

- Hoverer sur une photo → croix ✕ visible
- Cliquer ✕ → confirm dialog apparaît
- Confirmer → la photo disparaît de la grille

- [ ] **Step 5: Commit**

```bash
git add app/photos/page.tsx
git commit -m "feat: redesign photos page — 3-col grid, upload, delete"
```

---

### Task 4: Screensaver dynamique avec shuffle

**Files:**
- Modify: `components/Screensaver.tsx`

- [ ] **Step 1: Remplacer entièrement `components/Screensaver.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

type Props = {
  onWake: () => void
}

type Weather = {
  city: string
  temp: number
  description: string
  icon: string
}

function getWeatherIcon(main: string): string {
  const m = main.toLowerCase()
  if (m.includes('cloud')) return '☁️'
  if (m.includes('rain')) return '🌧'
  if (m.includes('storm')) return '⛈'
  if (m.includes('snow')) return '❄️'
  return '☀️'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Screensaver({ onWake }: Props) {
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
  const [weather, setWeather] = useState<Weather | null>(null)

  // Chargement dynamique des photos
  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((files: string[]) => {
        setImages(shuffle(files.map((f) => `/photos/${f}`)))
      })
      .catch(() => {})
  }, [])

  // Rotation des images
  useEffect(() => {
    if (images.length === 0) return
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 20000)
    return () => clearInterval(interval)
  }, [images])

  // Horloge
  useEffect(() => {
    const updateTime = () =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Météo
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch('/api/weather')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()
        const main = data.main
        setWeather({
          city: main.name,
          temp: Math.round(main.main.temp),
          description: main.weather[0].description,
          icon: getWeatherIcon(main.weather[0].main),
        })
      } catch {
        // garde le placeholder affiché
      }
    }
    fetchWeather()
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const weatherText = weather
    ? `${weather.city} • ${weather.temp}° • ${weather.description} ${weather.icon}`
    : 'Louhans • ... • ...'

  return (
    <div
      onClick={onWake}
      className="fixed inset-0 overflow-hidden cursor-pointer z-[999]"
    >
      {/* Background image ou fond noir si aucune photo */}
      {images.length > 0 ? (
        <img
          src={images[currentImage]}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 animate-slowzoom"
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <div className="text-center animate-fadein">
          <h1 className="text-[12rem] font-thin tracking-wider">{time}</h1>
          <p className="text-3xl text-zinc-200 mt-6">{weatherText}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier le screensaver**

Attendre 10 minutes d'inactivité (ou réduire temporairement le timeout dans `app/page.tsx` à `5000` ms pour tester).  
Expected :
- Le screensaver s'affiche avec les photos de `public/photos/`
- Les photos changent toutes les 20 secondes
- L'ordre est différent à chaque activation (shuffle)
- Si `public/photos/` est vide → fond noir + heure uniquement

- [ ] **Step 3: Commit**

```bash
git add components/Screensaver.tsx
git commit -m "feat: screensaver uses dynamic photos from /api/photos with random shuffle"
```

---

### Task 5: Push final

- [ ] **Step 1: Vérifier que tout fonctionne ensemble**

- `http://localhost:3000/photos` : grille 3 col, upload, delete
- Screensaver : photos dynamiques
- `http://localhost:3000/api/photos` : liste correcte

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Déployer sur Infomaniak**

```bash
cd ~/sites/myhome.lpj.ch && git pull && npm run build
```

Note : les photos existantes dans `public/photos/` sur le serveur sont préservées par le déploiement. Les nouvelles photos uploadées via l'interface sont sauvegardées côté serveur et ne transitent pas par git.
