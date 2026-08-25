'use client'

import { ListOrdered, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  customer: string
  amount: string
  status: string
}

interface RecentOrdersProps {
  orders?: Order[]
}

const FALLBACK: Order[] = [
  { id: '#PB-00024', customer: 'John Doe', amount: '$31.20', status: 'Completed' },
  { id: '#PB-00023', customer: 'Sarah Smith', amount: '$8.92', status: 'Completed' },
  { id: '#PB-00022', customer: 'Mike Johnson', amount: '$1.95', status: 'Completed' },
  { id: '#PB-00021', customer: 'Emma Wilson', amount: '$24.57', status: 'Processing' },
  { id: '#PB-00020', customer: 'David Brown', amount: '$1.43', status: 'Pending' },
]

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
  Processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const normalizeStatus = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

export function RecentOrders({ orders = FALLBACK }: RecentOrdersProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Recent Orders</h3>
        </div>
        <a
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-4 flex-1 space-y-2">
        {orders.length === 0 ? (
          <div className="grid h-32 place-items-center text-sm text-slate-400">
            No orders yet
          </div>
        ) : (
          orders.map((o) => {
            const normalized = normalizeStatus(o.status)
            return (
              <div
                key={o.id}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white">
                  {o.customer.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-slate-300">{o.id}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    <span className="text-white">{o.customer}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono font-semibold text-white">{o.amount}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    STATUS_STYLES[o.status] || STATUS_STYLES[normalized] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {normalized}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
