import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

interface RouteCtx {
  params: Promise<{ id: string }>
}

// GET /api/products/[id]
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const product = await db.product.findUnique({ where: { id } })
  if (!product) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, data: product })
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  // If SKU is changing, check uniqueness
  if (body?.sku && body.sku !== existing.sku) {
    const sku = String(body.sku).trim().toUpperCase()
    const dup = await db.product.findUnique({ where: { sku } })
    if (dup && dup.id !== id) {
      return NextResponse.json(
        { ok: false, error: `SKU "${sku}" already exists.` },
        { status: 409 }
      )
    }
    body.sku = sku
  }

  const data: Record<string, unknown> = {}
  for (const k of ['sku', 'name', 'description', 'category', 'price', 'currency', 'stock', 'status', 'image', 'digital']) {
    if (k in body) data[k] = body[k]
  }
  if (Array.isArray(body?.tags)) data.tags = body.tags.map(String)

  const updated = await db.product.update({ where: { id }, data })
  await db.activityLog.create({
    data: {
      action: 'product.update',
      detail: `Updated product ${updated.sku} (${updated.name})`,
      actor: auth.session.email,
    },
  })
  return NextResponse.json({ ok: true, data: updated })
}

// DELETE /api/products/[id]
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  await db.product.delete({ where: { id } })
  await db.activityLog.create({
    data: {
      action: 'product.delete',
      detail: `Deleted product ${existing.sku} (${existing.name})`,
      actor: auth.session.email,
    },
  })
  return NextResponse.json({ ok: true })
}
