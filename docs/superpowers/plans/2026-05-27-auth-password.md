# Auth Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protéger toutes les pages de myhome.lpj.ch par un mot de passe familial unique avec session cookie 7 jours.

**Architecture:** Le middleware Next.js intercepte chaque requête et vérifie un cookie `myhome_session`. La route `/api/auth/login` compare le mot de passe soumis à `AUTH_PASSWORD` (env var) et pose un cookie dont la valeur est `AUTH_SESSION_TOKEN` (env var). Le middleware compare le cookie à cette même valeur — aucune crypto nécessaire dans l'Edge Runtime.

**Tech Stack:** Next.js 16 App Router, middleware Edge Runtime, cookies httpOnly, variables d'environnement.

---

## Fichiers

| Fichier | Action |
|---|---|
| `.env.local` | Modification — ajout de `AUTH_PASSWORD` et `AUTH_SESSION_TOKEN` |
| `app/api/auth/login/route.ts` | Création |
| `app/api/auth/logout/route.ts` | Création |
| `app/login/page.tsx` | Création |
| `middleware.ts` | Création |
| `components/BottomBar.tsx` | Modification — ajout bouton déconnexion |

---

### Task 1 : Ajouter les variables d'environnement

**Fichiers :**
- Modifier : `.env.local`

- [ ] **Étape 1 : Générer un token aléatoire**

Dans le terminal PowerShell :
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie la valeur affichée — c'est ton `AUTH_SESSION_TOKEN`.

- [ ] **Étape 2 : Ajouter les variables dans `.env.local`**

Ajouter à la fin du fichier `.env.local` :
```
AUTH_PASSWORD=le-mot-de-passe-famille
AUTH_SESSION_TOKEN=la-valeur-generee-ci-dessus
```

Remplace `le-mot-de-passe-famille` par le vrai mot de passe choisi.

---

### Task 2 : Créer la route de login

**Fichiers :**
- Créer : `app/api/auth/login/route.ts`

- [ ] **Étape 1 : Créer le fichier**

```typescript
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'myhome_session'
const MAX_AGE = 7 * 24 * 60 * 60 // 7 jours en secondes

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.AUTH_PASSWORD) {
    return NextResponse.json(
      { error: 'Mot de passe incorrect' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set(COOKIE_NAME, process.env.AUTH_SESSION_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })

  return response
}
```

- [ ] **Étape 2 : Vérifier manuellement**

Démarrer `npm run dev`. Dans un terminal :
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"mauvais"}' 
```
Résultat attendu : `{"error":"Mot de passe incorrect"}` avec status 401.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"le-mot-de-passe-famille"}'
```
Résultat attendu : `{"success":true}` avec un header `Set-Cookie: myhome_session=...`.

- [ ] **Étape 3 : Commit**
```bash
git add app/api/auth/login/route.ts
git commit -m "feat: add login API route"
```

---

### Task 3 : Créer la route de logout

**Fichiers :**
- Créer : `app/api/auth/logout/route.ts`

- [ ] **Étape 1 : Créer le fichier**

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('myhome_session')
  return response
}
```

- [ ] **Étape 2 : Commit**
```bash
git add app/api/auth/logout/route.ts
git commit -m "feat: add logout API route"
```

---

### Task 4 : Créer la page de login

**Fichiers :**
- Créer : `app/login/page.tsx`

- [ ] **Étape 1 : Créer le fichier**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Mot de passe incorrect')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black flex items-center justify-center text-white">
      <div className="glass-card rounded-3xl p-12 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl font-thin">MYHOME</h1>
          <p className="text-zinc-400 mt-2">Accès privé</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            className="bg-black/20 rounded-2xl px-6 py-4 text-xl outline-none border border-white/10 focus:border-white/30 transition-all"
          />

          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-all rounded-2xl px-8 py-4 text-xl mt-2"
          >
            {loading ? '...' : 'Entrer'}
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Étape 2 : Vérifier visuellement**

Ouvrir `http://localhost:3000/login`. La page doit afficher le formulaire avec le style glass-card.

- [ ] **Étape 3 : Commit**
```bash
git add app/login/page.tsx
git commit -m "feat: add login page"
```

---

### Task 5 : Créer le middleware

**Fichiers :**
- Créer : `middleware.ts` (à la racine du projet, pas dans `app/`)

- [ ] **Étape 1 : Créer le fichier**

```typescript
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'myhome_session'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const expected = process.env.AUTH_SESSION_TOKEN

  if (!token || !expected || token !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
}
```

- [ ] **Étape 2 : Vérifier le comportement**

Sans être connecté, ouvrir `http://localhost:3000` → doit rediriger vers `/login`.

Se connecter avec le bon mot de passe → doit rediriger vers `/` et afficher le dashboard.

Ouvrir une autre page (ex: `/todo`) → doit fonctionner normalement (cookie présent).

- [ ] **Étape 3 : Commit**
```bash
git add middleware.ts
git commit -m "feat: add auth middleware, protect all routes"
```

---

### Task 6 : Ajouter le bouton déconnexion dans BottomBar

**Fichiers :**
- Modifier : `components/BottomBar.tsx`

- [ ] **Étape 1 : Remplacer le contenu de BottomBar.tsx**

```typescript
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BottomBar() {
  const router = useRouter()

  const items = [
    { icon: '🏠', label: 'Accueil', href: '/' },
    { icon: '🌤️', label: 'Météo', href: '/weather' },
    { icon: '🎵', label: 'Radios', href: '/radios' },
    { icon: '🍳', label: 'Recettes', href: '/recipes' },
    { icon: '🌍', label: 'Atlas', href: 'https://atlasculinaire.com/' },
    { icon: '🛒', label: 'Courses', href: '/courses' },
    { icon: '📝', label: 'Todo', href: '/todo' },
    { icon: '📅', label: 'Agenda', href: '/agenda' },
    { icon: '📸', label: 'Photos', href: '/photos' },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-card rounded-3xl px-8 py-4 flex gap-10 items-center">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            target={item.label === 'Atlas' ? '_blank' : '_self'}
            className="flex flex-col items-center gap-2 text-sm text-zinc-300 hover:text-white hover:scale-110 transition-all"
          >
            <span className="text-2xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-2 text-sm text-zinc-400 hover:text-red-400 hover:scale-110 transition-all"
        >
          <span className="text-2xl">🔒</span>
          <span>Quitter</span>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier**

Dans le dashboard, cliquer sur "Quitter" → doit déconnecter et rediriger vers `/login`.

- [ ] **Étape 3 : Commit**
```bash
git add components/BottomBar.tsx
git commit -m "feat: add logout button to BottomBar"
```

---

### Task 7 : Déployer sur Infomaniak

- [ ] **Étape 1 : Pousser sur GitHub**
```bash
git push
```

- [ ] **Étape 2 : Ajouter les variables d'env sur le serveur**

Dans la console SSH Infomaniak :
```bash
cd ~/sites/myhome.lpj.ch
echo "AUTH_PASSWORD=le-mot-de-passe-famille" >> .env.local
echo "AUTH_SESSION_TOKEN=la-valeur-generee" >> .env.local
```

- [ ] **Étape 3 : Mettre à jour et rebuilder**
```bash
git pull && npm run build
```

- [ ] **Étape 4 : Redémarrer depuis le dashboard Infomaniak**

Dashboard → myhome.lpj.ch → **Redémarrer**

- [ ] **Étape 5 : Vérifier en production**

Ouvrir `https://myhome.lpj.ch` → doit afficher la page de login.
Se connecter → doit accéder au dashboard.
