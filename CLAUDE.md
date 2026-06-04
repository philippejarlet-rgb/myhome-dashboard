@AGENTS.md
# myhome-dashboard

Dashboard personnel affiché en permanence sur une **tablette murale tactile**, à 1-2m de distance.

Modules : Météo (multi-villes), Todo, Liste de courses, Radios, Atlas-Culinaire, Recettes-Monde, News (bandeau défilant), Photos...

## Stack technique

- **Framework** : Next.js (App Router)
- **Langages** : TypeScript et JavaScript mélangés. **Ne pas convertir du JS en TS sans demander.**
- **Base de données** : Supabase (PostgreSQL + Auth)
- **Styling** : **Tailwind CSS v4** via `@tailwindcss/postcss`
- **Déploiement** : Vercel

## ⚠️ Tailwind CSS v4 — pièges à éviter

C'est Tailwind **v4**, pas v3. Tu peux par défaut générer du code v3 — ne pas le faire ici.

- Config via **CSS** (`@theme`, `@import "tailwindcss"`), pas via `tailwind.config.js`
- Ne **pas** introduire `tailwind.config.ts` ni `postcss.config.js` "à l'ancienne"
- Toutes les classes sont des **utilitaires Tailwind purs** — pas de CSS Modules, pas de styled-components, pas de `globals.css` rempli de classes custom
- Si tu hésites sur une syntaxe v3 vs v4, **demande-moi** avant d'écrire

## Esthétique — à préserver

L'app a déjà un design abouti qui me convient. **Ne pas le casser.**

- **Fond sombre** (gradient bleu nuit / noir)
- **Glassmorphism** : panneaux semi-transparents avec `backdrop-blur`
- **Bordures arrondies généreuses** (`rounded-2xl`, `rounded-3xl`)
- **Typographie claire et grosse** (lisible à 1-2m)
- **Iconographie simple et colorée** dans la barre du bas
- **Accents de couleur** : bleu cyan pour les actions actives, rouge pour Stop / Dernière minute, vert/jaune pour météo

Avant de modifier le visuel d'un composant existant, **demande confirmation**.

## Contraintes tablette murale

- L'app tourne sur **tablette tactile, fixe, à 1-2m** → gros boutons, gros texte
- **Aucun hover-only** : tout doit être accessible au tap
- **Pas de modales/popups intrusives** — préférer des panneaux inline
- **Pas de scroll horizontal**
- Pas de notifications natives — tout se passe dans l'UI

## Responsive — état et conventions

La refonte responsive est **terminée** (Phase 1 home + Phase 2 sous-pages). La cible principale reste la **tablette murale** (paysage, ~16:10) ; l'app est aussi utilisable sur mobile et desktop.

**Architecture choisie :**
- `/` (racine) = interface **tablette murale paysage** (complète, tous les modules)
- `/mobile` = interface **téléphone** dépouillée (Todo + Courses + Radios uniquement)
- Ne pas tenter de fusionner les deux ni de faire `/` responsive jusqu'au mobile

**Convention de breakpoint appliquée partout :**
- Base (sans préfixe) = **mobile ≤767px**
- `md:` (≥768px) = **tablette/desktop**
- Un seul breakpoint suffit — ne pas multiplier `sm:`, `lg:`, `xl:` sans raison

**Sous-pages responsifiées (Phase 2) :**
- `/weather` — grille 2→4 cols, températures, formulaire ajout ville
- `/todo` — padding, titres, items de liste, gap checkbox
- `/courses` — idem Todo
- `/radios` — grille 2→4 cols, formulaire 1→3 cols, logo réduit mobile, bouton Stop aligné
- `/cuisine` — header + barre de recherche empilée (input + select en colonne sur mobile)
- `/photos` — header empilé, grille 2→3 cols, cards `h-36` mobile, bouton upload pleine largeur

**Règles :**
- Mobile-first n'est PAS le mode par défaut ici — mais le code l'est (`md:` = surcharge tablette)
- Si tu hésites entre plusieurs comportements responsive → **demande-moi**, ne décide pas tout seul
- Toujours tester le rendu **paysage en priorité**, le reste après

## Conventions de code — IMPORTANT

### Avant d'écrire du code
1. **Toujours** chercher si un composant similaire existe déjà
2. **Toujours** lire un composant voisin pour suivre les conventions (nommage, structure, classes Tailwind utilisées)
3. **Jamais** introduire une nouvelle librairie sans me demander
4. **Jamais** modifier la stack (ajouter shadcn, changer de styling, etc.) sans m'en parler

### Style
- Composants React : function components + hooks, **jamais** de class components
- Nommage : `kebab-case` pour les fichiers, `PascalCase` pour les composants
- Pas de `any` en TS sans justification
- Imports groupés : React → libs externes → libs internes → relatifs

## Secrets

- Variables sensibles dans `.env.local` (jamais commité)
- `SUPABASE_SERVICE_ROLE_KEY` **uniquement** dans les API routes serveur, jamais côté client
- `NEXT_PUBLIC_*` pour ce qui est exposable au navigateur
- Ne **jamais** logger une clé Supabase, même temporairement

