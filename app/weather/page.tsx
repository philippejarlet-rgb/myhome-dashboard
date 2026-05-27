'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

type City = {
  name: string
  temp: string
  weather: string
  icon: string
  main?: boolean
  favorite?: boolean
}

export default function WeatherPage() {

  const router = useRouter()

  const [cities, setCities] = useState<City[]>([])

  const [newCity, setNewCity] = useState('')

  const [loaded, setLoaded] = useState(false)

  // LOAD

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data/weather')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()

        if (data.length === 0) {
          const saved = localStorage.getItem('myhome-weather')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              const migrateResponse = await fetch('/api/data/weather', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
              })
              if (!migrateResponse.ok) throw new Error('Migration PUT failed')
              setCities(parsed)
              localStorage.removeItem('myhome-weather')
              setLoaded(true)
              return
            } catch {
              // migration failed, continue with empty list
            }
          }
        }

        setCities(data)
        setLoaded(true)
      } catch {
        setLoaded(true)
      }
    }
    loadData()
  }, [])

  // SAVE

  useEffect(() => {
    if (!loaded) return
    fetch('/api/data/weather', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cities),
    }).catch(() => {})
  }, [cities, loaded])

  // ADD CITY LIVE WEATHER

  const addCity = async () => {

    if (!newCity.trim()) return

    try {

      const response = await fetch(
        `/api/weather/city?q=${encodeURIComponent(newCity)}`
      )

      const data = await response.json()

      if (data.cod !== 200) {

        alert('Ville introuvable 😄')

        return
      }

      setCities(prev => [
        ...prev,
        {
          name: data.name,
          temp: `${Math.round(data.main.temp)}°`,
          weather: data.weather[0].description,
          icon: (() => {
            const main = data.weather[0].main.toLowerCase()
            if (main.includes('cloud')) return '☁️'
            if (main.includes('rain')) return '🌧'
            if (main.includes('storm')) return '⛈'
            if (main.includes('snow')) return '❄️'
            return '☀️'
          })(),
        },
      ])

      setNewCity('')

    } catch (error) {

      console.error(error)

      alert('Erreur météo 😄')

    }
  }

  // DELETE

  const deleteCity = (index: number) => {

    const updated = cities.filter(
      (_, i) => i !== index
    )

    setCities(updated)
  }

  // TOGGLE MAIN

  const toggleMain = (index: number) => {
    const updated = cities.map((city, i) => ({
      ...city,
      main: i === index ? !city.main : false,
    }))
    setCities(updated)
  }

  // TOGGLE FAVORITE

  const toggleFavorite = (index: number) => {
    const city = cities[index]
    const favoriteCount = cities.filter((c) => c.favorite).length
    if (!city.favorite && favoriteCount >= 3) return
    const updated = cities.map((c, i) => ({
      ...c,
      favorite: i === index ? !c.favorite : c.favorite,
    }))
    setCities(updated)
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}

      <div className="flex items-center gap-6 mb-10">

        <button
          onClick={() => router.push('/')}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>

        <div>

          <h1 className="text-6xl font-thin">
            Weather
          </h1>

          <p className="text-zinc-400 mt-2 text-xl">
            Prévisions météo MYHOME
          </p>

        </div>

      </div>

      {/* ADD CITY */}

      <div className="glass-card rounded-3xl p-6 mb-10">

        <div className="flex gap-4">

          <input
            value={newCity}
            onChange={(e) =>
              setNewCity(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCity()
              }
            }}
            placeholder="Ajouter une ville..."
            className="flex-1 bg-black/20 rounded-2xl px-6 py-4 outline-none text-xl"
          />

          <button
            onClick={addCity}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-8 py-4 text-xl"
          >
            Ajouter
          </button>

        </div>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-4 gap-6">

        {cities.map((city, index) => (

          <div
            key={city.name}
            className="glass-card rounded-3xl p-8 relative flex flex-col"
          >

            <button
              onClick={() => deleteCity(index)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-300"
            >
              ✕
            </button>

            <h2 className="text-2xl">
              {city.name}
            </h2>

            <p className="text-7xl mt-6 font-thin">
              {city.temp}
            </p>

            <div className="flex items-center gap-3 mt-4">

              <div className="text-4xl">
                {city.icon}
              </div>

              <p className="text-zinc-300 capitalize">
                {city.weather}
              </p>

            </div>

            <div className="flex gap-2 mt-4">

              <button
                onClick={() => toggleMain(index)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all ${
                  city.main
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                ⭐ Principale
              </button>

              <button
                onClick={() => toggleFavorite(index)}
                disabled={!city.favorite && cities.filter((c) => c.favorite).length >= 3}
                className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all ${
                  city.favorite
                    ? 'bg-cyan-500 text-white'
                    : !city.favorite && cities.filter((c) => c.favorite).length >= 3
                    ? 'opacity-40 cursor-not-allowed bg-white/10 text-zinc-300'
                    : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                ♥ Favori
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>

  )
}