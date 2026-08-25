import { NextRequest, NextResponse } from 'next/server'
import { parseSessionCookie, verifySession, type SessionPayload } from './auth'
import { db } from './db'

export interface AuthedRequest {
  session: SessionPayload
}

/**
 * Validates the session cookie. Returns the session payload if authenticated,
 * or null + a 401 NextResponse if not.
 */
export async function requireAuth(req: NextRequest): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const token = parseSessionCookie(req.headers.get('cookie'))
  if (!token) {
    return {
      error: NextResponse.json(
        { ok: false, error: 'Not authenticated.' },
        { status: 401 }
      ),
    }
  }
  const session = verifySession(token)
  if (!session) {
    return {
      error: NextResponse.json(
        { ok: false, error: 'Invalid or expired session.' },
        { status: 401 }
      ),
    }
  }
  // Verify the user still exists and is an admin
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, role: true },
  })
  if (!user || user.role !== 'admin') {
    return {
      error: NextResponse.json(
        { ok: false, error: 'Access denied.' },
        { status: 403 }
      ),
    }
  }
  return { session }
}
