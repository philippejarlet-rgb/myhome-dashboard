import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'myhome_admin'
const MAX_AGE = 4 * 60 * 60 // 4 heures

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, process.env.ADMIN_SESSION_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}
