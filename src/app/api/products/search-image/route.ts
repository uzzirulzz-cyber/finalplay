import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { requireAuth } from '@/lib/require-auth'

// GET /api/products/search-image?query=Magcubic+HY450MAX+projector
// Admin-only — searches the web for product images via z-ai image-search CLI
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const query = req.nextUrl.searchParams.get('query') || ''
  if (!query || query.length < 3) {
    return NextResponse.json(
      { ok: false, error: 'Query must be at least 3 characters.' },
      { status: 400 }
    )
  }

  try {
    const cmd = `z-ai image-search -q "${query.replace(/"/g, '\\"')}" -c 6 --no-rank`
    const stdout = execSync(cmd, { encoding: 'utf-8', timeout: 90000 })
    const jsonStart = stdout.indexOf('{')
    if (jsonStart === -1) {
      return NextResponse.json({ ok: true, results: [] })
    }
    const data = JSON.parse(stdout.slice(jsonStart))
    const results = data?.data?.results || []

    // Return cleaned results with metadata
    const cleaned = results
      .filter((r: any) => r.original_url)
      .map((r: any, i: number) => ({
        id: i,
        url: r.original_url,
        source: r.source || '',
        width: parseInt(r.original_width) || 0,
        height: parseInt(r.original_height) || 0,
        isSquare: r.original_width === r.original_height,
        aspect: r.original_width && r.original_height
          ? parseInt(r.original_width) / parseInt(r.original_height)
          : 1,
      }))

    return NextResponse.json({ ok: true, results: cleaned, query })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[products.search-image]', msg)
    return NextResponse.json(
      { ok: false, error: 'Image search failed: ' + msg.slice(0, 100) },
      { status: 500 }
    )
  }
}
