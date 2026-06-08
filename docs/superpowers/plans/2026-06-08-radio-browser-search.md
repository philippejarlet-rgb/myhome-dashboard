# Radio Browser Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une recherche Radio Browser API dans la page `/radios` via deux onglets (Recherche | Manuel), sans modifier le formulaire manuel existant.

**Architecture:** On modifie uniquement `app/radios/page.tsx`. Le bloc "Ajouter une radio" gagne deux onglets. L'onglet "Recherche" interroge `radio-browser.info` avec un debounce 400ms et affiche les résultats en grille. Un tap ajoute la radio immédiatement. L'onglet "Manuel" contient le formulaire existant inchangé.

**Tech Stack:** React hooks (useState, useEffect, useRef), fetch natif, API Radio Browser (publique, sans auth, CORS activé), lucide-react (icônes `Loader2` et `Radio` à ajouter aux imports existants).

---

## Fichiers

- **Modify:** `app/radios/page.tsx`

---

### Task 1 : Ajouter le type `RadioBrowserResult` et les nouveaux imports

**Files:**
- Modify: `app/radios/page.tsx` (lignes 1-13)

- [ ] **Step 1 : Mettre à jour l'import lucide-react**

Remplacer la ligne existante :
```ts
import { Square, Star, Camera, Check } from 'lucide-react'
```
Par :
```ts
import { Square, Star, Camera, Check, Loader2, Radio as RadioIcon } from 'lucide-react'
```

- [ ] **Step 2 : Ajouter le type `RadioBrowserResult` juste après le type `Radio` existant (ligne ~13)**

```ts
type RadioBrowserResult = {
  name: string
  url_resolved: string
  favicon: string
  country: string
}
```

- [ ] **Step 3 : Vérifier que le fichier compile**

```powershell
cd c:\Users\LPJ\myhome-dashboard; npx tsc --noEmit
```
Résultat attendu : aucune erreur TypeScript.

---

### Task 2 : Ajouter les états pour la recherche

**Files:**
- Modify: `app/radios/page.tsx` (bloc useState, ~lignes 22-32)

- [ ] **Step 1 : Ajouter les nouveaux états après les états existants (`editingName`, `logoInputRef`, `formRef`)**

```ts
const [tab, setTab] = useState<'search' | 'manual'>('search')
const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState<RadioBrowserResult[]>([])
const [searching, setSearching] = useState(false)
const [searchError, setSearchError] = useState(false)
const [justAdded, setJustAdded] = useState<string | null>(null)
```

- [ ] **Step 2 : Vérifier que le fichier compile**

```powershell
npx tsc --noEmit
```
Résultat attendu : aucune erreur.

---

### Task 3 : Implémenter le useEffect de recherche (debounce 400ms)

**Files:**
- Modify: `app/radios/page.tsx` (après le useEffect LOAD existant)

- [ ] **Step 1 : Ajouter ce useEffect après le bloc `// LOAD` existant**

