/**
 * Generate premium PlayBeat Digital image assets using z-ai-web-dev-sdk.
 * Generates images in parallel with controlled concurrency (3 at a time)
 * to respect rate limits while staying fast.
 *
 * Usage: bun run scripts/generate-images.ts
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/public/assets/images/playbeat'

interface ImageJob {
  filename: string
  prompt: string
  size: string
}

// Shared style suffix to ensure visual consistency across all assets
const STYLE = 'premium 3D render, dark futuristic digital marketplace aesthetic, near-black deep navy background, electric blue and violet purple neon glow, cinematic lighting, glassmorphism, subtle particles, high quality, detailed, 8k, Apple Stripe level polish, no text, no watermark'

const JOBS: ImageJob[] = [
  // 1. Hero (1344x768 — both multiples of 32)
  {
    filename: 'hero-marketplace.png',
    size: '1344x768',
    prompt: `A large transparent glowing 3D digital shopping bag icon floating in center-right, luminous blue globe behind it, floating digital product cards orbiting around the globe (a PlayStation-style gaming card, a Netflix-style red streaming card, a Spotify-style green music card, a ChatGPT AI-style card, a Windows software card, a Steam gaming card, a Google Play card), subtle particles, blue and purple energy glow, clean negative space on the left side for text, ${STYLE}`,
  },
  // 2. Categories (7)
  {
    filename: 'category-games.png',
    size: '1024x1024',
    prompt: `A premium game controller with blue neon lighting, floating 3D object centered, ${STYLE}`,
  },
  {
    filename: 'category-software.png',
    size: '1024x1024',
    prompt: `A glowing laptop with software interface floating, 3D render centered, ${STYLE}`,
  },
  {
    filename: 'category-ai.png',
    size: '1024x1024',
    prompt: `A futuristic neural network AI orb glowing with electric blue and purple energy, 3D render centered, ${STYLE}`,
  },
  {
    filename: 'category-subscriptions.png',
    size: '1024x1024',
    prompt: `A glowing circular subscription symbol with infinity loop, premium 3D icon centered, ${STYLE}`,
  },
  {
    filename: 'category-giftcards.png',
    size: '1024x1024',
    prompt: `A premium digital gift card stack floating with golden glow, 3D render centered, ${STYLE}`,
  },
  {
    filename: 'category-free-tools.png',
    size: '1024x1024',
    prompt: `An open digital toolbox with glowing utility icons floating out, 3D render centered, ${STYLE}`,
  },
  {
    filename: 'category-bundles.png',
    size: '1024x1024',
    prompt: `Multiple digital products grouped together in a floating bundle, 3D render centered, ${STYLE}`,
  },
  // 3. Deal of the day (wide banner, 1344x768)
  {
    filename: 'deal-creative-cloud.png',
    size: '1344x768',
    prompt: `A large premium abstract Creative Cloud style icon treatment, purple orange pink gradient lighting, floating creative app symbols (camera, brush, pen, layers), futuristic dark studio environment, strong central visual focus, empty space on the left for text, ${STYLE}`,
  },
  // 4. Blog images (3, 16:9)
  {
    filename: 'blog-ai-tools.png',
    size: '1344x768',
    prompt: `Futuristic AI productivity tools visualization, glowing neural network connections, blue purple cinematic lighting, premium 3D composition, ${STYLE}`,
  },
  {
    filename: 'blog-subscriptions.png',
    size: '1344x768',
    prompt: `Digital subscriptions concept, floating app icons in orbit around a central hub, blue purple cinematic lighting, premium 3D composition, ${STYLE}`,
  },
  {
    filename: 'blog-software.png',
    size: '1344x768',
    prompt: `Essential software for creators, glowing software windows floating, creative tools, blue purple cinematic lighting, premium 3D composition, ${STYLE}`,
  },
]

async function generateOne(zai: any, job: ImageJob): Promise<{ job: ImageJob; ok: boolean; error?: string }> {
  const outPath = path.join(OUTPUT_DIR, job.filename)
  // Skip if already exists
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`⏭️  Skip (exists): ${job.filename}`)
    return { job, ok: true }
  }
  try {
    console.log(`🎨 Generating: ${job.filename} (${job.size})`)
    const response = await zai.images.generations.create({
      prompt: job.prompt,
      size: job.size,
    })
    const base64 = response.data[0].base64
    const buffer = Buffer.from(base64, 'base64')
    fs.writeFileSync(outPath, buffer)
    console.log(`✅ Saved: ${job.filename} (${(buffer.length / 1024).toFixed(0)} KB)`)
    return { job, ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`❌ Failed: ${job.filename} — ${msg}`)
    return { job, ok: false, error: msg }
  }
}

async function runWithConcurrency<T>(items: T[], fn: (item: T) => Promise<void>, limit: number) {
  const queue = [...items]
  const workers: Promise<void>[] = []
  for (let i = 0; i < limit; i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift()!
          await fn(item)
        }
      })()
    )
  }
  await Promise.all(workers)
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`🚀 Generating ${JOBS.length} PlayBeat image assets...`)
  console.log(`   Output: ${OUTPUT_DIR}`)
  console.log(`   Concurrency: 3\n`)

  const zai = await ZAI.create()
  const results: { ok: number; failed: number } = { ok: 0, failed: 0 }

  await runWithConcurrency(
    JOBS,
    async (job) => {
      const r = await generateOne(zai, job)
      if (r.ok) results.ok++
      else results.failed++
    },
    3
  )

  console.log(`\n🎉 Done! Success: ${results.ok}, Failed: ${results.failed}`)
  console.log(`\nFiles in ${OUTPUT_DIR}:`)
  fs.readdirSync(OUTPUT_DIR).forEach((f) => {
    const stat = fs.statSync(path.join(OUTPUT_DIR, f))
    console.log(`  ${f} — ${(stat.size / 1024).toFixed(0)} KB`)
  })
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
