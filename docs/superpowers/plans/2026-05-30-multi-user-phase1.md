# Multi-User Phase 1 — Auth + Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un panneau d'administration `/admin` pour gérer les utilisateurs, sans toucher à l'auth existante — l'app reste fonctionnelle tout au long.

**Architecture:** La table `users` est créée dans Supabase. Une page `/admin` protégée par `ADMIN_PASSWORD` (env var) permet de créer/lister/supprimer des utilisateurs avec email + mot de passe haché (bcrypt). L'auth principale reste inchangée en Phase 1.

**Tech Stack:** Next.js 16, TypeScript, Supabase, bcryptjs, Tailwind CSS 4.

---

## File Structure

| Fichier | Action |
|---|---|
| `lib/hashPassword.ts` | Créer — bcrypt hash + compare |
| `app/api/auth/admin/login/route.ts` | Créer — auth admin (ADMIN_PASSWORD) |
| `app/api/auth/admin/logout/route.ts` | Créer — logout admin |
| `app/api/admin/users/route.ts` | Créer — CRUD utilisateurs |
| `app/admin/login/page.tsx` | Créer — page login admin |
| `app/admin/page.tsx` | Créer — dashboard admin |
| `middleware.ts` | Créer — remplace proxy.ts, gère auth principale + admin |

---

### Task 1 : Installer les dépendances

**Files:** `package.json`

- [ ] **Step 1 : Installer bcryptjs**

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

Expected: no errors.

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add bcryptjs dependency"
```

---

### Task 2 : Utilitaire hashPassword

**Files:**
- Create: `lib/hashPassword.ts`

- [ ] **Step 1 : Créer `lib/hashPassword.ts`**

```typescript
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add lib/hashPassword.ts
git commit -m "feat: add bcrypt password utilities"
```

---

### Task 3 : Supabase — table users

**Action utilisateur : exécuter ce SQL dans Supabase SQL Editor**

- [ ] **Step 1 : Aller dans Supabase → SQL Editor et exécuter :**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

Expected: "Success. No rows returned."

- [ ] **Step 2 : Vérifier dans Supabase → Table Editor que la table `users` existe avec les bonnes colonnes.**

---

### Task 4 : Variables d'environnement

**Action utilisateur**

- [ ] **Step 1 : Ajouter dans `.env.local` :**

```
ADMIN_PASSWORD=<ton mot de passe pour la page /admin>
```

- [ ] **Step 2 : Ajouter sur Vercel** (Settings → Environment Variables) :

```
ADMIN_PASSWORD=<même valeur>
```

---

### Task 5 : API auth admin

**Files:**
- Create: `app/api/auth/admin/login/route.ts`
- Create: `app/api/auth/admin/logout/route.ts`

- [ ] **Step 1 : Créer `app/api/auth/admin/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'myhome_admin'
const MAX_AGE = 4 * 60 * 60 // 4 heures

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}
```

- [ ] **Step 2 : Créer `app/api/auth/admin/logout/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('myhome_admin')
  return response
}
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add app/api/auth/admin/login/route.ts app/api/auth/admin/logout/route.ts
git commit -m "feat: add admin auth endpoints"
```

---

### Task 6 : API CRUD utilisateurs

**Files:**
- Create: `app/api/admin/users/route.ts`

- [ ] **Step 1 : Créer `app/api/admin/users/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword } from '@/lib/hashPassword'

function isAdminAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get('myhome_admin')?.value
  return !!cookie && cookie === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, is_admin, created_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { email, name, password } = await request.json()
  if (!email || !name || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ email, name, password_hash })
    .select('id, email, name, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add app/api/admin/users/route.ts
git commit -m "feat: add admin users CRUD API"
```

---

### Task 7 : Page login admin

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1 : Créer `app/admin/login/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black flex items-center justify-center">
      <div className="glass-card rounded-3xl p-10 w-96 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-thin text-white">⚙️ Admin</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            className="bg-white/10 text-white rounded-2xl px-4 py-3 outline-none placeholder:text-zinc-500"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl py-3 font-semibold transition-all"
          >
            Connexion
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

### Task 8 : Page admin dashboard

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1 : Créer `app/admin/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => { loadUsers() }, [])

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, name: newName, password: newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setSuccess(`Utilisateur ${data.name} créé`)
    setNewName(''); setNewEmail(''); setNewPassword('')
    loadUsers()
  }

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer ${name} et toutes ses données ?`)) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadUsers()
  }

  const logout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-5xl font-thin">⚙️ Administration</h1>
        <button onClick={logout} className="glass-card rounded-2xl px-4 py-2 text-sm hover:text-red-400 transition-all">
          Déconnexion
        </button>
      </div>

      {/* Créer un utilisateur */}
      <div className="glass-card rounded-3xl p-6 mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Créer un utilisateur</h2>
        <form onSubmit={createUser} className="flex flex-col gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom"
            className="bg-white/10 rounded-xl px-4 py-3 outline-none placeholder:text-zinc-500" />
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" type="email"
            className="bg-white/10 rounded-xl px-4 py-3 outline-none placeholder:text-zinc-500" />
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mot de passe" type="password"
            className="bg-white/10 rounded-xl px-4 py-3 outline-none placeholder:text-zinc-500" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-cyan-400 text-sm">✓ {success}</p>}
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 rounded-xl py-3 font-semibold transition-all">
            Créer
          </button>
        </form>
      </div>

      {/* Liste des utilisateurs */}
      <div className="glass-card rounded-3xl p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Utilisateurs ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-zinc-500">Aucun utilisateur</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                  <p className="text-zinc-500 text-xs">{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <button onClick={() => deleteUser(user.id, user.name)}
                  className="text-zinc-500 hover:text-red-400 transition-all text-sm">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add admin dashboard page"
```

---

### Task 9 : Middleware — protéger /admin

**Files:**
- Create: `middleware.ts`
- Delete: `proxy.ts` (remplacé)

- [ ] **Step 1 : Créer `middleware.ts` à la racine**

```typescript
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'myhome_session'
const ADMIN_COOKIE = 'myhome_admin'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/admin/login', '/api/auth/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Paths publics
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Routes admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value
    if (!adminCookie || adminCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Auth principale (inchangée — session token)
  const token = request.cookies.get(COOKIE_NAME)?.value
  const expected = process.env.AUTH_SESSION_TOKEN

  if (!token || !expected || token !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.json|.*\\.webmanifest|sw\\.js).*)',
  ],
}
```

- [ ] **Step 2 : Supprimer proxy.ts**

```bash
git rm proxy.ts
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware with admin route protection"
```

---

### Task 10 : Push et test

- [ ] **Step 1 : Push**

```bash
git push origin main
```

- [ ] **Step 2 : Ajouter `ADMIN_PASSWORD` sur Vercel** (si pas encore fait).

- [ ] **Step 3 : Tester sur le site déployé**

- Aller sur `myhome.lpj.ch/admin/login` → se connecter avec `ADMIN_PASSWORD`
- Créer un utilisateur de test (nom + email + mot de passe)
- Vérifier qu'il apparaît dans la liste
- Le supprimer pour le test
- Vérifier que `/admin` sans cookie redirige vers `/admin/login`
- Vérifier que le dashboard principal fonctionne toujours normalement
