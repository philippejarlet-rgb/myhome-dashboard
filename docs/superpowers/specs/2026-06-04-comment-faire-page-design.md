# Spec — Page "Comment Faire ?" (aide / mode d'emploi)

**Date :** 2026-06-04  
**Statut :** Approuvé

---

## Objectif

Créer une page `/help` accessible depuis le hamburger menu et la bottom bar, affichant un mode d'emploi simple et scrollable du dashboard MyHome.

---

## Route

`/app/help/page.tsx`

---

## Structure de la page

Page scrollable, pas d'onglets ni d'accordions. Sections dans l'ordre :

### 1. MyHome — c'est quoi ?
Paragraphe d'intro décrivant le dashboard :
- Dashboard personnel conçu pour tablette murale tactile
- Affiché en permanence dans la maison
- Modules disponibles : Météo, Todo, Courses, Radios, Atlas Culinaire, Recettes du Monde, News, Photos

### 2. Météo
- Comment ajouter une ville (bouton + saisie du nom)
- Comment changer l'ordre des villes
- Comment supprimer une ville

### 3. Todo
- Comment ajouter une tâche (champ texte + validation)
- Comment cocher / décocher une tâche
- Comment supprimer une tâche

### 4. Courses
- Comment ajouter un article avec son magasin associé
- Comment supprimer un article
- Explication du groupement automatique par magasin (favoris magasins)

### 5. Recettes du Monde
- Explication du principe aléatoire : chaque affichage propose une recette différente du monde entier
- En cliquant sur la recette, on est redirigé vers la fiche détaillée sur atlasculinaire.com

### 6. Radios
- Comment ajouter une radio (nom + URL de stream)
- Comment mettre une radio en favori
- Comment supprimer une radio

---

## Navigation

### Hamburger menu (`components/MobileMenu.tsx`)
- Ajout d'un lien `? Comment Faire` avec icône `HelpCircle` (Lucide React)
- Position : avant le bouton "Quitter" (en dernier lien de navigation)
- Ferme le menu au clic (`onClick={() => setOpen(false)}`)

### Bottom bar (`components/BottomBar.tsx`)
- Ajout d'une icône `HelpCircle` avec label `Aide`
- Position : entre l'icône Photos et le bouton Refresh
- Href : `/help`

---

## Style

- Fond : même gradient existant `from-slate-950 via-zinc-900 to-black`
- Panneaux : glassmorphism `backdrop-blur`, `bg-white/5`, `border border-white/10`, `rounded-2xl`
- Titres de section : `text-2xl md:text-4xl font-thin text-white`
- Corps de texte : `text-zinc-300`, taille lisible à 1-2m (`text-base md:text-lg`)
- Icônes : Lucide React (existant dans le projet)
- Bouton retour : même style que les autres sous-pages

---

## Contraintes

- Pas de nouvelles librairies
- Pas de modales / popups
- Tailwind v4 uniquement (pas de tailwind.config.js)
- Pas de hover-only (tablette tactile)
- Responsive : mobile-first, `md:` pour tablette/desktop

---

## Fichiers à créer / modifier

| Action | Fichier |
|--------|---------|
| Créer | `app/help/page.tsx` |
| Modifier | `components/MobileMenu.tsx` |
| Modifier | `components/BottomBar.tsx` |
