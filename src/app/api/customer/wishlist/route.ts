import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomer } from '@/lib/customer-auth'

// GET /api/customer/wishlist — list wishlist products
export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req)
  if ('error' in auth) return auth.error
  const { customer } = auth

  const products = await db.product.findMany({
    where: { id: { in: customer.wishlist } },
    select: {
      id: true, sku: true, name: true, description: true, category: true,
      price: true, currency: true, originalPrice: true, originalCurrency: true,
      region: true, stock: true, status: true, image: true, images: true,
      digital: true, deliveryMethod: true, tags: true,
      rating: true, reviewCount: true, salesCount: true,
      featured: true, trending: true, bestSeller: true, flashDeal: true,
      brand: true,
    },
  })

  return NextResponse.json({ ok: true, products })
}

// POST /api/customer/wishlist — add/remove product
export async function POST(req: NextRequest) {
  const auth = await requireCustomer(req)
  if ('error' in auth) return auth.error
  const { customer } = auth

  const body = await req.json().catch(() => ({}))
  const productId = String(body?.productId || '')
  const action = String(body?.action || 'toggle') // add | remove | toggle

  if (!productId) {
    return NextResponse.json(
      { ok: false, error: 'productId is required.' },
      { status: 400 }
    )
  }

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json({ ok: false, error: 'Product not found.' }, { status: 404 })
  }

  const currentWishlist = customer.wishlist || []
  let newWishlist: string[]

  if (action === 'add') {
    newWishlist = currentWishlist.includes(productId) ? currentWishlist : [...currentWishlist, productId]
  } else if (action === 'remove') {
    newWishlist = currentWishlist.filter((id) => id !== productId)
  } else {
    // toggle
    newWishlist = currentWishlist.includes(productId)
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId]
  }

  await db.customer.update({
    where: { id: customer.id },
    data: { wishlist: newWishlist },
  })

  return NextResponse.json({
    ok: true,
    wishlist: newWishlist,
    inWishlist: newWishlist.includes(productId),
  })
}
