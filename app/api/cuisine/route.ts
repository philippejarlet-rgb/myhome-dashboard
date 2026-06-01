import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString()
  const res = await fetch(`https://atlasculinaire.com/api/v1/recipes?${qs}`, {
    headers: { 'x-api-key': process.env.ATLAS_API_KEY! },
    next: { revalidate: 300 },
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
