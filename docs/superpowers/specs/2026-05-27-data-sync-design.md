# Synchro des données — Design Spec

**Date:** 2026-05-27  
**Goal:** Remplacer localStorage par des fichiers JSON côté serveur pour que todos, courses, radios et villes météo soient partagés entre tous les appareils de la famille.

---

## Architecture

```
Client (navigateur)
  └── GET /api/data/[type]   ← lecture au chargement de chaque page
  └── PUT /api/data/[type]   ← écriture à chaque modification

Serveur (~/sites/myhome.lpj.ch/data/)
  └── todos.json             → Todo[]
  └── courses.json           → { items: CourseItem[], history: string[] }
  └── radios.json            → Radio[]
  └── weather.json           → City[]
```

---

## Route API : `app/api/data/[type]/route.ts`

Route dynamique unique qui gère les 4 types de données.

**Types valides :** `todos`, `courses`, `radios`, `weather`

**GET** — lit et retourne le contenu du fichier JSON correspondant. Si le fichier n'existe pas, retourne la valeur par défaut (tableau vide ou objet vide selon le type).

**PUT** — reçoit le body JSON et écrit dans le fichier. Crée le dossier `data/` si nécessaire.

**Erreur type inconnu** → HTTP 400.

---

## Fichiers de données

Stockés dans `data/` à la racine du projet. Ce dossier est dans `.gitignore` — il ne sera jamais écrasé par un `git pull`.

| Fichier | Type | Valeur par défaut |
|---|---|---|
| `data/todos.json` | `Todo[]` | `[]` |
| `data/courses.json` | `{ items: CourseItem[], history: string[] }` | `{ "items": [], "history": [] }` |
| `data/radios.json` | `Radio[]` | `[]` (les radios par défaut sont gérées côté client) |
| `data/weather.json` | `City[]` | `[]` |

---

## Types de données existants

```typescript
// Todo (app/todo/page.tsx)
type Todo = { id: number; text: string; done: boolean }

// CourseItem (app/courses/page.tsx)
type CourseItem = { id: number; text: string; done: boolean }

// Radio (app/radios/page.tsx)
type Radio = { name: string; url: string; logo: string; favorite: boolean }

// City (app/weather/page.tsx)
type City = { name: string; temp: string; weather: string; icon: string }
```

---

## Migration automatique (premier chargement)

Pour chaque page, au montage :
1. Fetch `GET /api/data/[type]`
2. Si le serveur retourne des données vides ET que localStorage contient des données → `PUT /api/data/[type]` avec les données localStorage
3. Effacer localStorage après migration réussie

---

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `app/api/data/[type]/route.ts` | **Nouveau** — route dynamique GET/PUT |
| `app/todo/page.tsx` | localStorage → API + migration |
| `app/courses/page.tsx` | localStorage → API + migration |
| `app/radios/page.tsx` | localStorage → API + migration |
| `app/weather/page.tsx` | localStorage → API + migration |
| `components/TodoWidget.tsx` | localStorage → fetch API |
| `components/CoursesWidget.tsx` | localStorage → fetch API |
| `components/RadioWidget.tsx` | localStorage → fetch API |
| `.gitignore` | Ajout de `data/` |

---

## Hors scope

- Conflits de version (deux personnes modifient en même temps)
- Historique des modifications
- Sauvegarde automatique des fichiers JSON
