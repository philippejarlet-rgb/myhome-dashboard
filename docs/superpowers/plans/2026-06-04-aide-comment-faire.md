# Page Aide — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/help` (Aide / Comment Faire ?) avec 6 sections de mode d'emploi, accessible depuis le hamburger menu et la bottom bar.

**Architecture:** Page Next.js statique `app/help/page.tsx` avec contenu inline (pas de composants externes). Les deux composants de navigation existants reçoivent chacun un lien supplémentaire vers `/help`.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, Lucide React, TypeScript

---

## Fichiers concernés

| Action | Fichier | Responsabilité |
|--------|---------|----------------|
| Créer | `app/help/page.tsx` | Page aide complète avec 6 sections |
| Modifier | `components/MobileMenu.tsx` | Ajouter lien Aide + icône HelpCircle |
| Modifier | `components/BottomBar.tsx` | Ajouter item Aide dans la liste |

---

### Task 1 : Créer la page `/help`

**Fichiers :**
- Créer : `app/help/page.tsx`

- [ ] **Step 1 : Créer `app/help/page.tsx` avec le contenu complet**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import {
  CloudSun, ListTodo, ShoppingCart, Music2, Globe, HelpCircle
} from 'lucide-react'

const sections = [
  {
    icon: <HelpCircle size={28} className="text-cyan-400" />,
    title: 'MyHome — c\'est quoi ?',
    content: [
      'MyHome est un dashboard personnel conçu pour rester affiché en permanence sur une tablette murale tactile dans votre maison.',
      'Il regroupe tous vos outils du quotidien en un seul endroit : météo multi-villes, listes de tâches et de courses, radios en streaming, recettes du monde, actualités et photos.',
      'Tout est accessible d\'un simple tap, sans clavier, depuis 1 à 2 mètres de distance.',
    ],
  },
  {
    icon: <CloudSun size={28} className="text-sky-400" />,
    title: 'Météo',
    content: [
      '→ Ajouter une ville : depuis la page Météo, tapez le nom d\'une ville dans le champ en bas et validez. La ville s\'ajoute à votre liste.',
      '→ Supprimer une ville : appuyez sur la croix (×) à côté du nom de la ville dans la liste.',
      '→ Les villes sont persistées dans votre compte — elles restent après fermeture de l\'app.',
    ],
  },
  {
    icon: <ListTodo size={28} className="text-emerald-400" />,
    title: 'Todo',
    content: [
      '→ Ajouter une tâche : tapez dans le champ texte en bas de la liste et validez (bouton + ou touche Entrée).',
      '→ Cocher / décocher : tapez sur la case à gauche de la tâche pour la marquer comme faite.',
      '→ Supprimer une tâche : tapez sur la corbeille à droite de la tâche.',
    ],
  },
  {
    icon: <ShoppingCart size={28} className="text-orange-400" />,
    title: 'Courses',
    content: [
      '→ Ajouter un article : saisissez le nom de l\'article et choisissez le magasin associé, puis validez.',
      '→ Magasins favoris : les magasins que vous utilisez souvent sont mémorisés et proposés en auto-complétion.',
      '→ Groupement automatique : les articles sont regroupés par magasin dans la liste pour faciliter les courses.',
      '→ Supprimer un article : tapez sur la corbeille à droite de l\'article.',
    ],
  },
  {
    icon: <Globe size={28} className="text-purple-400" />,
    title: 'Recettes du Monde',
    content: [
      '→ Le bouton "Recettes-Monde" (dans la barre du bas ou le menu) ouvre une recette choisie aléatoirement parmi des cuisines du monde entier.',
      '→ Chaque tap propose une recette différente — c\'est aléatoire à chaque fois.',
      '→ La recette s\'ouvre directement sur atlasculinaire.com pour voir tous les détails, ingrédients et étapes.',
    ],
  },
  {
    icon: <Music2 size={28} className="text-pink-400" />,
    title: 'Radios',
    content: [
      '→ Ajouter une radio : depuis la page Radios, renseignez le nom, l\'URL du stream audio et optionnellement un logo, puis validez.',
      '→ Mettre en favori : tapez sur l\'étoile (★) d\'une radio pour la faire remonter en tête de liste.',
      '→ Supprimer une radio : tapez sur la corbeille à droite de la radio.',
      '→ La radio continue de jouer si vous changez de page — le son ne s\'arrête pas à la navigation.',
    ],
  },
]

