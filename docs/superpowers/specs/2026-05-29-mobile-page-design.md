# Mobile Page — Design Spec

**Date:** 2026-05-29  
**Goal:** Créer une page `/mobile` optimisée pour smartphone avec 3 onglets : MyHome, Courses, Todo. Protégée par le même login que le dashboard.

---

## Contexte

Le dashboard principal est optimisé pour iPad (1180×820). Sur iPhone, seules les listes Todo et Courses sont utiles au quotidien. Une page dédiée `/mobile` permet un raccourci direct sur l'écran d'accueil iPhone.

---

## Layout

### Barre d'onglets (top navigation)

Fixe en haut de l'écran. 3 onglets égaux :

| Onglet | Icône | Label |
|---|---|---|
| 1 | Logo MyHome (icône maison) | MyHome |
| 2 | 🛒 | Courses |
| 3 | 📝 | Todo |

Onglet actif : fond coloré (cyan/accent), inactif : transparent.  
Charte graphique identique au dashboard : fond sombre, glass-card.

### Contenu des onglets

**Onglet MyHome**  
Logo de l'application centré + nom "MyHome". Espace réservé pour futures fonctionnalités (météo, heure, etc.).

**Onglet Courses**  
- Liste des courses depuis `GET /api/data/courses`
- Chaque item : checkbox + texte, bouton suppression
- Champ d'ajout en bas avec bouton "+"
- Items cochés visuellement barrés

**Onglet Todo**  
- Identique aux Courses mais avec `GET /api/data/todos`

### Dimensions touch-friendly
- Hauteur minimum des items : 56px
- Police : `text-lg` (18px)
- Padding généreux : `px-4 py-3`

---

## Architecture

### Fichiers créés

| Fichier | Action |
|---|---|
| `app/mobile/page.tsx` | Créer — page principale avec 3 onglets |

### Données
- Même API que le dashboard : `GET/PUT /api/data/courses` et `GET/PUT /api/data/todos`
- Même format de données (pas de changement backend)

### Authentification
- Le middleware existant (`middleware.ts`) protège déjà toutes les routes sauf `/login`
- Aucun changement nécessaire

---

## Hors scope
- Météo sur l'onglet MyHome (prévu plus tard)
- Notifications push
- Mode offline
- Design différent de la charte actuelle
