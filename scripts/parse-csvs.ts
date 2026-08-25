/**
 * Parse all uploaded PlayBeat CSV files and produce a single products.json
 * with cleaned product names, USD-normalized prices, categories, and SKUs.
 *
 * Usage: bun run scripts/parse-csvs.ts
 *
 * Inputs:  /home/z/my-project/upload/table-*.csv
 * Output:  /home/z/my-project/scripts/products.json
 */
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = '/home/z/my-project/upload'
const OUTPUT_PATH = '/home/z/my-project/scripts/products.json'

// Approximate exchange rates (Aug 2026). Used to normalize to USD base.
// Source: rough average of recent forex rates.
const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  TRY: 0.029,
  JPY: 0.0067,
  AUD: 0.66,
  BRL: 0.18,
  COP: 0.00025,
  MXN: 0.058,
  AED: 0.272,
  PKR: 0.0036,
}

// Display exchange rates (1 USD to target currency) — for the storefront switcher
export const DISPLAY_RATES: Record<string, number> = {
  PKR: 280,
  USD: 1,
  GBP: 0.79,
  AED: 3.67,
}

interface RawRow {
  num: string
  product: string
  finalPrice: string
}

interface ParsedProduct {
  sku: string
  name: string
  description: string
  category: string
  priceUSD: number // USD base price
  originalPrice: number
  originalCurrency: string
  digital: boolean
  tags: string[]
  stock: number
  status: 'active' | 'draft'
}

// ---- CSV parsing (handles quoted fields, BOM, and markdown) ----
function parseCsv(text: string): string[][] {
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
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
      } else if (c === ',') {
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
  return rows
}

// ---- Clean markdown bold (**) and backslashes from product names ----
function cleanMarkdown(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/\\$/g, '$')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---- Parse a price string like "$31.20 USD" or "€60.00 EUR" or "₺750.00 TRY" ----
interface ParsedPrice {
  value: number | null
  currency: string | null
}

function parsePrice(s: string): ParsedPrice {
  if (!s) return { value: null, currency: null }
  const cleaned = cleanMarkdown(s).trim()
  if (!cleaned || cleaned === '—' || cleaned === '-') {
    return { value: null, currency: null }
  }
  // Find the 3-letter currency code at the end (e.g., "USD", "EUR", "GBP")
  const curMatch = cleaned.match(/\b(USD|EUR|GBP|TRY|JPY|AUD|BRL|COP|MXN|AED|PKR)\b/i)
  const currency = curMatch ? curMatch[1].toUpperCase() : null
  // Strip everything except digits and . and ,
  let numStr = cleaned.replace(/[^\d.,]/g, '')
  // Remove thousand separators (commas between digits)
  numStr = numStr.replace(/(\d),(\d)/g, '$1$2')
  // If there's a comma as decimal separator (European style), convert
  if (numStr.includes('.') && numStr.includes(',')) {
    // Both present — assume comma is thousand sep
    numStr = numStr.replace(/,/g, '')
  } else if (!numStr.includes('.') && numStr.includes(',')) {
    // Only comma — treat as decimal
    numStr = numStr.replace(',', '.')
  }
  const value = parseFloat(numStr)
  return { value: isNaN(value) ? null : value, currency }
}

// ---- Categorize based on product name keywords ----
function categorize(name: string): { category: string; tags: string[]; skuPrefix: string } {
  const n = name.toLowerCase()

  // AI / Productivity tools
  if (
    n.includes('cursor ai') ||
    n.includes('claude') ||
    n.includes('grok') ||
    n.includes('lovable') ||
    n.includes('leonardo ai') ||
    n.includes('heygen') ||
    n.includes('openart') ||
    n.includes('replit') ||
    n.includes('google ai') ||
    n.includes('google storage')
  ) {
    return { category: 'AI & Productivity', tags: ['ai', 'subscription'], skuPrefix: 'AI' }
  }

  // CapCut
  if (n.includes('capcut')) {
    return { category: 'Video Editing', tags: ['capcut', 'subscription'], skuPrefix: 'CC' }
  }

  // Email accounts
  if (
    n.includes('gmail') ||
    n.includes('outlook') ||
    n.includes('hotmail') ||
    n.includes('firstmail') ||
    n.includes('gmx') ||
    n.includes('rambler') ||
    n.includes('offlive') ||
    (n.includes('mail') && n.includes('account'))
  ) {
    return { category: 'Email Accounts', tags: ['email', 'account'], skuPrefix: 'EML' }
  }

  // IPTV
  if (n.includes('iptv') || n.includes('5glive')) {
    return { category: 'IPTV', tags: ['iptv', 'subscription'], skuPrefix: 'IPTV' }
  }

  // NFLX / Sptfy Gift Cards (gift cards come before streaming accounts)
  if (
    (n.includes('nflx') || n.includes('sptfy') || n.includes('spotify')) &&
    n.includes('gift card')
  ) {
    return { category: 'Gift Cards', tags: ['giftcard'], skuPrefix: 'GC' }
  }

  // NFLX streaming accounts
  if (n.includes('nflx') || n.includes('netflix')) {
    return { category: 'Streaming Accounts', tags: ['streaming', 'account'], skuPrefix: 'STR' }
  }

  // Default
  return { category: 'Other', tags: ['digital'], skuPrefix: 'OTH' }
}

