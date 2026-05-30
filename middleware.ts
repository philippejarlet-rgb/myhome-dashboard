import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'myhome_session'
const ADMIN_COOKIE = 'myhome_admin'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/admin/login', '/api/auth/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Paths publics
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Routes admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value
    if (!adminCookie || adminCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Auth principale (session token — inchangée)
  const token = request.cookies.get(COOKIE_NAME)?.value
  const expected = process.env.AUTH_SESSION_TOKEN

  if (!token || !expected || token !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.json|.*\\.webmanifest|sw\\.js).*)',
  ],
}
