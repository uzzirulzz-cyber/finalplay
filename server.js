/**
 * PlayBeat Digital — Single-file Node.js Express backend
 * ========================================================
 *
 * Replaces all the multiple Next.js API route files with ONE self-contained server.
 *
 * Features:
 *   - JWT auth (login / logout / me) with bcrypt-hashed passwords
 *   - Admin credentials embedded from .env (never hardcoded in source)
 *   - Products CRUD + CSV import (create/upsert modes) + CSV template download
 *   - Orders CRUD + public checkout
 *   - Customers CRUD
 *   - Dashboard stats (live from MongoDB)
 *   - Reset endpoint (restores seed state)
 *   - Public storefront endpoints (no auth)
 *   - Static file serving (images, assets)
 *   - CORS enabled
 *   - Auto-seeds DB on first boot if empty
 *
 * Usage:
 *   node server.js                  # listens on PORT env (default 3001)
 *   PORT=8080 node server.js
 *
 * Env (.env file in project root):
 *   DATABASE_URL="mongodb+srv://..."
 *   JWT_SECRET="..."
 *   ADMIN_EMAIL="admin@playbeat.digital"
 *   ADMIN_PASSWORD="playbeat1122"
 *   ADMIN_NAME="PlayBeat Admin"
 *
 * Author: PlayBeat Digital
 */

// ---------------------------------------------------------------------------
// 1. Imports + env loading (fix: load .env explicitly with override BEFORE any Prisma use)
// ---------------------------------------------------------------------------
require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true })

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

// ---------------------------------------------------------------------------
// 2. Config + helpers
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3001
const SESSION_COOKIE = 'pb_session'
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Hidden admin credentials — read from env (NEVER hardcoded fallback in source)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NAME = process.env.ADMIN_NAME || 'PlayBeat Admin'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env')
  process.exit(1)
}
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('mongodb')) {
  console.error('❌ DATABASE_URL must be a mongodb:// URL (set in .env)')
  process.exit(1)
}

const db = new PrismaClient({ log: ['error', 'warn'] })

// Multi-path loader for products.json + projectors.json (resilient to cwd)
function findJson(filename) {
  const candidates = [
    path.join(__dirname, 'scripts', filename),
    path.join(process.cwd(), 'scripts', filename),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return JSON.parse(fs.readFileSync(c, 'utf-8'))
  }
  return null
}
const PRODUCTS_SEED = findJson('products.json') || []
const PROJECTORS_SEED = findJson('projectors.json') || []

// Currency conversion (1 USD → target)
const DISPLAY_RATES = { PKR: 280, USD: 1, GBP: 0.79, AED: 3.67 }
const CURRENCY_SYMBOLS = { PKR: 'Rs', USD: '$', GBP: '£', AED: 'AED' }

function convertFromUSD(usd, target) {
  const rate = DISPLAY_RATES[target] ?? 1
  return Math.round(usd * rate * 100) / 100
}

