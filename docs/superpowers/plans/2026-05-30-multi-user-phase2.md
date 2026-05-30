# Multi-User Phase 2 — Auth JWT + Isolation des données

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prérequis :** Phase 1 déployée et testée. Ton compte admin créé via `/admin`.

**Goal:** Remplacer l'auth par mot de passe unique par JWT email+password, et isoler toutes les données par utilisateur dans Supabase.

**Architecture:** Le middleware valide un JWT (via `jose`) au lieu du session token. `app_data` filtre par `user_id`. Les photos sont organisées par dossier `{user_id}/`. Les données existantes sont migrées vers le compte admin.

**Tech Stack:** Next.js 16, TypeScript, jose, Supabase, Tailwind CSS 4.

---

## ⚠️ IMPORTANT — ordre des opérations

Les tâches 1 à 7 peuvent être committées sans pusher. On pousse TOUT en une fois à la tâche 8, APRÈS avoir préparé les env vars. Le switch auth est atomique.

---

## File Structure

| Fichier | Action |
|---|---|
| `lib/auth.ts` | Créer — JWT sign/verify avec jose |
| `middleware.ts` | Modifier — valider JWT, injecter user_id |
| `app/api/auth/login/route.ts` | Modifier — email + password + JWT |
| `app/api/auth/logout/route.ts` | Modifier — supprimer cookie JWT |
| `app/login/page.tsx` | Modifier — formulaire email + password |
| `app/api/data/[type]/route.ts` | Modifier — filtrer par user_id |
| `app/api/photos/route.ts` | Modifier — préfixer par user_id |
| `app/api/photos/[filename]/route.ts` | Modifier — préfixer par user_id |

---

### Task 1 : Installer jose

**Files:** `package.json`

- [ ] **Step 1 : Installer jose**

```bash
npm install jose
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add jose JWT library"
```

---

### Task 2 : Utilitaire JWT

**Files:**
- Create: `lib/auth.ts`

- [ ] **Step 1 : Créer `lib/auth.ts`**

```typescript
import { SignJWT, jwtVerify } from 'jose'

export type JWTPayload = {
  userId: string
  email: string
  name: string
}

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add JWT sign/verify utilities"
```

---

### Task 3 : Nouvelle API login

**Files:**
- Modify: `app/api/auth/login/route.ts`

- [ ] **Step 1 : Lire le fichier actuel**

Lire `app/api/auth/login/route.ts` pour mémoriser le contenu existant.

- [ ] **Step 2 : Remplacer par**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyPassword } from '@/lib/hashPassword'
import { signJWT } from '@/lib/auth'

const COOKIE_NAME = 'myhome_session'
const MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, password_hash')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const token = await signJWT({ userId: user.id, email: user.email, name: user.name })

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add app/api/auth/login/route.ts
git commit -m "feat: login with email + password, JWT cookie"
```

---

### Task 4 : Nouveau middleware JWT

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1 : Lire `middleware.ts` actuel**

- [ ] **Step 2 : Remplacer par**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'myhome_session'
const ADMIN_COOKIE = 'myhome_admin'
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/admin/login', '/api/auth/admin']

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value
    if (!adminCookie || adminCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-email', payload.email as string)
    response.headers.set('x-user-name', payload.name as string)
    return response
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.json|.*\\.webmanifest|sw\\.js).*)',
  ],
}
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware validates JWT, injects user_id headers"
```

---

### Task 5 : Nouvelle page login

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

- [ ] **Step 2 : Remplacer par**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black flex items-center justify-center">
      <div className="glass-card rounded-3xl p-10 w-96 flex flex-col items-center gap-6">
        <div className="text-5xl">🏠</div>
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
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: login page accepts email + password"
```

---

### Task 6 : Isolation app_data

**Files:**
- Modify: `app/api/data/[type]/route.ts`

- [ ] **Step 1 : Lire le fichier actuel**

- [ ] **Step 2 : Remplacer par**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const VALID_TYPES = ['todos', 'courses', 'radios', 'weather', 'news_sources']

const DEFAULTS: Record<string, unknown> = {
  todos: [],
  courses: { items: [], history: [] },
  radios: [],
  weather: [],
  news_sources: [],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json(DEFAULTS[type])

  const { data, error } = await supabaseAdmin
    .from('app_data')
    .select('data')
    .eq('type', type)
    .eq('user_id', userId)
    .single()

  if (error || !data) return NextResponse.json(DEFAULTS[type])
  return NextResponse.json(data.data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('app_data')
    .upsert({ type, user_id: userId, data: body })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add "app/api/data/[type]/route.ts"
git commit -m "feat: isolate app_data per user_id"
```

