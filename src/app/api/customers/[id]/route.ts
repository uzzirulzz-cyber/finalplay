import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

interface RouteCtx {
  params: Promise<{ id: string }>
}

// DELETE /api/customers/[id]
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const existing = await db.customer.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  await db.customer.delete({ where: { id } })
  await db.activityLog.create({
    data: {
      action: 'customer.delete',
      detail: `Deleted customer ${existing.email}`,
      actor: auth.session.email,
    },
  })
  return NextResponse.json({ ok: true })
}
