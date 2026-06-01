import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ATLAS = 'https://atlasculinaire.com/api/v1'
  const headers = { 'x-api-key': process.env.ATLAS_API_KEY! }

  const head = await fetch(`${ATLAS}/recipes?limit=1`, { headers, cache: 'no-store' })
  if (!head.ok) return NextResponse.json(null, { status: head.status })

  const { total } = await head.json()
  const offset = Math.floor(Math.random() * (total || 1))

  const page = await fetch(`${ATLAS}/recipes?limit=1&offset=${offset}`, { headers, cache: 'no-store' })
  if (!page.ok) return NextResponse.json(null, { status: page.status })

  const data = await page.json()
  return NextResponse.json(data.recipes?.[0] ?? null)
}