```ts
// SEARCH
useEffect(() => {
  if (!searchQuery.trim()) {
    setSearchResults([])
    setSearchError(false)
    return
  }
  const timer = setTimeout(async () => {
    setSearching(true)
    setSearchError(false)
    try {
      const res = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(searchQuery)}&limit=20&hidebroken=true&order=clickcount&reverse=true`
      )
      if (!res.ok) throw new Error('API error')
      const data: RadioBrowserResult[] = await res.json()
      setSearchResults(data)
    } catch {
      setSearchError(true)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, 400)
  return () => clearTimeout(timer)
}, [searchQuery])
```

- [ ] **Step 2 : Vérifier que le fichier compile**

```powershell
npx tsc --noEmit
```
Résultat attendu : aucune erreur.

---

### Task 4 : Implémenter `addFromSearch` et mettre à jour `startEdit`

**Files:**
- Modify: `app/radios/page.tsx` (bloc fonctions, après `cancelEdit`)

- [ ] **Step 1 : Ajouter la fonction `addFromSearch` après la fonction `cancelEdit` existante**

```ts
const addFromSearch = (result: RadioBrowserResult) => {
  if (radios.some((r) => r.name === result.name)) return
  const newRadio: Radio = {
    name: result.name,
    stream: result.url_resolved,
    logo: result.favicon || '',
    favorite: false,
  }
  const updated = [...radios, newRadio]
  setRadios(updated)
  setJustAdded(result.name)
  setTimeout(() => setJustAdded(null), 1000)
  fetch('/api/data/radios', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch(() => {})
}
```

- [ ] **Step 2 : Mettre à jour `startEdit` pour basculer sur l'onglet Manuel**

Remplacer la fonction `startEdit` existante :
```ts
const startEdit = (radio: Radio) => {
  setEditingName(radio.name)
  setNewName(radio.name)
  setNewStream(radio.stream)
  setNewLogo(radio.logo)
  setTab('manual')
  formRef.current?.scrollIntoView({ behavior: 'smooth' })
}
```

- [ ] **Step 3 : Vérifier que le fichier compile**

```powershell
npx tsc --noEmit
```
Résultat attendu : aucune erreur.

---

### Task 5 : Remplacer le `<h2>` par les onglets dans le JSX

**Files:**
- Modify: `app/radios/page.tsx` (bloc JSX formulaire, `{/* ADD / EDIT */}`)

- [ ] **Step 1 : Remplacer le `<h2>` existant**

Remplacer :
```tsx
<h2 className="text-2xl mb-6">
  {editingName !== null ? `Modifier — ${editingName}` : 'Ajouter une radio'}
</h2>
```

Par :
```tsx
<div className="flex gap-2 mb-6">
  <button
    onClick={() => setTab('search')}
    className={`px-4 py-2 rounded-xl text-sm transition-all ${
      tab === 'search'
        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
        : 'bg-black/20 text-zinc-400'
    }`}
  >
    Recherche
  </button>
  <button
    onClick={() => setTab('manual')}
    className={`px-4 py-2 rounded-xl text-sm transition-all ${
      tab === 'manual'
        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
        : 'bg-black/20 text-zinc-400'
    }`}
  >
    Saisie manuelle
  </button>
</div>
```

- [ ] **Step 2 : Vérifier visuellement dans le navigateur**

Lancer le serveur si pas déjà lancé :
```powershell
npm run dev
```
Ouvrir `http://localhost:3000/radios` → vérifier que les deux onglets apparaissent en bas de page à la place du titre.

---

### Task 6 : Ajouter le panneau de recherche (onglet "Recherche")

**Files:**
- Modify: `app/radios/page.tsx` (JSX, juste après les onglets)

- [ ] **Step 1 : Ajouter le panneau de recherche après le bloc des onglets (avant le formulaire existant)**

```tsx
{tab === 'search' && (
  <div>
    <input
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value)
        setSearchError(false)
      }}
      placeholder="Rechercher une radio (ex: jazz, couleur, RTL...)"
      className="w-full bg-black/20 rounded-xl px-4 py-3 outline-none mb-4"
    />

    {searching && (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-cyan-400" size={28} />
      </div>
    )}

    {searchError && !searching && (
      <p className="text-zinc-400 text-sm py-4">
        Recherche indisponible, utilisez la saisie manuelle.
      </p>
    )}

    {!searching && !searchError && searchQuery.trim() && searchResults.length === 0 && (
      <p className="text-zinc-400 text-sm py-4">
        Aucune station trouvée pour « {searchQuery} »
      </p>
    )}

    {!searching && !searchError && !searchQuery.trim() && (
      <p className="text-zinc-500 text-sm py-4">
        Tapez le nom d&apos;une radio pour commencer la recherche.
      </p>
    )}

    {!searching && searchResults.length > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[280px]">
        {searchResults.map((result) => (
          <button
            key={result.name + result.url_resolved}
            onClick={() => addFromSearch(result)}
            disabled={radios.some((r) => r.name === result.name)}
            className={`rounded-2xl p-3 flex flex-col items-center justify-center gap-2 transition-all text-left ${
              justAdded === result.name
                ? 'bg-green-500/30 border border-green-400'
                : radios.some((r) => r.name === result.name)
                ? 'bg-white/5 opacity-40 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {result.favicon ? (
              <img
                src={result.favicon}
                className="h-12 object-contain rounded-xl"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <RadioIcon size={32} className="text-cyan-400" />
            )}
            <span className="text-sm text-center line-clamp-2">{result.name}</span>
            {result.country && (
              <span className="text-xs text-zinc-400">{result.country}</span>
            )}
          </button>
        ))}
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2 : Vérifier que le fichier compile**

