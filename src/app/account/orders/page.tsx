'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Package, Clock, CheckCircle2, X } from 'lucide-react'
import { useCustomer } from '@/lib/use-customer'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  total: number
  currency: string
  status: string
  paymentStatus: string
  deliveryStatus: string
  createdAt: string
  items: { productId: string; name: string; price: number; qty: number; image?: string; digital?: boolean }[]
}

const STATUS_STYLES = {
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  pending: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function OrdersPage() {
  const { customer, loading } = useCustomer()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!loading && !customer) router.replace('/login?redirect=/account/orders')
  }, [loading, customer, router])

  useEffect(() => {
    if (!customer) return
    fetch('/api/customer/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .finally(() => setLoadingOrders(false))
  }, [customer])

  if (loading || !customer) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050608] text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-1 text-sm text-slate-400">{orders.length} orders total</p>

        {loadingOrders ? (
          <div className="mt-8 grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center py-16 text-center">
            <Package className="h-12 w-12 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">No orders yet</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm font-medium text-white">{order.orderNumber}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                    </div>
                  </div>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', STATUS_STYLES[order.status] || STATUS_STYLES.pending)}>
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{item.name} × {item.qty}</span>
                      <span className="font-mono text-slate-400">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs text-slate-400">
                    Payment: <span className="capitalize text-white">{order.paymentStatus}</span>
                  </span>
                  <span className="font-mono font-bold text-white">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
