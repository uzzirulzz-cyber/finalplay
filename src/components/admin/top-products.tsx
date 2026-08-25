'use client'

import { Crown, ChevronDown, Flame, ArrowRight } from 'lucide-react'

interface Product {
  rank: number
  sku?: string
  title: string
  sales: number
  hot: boolean
  price: string
  color: string
}

const FALLBACK: Product[] = [
  { rank: 1, title: 'Cursor AI Pro Subscription 1 Month', sales: 12, hot: true, price: '$31.20', color: '#facc15' },
  { rank: 2, title: 'CapCut Pro Subscription 1 Month (US)', sales: 8, hot: true, price: '$11.70', color: '#cbd5e1' },
  { rank: 3, title: 'NFLX Gift Card USD 25 (US)', sales: 5, hot: false, price: '$32.50', color: '#d97706' },
]

const GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-slate-400 to-slate-600',
  'from-red-500 to-red-700',
]

export function TopProducts({ products = FALLBACK }: { products?: Product[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-400" />
          <h3 className="text-base font-bold text-white">Top Selling Products</h3>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
          This Week
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-2.5">
        {products.map((p, i) => (
          <div
            key={p.rank}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]"
          >
            {/* Rank */}
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold"
              style={{
                background: `${p.color}20`,
                color: p.color,
                boxShadow: `0 0 8px ${p.color}30`,
              }}
            >
              #{p.rank}
            </div>
            {/* Thumbnail */}
            <div
              className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${GRADIENTS[i] || GRADIENTS[0]} text-[10px] font-bold text-white`}
            >
              {p.title.split(' ')[0].slice(0, 2).toUpperCase()}
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white" title={p.title}>
                {p.title}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                <span>Sales: {p.sales}</span>
                {p.hot && <Flame className="h-3 w-3 text-orange-400" />}
              </div>
            </div>
            {/* Price */}
            <div className="text-right">
              <div className="font-mono text-sm font-semibold text-white">{p.price}</div>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/admin/products"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        View All Products
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