```powershell
npx tsc --noEmit
```
Résultat attendu : aucune erreur.

---

### Task 7 : Envelopper le formulaire manuel dans `tab === 'manual'`

**Files:**
- Modify: `app/radios/page.tsx` (JSX, formulaire existant)

- [ ] **Step 1 : Envelopper tout le contenu existant du formulaire (grille d'inputs + boutons) dans une condition**

Le formulaire existant (grille + boutons) doit être enveloppé :
```tsx
{tab === 'manual' && (
  <div>
    {editingName !== null && (
      <p className="text-zinc-400 text-sm mb-4">Modification de : {editingName}</p>
    )}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {/* --- inputs existants inchangés --- */}
      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Nom"
        className="bg-black/20 rounded-xl px-4 py-3 outline-none"
      />
      <input
        value={newStream}
        onChange={(e) => setNewStream(e.target.value)}
        placeholder="Flux URL"
        className="bg-black/20 rounded-xl px-4 py-3 outline-none"
      />
      <div className="flex items-center gap-3">
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <button
          onClick={() => logoInputRef.current?.click()}
          disabled={uploadingLogo}
          className="bg-black/20 rounded-xl px-4 py-3 flex-1 text-left disabled:opacity-50"
        >
          {uploadingLogo ? 'Upload...' : newLogo ? <><Check size={14} className="inline mr-1" />Logo uploadé</> : <><Camera size={14} className="inline mr-1" />Choisir un logo</>}
        </button>
        {newLogo && (
          <img src={newLogo} className="h-10 w-10 object-contain rounded-lg" />
        )}
      </div>
    </div>
    <div className="flex gap-3 mt-4">
      <button
        onClick={saveRadio}
        className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-6 py-3"
      >
        {editingName !== null ? 'Enregistrer' : 'Ajouter'}
      </button>
      {editingName !== null && (
        <button
          onClick={cancelEdit}
          className="bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-6 py-3"
        >
          Annuler
        </button>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 2 : Vérifier que le fichier compile**

```powershell
npx tsc --noEmit
```
Résultat attendu : aucune erreur.

---

### Task 8 : Test manuel complet + commit

- [ ] **Step 1 : Ouvrir `http://localhost:3000/radios` et vérifier le parcours nominal**

Checklist :
- [ ] Les onglets "Recherche" et "Saisie manuelle" sont visibles en bas
- [ ] L'onglet "Recherche" est actif par défaut
- [ ] Taper "couleur" → spinner → résultats (Couleur 3 et d'autres)
- [ ] Taper un nom introuvable (ex: "xyzxyz123") → message "Aucune station trouvée"
- [ ] Cliquer sur une radio → elle apparaît dans la grille du haut
- [ ] Cliquer à nouveau sur la même → elle reste grisée (doublon ignoré)
- [ ] Basculer sur "Saisie manuelle" → formulaire intact, fonctionnel
- [ ] Cliquer "Modifier" sur une radio existante → bascule sur "Saisie manuelle" avec les champs pré-remplis
- [ ] Vérifier que la lecture audio n'est pas affectée

- [ ] **Step 2 : Vérifier le rendu mobile (DevTools → responsive 375px)**

- [ ] Onglets visibles et cliquables
- [ ] Grille résultats en 2 colonnes
- [ ] Pas de scroll horizontal

- [ ] **Step 3 : Commit**

```powershell
git add app/radios/page.tsx
git commit -m "feat(radios): ajouter recherche Radio Browser API via onglets"
```
