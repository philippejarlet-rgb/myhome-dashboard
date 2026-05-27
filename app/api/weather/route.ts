import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const BASE = 'https://api.openweathermap.org/data/2.5'

type City = {
  name: string
  main?: boolean
  favorite?: boolean
}

function getWeatherConfig(): { mainCity: string; comparisonCities: string[] } {
  const filePath = path.join(process.cwd(), 'data', 'weather.json')
  if (!existsSync(filePath)) {
    return { mainCity: 'Louhans', comparisonCities: [] }
  }
  try {
    const cities: City[] = JSON.parse(readFileSync(filePath, 'utf-8'))
    const mainCity = cities.find((c) => c.main)?.name ?? 'Louhans'
    const comparisonCities = cities
      .filter((c) => c.favorite)
      .slice(0, 3)
      .map((c) => c.name)
    return { mainCity, comparisonCities }
  } catch {
    return { mainCity: 'Louhans', comparisonCities: [] }
  }
}

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  const { mainCity, comparisonCities } = getWeatherConfig()

  try {
    const [mainRes, forecastRes, ...cityResponses] = await Promise.all([
      fetch(`${BASE}/weather?q=${mainCity}&units=metric&lang=fr&appid=${apiKey}`),
      fetch(`${BASE}/forecast?q=${mainCity}&units=metric&lang=fr&appid=${apiKey}`),
      ...comparisonCities.map((city) =>
        fetch(`${BASE}/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`)
      ),
    ])

    const [main, forecastData, ...cities] = await Promise.all([
      mainRes.json(),
      forecastRes.json(),
      ...cityResponses.map((r) => r.json()),
    ])

    const forecast = (forecastData.list as unknown[])
      .filter((_: unknown, i: number) => i % 8 === 0)
      .slice(0, 5)

    return NextResponse.json({ main, forecast, cities })
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération météo' },
      { status: 500 }
    )
  }
}