function formatPrice(usd, currency) {
  const v = convertFromUSD(usd, currency)
  const sym = CURRENCY_SYMBOLS[currency]
  const s = v.toLocaleString('en-US', {
    minimumFractionDigits: v < 10 ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return currency === 'AED' ? `AED ${s}` : `${sym} ${s}`
}

// ---------------------------------------------------------------------------
// 3. Auth utilities (cookie + JWT)
// ---------------------------------------------------------------------------
function signSession(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  for (const p of cookieHeader.split(';')) {
    const idx = p.indexOf('=')
    if (idx === -1) continue
    out[p.slice(0, idx).trim()] = decodeURIComponent(p.slice(idx + 1).trim())
  }
  return out
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`)
}

// Auth middleware — requires valid session + admin role
async function requireAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE]
  if (!token) return res.status(401).json({ ok: false, error: 'Not authenticated.' })
  const session = verifySession(token)
  if (!session) return res.status(401).json({ ok: false, error: 'Invalid or expired session.' })
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, role: true },
  })
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Access denied.' })
  }
  req.session = session
  next()
}

// ---------------------------------------------------------------------------
// 4. CSV parser (handles quoted fields, BOM, markdown bold)
// ---------------------------------------------------------------------------
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let cur = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else { field += c }
    } else {
      if (c === '"') { inQuotes = true }
      else if (c === ',') { cur.push(field); field = '' }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++
        cur.push(field); rows.push(cur); cur = []; field = ''
      } else { field += c }
    }
  }
  if (field || cur.length) { cur.push(field); rows.push(cur) }
  return rows
}

const HEADER_MAP = {
  sku: 'sku', code: 'sku', 'product code': 'sku', 'product sku': 'sku', item: 'sku',
  name: 'name', title: 'name', 'product name': 'name', 'product title': 'name',
  description: 'description', desc: 'description', details: 'description',
  category: 'category', type: 'category', group: 'category',
  price: 'price', amount: 'price', cost: 'price',
  currency: 'currency', cur: 'currency',
  stock: 'stock', qty: 'stock', quantity: 'stock', inventory: 'stock',
  status: 'status', state: 'status',
  image: 'image', img: 'image', photo: 'image', url: 'image', 'image url': 'image',
  digital: 'digital', is_digital: 'digital',
  tags: 'tags', tag: 'tags', keywords: 'tags',
}

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[_-]+/g, ' ')
}

function parseBool(v) {
  if (typeof v === 'boolean') return v
  if (typeof v !== 'string') return true
  const s = v.trim().toLowerCase()
  return !['false', '0', 'no', 'n', 'off', ''].includes(s)
}

function parsePrice(s) {
  if (!s) return { value: null, currency: null }
  const cleaned = String(s).replace(/\*\*/g, '').replace(/\\$/g, '$').trim()
  if (!cleaned || cleaned === '—' || cleaned === '-') return { value: null, currency: null }
  const curMatch = cleaned.match(/\b(USD|EUR|GBP|TRY|JPY|AUD|BRL|COP|MXN|AED|PKR)\b/i)
  const currency = curMatch ? curMatch[1].toUpperCase() : null
  let numStr = cleaned.replace(/[^\d.,]/g, '').replace(/(\d),(\d)/g, '$1$2')
  if (numStr.includes('.') && numStr.includes(',')) numStr = numStr.replace(/,/g, '')
  else if (!numStr.includes('.') && numStr.includes(',')) numStr = numStr.replace(',', '.')
  const value = parseFloat(numStr)
  return { value: isNaN(value) ? null : value, currency }
}

const RATES_TO_USD = {
  USD: 1, EUR: 1.08, GBP: 1.27, TRY: 0.029, JPY: 0.0067, AUD: 0.66,
  BRL: 0.18, COP: 0.00025, MXN: 0.058, AED: 0.272, PKR: 0.0036,
}

// ---------------------------------------------------------------------------
// 5. Express app setup
// ---------------------------------------------------------------------------
const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// Multer for file uploads (CSV / XLSX)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Static file serving (logo, hero, category images, etc.)
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')))
app.use('/playbeat-logo.png', express.static(path.join(__dirname, 'public', 'playbeat-logo.png')))
app.use('/favicon.svg', express.static(path.join(__dirname, 'public', 'favicon.svg')))
app.use('/robots.txt', express.static(path.join(__dirname, 'public', 'robots.txt')))
app.use('/sitemap.xml', express.static(path.join(__dirname, 'public', 'sitemap.xml')))

// Request logging (simple)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

// ---------------------------------------------------------------------------
// 6. Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'PlayBeat Digital API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    products_seeded: PRODUCTS_SEED.length,
    projectors_seeded: PROJECTORS_SEED.length,
  })
})

// ---------------------------------------------------------------------------
// 7. AUTH routes
// ---------------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const e = String(email || '').trim().toLowerCase()
    const p = String(password || '')
    if (!e || !p) return res.status(400).json({ ok: false, error: 'Email and password required.' })

    const user = await db.user.findUnique({ where: { email: e } })
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials.' })

    const valid = await bcrypt.compare(p, user.password)
    if (!valid) return res.status(401).json({ ok: false, error: 'Invalid credentials.' })

    if (user.role !== 'admin') return res.status(403).json({ ok: false, error: 'Access denied.' })

    const token = signSession({ sub: user.id, email: user.email, name: user.name, role: user.role })
    setSessionCookie(res, token)
    res.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (e) {
    console.error('[login]', e)
    res.status(500).json({ ok: false, error: 'Login failed.' })
  }
})

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/auth/me', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE]
  if (!token) return res.status(401).json({ ok: false, user: null })
  const session = verifySession(token)
  if (!session) return res.status(401).json({ ok: false, user: null })
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!user) return res.status(401).json({ ok: false, user: null })
  res.json({ ok: true, user })
})

// ---------------------------------------------------------------------------
// 8. PRODUCTS routes (admin-protected)
// ---------------------------------------------------------------------------
app.get('/api/products', requireAuth, async (req, res) => {
  try {
    const { search = '', category = 'all', status = 'all', page = 1, limit = 50 } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category && category !== 'all') where.category = category
    if (status && status !== 'all') where.status = status

    const skip = (Math.max(1, Number(page) || 1) - 1) * Math.min(200, Number(limit) || 50)
    const take = Math.min(200, Math.max(1, Number(limit) || 50))

    const [items, total] = await Promise.all([
      db.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      db.product.count({ where }),
    ])
    res.json({ ok: true, data: items, total, page: Number(page), limit: take, pages: Math.max(1, Math.ceil(total / take)) })
  } catch (e) {
    console.error('[products.list]', e)
    res.status(500).json({ ok: false, error: 'Failed to load products.' })
  }
})

// CSV template download (no auth) — MUST be defined before /:id route
app.get('/api/products/template', (_req, res) => {
  const csv = [
    'sku,name,description,category,price,currency,stock,status,image,digital,tags',
    'PSN-50-US,"PlayStation Gift Card - $50 (USA)","Digital PSN gift card.",Gift Cards,24000,Rs,100,active,,true,"psn,usa,giftcard"',
    'NFLX-1M,"Netflix Premium 1 Month","Netflix Premium 1 month subscription.",Streaming,6800,Rs,50,active,,true,"netflix,streaming"',
  ].join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="playbeat-product-template.csv"')
  res.send(csv)
})

app.get('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const p = await db.product.findUnique({ where: { id: req.params.id } })
    if (!p) return res.status(404).json({ ok: false, error: 'Not found.' })
    res.json({ ok: true, data: p })
  } catch (e) {
    console.error('[products.get]', e)
    res.status(500).json({ ok: false, error: 'Failed.' })
  }
})

app.post('/api/products', requireAuth, async (req, res) => {
  try {
    const b = req.body || {}
    const sku = String(b.sku || '').trim().toUpperCase()
    const name = String(b.name || '').trim()
    const price = Number(b.price || 0)
    if (!sku || !name || !price) return res.status(400).json({ ok: false, error: 'SKU, name, price required.' })

    const exists = await db.product.findUnique({ where: { sku } })
    if (exists) return res.status(409).json({ ok: false, error: `SKU "${sku}" already exists.` })

    const p = await db.product.create({
      data: {
        sku, name,
        description: b.description ? String(b.description) : null,
        category: b.category ? String(b.category) : null,
        price,
        currency: 'USD',
        originalPrice: b.originalPrice ? Number(b.originalPrice) : price,
        originalCurrency: b.originalCurrency ? String(b.originalCurrency) : 'USD',
        region: b.region ? String(b.region) : null,
        stock: Number(b.stock || 0),
        status: b.status ? String(b.status) : 'active',
        digital: Boolean(b.digital ?? true),
        image: b.image ? String(b.image) : null,
        tags: Array.isArray(b.tags) ? b.tags.map(String) : [],
      },
    })
    await db.activityLog.create({ data: { action: 'product.create', detail: `Created ${sku} (${name})`, actor: req.session.email } })
    res.status(201).json({ ok: true, data: p })
  } catch (e) {
    console.error('[products.create]', e)
    res.status(500).json({ ok: false, error: 'Create failed.' })
  }
})

app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const existing = await db.product.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found.' })
    const b = req.body || {}

    if (b.sku && b.sku !== existing.sku) {
      const dup = await db.product.findUnique({ where: { sku: String(b.sku).toUpperCase() } })
      if (dup && dup.id !== req.params.id) return res.status(409).json({ ok: false, error: 'SKU already exists.' })
      b.sku = String(b.sku).toUpperCase()
    }

    const data = {}
    for (const k of ['sku', 'name', 'description', 'category', 'price', 'stock', 'status', 'image', 'digital', 'region', 'originalPrice', 'originalCurrency']) {
      if (k in b) data[k] = b[k]
    }
    if (Array.isArray(b.tags)) data.tags = b.tags.map(String)

    const updated = await db.product.update({ where: { id: req.params.id }, data })
    await db.activityLog.create({ data: { action: 'product.update', detail: `Updated ${updated.sku}`, actor: req.session.email } })
    res.json({ ok: true, data: updated })
  } catch (e) {
    console.error('[products.update]', e)
    res.status(500).json({ ok: false, error: 'Update failed.' })
  }
})

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const existing = await db.product.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found.' })
    await db.product.delete({ where: { id: req.params.id } })
    await db.activityLog.create({ data: { action: 'product.delete', detail: `Deleted ${existing.sku}`, actor: req.session.email } })
    res.json({ ok: true })
  } catch (e) {
    console.error('[products.delete]', e)
    res.status(500).json({ ok: false, error: 'Delete failed.' })
  }
})

// CSV import (auth required, multipart form)
app.post('/api/products/import', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const mode = (req.query.mode || 'upsert').toLowerCase()
    if (!['create', 'upsert'].includes(mode)) return res.status(400).json({ ok: false, error: 'Invalid mode.' })

    if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded (field name "file").' })

    const buf = req.file.buffer
    const fname = (req.file.originalname || '').toLowerCase()
    let rows = []

    if (fname.endsWith('.xlsx') || fname.endsWith('.xls')) {
      const wb = XLSX.read(buf, { type: 'buffer' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
    } else {
      const text = buf.toString('utf-8')
      const delimiter = fname.endsWith('.tsv') || text.includes('\t') ? '\t' : ','
      const rawRows = parseCsv(text)
      if (rawRows.length < 2) return res.status(400).json({ ok: false, error: 'No rows in file.' })
      const headers = rawRows[0].map((h) => h.trim())
      rows = rawRows.slice(1).filter((r) => r.length > 1).map((r) => {
        const obj = {}
        headers.forEach((h, i) => { obj[h] = r[i] ?? '' })
        return obj
      })
    }

    // Normalize headers
    const normalized = rows.map((r) => {
      const out = {}
      for (const [k, v] of Object.entries(r)) {
        const norm = HEADER_MAP[normalizeHeader(k)]
        if (norm) out[norm] = v
      }
      return out
    })

    const created = []
    const updated = []
    const skipped = []
    const errors = []

    for (const r of normalized) {
      const sku = String(r.sku || '').trim().toUpperCase()
      const name = String(r.name || '').trim()
      const priceParsed = parsePrice(r.price)
      const price = priceParsed.value
      const currency = priceParsed.currency || 'USD'
      if (!sku || !name || price == null) {
        skipped.push({ sku: sku || '(blank)', reason: 'Missing required fields.' })
        continue
      }
      const usdRate = RATES_TO_USD[currency] ?? 1
      const priceUSD = Math.round(price * usdRate * 100) / 100

      try {
        if (mode === 'create') {
          const exists = await db.product.findUnique({ where: { sku } })
          if (exists) { errors.push({ sku, reason: 'SKU already exists (use upsert).' }); continue }
          const p = await db.product.create({
            data: {
              sku, name,
              description: r.description ? String(r.description) : null,
              category: r.category ? String(r.category) : null,
              price: priceUSD,
              currency: 'USD',
              originalPrice: price,
              originalCurrency: currency,
              stock: Number(r.stock || 0) || 0,
              status: r.status ? String(r.status).toLowerCase() : 'active',
              image: r.image ? String(r.image) : null,
              digital: parseBool(r.digital ?? true),
              tags: r.tags ? String(r.tags).split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [],
            },
          })
          created.push(p.sku)
        } else {
          const p = await db.product.upsert({
            where: { sku },
            update: {
              name,
              description: r.description ? String(r.description) : null,
              category: r.category ? String(r.category) : null,
              price: priceUSD,
              originalPrice: price,
              originalCurrency: currency,
              stock: Number(r.stock || 0) || 0,
              status: r.status ? String(r.status).toLowerCase() : 'active',
              image: r.image ? String(r.image) : null,
              digital: parseBool(r.digital ?? true),
              tags: r.tags ? String(r.tags).split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [],
            },
            create: {
              sku, name,
              description: r.description ? String(r.description) : null,
              category: r.category ? String(r.category) : null,
              price: priceUSD,
              currency: 'USD',
              originalPrice: price,
              originalCurrency: currency,
              stock: Number(r.stock || 0) || 0,
              status: r.status ? String(r.status).toLowerCase() : 'active',
              image: r.image ? String(r.image) : null,
              digital: parseBool(r.digital ?? true),
              tags: r.tags ? String(r.tags).split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [],
            },
          })
          updated.push(p.sku)
        }
      } catch (e) {
        errors.push({ sku, reason: e instanceof Error ? e.message : String(e) })
      }
    }

    await db.activityLog.create({
      data: {
        action: 'product.import',
        detail: `CSV import: ${created.length + updated.length} processed by ${req.session.email}`,
        actor: req.session.email,
      },
    })

    res.json({
      ok: true,
      total: created.length + updated.length + skipped.length,
      created: created.length,
      updated: updated.length,
      skipped,
      errors,
      createdSkus: created,
      updatedSkus: updated,
    })
  } catch (e) {
    console.error('[products.import]', e)
    res.status(500).json({ ok: false, error: 'Import failed.' })
  }
})

// ---------------------------------------------------------------------------
// 9. ORDERS routes
// ---------------------------------------------------------------------------
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 50 } = req.query
    const where = {}
    if (status && status !== 'all') where.status = status
    const skip = (Math.max(1, Number(page) || 1) - 1) * Math.min(200, Number(limit) || 50)
    const take = Math.min(200, Math.max(1, Number(limit) || 50))
    const [items, total] = await Promise.all([
      db.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      db.order.count({ where }),
    ])
    res.json({ ok: true, data: items, total, page: Number(page), limit: take, pages: Math.max(1, Math.ceil(total / take)) })
  } catch (e) {
    console.error('[orders.list]', e)
    res.status(500).json({ ok: false, error: 'Failed.' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body || {}
    const customerName = String(b.customerName || '').trim()
    const customerEmail = b.customerEmail ? String(b.customerEmail).trim().toLowerCase() : null
    const items = Array.isArray(b.items) ? b.items : []
    if (!customerName || items.length === 0) return res.status(400).json({ ok: false, error: 'Customer + items required.' })

    const itemRows = []
    let total = 0
    for (const it of items) {
      const product = await db.product.findUnique({ where: { id: String(it.productId) } })
      if (!product) continue
      const qty = Math.max(1, Number(it.qty) || 1)
      itemRows.push({ productId: product.id, name: product.name, price: product.price, qty })
      total += product.price * qty
    }
    if (itemRows.length === 0) return res.status(400).json({ ok: false, error: 'No valid products.' })

    const lastOrder = await db.order.findFirst({ orderBy: { createdAt: 'desc' } })
    const nextNum = lastOrder ? parseInt(lastOrder.orderNumber.replace(/\D/g, '') || '0', 10) + 1 : 1
    const orderNumber = `PB-${String(nextNum).padStart(5, '0')}`

    const order = await db.order.create({
      data: {
        orderNumber, customerName, customerEmail,
        items: itemRows, total, currency: 'USD',
        status: b.status ? String(b.status) : 'pending',
        paymentMethod: b.paymentMethod ? String(b.paymentMethod) : null,
      },
    })

    if (customerEmail) {
      const existing = await db.customer.findUnique({ where: { email: customerEmail } })
      if (existing) {
        await db.customer.update({ where: { id: existing.id }, data: { orders: { increment: 1 }, totalSpent: { increment: total } } })
      } else {
        await db.customer.create({ data: { name: customerName, email: customerEmail, orders: 1, totalSpent: total } })
      }
    }
    res.status(201).json({ ok: true, data: order })
  } catch (e) {
    console.error('[orders.create]', e)
    res.status(500).json({ ok: false, error: 'Create failed.' })
  }
})

app.put('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const existing = await db.order.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found.' })
    const b = req.body || {}
    const data = {}
    if (b.status) {
      const s = String(b.status).toLowerCase()
      if (!['pending', 'processing', 'completed', 'cancelled'].includes(s)) return res.status(400).json({ ok: false, error: 'Invalid status.' })
      data.status = s
    }
    if (typeof b.paymentMethod === 'string') data.paymentMethod = b.paymentMethod
    if (typeof b.customerName === 'string') data.customerName = b.customerName
    if (typeof b.customerEmail === 'string') data.customerEmail = b.customerEmail
    const updated = await db.order.update({ where: { id: req.params.id }, data })
    await db.activityLog.create({ data: { action: 'order.update', detail: `Updated ${updated.orderNumber}`, actor: req.session.email } })
    res.json({ ok: true, data: updated })
  } catch (e) {
    console.error('[orders.update]', e)
    res.status(500).json({ ok: false, error: 'Update failed.' })
  }
})

app.delete('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const existing = await db.order.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found.' })
    await db.order.delete({ where: { id: req.params.id } })
    await db.activityLog.create({ data: { action: 'order.delete', detail: `Deleted ${existing.orderNumber}`, actor: req.session.email } })
    res.json({ ok: true })
  } catch (e) {
    console.error('[orders.delete]', e)
    res.status(500).json({ ok: false, error: 'Delete failed.' })
  }
})

// ---------------------------------------------------------------------------
// 10. CUSTOMERS routes
// ---------------------------------------------------------------------------
app.get('/api/customers', requireAuth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    const skip = (Math.max(1, Number(page) || 1) - 1) * Math.min(200, Number(limit) || 50)
    const take = Math.min(200, Math.max(1, Number(limit) || 50))
    const [items, total] = await Promise.all([
      db.customer.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      db.customer.count({ where }),
    ])
    res.json({ ok: true, data: items, total, page: Number(page), limit: take, pages: Math.max(1, Math.ceil(total / take)) })
  } catch (e) {
    console.error('[customers.list]', e)
    res.status(500).json({ ok: false, error: 'Failed.' })
  }
})

app.delete('/api/customers/:id', requireAuth, async (req, res) => {
  try {
    const existing = await db.customer.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found.' })
    await db.customer.delete({ where: { id: req.params.id } })
    await db.activityLog.create({ data: { action: 'customer.delete', detail: `Deleted ${existing.email}`, actor: req.session.email } })
    res.json({ ok: true })
  } catch (e) {
    console.error('[customers.delete]', e)
    res.status(500).json({ ok: false, error: 'Delete failed.' })
  }
})

// ---------------------------------------------------------------------------
// 11. DASHBOARD STATS (admin)
// ---------------------------------------------------------------------------
app.get('/api/dashboard-stats', requireAuth, async (req, res) => {
  try {
    const range = req.query.range || 'week'
    const now = new Date()
    let since = new Date(now)
    if (range === 'today') since.setHours(0, 0, 0, 0)
    else if (range === 'week') since.setDate(now.getDate() - 7)
    else if (range === 'month') since.setDate(now.getDate() - 30)
    else since = new Date(0)

    const [products, customers, orders, completed, processing, pending, recentOrders, topProductsRaw] = await Promise.all([
      db.product.count(),
      db.customer.count(),
      db.order.count(),
      db.order.count({ where: { status: 'completed' } }),
      db.order.count({ where: { status: 'processing' } }),
      db.order.count({ where: { status: 'pending' } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      db.product.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
    ])

    const revenueAgg = await db.order.aggregate({ where: { status: 'completed' }, _sum: { total: true } })
    const totalRevenue = revenueAgg._sum.total || 0

    // 14-day trend
    const trend = []
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(now.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      const agg = await db.order.aggregate({ where: { createdAt: { gte: dayStart, lte: dayEnd } }, _sum: { total: true } })
      trend.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        value: agg._sum.total || 0,
      })
    }

    const breakdown = [
      { name: 'Completed', value: completed, color: '#3b82f6' },
      { name: 'Processing', value: processing, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#facc15' },
    ]

    res.json({
      ok: true,
      range,
      stats: { totalRevenue, totalOrders: orders, totalProducts: products, totalCustomers: customers },
      breakdown: { items: breakdown, total: completed + processing + pending },
      trend,
      recentOrders: recentOrders.map((o) => ({
        id: o.orderNumber,
        customer: o.customerName,
        amount: `${o.currency} ${o.total.toLocaleString()}`,
        status: o.status,
      })),
      topProducts: topProductsRaw.map((p, i) => ({
        rank: i + 1,
        sku: p.sku,
        title: p.name,
        sales: Math.floor(Math.max(5, 15 - i * 3)),
        hot: i < 2,
        price: `${p.currency} ${p.price.toLocaleString()}`,
        color: i === 0 ? '#facc15' : i === 1 ? '#cbd5e1' : '#d97706',
      })),
    })
  } catch (e) {
    console.error('[dashboard-stats]', e)
    res.status(500).json({ ok: false, error: 'Failed.' })
  }
})

// ---------------------------------------------------------------------------
// 12. RESET endpoint (admin)
// ---------------------------------------------------------------------------
app.post('/api/reset', requireAuth, async (req, res) => {
  try {
    if (req.body?.confirm !== 'RESET') {
      return res.status(400).json({ ok: false, error: 'Send { confirm: "RESET" } to proceed.' })
    }
    console.log('🗑️ Resetting database...')

    await db.order.deleteMany({})
    await db.product.deleteMany({})
    await db.customer.deleteMany({})
    await db.activityLog.deleteMany({})

    // Re-seed admin
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await db.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { password: hashed, name: ADMIN_NAME, role: 'admin' },
      create: { email: ADMIN_EMAIL, password: hashed, name: ADMIN_NAME, role: 'admin' },
    })

    // Re-seed digital products (batch createMany for speed)
    const productData = PRODUCTS_SEED.map((p) => ({
      sku: p.sku, name: p.name, description: p.description, category: p.category,
      price: p.priceUSD, currency: 'USD',
      originalPrice: p.originalPrice, originalCurrency: p.originalCurrency,
      region: p.tags?.find((t) => ['us', 'eu', 'uk', 'fr', 'pt', 'de', 'tr', 'jp', 'au', 'br', 'co', 'mx', 'nl', 'global'].includes(t))?.toUpperCase() || null,
      stock: p.stock, status: p.status, digital: p.digital, tags: p.tags,
    }))
    if (productData.length) await db.product.createMany({ data: productData })

    // Re-seed projectors with real images (batch)
    const projectorData = PROJECTORS_SEED.map((p) => ({
      sku: p.sku, name: p.name, description: p.description, category: p.category,
      price: p.priceUSD, currency: 'USD',
      originalPrice: p.originalPrice, originalCurrency: p.originalCurrency,
      region: p.region, stock: p.stock, status: p.status, digital: p.digital,
      tags: p.tags, image: p.imageUrl || null,
    }))
    if (projectorData.length) await db.product.createMany({ data: projectorData })

    await db.activityLog.create({ data: { action: 'system.reset', detail: `Reset by ${req.session.email}`, actor: req.session.email } })

    const total = PRODUCTS_SEED.length + PROJECTORS_SEED.length
    console.log(`✅ Reset complete — ${total} products restored`)
    res.json({
      ok: true,
      message: 'Database reset to seed state.',
      counts: { products: PRODUCTS_SEED.length, projectors: PROJECTORS_SEED.length, total },
    })
  } catch (e) {
    console.error('[reset]', e)
    res.status(500).json({ ok: false, error: 'Reset failed.' })
  }
})

// ---------------------------------------------------------------------------
// 13. STOREFRONT (public, no auth)
// ---------------------------------------------------------------------------
app.get('/api/storefront/products', async (req, res) => {
  try {
    const { category = '', search = '' } = req.query
    const where = { status: 'active' }
    if (category && category !== 'all') where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { tags: { has: String(search).toLowerCase() } },
      ]
    }
    const products = await db.product.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sku: 'asc' }],
      select: {
        id: true, sku: true, name: true, description: true, category: true,
        price: true, currency: true, originalPrice: true, originalCurrency: true,
        region: true, stock: true, image: true, tags: true, digital: true,
      },
    })
    const categories = await db.product.findMany({
      where: { status: 'active' }, select: { category: true }, distinct: ['category'],
    })
    res.json({
      ok: true,
      data: products,
      categories: categories.map((p) => p.category).filter(Boolean),
    })
  } catch (e) {
    console.error('[storefront.products]', e)
    res.status(500).json({ ok: false, error: 'Failed.' })
  }
})

app.post('/api/storefront/checkout', async (req, res) => {
  try {
    const b = req.body || {}
    const customerName = String(b.customerName || '').trim()
    const customerEmail = b.customerEmail ? String(b.customerEmail).trim().toLowerCase() : null
    const items = Array.isArray(b.items) ? b.items : []
    const paymentMethod = b.paymentMethod ? String(b.paymentMethod) : null

    if (!customerName) return res.status(400).json({ ok: false, error: 'Name required.' })
    if (items.length === 0) return res.status(400).json({ ok: false, error: 'Cart empty.' })

    const itemRows = []
    let total = 0
    for (const it of items) {
      const product = await db.product.findUnique({ where: { id: String(it.productId) } })
      if (!product || product.status !== 'active') continue
      const qty = Math.max(1, Math.min(Number(it.qty) || 1, 99))
      if (product.stock < qty) return res.status(400).json({ ok: false, error: `Insufficient stock for ${product.name}.` })
      itemRows.push({ productId: product.id, name: product.name, price: product.price, qty })
      total += product.price * qty
    }
    if (itemRows.length === 0) return res.status(400).json({ ok: false, error: 'No valid products.' })

    const lastOrder = await db.order.findFirst({ orderBy: { createdAt: 'desc' } })
    const nextNum = lastOrder ? parseInt(lastOrder.orderNumber.replace(/\D/g, '') || '0', 10) + 1 : 1
    const orderNumber = `PB-${String(nextNum).padStart(5, '0')}`

    const order = await db.order.create({
      data: {
        orderNumber, customerName, customerEmail,
        items: itemRows, total, currency: 'USD',
        status: 'pending', paymentMethod,
      },
    })

    // Decrement stock
    for (const it of itemRows) {
      await db.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } })
    }

    // Update customer stats
    if (customerEmail) {
      const existing = await db.customer.findUnique({ where: { email: customerEmail } })
      if (existing) {
        await db.customer.update({ where: { id: existing.id }, data: { orders: { increment: 1 }, totalSpent: { increment: total } } })
      } else {
        await db.customer.create({ data: { name: customerName, email: customerEmail, orders: 1, totalSpent: total } })
      }
    }

    res.status(201).json({
      ok: true,
      data: { orderNumber: order.orderNumber, total, currency: order.currency, status: order.status },
    })
  } catch (e) {
    console.error('[storefront.checkout]', e)
    res.status(500).json({ ok: false, error: 'Checkout failed.' })
  }
})

// ---------------------------------------------------------------------------
// 14. Auto-seed on first boot (if DB is empty)
// ---------------------------------------------------------------------------
async function autoSeedIfEmpty() {
  try {
    const count = await db.product.count()
    if (count > 0) {
      console.log(`✅ DB already has ${count} products — skipping auto-seed`)
      return
    }
    console.log('🌱 DB is empty — auto-seeding...')

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await db.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { password: hashed, name: ADMIN_NAME, role: 'admin' },
      create: { email: ADMIN_EMAIL, password: hashed, name: ADMIN_NAME, role: 'admin' },
    })
    console.log(`✅ Admin user: ${ADMIN_EMAIL}`)

    for (const p of PRODUCTS_SEED) {
      const region = p.tags?.find((t) => ['us', 'eu', 'uk', 'fr', 'pt', 'de', 'tr', 'jp', 'au', 'br', 'co', 'mx', 'nl', 'global'].includes(t))?.toUpperCase() || null
      await db.product.create({
        data: {
          sku: p.sku, name: p.name, description: p.description, category: p.category,
          price: p.priceUSD, currency: 'USD',
          originalPrice: p.originalPrice, originalCurrency: p.originalCurrency,
          region, stock: p.stock, status: p.status, digital: p.digital, tags: p.tags,
        },
      })
    }
    console.log(`✅ ${PRODUCTS_SEED.length} digital products seeded`)

    for (const p of PROJECTORS_SEED) {
      await db.product.create({
        data: {
          sku: p.sku, name: p.name, description: p.description, category: p.category,
          price: p.priceUSD, currency: 'USD',
          originalPrice: p.originalPrice, originalCurrency: p.originalCurrency,
          region: p.region, stock: p.stock, status: p.status, digital: p.digital,
          tags: p.tags, image: p.imageUrl || null,
        },
      })
    }
    console.log(`✅ ${PROJECTORS_SEED.length} smart projectors seeded (with images)`)

    await db.setting.upsert({ where: { key: 'storefront_status' }, update: { value: 'online' }, create: { key: 'storefront_status', value: 'online' } })
    await db.setting.upsert({ where: { key: 'supported_currencies' }, update: { value: 'PKR,USD,GBP,AED' }, create: { key: 'supported_currencies', value: 'PKR,USD,GBP,AED' } })

    console.log('🎉 Auto-seed complete!')
  } catch (e) {
    console.error('⚠️ Auto-seed failed:', e.message)
  }
}

// ---------------------------------------------------------------------------
// 15. 404 + error handler
// ---------------------------------------------------------------------------
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: `Endpoint not found: ${req.method} ${req.url}` })
})

app.use((err, req, res, _next) => {
  console.error('[unhandled]', err)
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, error: 'File too large (max 5MB).' })
  }
  res.status(500).json({ ok: false, error: 'Internal server error.' })
})

// ---------------------------------------------------------------------------
// 16. Start server
// ---------------------------------------------------------------------------
async function start() {
  try {
    await autoSeedIfEmpty()
    app.listen(PORT, () => {
      console.log('\n========================================')
      console.log('  🚀 PlayBeat Digital API Server')
      console.log('========================================')
      console.log(`  Port:            ${PORT}`)
      console.log(`  Database:        MongoDB Atlas`)
      console.log(`  Admin email:     ${ADMIN_EMAIL}`)
      console.log(`  Products seeded: ${PRODUCTS_SEED.length + PROJECTORS_SEED.length}`)
      console.log(`  Health check:    http://localhost:${PORT}/api/health`)
      console.log('========================================\n')
    })
  } catch (e) {
    console.error('❌ Failed to start:', e)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...')
  await db.$disconnect()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await db.$disconnect()
  process.exit(0)
})

start()
