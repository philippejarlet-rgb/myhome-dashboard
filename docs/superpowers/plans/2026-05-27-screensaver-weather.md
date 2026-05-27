# Screensaver Météo en Temps Réel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'heure statique et le texte météo hardcodé du screensaver par des données dynamiques en temps réel.

**Architecture:** Un seul fichier modifié — `components/Screensaver.tsx`. L'horloge est mise à jour via `setInterval` toutes les 60 secondes. La météo est fetchée depuis `/api/weather` au montage puis rafraîchie toutes les 10 minutes.

**Tech Stack:** Next.js 16 App Router, React 19 (useState/useEffect), route API `/api/weather` existante (OpenWeatherMap).

---

## Fichiers

| Fichier | Action |
|---|---|
| `components/Screensaver.tsx` | Modification — horloge dynamique + météo temps réel |

---

### Task 1 : Horloge dynamique

**Fichiers :**
- Modifier : `components/Screensaver.tsx`

- [ ] **Étape 1 : Remplacer le calcul statique de l'heure par un state**

Actuellement la ligne :
```typescript
  const time = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
```

Est calculée une seule fois au rendu et ne se met jamais à jour. La remplacer par un `useState` initialisé à l'heure courante, et ajouter un `useEffect` qui met à jour le state toutes les 60 secondes.

Remplacer ces lignes par :
```typescript
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )

  // CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      )
    }, 60000)
    return () => clearInterval(interval)
  }, [])
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add components/Screensaver.tsx
git commit -m "feat: screensaver clock updates every minute"
```

---

### Task 2 : Météo en temps réel

**Fichiers :**
- Modifier : `components/Screensaver.tsx`

- [ ] **Étape 1 : Ajouter le type Weather et la fonction getWeatherIcon**

Ajouter après `type Props = { onWake: () => void }` :

```typescript
type Weather = {
  city: string
  temp: number
  description: string
  icon: string
}

function getWeatherIcon(main: string): string {
  const m = main.toLowerCase()
  if (m.includes('cloud')) return '☁️'
  if (m.includes('rain')) return '🌧'
  if (m.includes('storm')) return '⛈'
  if (m.includes('snow')) return '❄️'
  return '☀️'
}
```

- [ ] **Étape 2 : Ajouter le state weather et le useEffect de fetch**

Après le state `time`, ajouter :

```typescript
  const [weather, setWeather] = useState<Weather | null>(null)

  // WEATHER
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch('/api/weather')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()
        const main = data.main
        setWeather({
          city: main.name,
          temp: Math.round(main.main.temp),
          description: main.weather[0].description,
          icon: getWeatherIcon(main.weather[0].main),
        })
      } catch {
        // garde le placeholder affiché
      }
    }
    fetchWeather()
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
```

- [ ] **Étape 3 : Ajouter la variable weatherText et remplacer le texte hardcodé dans le JSX**

Avant le `return`, ajouter :

```typescript
  const weatherText = weather
    ? `${weather.city} • ${weather.temp}° • ${weather.description} ${weather.icon}`
    : 'Louhans • ... • ...'
```

Dans le JSX, remplacer :
```typescript
            Louhans • 24° • Clair 🌙
```
par :
```typescript
            {weatherText}
```

- [ ] **Étape 4 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 5 : Vérifier manuellement**

Démarrer `npm run dev`. Ouvrir `http://localhost:3000`. Attendre que le screensaver s'active (ou forcer l'affichage). Vérifier que :
- La météo de Louhans s'affiche (température et description réelles)
- Le texte `"Louhans • ... • ..."` n'est visible que brièvement au chargement
- L'heure affichée est correcte

- [ ] **Étape 6 : Commit**

```bash
git add components/Screensaver.tsx
git commit -m "feat: screensaver shows real-time weather from API"
```

---

### Task 3 : Déployer sur Infomaniak

- [ ] **Étape 1 : Push**
```bash
git push
```

- [ ] **Étape 2 : SSH Infomaniak**
```bash
cd ~/sites/myhome.lpj.ch && git pull && npm run build
```

- [ ] **Étape 3 : Redémarrer** depuis le dashboard Infomaniak

- [ ] **Étape 4 : Vérifier** sur `https://myhome.lpj.ch`
