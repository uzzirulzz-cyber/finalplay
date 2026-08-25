import { NextResponse } from 'next/server'

// GET /api/products/template
// Returns a CSV template users can download and fill in.
export async function GET() {
  const csv = [
    'sku,name,description,category,price,currency,stock,status,image,digital,tags',
    'PSN-50-US,"PlayStation Gift Card - $50 (USA)","Digital PSN gift card redeemable on US PlayStation Store.",Gift Cards,24000,Rs,100,active,,true,"psn,usa,giftcard"',
    'NFLX-1M,"Netflix Premium 1 Month","Netflix Premium account, 1 month subscription, 4K streaming.",Streaming,6800,Rs,50,active,,true,"netflix,streaming"',
    'IPTV-12M,"IPTV Subscription 12 Months","12-month IPTV subscription with 10,000+ live channels and VOD.",IPTV,8999,Rs,200,active,,true,"iptv,live-tv"',
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="playbeat-product-template.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
