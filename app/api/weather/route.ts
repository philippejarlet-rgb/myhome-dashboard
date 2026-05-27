import { NextResponse } from 'next/server'

const MAIN_CITY = 'Louhans'
const COMPARISON_CITIES = ['Bali', 'Grez-Doiceau', 'Barcelone']
const BASE = 'https://api.openweathermap.org/data/2.5'

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  try {
    const [mainRes, forecastRes, ...cityResponses] = await Promise.all([
      fetch(`${BASE}/weather?q=${MAIN_CITY}&units=metric&lang=fr&appid=${apiKey}`),
      fetch(`${BASE}/forecast?q=${MAIN_CITY}&units=metric&lang=fr&appid=${apiKey}`),
      ...COMPARISON_CITIES.map((city) =>
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
