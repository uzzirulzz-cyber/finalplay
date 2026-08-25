import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Hidden default admin — embedded from .env (no hardcoded fallback)
function readEnv(key: string): string {
  const candidates = [
    path.join(process.cwd(), '.env'),
    '/home/z/my-project/.env',
  ]
  for (const c of candidates) {
    try {
      const text = fs.readFileSync(c, 'utf-8')
      const m = text.match(new RegExp(`^${key}=["']?([^"'\n]+)["']?`, 'm'))
      if (m?.[1]?.trim()) return m[1].trim()
    } catch {
      // continue
    }
  }
  return ''
}
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || readEnv('ADMIN_EMAIL')
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || readEnv('ADMIN_PASSWORD')
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || readEnv('ADMIN_NAME') || 'PlayBeat Admin'

// Real products from CSV (no mock data)
// Use multiple fallback paths to find products.json regardless of cwd
function findJson(filename: string): string {
  const candidates = [
    path.join(process.cwd(), 'scripts', filename),
    `/home/z/my-project/scripts/${filename}`,
    path.resolve(__dirname, '../../../..', 'scripts', filename),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return fs.readFileSync(c, 'utf-8')
  }
  throw new Error(`${filename} not found in any expected location`)
}

const PRODUCTS_JSON = JSON.parse(findJson('products.json')) as Array<{
  sku: string
  name: string
  description: string
  category: string
  priceUSD: number
  originalPrice: number
  originalCurrency: string
  digital: boolean
  tags: string[]
  stock: number
  status: 'active' | 'draft'
}>

// Smart projectors (with real images)
const PROJECTORS_JSON = JSON.parse(findJson('projectors.json')) as Array<{
  sku: string
  name: string
  description: string
  category: string
  priceUSD: number
  originalPrice: number
  originalCurrency: string
  region: string
  digital: boolean
  tags: string[]
  stock: number
  status: 'active' | 'draft'
  model: string
  brand: string
  imageUrl?: string
}>

// POST /api/reset
// Wipes all transactional data (products, orders, customers, activity logs)
// and re-seeds the database with the REAL CSV-parsed products.
// Admin-only. Requires confirmation in body: { confirm: "RESET" }.
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  if (body?.confirm !== 'RESET') {
    return NextResponse.json(
      {
        ok: false,
        error: 'Confirmation required. Send { confirm: "RESET" } to proceed.',
      },
      { status: 400 }
    )
  }

  console.log('🗑️ Resetting PlayBeat database...')

  // Delete in dependency-safe order
  await db.order.deleteMany({})
  await db.product.deleteMany({})
  await db.customer.deleteMany({})
  await db.activityLog.deleteMany({})
  await db.setting.upsert({
    where: { key: 'storefront_status' },
    update: { value: 'online' },
    create: { key: 'storefront_status', value: 'online' },
  })
  await db.setting.upsert({
    where: { key: 'supported_currencies' },
    update: { value: 'PKR,USD,GBP,AED' },
    create: { key: 'supported_currencies', value: 'PKR,USD,GBP,AED' },
  })

  // Re-seed admin user
  const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)
  await db.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: { password: hashed, name: DEFAULT_ADMIN_NAME, role: 'admin' },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      password: hashed,
      name: DEFAULT_ADMIN_NAME,
      role: 'admin',
    },
  })

  // Re-seed REAL products from CSV (no mock data)
  for (const p of PRODUCTS_JSON) {
    const region = p.tags.find((t) =>
      ['us', 'eu', 'uk', 'fr', 'pt', 'de', 'tr', 'jp', 'au', 'br', 'co', 'mx', 'nl', 'global'].includes(t)
    )?.toUpperCase() || null

    await db.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.priceUSD,
        currency: 'USD',
        originalPrice: p.originalPrice,
        originalCurrency: p.originalCurrency,
        region,
        stock: p.stock,
        status: p.status,
        digital: p.digital,
        tags: p.tags,
      },
    })
  }

  // Re-seed smart projectors (with real images)
  for (const p of PROJECTORS_JSON) {
    await db.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.priceUSD,
        currency: 'USD',
        originalPrice: p.originalPrice,
        originalCurrency: p.originalCurrency,
        region: p.region,
        stock: p.stock,
        status: p.status,
        digital: p.digital,
        tags: p.tags,
        image: p.imageUrl || null,
      },
    })
  }

  const totalCount = PRODUCTS_JSON.length + PROJECTORS_JSON.length
  await db.activityLog.create({
    data: {
      action: 'system.reset',
      detail: `Database reset to seed state (${totalCount} real products + projectors restored)`,
      actor: auth.session.email,
    },
  })

  console.log(`✅ Reset complete — ${totalCount} products restored (${PRODUCTS_JSON.length} digital + ${PROJECTORS_JSON.length} projectors)`)
  return NextResponse.json({
    ok: true,
    message: 'Database reset to seed state.',
    counts: {
      products: PRODUCTS_JSON.length,
      projectors: PROJECTORS_JSON.length,
      total: totalCount,
    },
  })
}
