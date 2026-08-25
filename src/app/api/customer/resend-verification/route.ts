import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerFromRequest } from '@/lib/customer-auth'

// POST /api/customer/resend-verification
export async function POST(req: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(req)
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: 'Session expired.' },
        { status: 401 }
      )
    }

    if (customer.emailVerified) {
      return NextResponse.json({ ok: true, message: 'Email already verified.' })
    }

    // Generate new code
    const verifyToken = String(Math.floor(100000 + Math.random() * 900000))
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.customer.update({
      where: { id: customer.id },
      data: { verifyToken, verifyExpires },
    })

    return NextResponse.json({
      ok: true,
      message: 'Verification code sent.',
      verifyToken: process.env.NODE_ENV === 'development' ? verifyToken : undefined,
    })
  } catch (e) {
    console.error('[customer.resend-verification]', e)
    return NextResponse.json(
      { ok: false, error: 'Failed to resend code.' },
      { status: 500 }
    )
  }
}
