import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

// GET /api/orders?status=&page=&limit=
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const url = new URL(req.url)
  const status = url.searchParams.get('status') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || '50')))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status && status !== 'all') where.status = status

  const [items, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({
    ok: true,
    data: items,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  })
}

// POST /api/orders — create new order (also used by storefront checkout)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  const customerName = String(body?.customerName || '').trim()
  const customerEmail = body?.customerEmail ? String(body.customerEmail).trim().toLowerCase() : null
  const items = Array.isArray(body?.items) ? body.items : []
  const paymentMethod = body?.paymentMethod ? String(body.paymentMethod) : null

  if (!customerName || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Customer name and at least one item are required.' },
      { status: 400 }
    )
  }

  // Lookup product prices from DB to prevent tampering
  const itemRows = []
  let total = 0
  for (const it of items) {
    const product = await db.product.findUnique({ where: { id: String(it.productId) } })
    if (!product) continue
    const qty = Math.max(1, Number(it.qty) || 1)
    itemRows.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
    })
    total += product.price * qty
  }

  if (itemRows.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No valid products in order.' },
      { status: 400 }
    )
  }

  // Generate order number
  const lastOrder = await db.order.findFirst({ orderBy: { createdAt: 'desc' } })
  const nextNum = lastOrder ? parseInt(lastOrder.orderNumber.replace(/\D/g, '') || '0', 10) + 1 : 1
  const orderNumber = `PB-${String(nextNum).padStart(5, '0')}`

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,
      items: itemRows,
      total,
      currency: 'USD',
      status: body?.status ? String(body.status) : 'pending',
      paymentMethod,
    },
  })

  // Update customer stats
  if (customerEmail) {
    const existing = await db.customer.findUnique({ where: { email: customerEmail } })
    if (existing) {
      await db.customer.update({
        where: { id: existing.id },
        data: {
          orders: { increment: 1 },
          totalSpent: { increment: total },
        },
      })
    } else {
      await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          orders: 1,
          totalSpent: total,
        },
      })
    }
  }

  return NextResponse.json({ ok: true, data: order }, { status: 201 })
}
