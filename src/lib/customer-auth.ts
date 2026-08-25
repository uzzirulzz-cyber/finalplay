/**
 * Customer auth helpers — separate from admin auth.
 * Customers use the Customer model (not User), and a different cookie name.
 */
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'

export const CUSTOMER_COOKIE = 'pb_customer'
const SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface CustomerSession {
  sub: string // customer id
  email: string
  name: string
  role: string
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed)
}

export function signCustomerSession(payload: CustomerSession) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions)
}

export function verifyCustomerSession(token: string): CustomerSession | null {
  try {
    return jwt.verify(token, SECRET) as CustomerSession
  } catch {
    return null
  }
}

export function setCustomerCookie(res: NextResponse, token: string) {
  res.headers.set(
    'Set-Cookie',
    `${CUSTOMER_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  )
}

export function clearCustomerCookie(res: NextResponse) {
  res.headers.set(
    'Set-Cookie',
    `${CUSTOMER_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  )
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!cookieHeader) return out
  for (const p of cookieHeader.split(';')) {
    const idx = p.indexOf('=')
    if (idx === -1) continue
    out[p.slice(0, idx).trim()] = decodeURIComponent(p.slice(idx + 1).trim())
  }
  return out
}

export async function getCustomerFromRequest(req: NextRequest) {
  const cookies = parseCookies(req.headers.get('cookie'))
  const token = cookies[CUSTOMER_COOKIE]
  if (!token) return null
  const session = verifyCustomerSession(token)
  if (!session) return null
  const customer = await db.customer.findUnique({
    where: { id: session.sub },
    select: {
      id: true, email: true, name: true, role: true, avatar: true,
      phone: true, country: true, address: true, emailVerified: true,
      orders: true, totalSpent: true, wishlist: true,
    },
  })
  return customer
}

/**
 * Require customer auth for API routes.
 * Returns the customer if authenticated, or a 401 response if not.
 */
export async function requireCustomer(req: NextRequest) {
  const customer = await getCustomerFromRequest(req)
  if (!customer) {
    return {
      error: NextResponse.json(
        { ok: false, error: 'Please sign in to continue.' },
        { status: 401 }
      ),
    }
  }
  if (!customer.emailVerified) {
    return {
      error: NextResponse.json(
        { ok: false, error: 'Please verify your email address.' },
        { status: 403 }
      ),
    }
  }
  return { customer }
}
