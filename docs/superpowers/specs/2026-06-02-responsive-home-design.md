# Spec : Dashboard MyHome Responsive — Phase 1 (Home)

## Contexte

MyHome est conçu pour iPad mini paysage (1024×768). L'objectif est de rendre le dashboard principal (`/`) responsive pour les téléphones mobiles, en conservant le layout iPad intact et en gardant `/mobile` en parallèle.

## Breakpoints

- **Mobile** : < 768px (`sm` en Tailwind)
- **Desktop/Tablet** : ≥ 768px (`md+`) — layout actuel inchangé

## Section 1 — Grid responsive (`app/page.tsx`)

Remplacer le grid fixe 12 colonnes par un grid responsive. Chaque widget dans sa propre cellule de grid avec classes responsive.

**Restructuration du grid :**

```tsx
// Avant (nested flex dans les cellules)
<div className="col-span-3 h-full flex flex-col gap-4">
  <div className="h-[160px]"><ClockWidget /></div>
  <div className="flex-1 min-h-0 overflow-hidden"><TodoWidget /></div>
</div>

// Après (chaque widget dans sa propre cellule)
<div className="col-span-1 md:col-span-3 md:h-[160px]"><ClockWidget /></div>
<div className="col-span-1 md:col-span-5 md:row-span-2 md:h-[300px]"><WeatherWidget /></div>
<div className="col-span-1 md:col-span-4 md:h-[160px]"><RecetteDuMonde /></div>
<div className="col-span-1 md:col-span-3"><TodoWidget /></div>
<div className="col-span-1 md:col-span-4"><CoursesWidget /></div>
<div className="col-span-1 md:col-span-12"><RadioWidget /></div>
```

**Ordre d'affichage sur mobile (de haut en bas) :**
1. Clock
2. Weather
3. Todo
4. Courses
5. RecetteDuMonde
6. Radio

**Grid container :**
```tsx
<div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
```

## Section 2 — Navigation mobile

### BottomBar
Ajouter `hidden md:flex` sur le container principal de BottomBar.

### NewsTicker
Ajouter `hidden md:block` sur le ticker.

### Nouveau composant `MobileMenu`
Fichier : `components/MobileMenu.tsx`

- Bouton ☰ fixé en haut à droite (`fixed top-3 right-3 z-50 md:hidden`)
- Overlay slide-in depuis la droite avec backdrop blur
- Contient tous les liens de navigation (même liste que BottomBar)
- Bouton de fermeture en haut de l'overlay
- Gestion de l'état ouvert/fermé en local state

### Intégration dans `app/page.tsx`
```tsx
<BottomBar />      // visible md+
<MobileMenu />     // visible < md
```

## Section 3 — Adaptations widgets

### ClockWidget
- Temps : `text-3xl md:text-5xl` (réduit sur mobile)
- Date : `text-sm md:text-base`
- Saint du jour : visible seulement `md+` si manque de place

### WeatherWidget
- Sur mobile : afficher uniquement ville principale + température + condition
- Masquer les 3 villes comparatives : `hidden md:grid`
- Masquer les prévisions 4 jours : `hidden md:grid`

### RadioWidget
- Grille : `grid-cols-2 md:grid-cols-5` (2 colonnes sur mobile, 5 sur desktop)

### TodoWidget / CoursesWidget / RecetteDuMonde
- Hauteur auto sur mobile (pas de `h-[160px]` fixe)
- Fonctionnent déjà bien dans n'importe quelle hauteur

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `app/page.tsx` | Restructurer grid, ajouter `<MobileMenu />` |
| `components/BottomBar.tsx` | `hidden md:flex` |
| `components/NewsTicker.tsx` | `hidden md:block` |
| `components/MobileMenu.tsx` | **Créer** |
| `components/ClockWidget.tsx` | Classes responsive |
| `components/WeatherWidget.tsx` | Masquer éléments sur mobile |
| `components/RadioWidget.tsx` | `grid-cols-2 md:grid-cols-5` |

## Ce qui reste inchangé

- Layout desktop (md+) : identique à aujourd'hui
- Page `/mobile` : conservée en parallèle
- Sous-pages (Todo, Courses, Cuisine…) : traitées en Phase 2

## Vérification

1. Ouvrir `localhost:3000` dans Chrome DevTools → mode iPhone SE (375px)
2. Vérifier l'ordre vertical des widgets
3. Vérifier le hamburger menu (s'ouvre, contient tous les liens)
4. Vérifier le layout desktop inchangé (désactiver DevTools)
5. Tester la météo simplifiée sur mobile
