'use client'

import { useEffect, useState } from 'react'

type Props = {
  onWake: () => void
}

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Screensaver({ onWake }: Props) {
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
  const [weather, setWeather] = useState<Weather | null>(null)

  // Chargement dynamique des photos avec shuffle Fisher-Yates
  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((files: string[]) => {
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL
        setImages(shuffle(files.map((f) => `${base}/storage/v1/object/public/photos/${encodeURIComponent(f)}`)))
      })
      .catch(() => {})
  }, [])

  // Rotation des images toutes les 20 secondes
  useEffect(() => {
    if (images.length === 0) return
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 20000)
    return () => clearInterval(interval)
  }, [images])

  // Horloge
  useEffect(() => {
    const updateTime = () =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Météo
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

  const weatherText = weather
    ? `${weather.city} • ${weather.temp}° • ${weather.description} ${weather.icon}`
    : 'Louhans • ... • ...'

  return (
    <div
      onClick={onWake}
      className="fixed inset-0 overflow-hidden cursor-pointer z-[999]"
    >
      {/* Background image ou fond noir si aucune photo */}
      {images.length > 0 ? (
        <img
          src={images[currentImage]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 animate-slowzoom"
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <div className="text-center animate-fadein">
          <h1 className="text-[12rem] font-thin tracking-wider">{time}</h1>
          <p className="text-3xl text-zinc-200 mt-6">{weatherText}</p>
        </div>
      </div>
    </div>
  )
}