---

### Task 7 : Isolation photos

**Files:**
- Modify: `app/api/photos/route.ts`
- Modify: `app/api/photos/[filename]/route.ts`

- [ ] **Step 1 : Lire `app/api/photos/route.ts`**

- [ ] **Step 2 : Remplacer `app/api/photos/route.ts` par**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') ?? 'default'
  const { data, error } = await supabaseAdmin.storage.from('photos').list(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const files = (data ?? [])
    .map((f) => f.name)
    .filter((name) => IMAGE_EXTENSIONS.includes(('.' + name.split('.').pop()!).toLowerCase()))
  return NextResponse.json(files)
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') ?? 'default'

  let formData: FormData
  try { formData = await request.formData() }
  catch { return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }) }

  const fileEntry = formData.get('file')
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'Champ "file" manquant ou invalide' }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(fileEntry.type)) {
    return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
  }

  if (fileEntry.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
  }

  const ext = ('.' + fileEntry.name.split('.').pop()!).toLowerCase()
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: 'Extension non supportée' }, { status: 400 })
  }

  const base = fileEntry.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_\-]/g, '')
  const filename = `${userId}/${base || 'photo'}${ext}`

  const arrayBuffer = await fileEntry.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from('photos')
    .upload(filename, Buffer.from(arrayBuffer), { contentType: fileEntry.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, filename: `${base || 'photo'}${ext}` })
}
```

- [ ] **Step 3 : Lire `app/api/photos/[filename]/route.ts`**

- [ ] **Step 4 : Remplacer `app/api/photos/[filename]/route.ts` par**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const userId = request.headers.get('x-user-id') ?? 'default'

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Fichier invalide', { status: 400 })
  }

  const path = `${userId}/${filename}`
  const { data, error } = await supabaseAdmin.storage.from('photos').download(path)
  if (error) return new NextResponse('Fichier introuvable', { status: 404 })

  const ext = ('.' + filename.split('.').pop()!).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const buffer = await data.arrayBuffer()
  return new NextResponse(buffer, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const userId = request.headers.get('x-user-id') ?? 'default'

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.storage.from('photos').remove([`${userId}/${filename}`])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
git add app/api/photos/route.ts "app/api/photos/[filename]/route.ts"
git commit -m "feat: isolate photos per user_id in Supabase Storage"
```

---

### Task 8 : Migration Supabase + env vars

**Action utilisateur — AVANT de pusher**

- [ ] **Step 1 : Ajouter dans `.env.local` :**

```
JWT_SECRET=<générer avec : openssl rand -base64 32>
```

- [ ] **Step 2 : Ajouter sur Vercel :**
```
JWT_SECRET=<même valeur>
```

- [ ] **Step 3 : Récupérer ton user_id depuis Supabase**

Dans Supabase → Table Editor → `users` → copie ton `id` (UUID de ton compte).

- [ ] **Step 4 : Migrer les données existantes dans Supabase SQL Editor :**

```sql
-- Remplacer 'TON-USER-ID-ICI' par ton UUID copié à l'étape 3
UPDATE app_data SET user_id = 'TON-USER-ID-ICI' WHERE user_id IS NULL;
```

- [ ] **Step 5 : Vérifier dans Table Editor que toutes les lignes app_data ont un user_id.**

---

### Task 9 : Push final

- [ ] **Step 1 : Push**

```bash
git push origin main
```

- [ ] **Step 2 : Sur Vercel, supprimer les anciennes variables :**
  - `AUTH_PASSWORD`
  - `AUTH_SESSION_TOKEN`

- [ ] **Step 3 : Tester**
  - Aller sur `myhome.lpj.ch/login` → se connecter avec email + mot de passe
  - Vérifier que le dashboard s'affiche avec tes données
  - Aller sur `/photos` → vérifier que les photos s'affichent
  - Tester l'upload d'une photo
  - Créer un 2ème utilisateur depuis `/admin` et se connecter → vérifier qu'il a des données vides
