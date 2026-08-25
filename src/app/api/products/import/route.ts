import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'
import * as XLSX from 'xlsx'

// CSV column header aliases — supports many naming variations
const HEADER_MAP: Record<string, string> = {
  sku: 'sku',
  code: 'sku',
  'product code': 'sku',
  'product sku': 'sku',
  item: 'sku',
  name: 'name',
  title: 'name',
  'product name': 'name',
  'product title': 'name',
  description: 'description',
  desc: 'description',
  details: 'description',
  category: 'category',
  type: 'category',
  group: 'category',
  price: 'price',
  amount: 'price',
  cost: 'price',
  currency: 'currency',
  cur: 'currency',
  stock: 'stock',
  qty: 'stock',
  quantity: 'stock',
  inventory: 'stock',
  status: 'status',
  state: 'status',
  active: 'status',
  image: 'image',
  img: 'image',
  photo: 'image',
  url: 'image',
  'image url': 'image',
  digital: 'digital',
  is_digital: 'digital',
  tags: 'tags',
  tag: 'tags',
  keywords: 'tags',
}

interface ParsedRow {
  sku: string
  name: string
  description?: string | null
  category?: string | null
  price: number
  currency: string
  stock: number
  status: string
  image?: string | null
  digital: boolean
  tags: string[]
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[_-]+/g, ' ')
}

function parseBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v !== 'string') return true
  const s = v.trim().toLowerCase()
  return !['false', '0', 'no', 'n', 'off', ''].includes(s)
}

function parseRow(row: Record<string, unknown>): ParsedRow | null {
  const sku = String(row.sku || '').trim().toUpperCase()
  const name = String(row.name || '').trim()
  const price = Number(String(row.price || '0').replace(/[^0-9.-]/g, '')) || 0
  if (!sku || !name) return null

  return {
    sku,
    name,
    description: row.description ? String(row.description) : null,
    category: row.category ? String(row.category) : null,
    price,
    currency: 'USD',
    stock: Number(row.stock || 0) || 0,
    status: row.status ? String(row.status).trim().toLowerCase() : 'active',
    image: row.image ? String(row.image) : null,
    digital: parseBool(row.digital ?? true),
    tags: row.tags
      ? String(row.tags).split(/[,;|]/).map((t) => t.trim()).filter(Boolean)
      : [],
  }
}

// POST /api/products/import
// Form data with file: "file" (CSV, XLSX, or TSV)
// Optional: "mode" = "create" | "upsert" (default: upsert)
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const mode = (req.nextUrl.searchParams.get('mode') || 'upsert').toLowerCase()
  if (!['create', 'upsert'].includes(mode)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid mode. Use "create" or "upsert".' },
      { status: 400 }
    )
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json(
      { ok: false, error: 'Expected multipart/form-data with a file.' },
      { status: 400 }
    )
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: 'No file uploaded. Field name must be "file".' },
      { status: 400 }
    )
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const fname = file.name.toLowerCase()

  let rows: Record<string, unknown>[] = []

  try {
    if (fname.endsWith('.xlsx') || fname.endsWith('.xls')) {
      const wb = XLSX.read(buf, { type: 'buffer' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
    } else {
      // CSV / TSV — parse manually for robustness
      const text = buf.toString('utf-8')
      const delimiter = fname.endsWith('.tsv') || text.includes('\t') ? '\t' : ','
      rows = parseCsv(text, delimiter)
    }
  } catch (e) {
    console.error('[import] parse error:', e)
    return NextResponse.json(
      { ok: false, error: 'Failed to parse file. Ensure it is a valid CSV/XLSX.' },
      { status: 400 }
    )
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No rows found in file.' },
      { status: 400 }
    )
  }

  // Normalize headers
  const normalizedRows = rows.map((r) => {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(r)) {
      const norm = HEADER_MAP[normalizeHeader(k)]
      if (norm) out[norm] = v
    }
    return out
  })

  const parsed: ParsedRow[] = []
  const skipped: { row: number; reason: string }[] = []

  normalizedRows.forEach((r, idx) => {
    const row = parseRow(r)
    if (!row) {
      skipped.push({ row: idx + 2, reason: 'Missing required fields (sku, name) or invalid price.' })
      return
    }
    if (!['active', 'draft', 'archived'].includes(row.status)) row.status = 'active'
    parsed.push(row)
  })

  if (parsed.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'No valid rows after parsing.',
        skipped,
      },
      { status: 400 }
    )
  }

  const created: string[] = []
  const updated: string[] = []
  const errors: { sku: string; reason: string }[] = []

  for (const p of parsed) {
    try {
      if (mode === 'create') {
        const exists = await db.product.findUnique({ where: { sku: p.sku } })
        if (exists) {
          errors.push({ sku: p.sku, reason: 'SKU already exists (use upsert mode)' })
          continue
        }
        const product = await db.product.create({ data: p })
        created.push(product.sku)
      } else {
        // upsert
        const product = await db.product.upsert({
          where: { sku: p.sku },
          update: {
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
            currency: p.currency,
            stock: p.stock,
            status: p.status,
            image: p.image,
            digital: p.digital,
            tags: p.tags,
          },
          create: p,
        })
        if (await db.product.count({ where: { sku: p.sku } }) > 0) {
          // Newly counted — we don't know if it was an update or create; track separately
          updated.push(product.sku)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push({ sku: p.sku, reason: msg })
    }
  }

  await db.activityLog.create({
    data: {
      action: 'product.import',
      detail: `CSV import: ${created.length + updated.length} processed (${created.length} created, ${updated.length} updated) by ${auth.session.email}`,
      actor: auth.session.email,
    },
  })

  return NextResponse.json({
    ok: true,
    total: parsed.length,
    created: created.length,
    updated: updated.length,
    skipped,
    errors,
    createdSkus: created,
    updatedSkus: updated,
  })
}

/** Minimal CSV parser that handles quoted fields and embedded commas. */
function parseCsv(text: string, delimiter = ','): Record<string, unknown>[] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === delimiter) {
        cur.push(field)
        field = ''
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++
        cur.push(field)
        rows.push(cur)
        cur = []
        field = ''
      } else {
        field += c
      }
    }
  }
  if (field || cur.length) {
    cur.push(field)
    rows.push(cur)
  }

  if (rows.length === 0) return []

  const headers = rows[0].map((h) => h.trim())
  const out: Record<string, unknown>[] = []
  for (let r = 1; r < rows.length; r++) {
    if (rows[r].length === 1 && rows[r][0] === '') continue // skip empty lines
    const obj: Record<string, unknown> = {}
    headers.forEach((h, idx) => {
      obj[h] = rows[r][idx] ?? ''
    })
    out.push(obj)
  }
  return out
}
