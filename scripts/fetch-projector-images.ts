/**
 * Search projector images with parallel execution (3 at a time).
 * Writes URLs incrementally so partial progress is preserved.
 */
import { execSync } from 'child_process'
import fs from 'fs'

const INPUT_PATH = '/home/z/my-project/scripts/projectors.json'

interface Product {
  sku: string
  brand: string
  model: string
  imageUrl?: string
  [k: string]: any
}

function searchImage(query: string): string | null {
  try {
    const cmd = `z-ai image-search -q "${query.replace(/"/g, '\\"')}" -c 2 --no-rank`
    const stdout = execSync(cmd, { encoding: 'utf-8', timeout: 90 })
    const jsonStart = stdout.indexOf('{')
    if (jsonStart === -1) return null
    const data = JSON.parse(stdout.slice(jsonStart))
    const results = data?.data?.results || []
    if (Array.isArray(results) && results.length > 0) {
      return results[0]?.original_url || null
    }
    return null
  } catch (e) {
    return null
  }
}

async function runWithConcurrency<T>(items: T[], fn: (item: T) => Promise<void>, limit: number) {
  const queue = [...items]
  const workers: Promise<void>[] = []
  for (let i = 0; i < limit; i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const item = queue.shift()!
        await fn(item)
      }
    })())
  }
  await Promise.all(workers)
}

async function main() {
  const products: Product[] = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'))
  console.log(`🔍 Searching images for ${products.length} projectors (concurrency: 3)...\n`)

  let found = 0
  let processed = 0

  await runWithConcurrency(
    products,
    async (p) => {
      processed++
      if (p.imageUrl) {
        found++
        console.log(`[${processed}/${products.length}] ⏭️  ${p.sku} already has image`)
        return
      }
      const query = `${p.brand} ${p.model} projector`
      const url = searchImage(query)
      if (url) {
        p.imageUrl = url
        found++
        console.log(`[${processed}/${products.length}] ✅ ${p.sku}: ${url.substring(0, 70)}...`)
      } else {
        console.log(`[${processed}/${products.length}] ❌ ${p.sku}: no image`)
      }
      // Save incrementally so partial progress is preserved
      fs.writeFileSync(INPUT_PATH, JSON.stringify(products, null, 2))
    },
    3
  )

  fs.writeFileSync(INPUT_PATH, JSON.stringify(products, null, 2))
  console.log(`\n✅ Saved with images: ${found}/${products.length}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
