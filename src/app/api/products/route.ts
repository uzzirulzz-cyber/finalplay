import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

// GET /api/products?search=&category=&status=&page=&limit=
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const category = url.searchParams.get('category') || ''
  const status = url.searchParams.get('status') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || '50')))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (category && category !== 'all') where.category = category
  if (status && status !== 'all') where.status = status

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
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

// POST /api/products  (create single product)
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const sku = String(body?.sku || '').trim().toUpperCase()
  const name = String(body?.name || '').trim()
  const price = Number(body?.price || 0)

  if (!sku || !name || !price) {
    return NextResponse.json(
      { ok: false, error: 'SKU, name, and price are required.' },
      { status: 400 }
    )
  }

  // Check duplicate SKU
  const exists = await db.product.findUnique({ where: { sku } })
  if (exists) {
    return NextResponse.json(
      { ok: false, error: `SKU "${sku}" already exists.` },
      { status: 409 }
    )
  }

  const product = await db.product.create({
    data: {
      sku,
      name,
      description: body?.description ? String(body.description) : null,
      category: body?.category ? String(body.category) : null,
      price, // USD base
      currency: 'USD', // always USD base
      originalPrice: body?.originalPrice ? Number(body.originalPrice) : price,
      originalCurrency: body?.originalCurrency ? String(body.originalCurrency) : 'USD',
      region: body?.region ? String(body.region) : null,
      stock: Number(body?.stock || 0),
      status: body?.status ? String(body.status) : 'active',
      digital: Boolean(body?.digital ?? true),
      image: body?.image ? String(body.image) : null,
      tags: Array.isArray(body?.tags) ? body.tags.map(String) : [],
    },
  })

  await db.activityLog.create({
    data: {
      action: 'product.create',
      detail: `Created product ${sku} (${name})`,
      actor: auth.session.email,
    },
  })

  return NextResponse.json({ ok: true, data: product }, { status: 201 })
}