## Modules

- **Météo** : multi-villes, **configurables par l'utilisateur** via une interface dédiée
- **Todo** : Supabase
- **Courses** : Supabase
- **Radios** : streams audio + UI de sélection
- **Atlas-Culinaire** : recherche et sélection de recettes via API Atlas Culinaire
- **Recettes-Monde** : API externe + affichage carte
- **News** : bandeau défilant + page dédiée avec **16 chaînes** proposées
- **Photos** : upload, suppression, gestion (Supabase Storage probablement)
- **Horloge** : widget date + saint du jour
- **Recette du jour** : widget en page d'accueil
- **Écran de veille** : diaporama aléatoire des photos du module Photos, radio reste active en fond
- **Page /mobile** : version dépouillée pour téléphone — Todo + Courses + Radios uniquement
- **Important** : la lecture radio **ne doit jamais être interrompue** par un changement de page ou par l'activation de l'écran de veille. Le lecteur audio doit être monté **au niveau du layout global**, pas par page.

## Workflow attendu

1. **Avant** toute modification, expliquer ce qui va être fait
2. Modifier **un fichier à la fois** quand possible
3. Après chaque modif, dire **ce qu'il faut tester** côté utilisateur
4. **Jamais** lancer `git push` sans demander
5. **Jamais** modifier `.env.local` ou les migrations Supabase sans confirmation
6. Si une erreur précédente revient → la signaler, ne pas la refaire silencieusement

## ⚠️ Grille home (`/`) — hauteurs fixes et ascenseurs

La page home utilise une grille CSS à hauteurs fixes sur desktop (`md:`). **Ne jamais toucher un wrapper de widget sans vérifier la cohérence des hauteurs.**

### Hauteurs en vigueur (à maintenir)
| Widget | Mobile (< 768px) | Desktop (`md:`) |
|--------|-----------------|-----------------|
| Clock | — (masqué) | `md:h-[160px]` |
| Recettes du monde | `h-[160px]` | `md:h-[160px]` |
| Todo | `h-[160px]` | `md:h-[140px]` |
| Courses | `h-[160px]` | `md:h-[140px]` |
| Météo | — (hauteur libre) | `md:h-[316px]` (= 160 + 16gap + 140) |

### Règles
- **Hauteur explicite (`h-[...]`)** sur tous les wrappers à contenu variable, jamais `max-h` — sinon `h-full` interne ne se résout pas.
- **`overflow-hidden`** obligatoire sur tous les wrappers à hauteur fixe (mobile ET desktop).
- **Si on change une hauteur de rangée desktop**, répercuter sur Météo : `md:h-[row1 + 16 + row2]`.
- **Sur mobile**, les widgets à liste (Todo, Courses, Recettes) doivent avoir une hauteur fixe pour éviter qu'une longue liste empêche d'atteindre les Radios.

### Ascenseur dans les widgets
Les widgets `TodoWidget` et `CoursesWidget` gèrent leur propre scroll en interne :
```
// structure interne des widgets à liste
<div class="h-full flex flex-col overflow-hidden">   ← wrapper widget
  <h2 class="shrink-0">Titre</h2>
  <div class="flex-1 min-h-0 overflow-y-auto">       ← zone scrollable
    <ul>...</ul>
  </div>
</div>
```
**Ne pas déplacer la logique de scroll vers le wrapper page.tsx** — elle appartient au composant widget.

## Anti-patterns à éviter

- Ne pas générer 50 fichiers d'un coup — je valide étape par étape
- Ne pas proposer 3 options quand tu peux décider : choisis et explique pourquoi
- Ne pas redemander le contexte du projet — lis ce CLAUDE.md
- Pas de commentaires évidents (`// incrémente i`)
- Pas de refactoring spontané "tant qu'on y est" — me demander
- Pas de Tailwind v3-isms (cf. section dédiée)
- Pas de hover-only — tablette tactile

## État d'avancement

### Fait
- [x] Setup initial Next.js + Supabase + Tailwind v4
- [x] Design système (glassmorphism, dark theme)
- [x] Module Météo (affichage multi-villes)
- [x] Module Todo
- [x] Module Courses
- [x] Module Radios (lecture audio + UI)
- [x] Module Photos (upload + suppression)
- [x] Module Atlas-Culinaire (recherche + sélection de recettes)
- [x] Module Recettes-Monde (widget "Recette du jour" en accueil)
- [x] Module News (bandeau défilant + page avec 16 chaînes)
- [x] Widget Horloge (date + saint du jour)
- [x] Écran de veille (diaporama photos + radio active en fond)
- [x] Page /mobile (Todo + Courses + Radios)
- [x] Barre de navigation tactile

### En cours / À faire
- [x] Configuration utilisateur des villes météo
- [x] Responsive Phase 1 (home `/`) + Phase 2 (6 sous-pages)
- [x] Authentification admin
- [x] Déploiement Vercel final