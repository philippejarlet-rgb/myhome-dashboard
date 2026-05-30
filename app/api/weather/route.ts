import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const BASE = 'https://api.openweathermap.org/data/2.5'

type City = {
  name: string
  main?: boolean
  favorite?: boolean
}

async function getWeatherConfig(userId: string | null): Promise<{ mainCity: string; comparisonCities: string[] }> {
  try {
    const query = supabaseAdmin
      .from('app_data')
      .select('data')
      .eq('type', 'weather')

    if (userId) query.eq('user_id', userId)

    const { data } = await query.single()
    const cities: City[] = data?.data ?? []
    const mainCity = cities.find((c) => c.main)?.name ?? 'Louhans'
    const comparisonCities = cities.filter((c) => c.favorite).slice(0, 3).map((c) => c.name)
    return { mainCity, comparisonCities }
  } catch {
    return { mainCity: 'Louhans', comparisonCities: [] }
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  const userId = request.headers.get('x-user-id')
  const { mainCity, comparisonCities } = await getWeatherConfig(userId)

  try {
    const [mainRes, forecastRes, ...cityResponses] = await Promise.all([
      fetch(`${BASE}/weather?q=${encodeURIComponent(mainCity)}&units=metric&lang=fr&appid=${apiKey}`),
      fetch(`${BASE}/forecast?q=${encodeURIComponent(mainCity)}&units=metric&lang=fr&appid=${apiKey}`),
      ...comparisonCities.map((city) =>
        fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${apiKey}`)
      ),
    ])

    if (!mainRes.ok || !forecastRes.ok) {
      return NextResponse.json({ error: 'Erreur OpenWeatherMap' }, { status: 502 })
    }

    const [main, forecastData, ...cities] = await Promise.all([
      mainRes.json(),
      forecastRes.json(),
      ...cityResponses.map((r) => r.json()),
    ])

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

    return NextResponse.json({ main, forecast, cities })
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération météo' },
      { status: 500 }
    )
  }
}
