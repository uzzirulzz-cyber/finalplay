/**
 * Seed script — creates the PlayBeat admin user (credentials hidden in env)
 * and imports REAL products parsed from the user's CSV files (no mock data).
 *
 * Usage: bun run scripts/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'

const db = new PrismaClient()

// Hidden admin credentials — embedded from .env (no hardcoded fallback)
// Read directly from .env file to avoid leaking in source-visible code
function readEnv(key: string): string {
  const envText = fs.readFileSync(__dirname + '/../.env', 'utf-8')
  const m = envText.match(new RegExp(`^${key}=["']?([^"'\n]+)["']?`, 'm'))
  return m?.[1]?.trim() || ''
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || readEnv('ADMIN_EMAIL')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || readEnv('ADMIN_PASSWORD')
const ADMIN_NAME = process.env.ADMIN_NAME || readEnv('ADMIN_NAME') || 'PlayBeat Admin'

// Real products parsed from CSV uploads (no mock data)
const PRODUCTS_JSON = JSON.parse(
  fs.readFileSync(__dirname + '/products.json', 'utf-8')
) as Array<{
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

// Smart projector products parsed from zerobyte CSV (with real web-sourced images)
const PROJECTORS_JSON = JSON.parse(
  fs.readFileSync(__dirname + '/projectors.json', 'utf-8')
) as Array<{
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

async function main() {
  console.log('🌱 Seeding PlayBeat database with REAL CSV products + projectors...')

  // 1. Admin user
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashedPassword, name: ADMIN_NAME, role: 'admin' },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'admin',
      avatar: null,
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // 2. Products — REAL CSV products only
  // Clear existing products first (idempotent re-seed)
  await db.product.deleteMany({})
  console.log(`🗑️ Cleared existing products`)

  for (const p of PRODUCTS_JSON) {
    // Detect region from tags
    const region = p.tags.find((t) =>
      ['us', 'eu', 'uk', 'fr', 'pt', 'de', 'tr', 'jp', 'au', 'br', 'co', 'mx', 'nl', 'global'].includes(t)
    )?.toUpperCase() || null

    await db.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.priceUSD, // USD base
        currency: 'USD', // base currency
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
  console.log(`✅ ${PRODUCTS_JSON.length} digital products imported`)

  // 2b. Smart projectors (with real images)
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
  console.log(`✅ ${PROJECTORS_JSON.length} smart projectors imported (with images)`)

  // 3. Settings
  await db.setting.upsert({
    where: { key: 'storefront_status' },
    update: { value: 'online' },
    create: { key: 'storefront_status', value: 'online' },
  })
  await db.setting.upsert({
    where: { key: 'currency' },
    update: { value: 'USD' },
    create: { key: 'currency', value: 'USD' },
  })
  await db.setting.upsert({
    where: { key: 'supported_currencies' },
    update: { value: 'PKR,USD,GBP,AED' },
    create: { key: 'supported_currencies', value: 'PKR,USD,GBP,AED' },
  })

  console.log('🎉 Seeding complete!')
  console.log(`\nProduct breakdown:`)
  const byCat: Record<string, number> = {}
  for (const p of PRODUCTS_JSON) byCat[p.category] = (byCat[p.category] || 0) + 1
  for (const [cat, n] of Object.entries(byCat)) {
    console.log(`  ${cat}: ${n} products`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
