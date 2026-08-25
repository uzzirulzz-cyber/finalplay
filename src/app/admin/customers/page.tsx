'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Search, Inbox, ChevronLeft, ChevronRight, Trash2, Mail, Globe } from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { useSession } from '@/lib/use-session'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string | null
  country?: string | null
  orders: number
  totalSpent: number
  createdAt: string
}

export default function CustomersPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/customers?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data?.ok) {
        setCustomers(data.data || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCustomers(false)
    }
  }, [search, page])

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/admin/customers')
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      const t = setTimeout(() => fetchCustomers(), 250)
      return () => clearTimeout(t)
    }
  }, [user, fetchCustomers])

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete customer ${email}?`)) return
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Delete failed')
      toast.success(`Deleted ${email}`)
      fetchCustomers()
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
                Customer Accounts
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {total} customer{total !== 1 ? 's' : ''} total
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
              {loadingCustomers ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                  <Inbox className="h-8 w-8 text-slate-500" />
                  <span>No customers found</span>
                </div>
              ) : (
                <>
                  <div className="scrollbar-thin overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                          <th className="px-4 py-3 font-semibold">Customer</th>
                          <th className="px-4 py-3 font-semibold">Country</th>
                          <th className="px-4 py-3 text-right font-semibold">Orders</th>
                          <th className="px-4 py-3 text-right font-semibold">Total Spent</th>
                          <th className="px-4 py-3 font-semibold">Joined</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-bold text-slate-950">
                                  {c.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate font-medium text-white">{c.name}</div>
                                  <div className="flex items-center gap-1 truncate text-[11px] text-slate-500">
                                    <Mail className="h-3 w-3" />
                                    {c.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {c.country ? (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3 text-slate-500" />
                                  {c.country}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-white">{c.orders}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                              Rs {c.totalSpent.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleDelete(c.id, c.email)}
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
