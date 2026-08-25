import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerFromRequest } from '@/lib/customer-auth'

// POST /api/customer/verify-email
export async function POST(req: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(req)
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: 'Session expired. Please sign up again.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const code = String(body?.code || '').trim()

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { ok: false, error: 'Please enter the 6-digit verification code.' },
        { status: 400 }
      )
    }

    const fullCustomer = await db.customer.findUnique({ where: { id: customer.id } })
    if (!fullCustomer) {
      return NextResponse.json(
        { ok: false, error: 'Account not found.' },
        { status: 404 }
      )
    }

    if (fullCustomer.emailVerified) {
      return NextResponse.json({ ok: true, message: 'Email already verified.' })
    }

    if (!fullCustomer.verifyToken || fullCustomer.verifyToken !== code) {
      return NextResponse.json(
        { ok: false, error: 'Invalid verification code.' },
        { status: 400 }
      )
    }

    if (fullCustomer.verifyExpires && fullCustomer.verifyExpires < new Date()) {
      return NextResponse.json(
        { ok: false, error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      )
    }

    await db.customer.update({
      where: { id: customer.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyExpires: null,
      },
    })

    // Create welcome notification
    await db.notification.create({
      data: {
        customerId: customer.id,
        type: 'system',
        title: 'Welcome to PlayBeat Digital! 🎉',
        message: `Hi ${customer.name}, your account is verified. Start exploring premium digital products.`,
        read: false,
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Email verified successfully!',
    })
  } catch (e) {
    console.error('[customer.verify-email]', e)
    return NextResponse.json(
      { ok: false, error: 'Verification failed.' },
      { status: 500 }
    )
  }
}
