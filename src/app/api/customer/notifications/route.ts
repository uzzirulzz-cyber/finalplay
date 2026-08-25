import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomer } from '@/lib/customer-auth'

// GET /api/customer/notifications
export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req)
  if ('error' in auth) return auth.error
  const { customer } = auth

  const notifications = await db.notification.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unread = notifications.filter((n) => !n.read).length

  return NextResponse.json({ ok: true, notifications, unread })
}

// POST /api/customer/notifications — mark as read
export async function POST(req: NextRequest) {
  const auth = await requireCustomer(req)
  if ('error' in auth) return auth.error
  const { customer } = auth

  const body = await req.json().catch(() => ({}))
  const markAll = Boolean(body?.markAll)
  const notificationId = body?.notificationId ? String(body.notificationId) : null

  if (markAll) {
    await db.notification.updateMany({
      where: { customerId: customer.id, read: false },
      data: { read: true },
    })
    return NextResponse.json({ ok: true, message: 'All marked as read.' })
  }

  if (notificationId) {
    await db.notification.updateMany({
      where: { id: notificationId, customerId: customer.id },
      data: { read: true },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json(
    { ok: false, error: 'Provide notificationId or markAll.' },
    { status: 400 }
  )
}
