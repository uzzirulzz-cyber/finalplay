import { NextRequest, NextResponse } from 'next/server'
import { parseSessionCookie, verifySession } from './lib/auth'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/admin']

// Public prefixes — no auth, no redirects
const PUBLIC_PREFIXES = [
  '/storefront',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/storefront/',
  '/api/products/template',
  '/api/customer/signup',
  '/api/customer/login',
  '/api/customer/logout',
  '/api/customer/me',
  '/api/customer/verify-email',
  '/api/customer/resend-verification',
  '/api/customer/forgot-password',
  '/api/customer/reset-password',
  '/legal',
  '/contact',
  '/account',
  '/signup',
  '/login',
  '/_next/',
  '/favicon',
  '/playbeat-logo',
  '/logo',
  '/robots',
  '/sitemap',
  '/assets',
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect /admin/*
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const token = parseSessionCookie(req.headers.get('cookie'))
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    const session = verifySession(token)
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Everything else (including `/`) is public
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static assets and Next internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|logo.svg|playbeat-logo.png).*)',
  ],
}
