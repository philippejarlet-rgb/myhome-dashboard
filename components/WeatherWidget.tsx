'use client'

import { useEffect, useState } from 'react'

export default function WeatherWidget() {

  const [weather, setWeather] = useState<any>(null)
  const [citiesWeather, setCitiesWeather] = useState<any[]>([])
  const [forecast, setForecast] = useState<any[]>([])

  useEffect(() => {

    async function fetchWeather() {

      const response = await fetch('/api/weather')

      if (!response.ok) return

      const data = await response.json()

      setWeather(data.main)
      setCitiesWeather(data.cities)
      setForecast(data.forecast)

    }

    fetchWeather()

  }, [])

  // LOADING

  if (!weather || !weather.main) {
    return (
      <div className="widget-hover glass-card rounded-3xl p-4 h-full shadow-2xl">
        Chargement météo...
      </div>
    )
  }

  // WEATHER BACKGROUND

  const weatherMain = weather.weather[0].main

  let weatherBackground = 'from-slate-900 to-zinc-900'

  if (weatherMain === 'Clear') {
    weatherBackground = 'from-blue-900 to-sky-700'
  }

  if (weatherMain === 'Rain') {
    weatherBackground = 'from-zinc-800 to-slate-700'
  }

  if (weatherMain === 'Clouds') {
    weatherBackground = 'from-slate-700 to-zinc-700'
  }

  if (weatherMain === 'Thunderstorm') {
    weatherBackground = 'from-purple-900 to-zinc-900'
  }

  // ICONS

  const getWeatherIcon = (main: string) => {

    switch (main) {

      case 'Clear':
        return '☀️'

      case 'Clouds':
        return '☁️'

      case 'Rain':
        return '🌧️'

      case 'Thunderstorm':
        return '⛈️'

      case 'Snow':
        return '❄️'

      case 'Mist':
        return '🌫️'

      default:
        return '☀️'
    }
  }

  return (

    <div
      className={`widget-hover bg-gradient-to-br ${weatherBackground} rounded-3xl p-4 h-full shadow-2xl border border-white/10`}
    >

      <div className="flex justify-between gap-6 h-full">

        {/* LEFT */}

        <div className="flex-1 flex flex-col gap-3">

          <div>

            <h2 className="text-xl mb-2">
              {weather.name}
            </h2>

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

          </div>

          {/* FORECAST */}

          <div className="mt-3 flex gap-2">

            {forecast.map((item, index) => (

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

            ))}

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex gap-3">

          {citiesWeather.map((city) => (

            <div
              key={city.name}
              className="glass-card rounded-2xl px-2 py-3 w-16 flex flex-col items-center justify-around"
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

          ))}

        </div>

      </div>

    </div>
  )
}