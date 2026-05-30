import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyPassword } from '@/lib/hashPassword'
import { signJWT } from '@/lib/auth'

const COOKIE_NAME = 'myhome_session'
const MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, password_hash')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const token = await signJWT({ userId: user.id, email: user.email, name: user.name })

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}
