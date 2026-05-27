# Responsive Tablet — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire tenir le home dashboard dans le viewport iPad Air (1180×820) sans scroll, en réduisant padding/textes/tailles et en corrigeant le forecast météo.

**Architecture:** Modifications de style pures (pas de breakpoints Tailwind — le home est toujours sur tablette). Correction de la logique forecast côté serveur. Aucun nouveau composant, aucune nouvelle route.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript.

---

## Fichiers

| Fichier | Action |
|---|---|
| `app/api/weather/route.ts` | Modifier — corriger le filtre forecast |
| `components/WeatherWidget.tsx` | Modifier — layout icône, tailles textes, colonnes comparaison |
| `app/page.tsx` | Modifier — padding, gaps, hauteurs fixes |
| `components/ClockWidget.tsx` | Modifier — réduire taille heure |
| `components/RadioWidget.tsx` | Modifier — supprimer labels, réduire logos |
| `components/TodoWidget.tsx` | Modifier — h-full + réduire padding |
| `components/CoursesWidget.tsx` | Modifier — h-full + réduire padding |

---

### Task 1 : Corriger le forecast dans `app/api/weather/route.ts`

**Fichiers :**
- Modifier : `app/api/weather/route.ts`

- [ ] **Étape 1 : Remplacer le filtre forecast**

Remplacer les lignes :
```typescript
    const forecast = (forecastData.list as unknown[])
      .filter((_: unknown, i: number) => i % 8 === 0)
      .slice(0, 5)
```

Par :
```typescript
    const today = new Date().toISOString().slice(0, 10)
    type ForecastEntry = {
      dt_txt: string
      main: { temp: number }
      weather: Array<{ main: string; description: string }>
    }
    const list = forecastData.list as ForecastEntry[]
    const byDate = new Map<string, ForecastEntry>()
    for (const entry of list) {
      const date = entry.dt_txt.slice(0, 10)
      if (date === today) continue
      if (!byDate.has(date)) {
        byDate.set(date, entry)
      } else {
        const currentHour = parseInt(byDate.get(date)!.dt_txt.slice(11, 13))
        const entryHour = parseInt(entry.dt_txt.slice(11, 13))
        if (Math.abs(entryHour - 12) < Math.abs(currentHour - 12)) {
          byDate.set(date, entry)
        }
      }
    }
    const forecast = Array.from(byDate.values()).slice(0, 4)
```

Logique : on saute aujourd'hui, on groupe par date, on prend l'entrée la plus proche de 12h00 pour chaque jour, max 4 jours.

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add app/api/weather/route.ts && git commit -m "fix: forecast skips today and picks noon entry per day"
```

---

### Task 2 : Mettre à jour `components/WeatherWidget.tsx`

**Fichiers :**
- Modifier : `components/WeatherWidget.tsx`

- [ ] **Étape 1 : Réduire le padding du conteneur principal**

Remplacer :
```typescript
      className={`widget-hover bg-gradient-to-br ${weatherBackground} rounded-3xl p-8 h-full shadow-2xl border border-white/10`}
```
Par :
```typescript
      className={`widget-hover bg-gradient-to-br ${weatherBackground} rounded-3xl p-4 h-full shadow-2xl border border-white/10`}
```

- [ ] **Étape 2 : Réduire le titre de la ville et le margin**

Remplacer :
```typescript
            <h2 className="text-2xl mb-6">
```
Par :
```typescript
            <h2 className="text-xl mb-2">
```

- [ ] **Étape 3 : Déplacer l'icône sous la température**

Remplacer :
```typescript
            <div className="flex items-center justify-between">

              <div>

                <p className="text-8xl font-light">
                  {Math.round(weather.main.temp)}°
                </p>

                <p className="text-zinc-300 mt-2 capitalize">
                  {weather.weather[0].description}
                </p>

              </div>

              <div className="text-8xl animate-float drop-shadow-2xl">
                {getWeatherIcon(weather.weather[0].main)}
              </div>

            </div>
```

Par :
```typescript
            <div>

              <p className="text-5xl font-light">
                {Math.round(weather.main.temp)}°
              </p>

              <div className="text-4xl animate-float drop-shadow-2xl mt-2">
                {getWeatherIcon(weather.weather[0].main)}
              </div>

              <p className="text-zinc-300 mt-2 capitalize">
                {weather.weather[0].description}
              </p>

            </div>
```

- [ ] **Étape 4 : Réduire le margin avant le forecast**

Remplacer :
```typescript
          <div className="mt-6 flex gap-2">
```
Par :
```typescript
          <div className="mt-3 flex gap-2">
