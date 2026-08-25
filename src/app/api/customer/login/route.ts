import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyPassword,
  signCustomerSession,
  setCustomerCookie,
} from '@/lib/customer-auth'

// POST /api/customer/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const remember = Boolean(body?.remember)

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const customer = await db.customer.findUnique({ where: { email } })
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, customer.password)
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const token = signCustomerSession({
      sub: customer.id,
      email: customer.email,
      name: customer.name,
      role: customer.role,
    })

    const res = NextResponse.json({
      ok: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: customer.role,
        emailVerified: customer.emailVerified,
        avatar: customer.avatar,
      },
      requiresVerification: !customer.emailVerified,
    })
    setCustomerCookie(res, token)
    return res
  } catch (e) {
    console.error('[customer.login]', e)
    return NextResponse.json(
      { ok: false, error: 'Login failed.' },
      { status: 500 }
    )
  }
}
