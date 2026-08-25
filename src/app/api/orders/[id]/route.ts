import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

interface RouteCtx {
  params: Promise<{ id: string }>
}

// PUT /api/orders/[id] — update status
export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))

  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (body?.status) {
    const s = String(body.status).toLowerCase()
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(s)) {
      return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 })
    }
    data.status = s
  }
  if (typeof body?.paymentMethod === 'string') data.paymentMethod = body.paymentMethod
  if (typeof body?.customerName === 'string') data.customerName = body.customerName
  if (typeof body?.customerEmail === 'string') data.customerEmail = body.customerEmail

  const updated = await db.order.update({ where: { id }, data })
  await db.activityLog.create({
    data: {
      action: 'order.update',
      detail: `Updated order ${updated.orderNumber} (status=${updated.status})`,
      actor: auth.session.email,
    },
  })
  return NextResponse.json({ ok: true, data: updated })
}

// DELETE /api/orders/[id]
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  await db.order.delete({ where: { id } })
  await db.activityLog.create({
    data: {
      action: 'order.delete',
      detail: `Deleted order ${existing.orderNumber}`,
      actor: auth.session.email,
    },
  })
  return NextResponse.json({ ok: true })
}
