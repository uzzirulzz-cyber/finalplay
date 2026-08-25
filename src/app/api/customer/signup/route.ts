import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signCustomerSession, setCustomerCookie } from '@/lib/customer-auth'

// POST /api/customer/signup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const phone = body?.phone ? String(body.phone).trim() : null
    const password = String(body?.password || '')
    const confirmPassword = String(body?.confirmPassword || '')
    const referralCode = body?.referralCode ? String(body.referralCode).trim() : null
    const agreeToTerms = Boolean(body?.agreeToTerms)

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: 'Passwords do not match.' },
        { status: 400 }
      )
    }
    if (!agreeToTerms) {
      return NextResponse.json(
        { ok: false, error: 'You must agree to the Terms & Conditions.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await db.customer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate 6-digit verification code
    const verifyToken = String(Math.floor(100000 + Math.random() * 900000))
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create customer
    const customer = await db.customer.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        referralCode,
        verifyToken,
        verifyExpires,
        role: 'customer',
      },
    })

    // Delivery is handled by the configured email provider in deployment.
    const token = signCustomerSession({
      sub: customer.id,
      email: customer.email,
      name: customer.name,
      role: customer.role,
    })

    const res = NextResponse.json({
      ok: true,
      message: 'Account created. Please verify your email.',
      customerId: customer.id,
      email: customer.email,
      requiresVerification: true,
    })
    setCustomerCookie(res, token)
    return res
  } catch (e) {
    console.error('[customer.signup]', e)
    return NextResponse.json(
      { ok: false, error: 'Signup failed.' },
      { status: 500 }
    )
  }
}
