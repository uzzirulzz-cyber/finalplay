/**
 * Auth utilities — JWT-based session, cookie handling, password hashing.
 * Used by server-side route handlers and middleware only.
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const SESSION_COOKIE = 'pb_session'
const SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface SessionPayload {
  sub: string // user id
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

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions)
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as SessionPayload
    return decoded
  } catch {
    return null
  }
}

export function setSessionCookie(res: Response, token: string) {
  res.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  )
}

export function clearSessionCookie(res: Response) {
  res.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  )
}

/** Parse cookies from a Cookie header string. */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!cookieHeader) return out
  const pairs = cookieHeader.split(';')
  for (const p of pairs) {
    const idx = p.indexOf('=')
    if (idx === -1) continue
    const key = p.slice(0, idx).trim()
    const val = p.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(val)
  }
  return out
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const cookies = parseCookies(cookieHeader)
  return cookies[SESSION_COOKIE] || null
}
