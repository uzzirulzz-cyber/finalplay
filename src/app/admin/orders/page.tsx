'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Search, ShoppingCart, Inbox, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { useSession } from '@/lib/use-session'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail?: string | null
  total: number
  currency: string
  status: string
  paymentMethod?: string | null
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const

export default function OrdersPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/orders?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data?.ok) {
        setOrders(data.data || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOrders(false)
    }
  }, [status, page])

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/admin/orders')
  }, [loading, user, router])

  useEffect(() => {
    if (user) fetchOrders()
  }, [user, fetchOrders])

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Update failed')
      toast.success(`Order marked as ${newStatus}`)
      fetchOrders()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed'
      toast.error(msg)
    }
  }

  async function handleDelete(id: string, orderNumber: string) {
    if (!confirm(`Delete order ${orderNumber}?`)) return
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Delete failed')
      toast.success(`Deleted ${orderNumber}`)
      fetchOrders()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed'
      toast.error(msg)
    }
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[#070b18] text-foreground">
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-40" />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 lg:p-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                Orders & Fulfillment
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {total} order{total !== 1 ? 's' : ''} total
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
              <button
                onClick={() => { setStatus('all'); setPage(1) }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  status === 'all'
                    ? 'bg-yellow-400/20 text-yellow-300'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                )}
              >
                All
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1) }}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition',
                    status === s
                      ? 'bg-yellow-400/20 text-yellow-300'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
              {loadingOrders ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                  <Inbox className="h-8 w-8 text-slate-500" />
                  <span>No orders found</span>
                </div>
              ) : (
                <>
                  <div className="scrollbar-thin overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                          <th className="px-4 py-3 font-semibold">Order #</th>
                          <th className="px-4 py-3 font-semibold">Customer</th>
                          <th className="px-4 py-3 font-semibold">Payment</th>
                          <th className="px-4 py-3 text-right font-semibold">Total</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                            <td className="px-4 py-3 font-mono text-xs text-slate-300">{o.orderNumber}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-[10px] font-bold text-slate-300">
                                  {o.customerName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium text-white">{o.customerName}</div>
                                  {o.customerEmail && (
                                    <div className="truncate text-[11px] text-slate-500">{o.customerEmail}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">{o.paymentMethod || '—'}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                              {o.currency} {o.total.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                className={cn(
                                  'rounded-full border px-2 py-1 text-[10px] font-semibold capitalize outline-none',
                                  STATUS_STYLES[o.status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                                )}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleDelete(o.id, o.orderNumber)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-xs text-slate-400">
                    <div>Page {page} of {pages} · {total} total</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 disabled:opacity-40">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 disabled:opacity-40">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