```

- [ ] **Étape 5 : Réduire la taille des items forecast**

Remplacer :
```typescript
              <div
                key={index}
                className="glass-card rounded-xl px-2 py-2 w-14 text-center"
              >

                <div className="text-xl">
                  {getWeatherIcon(item.weather[0].main)}
                </div>

                <p className="text-[10px] mt-1 text-zinc-300">
                  {new Date(item.dt_txt).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                  })}
                </p>

                <p className="text-sm mt-1">
                  {Math.round(item.main.temp)}°
                </p>

              </div>
```

Par :
```typescript
              <div
                key={index}
                className="glass-card rounded-xl px-2 py-2 w-12 text-center"
              >

                <div className="text-base">
                  {getWeatherIcon(item.weather[0].main)}
                </div>

                <p className="text-[10px] mt-1 text-zinc-300">
                  {new Date(item.dt_txt).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                  })}
                </p>

                <p className="text-xs mt-1">
                  {Math.round(item.main.temp)}°
                </p>

              </div>
```

- [ ] **Étape 6 : Réduire les colonnes de comparaison**

Remplacer :
```typescript
            <div
              key={city.name}
              className="glass-card rounded-2xl px-3 py-5 w-20 flex flex-col items-center justify-between"
            >

              <p className="text-sm text-zinc-300 text-center">
                {city.name}
              </p>

              <div className="text-5xl animate-float">
                {getWeatherIcon(city.weather[0].main)}
              </div>

              <p className="text-3xl font-light">
                {Math.round(city.main.temp)}°
              </p>

            </div>
```

Par :
```typescript
            <div
              key={city.name}
              className="glass-card rounded-2xl px-2 py-3 w-16 flex flex-col items-center justify-between"
            >

              <p className="text-xs text-zinc-300 text-center">
                {city.name}
              </p>

              <div className="text-3xl animate-float">
                {getWeatherIcon(city.weather[0].main)}
              </div>

              <p className="text-2xl font-light">
                {Math.round(city.main.temp)}°
              </p>

            </div>
```

- [ ] **Étape 7 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 8 : Commit**

```bash
git add components/WeatherWidget.tsx && git commit -m "feat: weather widget compact layout for tablet"
```

---

### Task 3 : Mettre à jour `app/page.tsx`

**Fichiers :**
- Modifier : `app/page.tsx`

- [ ] **Étape 1 : Réduire le padding principal**

Remplacer :
```typescript
      className={`min-h-screen overflow-hidden bg-gradient-to-br ${backgroundClass} text-white p-6`}
```
Par :
```typescript
      className={`min-h-screen overflow-hidden bg-gradient-to-br ${backgroundClass} text-white p-3`}
```

- [ ] **Étape 2 : Supprimer h-[78vh] et réduire gap du grid principal**

Remplacer :
```typescript
      <div className="relative grid grid-cols-12 gap-6 h-[78vh]">
```
Par :
```typescript
      <div className="relative grid grid-cols-12 gap-4">
```

- [ ] **Étape 3 : Réduire la top row — hauteur et gap**

Remplacer :
```typescript
        <div className="col-span-12 grid grid-cols-12 gap-6 h-[390px]">
```
Par :
```typescript
        <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">
```

- [ ] **Étape 4 : Réduire la colonne droite (Todo + Courses)**

Remplacer :
```typescript
          <div className="col-span-3 h-[390px] flex flex-col gap-6">

  <div className="h-[200px]">
    <TodoWidget />
  </div>

  <div className="h-[140px]">
    <CoursesWidget />
  </div>

</div>
```

Par :
```typescript
          <div className="col-span-3 h-[300px] flex flex-col gap-4">

            <div className="h-[160px]">
              <TodoWidget />
            </div>

            <div className="flex-1">
              <CoursesWidget />
            </div>

          </div>
