# Villes Météo Configurables — Design Spec

**Date:** 2026-05-27  
**Goal:** Permettre de configurer la ville principale et les villes de comparaison du widget météo et du screensaver depuis la page `/weather`, sans toucher au code.

---

## Problème actuel

La ville principale (`Louhans`) et les villes de comparaison (`Bali`, `Grez-Doiceau`, `Barcelone`) sont hardcodées dans `app/api/weather/route.ts`. Pour les changer, il faut modifier le code et redéployer.

---

## Solution

Enrichir le modèle `City` existant avec deux flags, et mettre à jour la route `/api/weather` pour lire la configuration depuis `data/weather.json` au lieu du code hardcodé.

---

## Modèle de données

### Type `City` étendu

```typescript
type City = {
  name: string
  temp: string
  weather: string
  icon: string
  main?: boolean      // ville principale (screensaver + titre widget) — max 1
  favorite?: boolean  // ville de comparaison (colonnes widget) — max 3
}
```

Stocké dans `data/weather.json` (fichier existant, géré par `/api/data/weather`).

### Contraintes

- Max **1** ville avec `main: true` — quand on en marque une nouvelle, l'ancienne est démarquée automatiquement
- Max **3** villes avec `favorite: true` — si 3 favoris déjà, le bouton favori des autres villes est désactivé
- Une ville peut être à la fois `main` ET `favorite`

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `app/weather/page.tsx` | Modification — ajout boutons Principale / Favori sur chaque carte ville |
| `app/api/weather/route.ts` | Modification — lire config depuis data/weather.json au lieu du hardcodé |

### Fichiers inchangés

- `components/WeatherWidget.tsx` — consomme `/api/weather` comme avant
- `components/Screensaver.tsx` — consomme `/api/weather` comme avant
- `app/api/data/[type]/route.ts` — gère déjà le GET/PUT de `weather`

---

## UX — Page `/weather`

Chaque carte ville affiche deux nouveaux boutons en bas :

**Bouton "Principale"**
- Icône ⭐, label "Principale"
- Si `city.main === true` : surbrillance (fond cyan), label "⭐ Principale"
- Clic si non sélectionnée : met `main: true` sur cette ville, met `main: false` sur toutes les autres, PUT vers `/api/data/weather`
- Clic si déjà sélectionnée : met `main: false` (déselectionne) — la route utilisera le fallback `'Louhans'`

**Bouton "Favori"**
- Icône ♥, label "Favori"
- Si `city.favorite === true` : surbrillance (fond cyan), label "♥ Favori"
- Si `city.favorite !== true` ET déjà 3 favoris : bouton désactivé (`opacity-40 cursor-not-allowed`)
- Clic : toggle `favorite`, PUT vers `/api/data/weather`

---

## Route `/api/weather` modifiée

### Logique

```typescript
// 1. Lire data/weather.json
const savedCities: City[] = readWeatherConfig()  // readFileSync + JSON.parse, fallback []

// 2. Extraire config
const mainCity = savedCities.find(c => c.main)?.name ?? 'Louhans'
const comparisonCities = savedCities.filter(c => c.favorite).slice(0, 3).map(c => c.name)

// 3. Fetch OWM (identique à aujourd'hui mais avec les villes dynamiques)
const [mainRes, forecastRes, ...cityResponses] = await Promise.all([
  fetch(`${BASE}/weather?q=${mainCity}&units=metric&lang=fr&appid=${apiKey}`),
  fetch(`${BASE}/forecast?q=${mainCity}&units=metric&lang=fr&appid=${apiKey}`),
  ...comparisonCities.map(city =>
    fetch(`${BASE}/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`)
  ),
])

// 4. Retourner { main, forecast, cities } — format identique à aujourd'hui
```

### Fallback

- Si `data/weather.json` n'existe pas ou est vide → `mainCity = 'Louhans'`, `comparisonCities = []`
- Si une ville configurée est introuvable sur OWM → la route retourne une erreur 500 (comportement actuel inchangé)

---

## Hors scope

- Validation du nom de ville lors du marquage comme principale/favori (la ville est déjà dans la liste, donc déjà validée)
- Ordre des villes de comparaison dans le widget (ordre d'ajout dans la liste)
- Affichage d'un message d'erreur si OWM ne trouve pas une ville configurée
