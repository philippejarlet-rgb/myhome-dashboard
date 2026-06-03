# Spec — Favoris par magasin dans le module Courses

Date : 2026-06-03  
Statut : approuvé

## Contexte

La page `/courses` permet d'ajouter des articles à une liste de courses avec suggestions depuis l'historique. L'utilisateur veut associer chaque produit à un magasin (Aldi, Lidl, etc.) pour organiser sa liste par enseigne.

## Périmètre

- Fichier principal modifié : `app/courses/page.tsx`
- Aucune modification de la route API `/api/data/courses` (elle accepte déjà un corps JSON libre)
- Aucune nouvelle librairie

## Structure des données

### Avant

```ts
type Item = { text: string; checked: boolean }
// Stocké : { items: Item[], history: string[] }
```

### Après

```ts
type Item = { text: string; checked: boolean; store?: string }
type CoursesData = {
  items: Item[]
  history: string[]
  favorites: Record<string, string>  // { "Pudding Chocolat": "Aldi" }
}
```

### Règles

- `favorites` : map `nom produit → nom magasin`. Jamais stocké null — défaut `{}`
- La liste des magasins connus est dérivée à la volée : `Array.from(new Set(Object.values(favorites)))`
- **Rétrocompatibilité** : si `favorites` est absent des données Supabase existantes, on initialise à `{}`
- Un article peut exister dans la liste sans `store` (champ optionnel)

## UX — Ajouter un article

### Formulaire

Le bloc ADD gagne un **2e champ "Magasin"** sous l'input existant :

```
[ Ajouter un article...          ]  [ Ajouter ]
[ Magasin (optionnel)       ▼   ]
```

Sur mobile (< 768px) : les deux champs en colonne pleine largeur.  
Sur tablette (≥ 768px) : les deux champs côte à côte si la place le permet, sinon en colonne.

### Comportement du champ Magasin

1. L'utilisateur tape ou sélectionne un produit dans l'input principal
2. **Produit connu dans `favorites`** → le champ magasin se remplit automatiquement avec la valeur stockée (modifiable)
3. **Produit inconnu** → le champ magasin est vide, affiche un `<select>` avec :
   - Les magasins déjà connus (triés alphabétiquement)
   - Une option "＋ Nouveau magasin..." → bascule vers un `<input>` libre
4. Le magasin est **facultatif** — on peut valider avec le champ vide

### Au moment de l'ajout (`addItem`)

1. Créer l'article `{ text, checked: false, store: storeValue || undefined }`
2. Ajouter à `history` si absent (comportement existant)
3. Si `storeValue` non vide :
   - Ajouter/mettre à jour `favorites[text] = storeValue`

### Modifier le magasin d'un article existant

- Chaque article dans la liste affiche un badge tappable `[Aldi]` (ou `[—]` si sans magasin)
- Tapper le badge ouvre un `<select>` inline avec les magasins connus + "＋ Nouveau"
- La sélection met à jour :
  - `items[i].store`
  - `favorites[item.text]` (mémorisé pour les prochains ajouts)

## Affichage de la liste

### Groupement

```
── Sans magasin ──────────────
  □ Lait
  □ Pain

── ALDI ──────────────────────
  □ Pudding Chocolat   [Aldi]
  ✅ Fromage Blanc     [Aldi]

── LIDL ──────────────────────
  □ Saumon             [Lidl]
```

- "Sans magasin" en premier, avec un titre discret "— Sans magasin —" en `text-zinc-500 text-sm`
- Sections magasin triées alphabétiquement, chacune avec un titre en majuscules style `text-zinc-400 text-sm tracking-widest`
- L'ordre des articles à l'intérieur de chaque section est l'ordre d'ajout (pas de tri automatique)
- Le badge magasin `[Aldi]` est tappable sur chaque article

### Partage

La fonction `shareCourses` est mise à jour pour grouper le texte partagé par magasin :

```
ALDI
⬜ Pudding Chocolat
✅ Fromage Blanc

LIDL
⬜ Saumon

Sans magasin
⬜ Lait
```

## Ce qui ne change pas

- Logique de suggestions depuis l'historique
- Logique de cocher / supprimer un article
- Design glassmorphism, arrondis, palette de couleurs
- API route `/api/data/courses` (GET/PUT)
- Page `/mobile` (si elle utilise les courses, elle ignore simplement `store` et `favorites`)
