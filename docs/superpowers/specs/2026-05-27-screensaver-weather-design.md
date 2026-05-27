# Screensaver Météo en Temps Réel — Design Spec

**Date:** 2026-05-27  
**Goal:** Remplacer le texte météo hardcodé du screensaver par des données réelles, et corriger l'horloge qui ne se met pas à jour.

---

## Problème actuel

`components/Screensaver.tsx` affiche :
- L'heure calculée une seule fois au rendu (ne se met pas à jour)
- `"Louhans • 24° • Clair 🌙"` en dur

---

## Solution

Un seul fichier modifié : `components/Screensaver.tsx`.

### Horloge

Remplacer le calcul statique par un `useState<string>` initialisé à l'heure courante, mis à jour toutes les 60 secondes via `setInterval`.

### Météo

- Au montage : fetch `GET /api/weather` (route existante, retourne `{ main, forecast, cities }`)
- Extraire de `main` : `main.name` (ville), `Math.round(main.main.temp)` (température), `main.weather[0].description` (description), `main.weather[0].main` (pour l'icône)
- Rafraîchir toutes les 10 minutes via `setInterval`
- State : `weather: { city: string; temp: number; description: string; icon: string } | null`
- État initial `null` → affiche `"Louhans • ... • ..."` pendant le chargement
- En cas d'erreur fetch : garder l'affichage `"Louhans • ... • ..."` (pas de crash)

### Icônes météo

Même logique que `app/weather/page.tsx` :

| Condition (`main`) | Icône |
|---|---|
| contient `cloud` | ☁️ |
| contient `rain` | 🌧 |
| contient `storm` | ⛈ |
| contient `snow` | ❄️ |
| autre | ☀️ |

### Affichage

Remplacer la ligne hardcodée :
```
Louhans • 24° • Clair 🌙
```
par :
```
{weather.city} • {weather.temp}° • {weather.description} {weather.icon}
```

---

## Fichiers

| Fichier | Action |
|---|---|
| `components/Screensaver.tsx` | Modification — horloge dynamique + météo temps réel |

---

## Hors scope

- Rendre la ville configurable (suffit de modifier `MAIN_CITY` dans `app/api/weather/route.ts`)
- Afficher les prévisions ou plusieurs villes
- Animation de transition lors du changement de météo
