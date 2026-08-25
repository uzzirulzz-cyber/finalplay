import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/storefront/products?category=&search=&sort=
// Public endpoint — returns only active products for the storefront.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category') || ''
  const search = url.searchParams.get('search') || ''
  const sort = url.searchParams.get('sort') || 'newest' // newest | best-selling | price-low | price-high | rating
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || '100')))

  const where: Record<string, unknown> = { status: 'active' }
  if (category && category !== 'all') where.category = category
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { tags: { has: search.toLowerCase() } },
      { brand: { contains: search, mode: 'insensitive' } },
    ]
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (sort === 'best-selling') orderBy = { salesCount: 'desc' }
  else if (sort === 'price-low') orderBy = { price: 'asc' }
  else if (sort === 'price-high') orderBy = { price: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }

  const products = await db.product.findMany({
    where,
    orderBy,
    take: limit,
    select: {
      id: true, sku: true, name: true, description: true, category: true,
      price: true, currency: true, originalPrice: true, originalCurrency: true,
      compareAtPrice: true, region: true, brand: true,
      stock: true, status: true, image: true, images: true,
      digital: true, deliveryMethod: true, tags: true,
      rating: true, reviewCount: true, salesCount: true,
      featured: true, trending: true, bestSeller: true, flashDeal: true,
    },
  })

  const categories = await db.product.findMany({
    where: { status: 'active' },
    select: { category: true },
    distinct: ['category'],
  })

  return NextResponse.json({
    ok: true,
    data: products,
    categories: categories
      .map((p) => p.category)
      .filter(Boolean) as string[],
  })
}
