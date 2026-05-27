import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY non configurée' },
      { status: 500 }
    )
  }

  const q = request.nextUrl.searchParams.get('q')

  if (!q) {
    return NextResponse.json(
      { error: 'Paramètre q manquant' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=metric&lang=fr&appid=${apiKey}`
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération météo' },
      { status: 500 }
    )
  }
}
