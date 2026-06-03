# Courses — Favoris par magasin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Associer chaque article de courses à un magasin (favoris), afficher la liste groupée par enseigne, et auto-remplir le magasin lors des prochains ajouts.

**Architecture:** Un seul fichier modifié (`app/courses/page.tsx`). On étend le type `Item` avec `store?: string`, on ajoute un état `favorites: Record<string, string>` persisté dans le même objet Supabase `{ items, history, favorites }`. L'affichage de la liste est réorganisé en sections par magasin. Aucune nouvelle librairie.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS v4. Persistance via `PUT /api/data/courses` (inchangée).

---

## Fichiers

| Action | Fichier |
|--------|---------|
| Modifier | `app/courses/page.tsx` |

---

## Task 1 — Types, état et persistance

**Files:**
- Modify: `app/courses/page.tsx`

- [ ] **Step 1 : Mettre à jour le type `Item` et ajouter les nouveaux états**

Remplacer :
```tsx
type Item = {
  text: string
  checked: boolean
}
```
Par :
```tsx
type Item = {
  text: string
  checked: boolean
  store?: string
}
```

Dans `CoursesPage`, après `const [loaded, setLoaded] = useState(false)`, ajouter :
```tsx
const [favorites, setFavorites] = useState<Record<string, string>>({})
const [newStore, setNewStore] = useState('')
const [isNewStoreInput, setIsNewStoreInput] = useState(false)
const [editingStoreIndex, setEditingStoreIndex] = useState<number | null>(null)
const [editingNewStoreValue, setEditingNewStoreValue] = useState('')
```

- [ ] **Step 2 : Mettre à jour `loadData` pour charger `favorites`**

Dans le bloc `loadData`, remplacer :
```tsx
setItems(data.items)
setHistory(data.history)
setLoaded(true)
```
Par :
```tsx
setItems(data.items || [])
setHistory(data.history || [])
setFavorites(data.favorites || {})
setLoaded(true)
```

Faire de même dans le chemin migration (après `setTodos(parsed.items)` / `setHistory(parsed.history)`) — ajouter :
```tsx
setFavorites(parsed.favorites || {})
```

- [ ] **Step 3 : Mettre à jour l'effet de sauvegarde pour inclure `favorites`**

Remplacer :
```tsx
body: JSON.stringify({ items, history }),
```
Par :
```tsx
body: JSON.stringify({ items, history, favorites }),
```

Et ajouter `favorites` dans le tableau de dépendances de l'effet :
```tsx
}, [items, history, favorites, loaded])
```

- [ ] **Step 4 : Corriger `toggleItem` et `deleteItem` (mutation directe → fonctionnel)**

Remplacer :
```tsx
const toggleItem = (index: number) => {
  const updated = [...items]
  updated[index].checked = !updated[index].checked
  setItems(updated)
}

const deleteItem = (index: number) => {
  const updated = items.filter((_, i) => i !== index)
  setItems(updated)
}
```
Par :
```tsx
const toggleItem = (index: number) => {
  setItems(prev => prev.map((it, i) => i === index ? { ...it, checked: !it.checked } : it))
}

const deleteItem = (index: number) => {
  setItems(prev => prev.filter((_, i) => i !== index))
}
```

- [ ] **Step 5 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected : zéro erreur.

- [ ] **Step 6 : Commit**

```bash
git add app/courses/page.tsx
git commit -m "feat(courses): types, favorites state, persistence"
```

---

## Task 2 — Formulaire ADD avec champ magasin

**Files:**
- Modify: `app/courses/page.tsx`

- [ ] **Step 1 : Mettre à jour `addItem` pour gérer `store` et `favorites`**

Remplacer la fonction `addItem` entière :
```tsx
const addItem = () => {
  if (!newItem.trim()) return

  const store = newStore.trim() || undefined

  setItems(prev => [...prev, { text: newItem, checked: false, store }])

  if (!history.includes(newItem)) {
    setHistory(prev => [...prev, newItem])
  }

  if (store) {
    setFavorites(prev => ({ ...prev, [newItem]: store }))
  }

  setNewItem('')
  setNewStore('')
  setIsNewStoreInput(false)
  setSuggestions([])
}
```

- [ ] **Step 2 : Ajouter la variable dérivée `knownStores` avant le return**

