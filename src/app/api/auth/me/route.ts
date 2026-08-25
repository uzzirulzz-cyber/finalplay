import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseSessionCookie, verifySession } from '@/lib/auth'

// GET /api/auth/me
export async function GET(req: NextRequest) {
  const token = parseSessionCookie(req.headers.get('cookie'))
  if (!token) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 })
  }
  const session = verifySession(token)
  if (!session) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 })
  }
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  })
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 })
  }
  return NextResponse.json({ ok: true, user })
}
