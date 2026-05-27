# Responsive Tablet (iPad Air 1180×820) — Design Spec

**Date:** 2026-05-27  
**Goal:** Faire tenir tout le home dashboard dans le viewport d'un iPad Air (1180×820) sans scroll, en optimisant les tailles directement (pas de breakpoints — le home est toujours consulté sur tablette).

---

## Contexte

Le dashboard est actuellement conçu pour grand écran. Sur iPad Air 1180×820 :
- La 3e ville de comparaison météo est coupée à droite
- La section radio déborde en bas
- Les textes et paddings sont surdimensionnés

Approche retenue : valeurs directement optimisées pour tablet (Option A — pas de breakpoints Tailwind).

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `app/page.tsx` | Réduire padding, gaps, assouplir hauteurs fixes |
| `components/WeatherWidget.tsx` | Layout icône, tailles textes, colonnes comparaison |
| `components/ClockWidget.tsx` | Réduire taille de l'heure et de la date |
| `components/RadioWidget.tsx` | Supprimer labels, réduire logos et padding |
| `components/TodoWidget.tsx` | Réduire padding interne |
| `components/CoursesWidget.tsx` | Réduire padding interne |
| `app/api/weather/route.ts` | Corriger le filtre forecast |

**Fichiers inchangés :**
- `components/Screensaver.tsx` — plein écran, grands textes intentionnels

---

## Section 1 : Layout global (`app/page.tsx`)

- `p-6` → `p-3`
- `gap-6` → `gap-4` sur le grid principal
- `h-[78vh]` → supprimer (laisser le contenu déterminer la hauteur)
- `h-[390px]` sur la top row → `h-[310px]`

---

## Section 2 : WeatherWidget (`components/WeatherWidget.tsx`)

### Colonne principale (ville principale)
- Température : `text-8xl` → `text-5xl`
- Icône météo : déplacée **sous** la température (plus en ligne avec la description)
- Icône taille : `text-8xl` → `text-4xl`

### Colonnes de comparaison (3 villes)
- Largeur des colonnes : réduire padding interne pour que les 3 tiennent
- Température des villes : `text-4xl` → `text-3xl`

### Prévisions (ligne du bas)
- Icônes prévisions : `text-2xl` → `text-xl`
- Largeur des items : `w-14` → `w-12`
- Texte jours et températures : légèrement réduits

---

## Section 3 : Correction forecast (`app/api/weather/route.ts`)

### Problèmes actuels
1. Le filtre `i % 8 === 0` prend des tranches horaires arbitraires → températures incorrectes
2. Le premier résultat correspond souvent à aujourd'hui → redondant avec l'affichage principal

### Solution
Remplacer le filtre par un regroupement par date :

```typescript
// Grouper les entrées par date (YYYY-MM-DD)
// Exclure la date d'aujourd'hui
// Pour chaque date future, prendre l'entrée la plus proche de 12h00
// Garder au max 4 jours
```

Logique concrète :
```typescript
const today = new Date().toISOString().slice(0, 10)

const byDate = new Map<string, typeof forecastData.list[0]>()
for (const entry of forecastData.list) {
  const date = (entry.dt_txt as string).slice(0, 10)
  if (date === today) continue
  if (!byDate.has(date)) {
    byDate.set(date, entry)
  } else {
    // Garder l'entrée la plus proche de 12h00
    const current = byDate.get(date)!
    const currentHour = parseInt((current.dt_txt as string).slice(11, 13))
    const entryHour = parseInt((entry.dt_txt as string).slice(11, 13))
    if (Math.abs(entryHour - 12) < Math.abs(currentHour - 12)) {
      byDate.set(date, entry)
    }
  }
}

const forecast = Array.from(byDate.values()).slice(0, 4)
```

Résultat : 4 jours (demain + 3 suivants), entrée de midi pour chaque jour → températures représentatives de la journée.

---

## Section 4 : RadioWidget (`components/RadioWidget.tsx`)

- Supprimer le label "Multimédia" et "MYHOME HUB"
- Logos : `h-20` → `h-14`
- Padding cartes radio : `p-4` → `p-2` ou `p-3`

---

## Section 5 : ClockWidget (`components/ClockWidget.tsx`)

- Heure : `text-7xl` → `text-5xl`
- Date : réduire proportionnellement (environ 1-2 tailles en dessous)

---

## Section 6 : TodoWidget / CoursesWidget

- Réduire padding interne (`p-6` → `p-4`) pour gagner de la hauteur
- Contenu inchangé

---

## Hors scope

- Pages `/courses`, `/todo`, `/weather` — responsive smartphone = chantier séparé
- Screensaver — textes volontairement grands
- BottomBar — ne pas toucher
- Fonctionnalités existantes — aucune modification de comportement
