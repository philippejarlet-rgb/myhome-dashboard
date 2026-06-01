import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetch('https://atlasculinaire.com/api/v1/countries', {
    headers: { 'x-api-key': process.env.ATLAS_API_KEY! },
    next: { revalidate: 86400 },
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
