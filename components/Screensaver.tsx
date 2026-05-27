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

export default function Screensaver({ onWake }: Props) {

  const images = [
    '/screensaver/1.jpg',
    '/screensaver/2.jpg',
    '/screensaver/3.jpg',
    '/screensaver/4.jpg',
    '/screensaver/5.jpg',
    '/screensaver/6.jpg',
    '/screensaver/7.jpg',
    '/screensaver/8.jpg',
    '/screensaver/9.jpg',
    '/screensaver/10.jpg',
    '/screensaver/11.jpg',
    '/screensaver/12.jpg',
    '/screensaver/13.jpg',
  ]

  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentImage((prev) =>
        (prev + 1) % images.length
      )

    }, 20000)

    return () => clearInterval(interval)

  }, [])

  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )

  // CLOCK
  useEffect(() => {
    const updateTime = () =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

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

  const weatherText = weather
    ? `${weather.city} • ${weather.temp}° • ${weather.description} ${weather.icon}`
    : 'Louhans • ... • ...'

  return (

    <div
      onClick={onWake}
      className="fixed inset-0 overflow-hidden cursor-pointer z-[999]"
    >

      {/* Background image */}

      <img
        src={images[currentImage]}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 animate-slowzoom"
      />

      {/* Dark overlay */}

      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Content */}

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">

        <div className="text-center animate-fadein">

          <h1 className="text-[12rem] font-thin tracking-wider">
            {time}
          </h1>

          <p className="text-3xl text-zinc-200 mt-6">
            {weatherText}
          </p>

        </div>

      </div>

    </div>
  )
}