Juste avant le `return (`, ajouter :
```tsx
const knownStores = Array.from(new Set(Object.values(favorites))).sort()
```

- [ ] **Step 3 : Mettre à jour l'`onChange` de l'input principal pour auto-remplir le magasin**

Dans l'input existant, dans le handler `onChange`, après `setNewItem(value)`, ajouter :
```tsx
// Auto-fill store depuis les favoris
if (favorites[value]) {
  setNewStore(favorites[value])
  setIsNewStoreInput(false)
} else if (!value) {
  setNewStore('')
  setIsNewStoreInput(false)
}
```

- [ ] **Step 4 : Mettre à jour le clic sur une suggestion pour auto-remplir le magasin**

Dans le handler `onClick` des suggestions :
```tsx
onClick={() => {
  setNewItem(suggestion)
  if (favorites[suggestion]) {
    setNewStore(favorites[suggestion])
    setIsNewStoreInput(false)
  }
  setSuggestions([])
}}
```

- [ ] **Step 5 : Ajouter le bloc "Sélecteur de magasin" dans le formulaire ADD**

Dans la section `{/* ADD */}`, dans le `<div className="glass-card ...">`, après le `<div className="flex gap-4">...</div>` existant (le bloc input + bouton Ajouter), ajouter :

```tsx
{/* STORE SELECTOR */}
<div className="mt-3">
  {isNewStoreInput ? (
    <div className="flex gap-2">
      <input
        value={newStore}
        onChange={(e) => setNewStore(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setIsNewStoreInput(false)
        }}
        placeholder="Nom du magasin..."
        autoFocus
        className="flex-1 bg-black/20 rounded-2xl px-4 py-2 outline-none text-base md:text-lg"
      />
      <button
        type="button"
        onClick={() => setIsNewStoreInput(false)}
        className="glass-card rounded-2xl px-4 py-2 text-sm text-zinc-300"
      >
        ✓
      </button>
    </div>
  ) : (
    <select
      value={newStore}
      onChange={(e) => {
        if (e.target.value === '__new__') {
          setIsNewStoreInput(true)
          setNewStore('')
        } else {
          setNewStore(e.target.value)
        }
      }}
      className="w-full bg-black/20 rounded-2xl px-4 py-3 outline-none text-base md:text-lg text-zinc-300"
    >
      <option value="">Magasin (optionnel)</option>
      {knownStores.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
      <option value="__new__">＋ Nouveau magasin...</option>
    </select>
  )}
</div>
```

- [ ] **Step 6 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected : zéro erreur.

- [ ] **Step 7 : Commit**

```bash
git add app/courses/page.tsx
git commit -m "feat(courses): store selector in ADD form, auto-fill from favorites"
```

---

## Task 3 — Badge magasin tappable sur chaque article

**Files:**
- Modify: `app/courses/page.tsx`

- [ ] **Step 1 : Ajouter la fonction `updateItemStore`**

Après la fonction `deleteItem`, ajouter :
```tsx
// UPDATE STORE

const updateItemStore = (index: number, store: string) => {
  const itemText = items[index].text
  setItems(prev => prev.map((it, i) => i === index ? { ...it, store: store || undefined } : it))
  if (store) {
    setFavorites(prev => ({ ...prev, [itemText]: store }))
  }
  setEditingStoreIndex(null)
  setEditingNewStoreValue('')
}
```

- [ ] **Step 2 : Ajouter les variables dérivées pour le groupement (avant le return)**

Juste après `const knownStores = ...`, ajouter :
```tsx
const noStoreItems = items.map((it, i) => ({ item: it, index: i })).filter(({ item }) => !item.store)
const storesInItems = Array.from(new Set(items.filter(it => it.store).map(it => it.store!))).sort()
const itemsByStore = (store: string) =>
  items.map((it, i) => ({ item: it, index: i })).filter(({ item }) => item.store === store)
```

- [ ] **Step 3 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected : zéro erreur.

- [ ] **Step 4 : Commit**

```bash
git add app/courses/page.tsx
git commit -m "feat(courses): updateItemStore, grouping helpers"
```

---

## Task 4 — Affichage groupé par magasin (remplacer la section LIST)

