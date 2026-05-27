import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'myhome_session'
const MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.AUTH_PASSWORD) {
    return NextResponse.json(
      { error: 'Mot de passe incorrect' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set(COOKIE_NAME, process.env.AUTH_SESSION_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })

  return response
}