```

- [ ] **Étape 5 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 6 : Commit**

```bash
git add app/page.tsx && git commit -m "feat: reduce layout sizes for tablet viewport"
```

---

### Task 4 : Mettre à jour `components/ClockWidget.tsx`

**Fichiers :**
- Modifier : `components/ClockWidget.tsx`

- [ ] **Étape 1 : Remplacer le contenu du composant**

Remplacer le `return` entier par :
```typescript
  return (
    <div className="widget-hover glass-card rounded-3xl p-6 h-full shadow-2xl">
      <h1 className="text-5xl font-light">{time}</h1>

      <p className="text-zinc-400 mt-2">
        {new Date().toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
    </div>
  )
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add components/ClockWidget.tsx && git commit -m "feat: reduce clock widget text size for tablet"
```

---

### Task 5 : Mettre à jour `components/RadioWidget.tsx`

**Fichiers :**
- Modifier : `components/RadioWidget.tsx`

- [ ] **Étape 1 : Supprimer le header "Multimédia / MYHOME HUB" et réduire le padding**

Remplacer :
```typescript
    <div className="widget-hover glass-card rounded-3xl p-6 shadow-2xl">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-light">
          Multimédia
        </h2>

        <div className="text-zinc-400">
          MYHOME HUB
        </div>

      </div>

      <div className="grid grid-cols-5 gap-4">
```

Par :
```typescript
    <div className="widget-hover glass-card rounded-3xl p-4 shadow-2xl">

      <div className="grid grid-cols-5 gap-3">
```

- [ ] **Étape 2 : Réduire les boutons radio (logo + padding)**

Remplacer :
```typescript
          <button
            key={radio.name}
            onClick={() => playRadio(radio)}
            className={`transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-3
            ${
              activeRadio === radio.name
                ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/30 shadow-2xl'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >

            <img
              src={radio.logo}
              className="h-20 object-contain rounded-xl"
            />

            <span>
              {radio.name}
            </span>

          </button>
```

Par :
```typescript
          <button
            key={radio.name}
            onClick={() => playRadio(radio)}
            className={`transition-all rounded-2xl p-3 flex flex-col items-center justify-center gap-2
            ${
              activeRadio === radio.name
                ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/30 shadow-2xl'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >

            <img
              src={radio.logo}
              className="h-12 object-contain rounded-xl"
            />

            <span>
              {radio.name}
            </span>

          </button>
```

- [ ] **Étape 3 : Réduire le bouton Stop**

Remplacer :
```typescript
        <button
          onClick={stopRadio}
          className={`transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-3
          ${
            activeRadio === ''
              ? 'bg-red-500/50 border border-red-400 shadow-red-500/30 shadow-2xl'
              : 'bg-red-500/70 hover:bg-red-400'
          }`}
        >

          <span className="text-4xl">
            ⏹
          </span>

          <span>
            Stop
          </span>

        </button>
```

Par :
```typescript
        <button
          onClick={stopRadio}
          className={`transition-all rounded-2xl p-3 flex flex-col items-center justify-center gap-2
          ${
            activeRadio === ''
              ? 'bg-red-500/50 border border-red-400 shadow-red-500/30 shadow-2xl'
              : 'bg-red-500/70 hover:bg-red-400'
          }`}
        >

          <span className="text-3xl">
            ⏹
          </span>

          <span>
            Stop
          </span>

        </button>
```

- [ ] **Étape 4 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 5 : Commit**

```bash
git add components/RadioWidget.tsx && git commit -m "feat: radio widget compact — remove header, reduce logos"
```

---

### Task 6 : Mettre à jour `components/TodoWidget.tsx` et `components/CoursesWidget.tsx`

**Fichiers :**
- Modifier : `components/TodoWidget.tsx`
- Modifier : `components/CoursesWidget.tsx`

- [ ] **Étape 1 : TodoWidget — h-full + padding réduit**

Remplacer :
```typescript
    <div className="widget-hover glass-card rounded-3xl p-8 shadow-2xl h-[200px] flex flex-col overflow-hidden">

     <h2 className="text-xl mb-4 shrink-0">
       Todo
     </h2>
```

Par :
```typescript
    <div className="widget-hover glass-card rounded-3xl p-4 shadow-2xl h-full flex flex-col overflow-hidden">

      <h2 className="text-base mb-2 shrink-0">
        Todo
      </h2>
```

- [ ] **Étape 2 : CoursesWidget — h-full + padding réduit**

Remplacer :
```typescript
    <div className="widget-hover glass-card rounded-3xl p-6 shadow-2xl h-[170px] flex flex-col overflow-hidden">

      <h2 className="text-xl mb-4 shrink-0">
        Courses
      </h2>
```

Par :
```typescript
    <div className="widget-hover glass-card rounded-3xl p-4 shadow-2xl h-full flex flex-col overflow-hidden">

      <h2 className="text-base mb-2 shrink-0">
        Courses
      </h2>
```

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 4 : Commit**

```bash
git add components/TodoWidget.tsx components/CoursesWidget.tsx && git commit -m "feat: todo and courses widgets use h-full for flexible height"
```

---

### Task 7 : Vérifier visuellement en local

- [ ] **Étape 1 : Lancer le serveur de développement**

```bash
npm run dev
```

- [ ] **Étape 2 : Ouvrir DevTools à 1180×820**

Ouvrir `http://localhost:3000` dans le navigateur. Activer les DevTools, choisir "iPad Air" (ou saisir manuellement 1180×820). Vérifier :

- Tout le contenu tient dans le viewport sans scroll
- Les 3 colonnes de comparaison météo sont visibles
- Le forecast affiche 4 jours (pas aujourd'hui)
- Les températures du forecast sont représentatives de la journée
- La section radio ne déborde pas
- L'horloge, Todo et Courses sont lisibles

- [ ] **Étape 3 : Ajuster si nécessaire**

Si un élément déborde encore, ajuster la valeur en question et re-tester. Committer les ajustements.
