/**
 * Parse the zerobyte_complete_projector_catalog.csv into products.json format.
 * Skips rows with no price. Generates SKUs with PROJ- prefix.
 *
 * Usage: bun run scripts/parse-projectors.ts
 */
import fs from 'fs'

const CSV_PATH = '/home/z/my-project/upload/zerobyte_complete_projector_catalog.csv'
const OUTPUT_PATH = '/home/z/my-project/scripts/projectors.json'

interface ParsedProduct {
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
}

// PKR → USD rate (Aug 2026)
const PKR_TO_USD = 1 / 280

function parseCsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows: string[][] = []
  let cur: string[] = []
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

function parsePrice(s: string): number | null {
  if (!s) return null
  // Handle "From 36000" — take the number after "From"
  const cleaned = s.replace(/from/i, '').replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const v = parseFloat(cleaned)
  return isNaN(v) ? null : v
}

function buildDescription(p: any): string {
  const parts: string[] = []
  if (p.brand) parts.push(p.brand)
  parts.push(p.model)
  if (p.nativeResolution) parts.push(`· ${p.nativeResolution} Native`)
  if (p.brightness) parts.push(`· ${p.brightness} ANSI Lumens`)
  if (p.os) parts.push(`· ${p.os}`)
  if (p.wifi) parts.push(`· WiFi ${p.wifi.includes('6') ? '6' : ''}`.trim())
  const base = parts.join(' ')
  const features = p.specialFeatures ? ` · ${p.specialFeatures}` : ''
  return `${base}${features}`
}

function main() {
  const text = fs.readFileSync(CSV_PATH, 'utf-8')
  const rows = parseCsv(text)
  if (rows.length < 2) { console.error('No data'); process.exit(1) }

  const header = rows[0].map((h) => h.trim())
  console.log('Headers:', header)

  const products: ParsedProduct[] = []
  let counter = 0

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length < 2) continue
    const num = row[0]?.trim()
    const model = row[1]?.trim() || ''
    const brand = row[2]?.trim() || ''
    const priceStr = row[3]?.trim() || ''
    const originalPriceStr = row[4]?.trim() || ''
    const status = row[5]?.trim() || ''
    const nativeResolution = row[6]?.trim() || ''
    const brightness = row[7]?.trim() || ''
    const os = row[8]?.trim() || ''
    const cpu = row[9]?.trim() || ''
    const ramRom = row[10]?.trim() || ''
    const wifi = row[11]?.trim() || ''
    const bluetooth = row[12]?.trim() || ''
    const focus = row[13]?.trim() || ''
    const keystone = row[14]?.trim() || ''
    const speaker = row[15]?.trim() || ''
    const power = row[16]?.trim() || ''
    const specialFeatures = row[17]?.trim() || ''

    const price = parsePrice(priceStr)
    const originalPrice = parsePrice(originalPriceStr)

    // Skip rows with no price
    if (price === null) {
      console.log(`⏭️  Skip row ${num} (${brand} ${model}) — no price`)
      continue
    }

    counter++
    const sku = `PROJ-${String(counter).padStart(3, '0')}`
    const priceUSD = Math.round(price * PKR_TO_USD * 100) / 100
    const origUSD = originalPrice ? Math.round(originalPrice * PKR_TO_USD * 100) / 100 : priceUSD

    const tags: string[] = ['projector', brand.toLowerCase()]
    if (nativeResolution.includes('1080')) tags.push('1080p')
    if (nativeResolution.includes('720')) tags.push('720p')
    if (os.toLowerCase().includes('android')) tags.push('android')
    if (os.toLowerCase().includes('google')) tags.push('google-tv')
    if (wifi.includes('6')) tags.push('wifi-6')
    if (bluetooth) tags.push('bluetooth')
    if (specialFeatures.toLowerCase().includes('4k')) tags.push('4k')
    if (specialFeatures.toLowerCase().includes('8k')) tags.push('8k')
    if (specialFeatures.toLowerCase().includes('netflix')) tags.push('netflix')

    const productStatus: 'active' | 'draft' = status.toLowerCase().includes('sold out') ? 'draft' : 'active'
    const stock = productStatus === 'active' ? 25 : 0

    products.push({
      sku,
      name: `${brand} ${model} Smart Projector`,
      description: buildDescription({
        brand, model, nativeResolution, brightness, os, wifi, specialFeatures
      }),
      category: 'Smart Projectors',
      priceUSD,
      originalPrice: origUSD,
      originalCurrency: 'PKR',
      region: 'Global',
      digital: false,
      tags,
      stock,
      status: productStatus,
      model,
      brand,
    })
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2))
  console.log(`\n✅ Wrote ${products.length} projector products to ${OUTPUT_PATH}`)
  console.log(`\nBrand summary:`)
  const byBrand: Record<string, number> = {}
  for (const p of products) byBrand[p.brand] = (byBrand[p.brand] || 0) + 1
  for (const [b, n] of Object.entries(byBrand)) console.log(`  ${b}: ${n}`)
}

main()
