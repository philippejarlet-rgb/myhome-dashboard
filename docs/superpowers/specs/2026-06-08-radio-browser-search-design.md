# Spec : Recherche de radios via Radio Browser API

**Date :** 2026-06-08  
**Fichier impacté :** `app/radios/page.tsx` uniquement

---

## Objectif

Rendre l'ajout d'une radio plus facile en proposant une recherche en temps réel via l'API publique Radio Browser, en complément du formulaire manuel existant (qui reste intact).

---

## Contraintes

- Ne pas supprimer ni modifier le formulaire manuel existant
- Pas de nouvelle librairie
- Pas de modale — tout est inline
- Style cohérent : glassmorphism, dark theme, rounded-2xl/3xl
- Tablette tactile : gros boutons, pas de hover-only

---

## API : Radio Browser

- **URL** : `https://de1.api.radio-browser.info/json/stations/search`
- **Auth** : aucune (API publique)
- **CORS** : activé — appel direct depuis le client, pas de proxy
- **Paramètres utilisés** :
  - `name=<query>` — terme de recherche
  - `limit=20` — max 20 résultats
  - `hidebroken=true` — exclure les flux cassés
  - `order=clickcount&reverse=true` — trier par popularité
- **Champs utilisés dans la réponse** :
  - `name` → nom de la radio
  - `url_resolved` → URL du flux audio
  - `favicon` → logo (URL externe, peut être vide)
  - `country` → pays affiché sous le nom

---

## Changements dans `app/radios/page.tsx`

### Nouveaux états React

```ts
const [tab, setTab] = useState<'search' | 'manual'>('search')
const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState<RadioBrowserResult[]>([])
const [searching, setSearching] = useState(false)
```

### Type `RadioBrowserResult`

```ts
type RadioBrowserResult = {
  name: string
  url_resolved: string
  favicon: string
  country: string
}
```

### Logique de recherche

- Debounce 400ms après la dernière frappe
- Si `searchQuery` vide → vider les résultats, ne pas appeler l'API
- En cas d'erreur réseau → afficher message "Recherche indisponible, utilisez la saisie manuelle"

### Ajout depuis les résultats

- Tap sur une carte résultat → ajout immédiat dans `radios`
- Logo : utiliser `favicon` si non vide, sinon fallback icône `Radio` de lucide-react
- Doublon : si `radios` contient déjà une radio avec le même `name` → ignorer silencieusement
- Feedback : la carte passe brièvement en vert (`bg-green-500/30 border-green-400`) pendant ~1s

---

## Interface

### Onglets

Dans le bloc `glass-card` en bas de page, remplacer le `<h2>` par deux boutons :

| État | Style |
|------|-------|
| Actif | `bg-cyan-500/20 border border-cyan-500/50 rounded-xl px-4 py-2` |
| Inactif | `bg-black/20 rounded-xl px-4 py-2` |

### Onglet "Recherche" (défaut)

- Champ pleine largeur, style `bg-black/20 rounded-xl px-4 py-3`
- Placeholder : `Rechercher une radio (ex: jazz, couleur, RTL...)`
- Résultats : grille `grid-cols-2 md:grid-cols-4 gap-3`, `overflow-y-auto max-h-[280px]`
- Chaque carte : logo (`h-12 object-contain`) + nom + pays

**États affichés :**
- Pas encore tapé → texte neutre d'invite
- Recherche en cours → spinner (`animate-spin`, icône lucide `Loader2`)
- Aucun résultat → `"Aucune station trouvée pour « xyz »"`
- Erreur réseau → `"Recherche indisponible, utilisez la saisie manuelle"`

### Onglet "Manuel"

Formulaire actuel sans aucune modification : nom + flux URL + upload logo + bouton Ajouter/Enregistrer + Annuler.

---

## Ce qui ne change pas

- Grille des radios enregistrées (lecture, stop, favoris, modifier, supprimer)
- Logique de lecture audio (HLS + MP3)
- `RadioWidget.tsx` (widget page d'accueil)
- API routes existantes (`/api/data/radios`, `/api/logos`)
- Données actuelles (`data/radios.json`)
