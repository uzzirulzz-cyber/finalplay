import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomer } from '@/lib/customer-auth'

// GET /api/customer/licenses
export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req)
  if ('error' in auth) return auth.error
  const { customer } = auth

  const licenses = await db.digitalLicense.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ ok: true, licenses })
}
