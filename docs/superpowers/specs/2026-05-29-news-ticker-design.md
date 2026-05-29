# News Ticker — Design Spec

**Date:** 2026-05-29  
**Goal:** Remplacer le bandeau de news actuel par un ticker horizontal style CNews avec flux RSS français.

---

## Contexte

Actuellement :
- Source : BBC World RSS (en anglais)
- Design : bandeau rouge uni, défilement horizontal basique
- Messages custom hardcodés avec emojis

Cible : ticker horizontal style CNews, source française, design soigné.

---

## Design

### Apparence
- Fond rouge dégradé horizontal : `from-red-800 to-red-600`
- À gauche : label **"DERNIÈRE MINUTE"** en blanc gras, fixe, séparé par un trait vertical
- Défilement horizontal infini des titres
- Format de chaque item : `12h51 — Titre de l'actualité`
- Texte blanc, `text-sm`, lisible

### Animation
- Défilement CSS `@keyframes scroll` horizontal continu (de droite à gauche)
- Vitesse adaptée à la longueur du contenu
- Pas de pause au survol (écran tactile)

---

## Architecture

### `app/api/news/route.ts` — modifié
- Source : `https://www.cnews.fr/rss.xml` via `rss2json.com`
- Chaque item retourné : `{ time: "12h51", title: "Titre..." }`
- Message custom : `{ time: "", title: "MYHOME V2" }` (sans emoji)
- Fallback si RSS indisponible : message custom uniquement

### `components/NewsTicker.tsx` — modifié
- Fetch `GET /api/news` au montage
- Rendu : bandeau rouge dégradé avec label fixe + défilement CSS

---

## Hors scope
- Clic sur une news pour ouvrir l'article
- Catégories de news
- Gestion de plusieurs sources RSS
