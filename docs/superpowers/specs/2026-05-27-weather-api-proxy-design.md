# Weather API Proxy — Design Spec

**Date:** 2026-05-27  
**Goal:** Sécuriser la clé OpenWeatherMap avant déploiement sur myhome.lpj.ch — la clé ne doit plus apparaître dans le code client.

---

## Contexte

La clé API OpenWeatherMap est actuellement hardcodée dans deux composants côté client (`WeatherWidget.tsx`, `app/weather/page.tsx`). Elle est visible dans le bundle JavaScript envoyé au navigateur. Avant tout déploiement, elle doit être déplacée côté serveur via une variable d'environnement.

---

## Architecture

```
Client (navigateur)
  └── 1 appel : GET /api/weather
        └── Serveur Next.js (lit process.env.OPENWEATHER_API_KEY)
              ├── fetch current weather → Louhans
              ├── fetch forecast        → Louhans (5 jours)
              ├── fetch current weather → Bali
              ├── fetch current weather → Grez-Doiceau
              └── fetch current weather → Barcelone
              → Promise.all() → retourne 1 JSON groupé
```

---

## Route serveur : `app/api/weather/route.ts`

Méthode : `GET`  
Authentification : aucune (app personnelle, accès restreint par domaine)

### Réponse JSON

```ts
{
  main: {
    temp: number,
    description: string,
    icon: string,        // code icône OpenWeatherMap
    city: string
  },
  forecast: Array<{
    date: string,        // ISO date
    temp: number,
    icon: string,
    description: string
  }>,
  cities: Array<{
    name: string,
    temp: number,
    icon: string,
    description: string
  }>
}
```

- Les 5 appels OpenWeatherMap se font en parallèle avec `Promise.all()`
- Forecast : l'API retourne 40 tranches de 3h → on filtre `index % 8 === 0` pour garder 1 point par jour (5 entrées)
- Unité : métrique (°C), langue : français
- Villes comparaison hardcodées : Bali, Grez-Doiceau, Barcelone
- Ville principale hardcodée : Louhans
- En cas d'erreur : retourne HTTP 500 avec `{ error: string }`

---

## Fichiers modifiés

| Fichier | Action | Description |
|---|---|---|
| `app/api/weather/route.ts` | Création | Route proxy serveur |
| `components/WeatherWidget.tsx` | Modification | Remplace 5 fetch directs → 1 fetch `/api/weather` |
| `app/weather/page.tsx` | Modification | Idem |

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `OPENWEATHER_API_KEY` | Oui | Clé API OpenWeatherMap |

Définie dans `.env.local` (local) et uploadée via SFTP sur le serveur Infomaniak.  
Ne jamais préfixer `NEXT_PUBLIC_` — doit rester côté serveur uniquement.

---

## Hors scope

- Cache serveur (peut s'ajouter en Option C plus tard)
- Rendre les villes configurables
- Authentification sur la route `/api/weather`
