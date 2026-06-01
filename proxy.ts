import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'myhome_session'
const ADMIN_COOKIE = 'myhome_admin'
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/admin/login', '/api/auth/admin']

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value
    if (!adminCookie || adminCookie !== process.env.ADMIN_SESSION_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-email', payload.email as string)
    response.headers.set('x-user-name', payload.name as string)
    return response
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|.*\\.webmanifest).*)',
  ],
}
