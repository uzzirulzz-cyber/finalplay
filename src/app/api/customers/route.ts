import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

// GET /api/customers?search=&page=&limit=
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || '50')))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.customer.count({ where }),
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
