# Photos Upload & Screensaver — Design Spec

**Date:** 2026-05-27  
**Goal:** Gérer les photos de la galerie et du screensaver depuis la page `/photos` : upload, suppression, grille 3 colonnes. Le screensaver pioche dans les mêmes photos dynamiquement.

---

## Contexte

Actuellement :
- `app/photos/page.tsx` : liste hardcodée de 13 photos (`photo1.jpg` → `photo13.jpg`)
- `components/Screensaver.tsx` : liste hardcodée de 13 images (`/screensaver/1.jpg` → `13.jpg`)
- Aucune possibilité d'upload ou de suppression

Cible : une seule collection dans `public/photos/`, gérée via la page `/photos`, utilisée par le screensaver.

---

## Architecture

### Stockage

Fichiers uploadés dans `public/photos/` — servis en statique par Next.js sous `/photos/filename`.  
Noms originaux conservés (pas de renommage). Persistents entre déploiements (`git pull` ne touche pas aux fichiers non-trackés).

### Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `app/api/photos/route.ts` | Créer — GET (liste) + POST (upload) |
| `app/api/photos/[filename]/route.ts` | Créer — DELETE |
| `app/photos/page.tsx` | Modifier — grille 3 col, upload, suppression |
| `components/Screensaver.tsx` | Modifier — liste dynamique + shuffle aléatoire |

---

## Section 1 : API Photos

### `GET /api/photos`

Lit `public/photos/` avec `fs.readdirSync`, filtre les extensions image (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`), retourne un tableau de noms de fichiers.

```typescript
// Réponse
["photo1.jpg", "vacances.jpg", "portrait.png"]
```

### `POST /api/photos`

Upload multipart (`FormData`, champ `file`). Sauvegarde dans `public/photos/` avec le nom original. Écrase si le fichier existe déjà. Accepte uniquement les images (vérification du type MIME).

```typescript
// Réponse succès
{ success: true, filename: "vacances.jpg" }
// Réponse erreur
{ error: "Type de fichier non supporté" }
```

### `DELETE /api/photos/[filename]`

Supprime `public/photos/[filename]`. Retourne 404 si le fichier n'existe pas. Valide que le filename ne contient pas de `..` (sécurité path traversal).

```typescript
// Réponse succès
{ success: true }
```

---

## Section 2 : Page `/photos`

### Layout

Grille 3 colonnes avec scroll vertical (`overflow-y-auto`). Chaque photo : hauteur fixe (`h-48` ou `h-56`), `object-cover`, `rounded-2xl`.

### Upload

Bouton "＋ Ajouter des photos" en haut à droite. Déclenche un `<input type="file" accept="image/*" multiple>` caché. Upload séquentiel de chaque fichier sélectionné via `POST /api/photos`. Indicateur de chargement pendant l'upload. Rechargement de la liste après upload.

### Suppression

Icône ✕ en overlay sur chaque photo, visible au hover. Clic → confirmation via `window.confirm` → `DELETE /api/photos/[filename]` → retrait de la liste locale.

### Affichage

La liste vient de `GET /api/photos` au montage. Message "Aucune photo" si la collection est vide.

---

## Section 3 : Screensaver

### Chargement dynamique

Au montage, fetch `GET /api/photos`. Si la liste est vide : affiche fond noir avec l'heure uniquement.

### Ordre aléatoire

Les photos sont mélangées avec Fisher-Yates shuffle avant d'être affichées. Le shuffle s'applique à chaque activation du screensaver.

### Suppression de l'ancien dossier

`public/screensaver/` n'est plus utilisé. Les images hardcodées dans `Screensaver.tsx` sont remplacées par la liste dynamique.

---

## Hors scope

- Compression ou redimensionnement des images à l'upload
- Gestion des doublons (l'écrasement suffit)
- Ordre personnalisé des photos dans la galerie
- Tags ou catégories
