import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const PROTECTED = ['/dashboard', '/videos']
const AUTH_ONLY = ['/auth/login', '/auth/register']

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p))

  if (isProtected) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (isAuthOnly && token && verifyToken(token)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/videos/:path*', '/auth/:path*'],
}
