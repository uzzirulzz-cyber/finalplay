import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyPassword,
  signSession,
  setSessionCookie,
} from '@/lib/auth'

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials.' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials.' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { ok: false, error: 'Access denied.' },
        { status: 403 }
      )
    }

    const token = signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
    setSessionCookie(res, token)
    return res
  } catch (e) {
    console.error('[login] error:', e)
    return NextResponse.json(
      { ok: false, error: 'Login failed.' },
      { status: 500 }
    )
  }
}