**Files:**
- Modify: `app/courses/page.tsx`

Remplacer entièrement la section `{/* LIST */}` (du commentaire jusqu'au `</div>` fermant) par :

- [ ] **Step 1 : Remplacer la section LIST**

```tsx
{/* LIST */}

<div className="flex flex-col gap-8">

  {/* Sans magasin */}
  {noStoreItems.length > 0 && (
    <div>
      <p className="text-zinc-500 text-xs tracking-widest mb-3">— SANS MAGASIN —</p>
      <div className="flex flex-col gap-4">
        {noStoreItems.map(({ item, index }) => (
          <div
            key={index}
            className={`glass-card rounded-3xl p-4 md:p-6 flex items-center justify-between transition-all
              ${item.checked ? 'opacity-40 scale-[0.98]' : ''}`}
          >
            <div className="flex items-center gap-3 md:gap-6 flex-1">
              <button
                onClick={() => toggleItem(index)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                  ${item.checked ? 'bg-green-500 border-green-400' : 'border-white/30'}`}
              >
                {item.checked && <Check size={14} />}
              </button>
              <span className={`text-lg md:text-2xl ${item.checked ? 'line-through text-zinc-500' : ''}`}>
                {item.text}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {editingStoreIndex === index ? (
                editingNewStoreValue !== '__input__' ? (
                  <select
                    autoFocus
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setEditingNewStoreValue('__input__')
                      } else if (e.target.value) {
                        updateItemStore(index, e.target.value)
                      }
                    }}
                    onBlur={() => { setEditingStoreIndex(null); setEditingNewStoreValue('') }}
                    className="bg-black/40 rounded-xl px-3 py-1 text-sm outline-none text-zinc-200"
                  >
                    <option value="">— choisir —</option>
                    {knownStores.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__new__">＋ Nouveau...</option>
                  </select>
                ) : (
                  <input
                    autoFocus
                    value={editingNewStoreValue === '__input__' ? '' : editingNewStoreValue}
                    onChange={(e) => setEditingNewStoreValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editingNewStoreValue && editingNewStoreValue !== '__input__') {
                        updateItemStore(index, editingNewStoreValue)
                      }
                    }}
                    onBlur={() => { setEditingStoreIndex(null); setEditingNewStoreValue('') }}
                    placeholder="Nom magasin..."
                    className="bg-black/40 rounded-xl px-3 py-1 text-sm outline-none text-zinc-200 w-32"
                  />
                )
              ) : (
                <button
                  type="button"
                  onClick={() => { setEditingStoreIndex(index); setEditingNewStoreValue('') }}
                  className="text-zinc-500 text-sm px-2 py-1 rounded-xl bg-white/5"
                >
                  [—]
                </button>
              )}
              <button onClick={() => deleteItem(index)} className="text-red-400 text-lg">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Par magasin */}
  {storesInItems.map(store => (
    <div key={store}>
      <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">{store}</p>
      <div className="flex flex-col gap-4">
        {itemsByStore(store).map(({ item, index }) => (
          <div
            key={index}
            className={`glass-card rounded-3xl p-4 md:p-6 flex items-center justify-between transition-all
              ${item.checked ? 'opacity-40 scale-[0.98]' : ''}`}
          >
            <div className="flex items-center gap-3 md:gap-6 flex-1">
              <button
                onClick={() => toggleItem(index)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                  ${item.checked ? 'bg-green-500 border-green-400' : 'border-white/30'}`}
              >
                {item.checked && <Check size={14} />}
              </button>
              <span className={`text-lg md:text-2xl ${item.checked ? 'line-through text-zinc-500' : ''}`}>
                {item.text}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {editingStoreIndex === index ? (
                editingNewStoreValue !== '__input__' ? (
                  <select
                    autoFocus
                    defaultValue={item.store}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setEditingNewStoreValue('__input__')
                      } else if (e.target.value) {
                        updateItemStore(index, e.target.value)
                      }
                    }}
                    onBlur={() => { setEditingStoreIndex(null); setEditingNewStoreValue('') }}
                    className="bg-black/40 rounded-xl px-3 py-1 text-sm outline-none text-zinc-200"
                  >
                    <option value="">— choisir —</option>
                    {knownStores.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__new__">＋ Nouveau...</option>
                  </select>
                ) : (
                  <input
                    autoFocus
                    value={editingNewStoreValue === '__input__' ? '' : editingNewStoreValue}
                    onChange={(e) => setEditingNewStoreValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editingNewStoreValue && editingNewStoreValue !== '__input__') {
                        updateItemStore(index, editingNewStoreValue)
                      }
                    }}
                    onBlur={() => { setEditingStoreIndex(null); setEditingNewStoreValue('') }}
                    placeholder="Nom magasin..."
                    className="bg-black/40 rounded-xl px-3 py-1 text-sm outline-none text-zinc-200 w-32"
                  />
                )
              ) : (
                <button
                  type="button"
                  onClick={() => { setEditingStoreIndex(index); setEditingNewStoreValue('') }}
                  className="text-cyan-400 text-sm px-2 py-1 rounded-xl bg-white/5"
                >
                  [{item.store}]
                </button>
              )}
              <button onClick={() => deleteItem(index)} className="text-red-400 text-lg">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}

</div>
```

> **Note :** Le rendu de l'item est identique dans les deux sections (sans magasin et par magasin) — la seule différence est le badge : `[—]` pour les items sans magasin, `[Aldi]` pour ceux qui en ont un.

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected : zéro erreur.

- [ ] **Step 3 : Commit**

```bash
git add app/courses/page.tsx
git commit -m "feat(courses): liste groupée par magasin avec badge tappable"
```

---

## Task 5 — shareCourses et test final

**Files:**
- Modify: `app/courses/page.tsx`

- [ ] **Step 1 : Mettre à jour `shareCourses` pour grouper par magasin**

Remplacer la fonction `shareCourses` entière (calcul inline pour éviter tout problème d'ordre de déclaration) :
```tsx
const shareCourses = async () => {
  const shareNoStore = items.filter(it => !it.store)
  const shareStores = Array.from(new Set(items.filter(it => it.store).map(it => it.store!))).sort()

  const lines: string[] = []

  if (shareNoStore.length > 0) {
    lines.push('Sans magasin')
    shareNoStore.forEach(it =>
      lines.push(`${it.checked ? '✅' : '⬜'} ${it.text}`)
    )
  }

  shareStores.forEach(store => {
    if (lines.length > 0) lines.push('')
    lines.push(store.toUpperCase())
    items.filter(it => it.store === store).forEach(it =>
      lines.push(`${it.checked ? '✅' : '⬜'} ${it.text}`)
    )
  })

  const text = lines.join('\n')

  if (navigator.share) {
    await navigator.share({ title: 'MYHOME Courses', text })
  } else {
    alert('Partage non supporté 😄')
  }
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected : zéro erreur.

- [ ] **Step 3 : Tester manuellement dans le navigateur**

Lancer `npm run dev` et aller sur `http://localhost:3000/courses`.

**Scénario 1 — Premier ajout avec nouveau magasin :**
- Taper "Pudding Chocolat" dans l'input
- Le select magasin affiche "Magasin (optionnel)" + les magasins connus (vide au départ) + "＋ Nouveau magasin..."
- Choisir "＋ Nouveau magasin..." → l'input texte apparaît
- Taper "Aldi" → appuyer ✓ ou Enter
- Cliquer "Ajouter"
- Vérifier : l'article apparaît dans la section "ALDI"

**Scénario 2 — Auto-fill depuis les favoris :**
- Taper "Pudding Chocolat" de nouveau
- Vérifier : le select magasin se remplit automatiquement sur "Aldi"
- Ajouter → l'article va dans "ALDI"

**Scénario 3 — Article sans magasin :**
- Ajouter "Lait" sans sélectionner de magasin
- Vérifier : l'article apparaît dans la section "— SANS MAGASIN —" en haut

**Scénario 4 — Changer de magasin :**
- Tapper le badge `[Aldi]` d'un article
- Vérifier : un select s'affiche avec les magasins connus
- Sélectionner un autre magasin → l'article change de section

**Scénario 5 — Persistance :**
- Recharger la page
- Vérifier que les articles, leurs magasins et les favoris sont préservés

- [ ] **Step 4 : Commit final**

```bash
git add app/courses/page.tsx
git commit -m "feat(courses): shareCourses groupé par magasin"
```