// ---- Detect region from product name ----
function detectRegion(name: string): string | null {
  const m = name.match(/\((US|EU|UK|FR|PT|DE|TR|JP|AU|BR|CO|MX|NL|Global)\)/i)
  return m ? m[1].toUpperCase() : null
}

// ---- Main ----
function main() {
  const files = fs.readdirSync(UPLOAD_DIR).filter((f) => f.startsWith('table-') && f.endsWith('.csv'))
  console.log(`Found ${files.length} CSV files`)

  // Collect rows from all files, deduplicating by (name, price, currency)
  const seen = new Set<string>()
  const allProducts: ParsedProduct[] = []
  let skuCounter: Record<string, number> = {}

  for (const file of files) {
    const fullPath = path.join(UPLOAD_DIR, file)
    const text = fs.readFileSync(fullPath, 'utf-8')
    const rows = parseCsv(text)
    if (rows.length < 2) continue

    // Find the header row to figure out column indices
    const header = rows[0].map((h) => h.trim().toLowerCase())
    const idxNum = header.findIndex((h) => h === '#' || h.includes('no'))
    const idxProduct = header.findIndex((h) => h.includes('product'))
    const idxFinal = header.findIndex((h) => h.includes('final price'))
    if (idxProduct === -1 || idxFinal === -1) {
      console.warn(`Skipping ${file}: no product/final-price columns`)
      continue
    }

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || row.length < 2) continue
      const num = idxNum >= 0 ? row[idxNum]?.trim() : String(r)
      const rawProduct = row[idxProduct]?.trim() || ''
      const rawFinal = row[idxFinal]?.trim() || ''
      if (!rawProduct || rawProduct === '—' || rawProduct === '-') continue

      const cleanedName = cleanMarkdown(rawProduct)
      const { value, currency } = parsePrice(rawFinal)
      if (value === null || !currency) {
        // Skip rows with no price (— in CSV)
        continue
      }

      // Convert to USD
      const rate = RATES_TO_USD[currency] ?? 1
      const priceUSD = Math.round(value * rate * 100) / 100

      // Dedupe
      const key = `${cleanedName}|${value}|${currency}`
      if (seen.has(key)) continue
      seen.add(key)

      const { category, tags, skuPrefix } = categorize(cleanedName)
      skuCounter[skuPrefix] = (skuCounter[skuPrefix] || 0) + 1
      const sku = `${skuPrefix}-${String(skuCounter[skuPrefix]).padStart(3, '0')}`

      const region = detectRegion(cleanedName)
      const allTags = [...tags]
      if (region) allTags.push(region.toLowerCase())

      allProducts.push({
        sku,
        name: cleanedName,
        description: `Digital product — ${cleanedName}. Instant delivery after payment verification.`,
        category,
        priceUSD,
        originalPrice: value,
        originalCurrency: currency,
        digital: true,
        tags: allTags,
        stock: 100,
        status: 'active',
      })
    }
  }

  // Sort by category then SKU
  allProducts.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.sku.localeCompare(b.sku)
  })

  // Reassign SKUs based on sorted position
  let counter: Record<string, number> = {}
  for (const p of allProducts) {
    const prefix = p.sku.split('-')[0]
    counter[prefix] = (counter[prefix] || 0) + 1
    p.sku = `${prefix}-${String(counter[prefix]).padStart(3, '0')}`
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allProducts, null, 2))
  console.log(`✅ Wrote ${allProducts.length} products to ${OUTPUT_PATH}`)

  // Print category summary
  const byCat: Record<string, number> = {}
  for (const p of allProducts) byCat[p.category] = (byCat[p.category] || 0) + 1
  console.log('\nCategory summary:')
  for (const [cat, n] of Object.entries(byCat)) {
    console.log(`  ${cat}: ${n} products`)
  }

  // Print currency summary
  const byCur: Record<string, number> = {}
  for (const p of allProducts) byCur[p.originalCurrency] = (byCur[p.originalCurrency] || 0) + 1
  console.log('\nCurrency summary:')
  for (const [cur, n] of Object.entries(byCur)) {
    console.log(`  ${cur}: ${n} products`)
  }
}

main()
