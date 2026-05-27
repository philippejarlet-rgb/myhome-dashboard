import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'myhome_session'
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const expected = process.env.AUTH_SESSION_TOKEN

  if (!token || !expected || token !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
}