export default function HelpPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8 pb-32">
      <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-10">
        <button
          onClick={() => router.push('/')}
          className="glass-card rounded-2xl px-4 py-2 text-sm md:text-base hover:scale-105 transition-all"
        >
          ← Retour
        </button>
        <h1 className="text-3xl md:text-5xl font-thin tracking-wide">Aide</h1>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="glass-card rounded-2xl p-5 md:p-7 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 mb-1">
              {section.icon}
              <h2 className="text-xl md:text-2xl font-semibold">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-2">
              {section.content.map((line, i) => (
                <p key={i} className="text-zinc-300 text-base md:text-lg leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2 : Vérifier que la page compile**

```powershell
cd c:\Users\LPJ\myhome-dashboard
npx tsc --noEmit
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Step 3 : Commit**

```powershell
git add app/help/page.tsx
git commit -m "feat(aide): créer page Aide / Comment Faire ?"
```

---

### Task 2 : Ajouter le lien Aide dans MobileMenu

**Fichiers :**
- Modifier : `components/MobileMenu.tsx`

- [ ] **Step 1 : Ajouter `HelpCircle` dans les imports Lucide**

Dans [components/MobileMenu.tsx](components/MobileMenu.tsx), ligne 8, remplacer :

```tsx
import {
  Menu, X, CloudSun, ListTodo, ShoppingCart, Music2,
  Globe, Camera, RefreshCw, LogOut
} from 'lucide-react'
```

par :

```tsx
import {
  Menu, X, CloudSun, ListTodo, ShoppingCart, Music2,
  Globe, Camera, RefreshCw, LogOut, HelpCircle
} from 'lucide-react'
```

- [ ] **Step 2 : Ajouter le lien `/help` avant le bouton Quitter**

Dans [components/MobileMenu.tsx](components/MobileMenu.tsx), ligne 120, après le lien Photos et avant le bouton Quitter, insérer :

```tsx
          <Link href="/help" onClick={() => setOpen(false)} className={linkClass}>
            <HelpCircle size={22} />
            <span>Aide</span>
          </Link>
```

Le bloc `<nav>` doit ressembler à ceci en fin :

```tsx
          <Link href="/photos" onClick={() => setOpen(false)} className={linkClass}>
            <Camera size={22} />
            <span>Photos</span>
          </Link>
          <Link href="/help" onClick={() => setOpen(false)} className={linkClass}>
            <HelpCircle size={22} />
            <span>Aide</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-lg text-red-400 hover:text-red-300 py-3 px-4 rounded-xl hover:bg-red-500/10 transition-all mt-4"
          >
            <LogOut size={22} />
            <span>Quitter</span>
          </button>
```

- [ ] **Step 3 : Vérifier que ça compile**

```powershell
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 4 : Commit**

```powershell
git add components/MobileMenu.tsx
git commit -m "feat(aide): ajouter lien Aide dans le hamburger menu"
```

---

### Task 3 : Ajouter l'icône Aide dans la BottomBar

**Fichiers :**
- Modifier : `components/BottomBar.tsx`

- [ ] **Step 1 : Ajouter `HelpCircle` dans les imports Lucide**

Dans [components/BottomBar.tsx](components/BottomBar.tsx), ligne 8, remplacer :

```tsx
import {
  RefreshCw, CloudSun, ListTodo, ShoppingCart, Music2,
  Globe, Newspaper, Camera, Maximize2, Minimize2, LogOut
} from 'lucide-react'
```

par :

```tsx
import {
  RefreshCw, CloudSun, ListTodo, ShoppingCart, Music2,
  Globe, Newspaper, Camera, Maximize2, Minimize2, LogOut, HelpCircle
} from 'lucide-react'
```

- [ ] **Step 2 : Ajouter l'item Aide en fin de tableau `items`**

Dans [components/BottomBar.tsx](components/BottomBar.tsx), ligne 38, après l'item Photos :

```tsx
  const items = [
    { icon: <CloudSun size={26} />, label: 'Météo', href: '/weather' },
    { icon: <ListTodo size={26} />, label: 'Todo', href: '/todo' },
    { icon: <ShoppingCart size={26} />, label: 'Courses', href: '/courses' },
    { icon: <Music2 size={26} />, label: 'Radios', href: '/radios' },
    { icon: null, label: 'Atlas-Culinaire', href: '/cuisine' },
    { icon: null, label: 'Recettes-Monde', href: null },
    { icon: <Newspaper size={26} />, label: 'News', href: '/news' },
    { icon: <Camera size={26} />, label: 'Photos', href: '/photos' },
    { icon: <HelpCircle size={26} />, label: 'Aide', href: '/help' },
  ]
```

- [ ] **Step 3 : Vérifier que ça compile**

```powershell
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 4 : Commit**

```powershell
git add components/BottomBar.tsx
git commit -m "feat(aide): ajouter icône Aide dans la bottom bar"
```

---

## Vérification finale

- [ ] Démarrer le serveur de dev : `npm run dev`
- [ ] Ouvrir `http://localhost:3000` — vérifier que l'icône Aide apparaît dans la bottom bar
- [ ] Taper sur l'icône Aide → la page `/help` s'affiche avec les 6 sections
- [ ] Ouvrir le hamburger menu (mobile / resize fenêtre < 768px) → lien "Aide" visible avant "Quitter"
- [ ] Taper sur "Retour" → retour sur l'accueil
- [ ] Vérifier le rendu sur desktop (≥768px) et mobile (<768px)
