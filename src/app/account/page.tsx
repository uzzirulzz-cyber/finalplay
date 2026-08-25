'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Package,
  Heart,
  KeyRound,
  Bell,
  ShoppingBag,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useCustomer } from '@/lib/use-customer'
import { cn } from '@/lib/utils'

export default function AccountPage() {
  const { customer, loading, logout } = useCustomer()
  const router = useRouter()
  const [stats, setStats] = useState({ orders: 0, completed: 0, pending: 0, wishlist: 0, licenses: 0, notifications: 0, totalSpent: 0 })

  useEffect(() => {
    if (!loading && !customer) {
      router.replace('/login?redirect=/account')
    }
  }, [loading, customer, router])

  useEffect(() => {
    if (!customer) return
    Promise.all([
      fetch('/api/customer/orders', { credentials: 'include' }).then(r => r.json()).catch(() => ({ orders: [] })),
      fetch('/api/customer/wishlist', { credentials: 'include' }).then(r => r.json()).catch(() => ({ products: [] })),
      fetch('/api/customer/licenses', { credentials: 'include' }).then(r => r.json()).catch(() => ({ licenses: [] })),
      fetch('/api/customer/notifications', { credentials: 'include' }).then(r => r.json()).catch(() => ({ unread: 0 })),
    ]).then(([ordersRes, wishlistRes, licensesRes, notifRes]) => {
      const orders = ordersRes.orders || []
      setStats({
        orders: orders.length,
        completed: orders.filter((o: any) => o.status === 'completed').length,
        pending: orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
        wishlist: (wishlistRes.products || []).length,
        licenses: (licensesRes.licenses || []).length,
        notifications: notifRes.unread || 0,
        totalSpent: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      })
    })
  }, [customer])

  if (loading || !customer) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050608] text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          Loading your dashboard...
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Orders', value: stats.orders, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Wishlist', value: stats.wishlist, icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Digital Licenses', value: stats.licenses, icon: KeyRound, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ]

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative mx-auto max-w-5xl px-4 py-8 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{customer.name.split(' ')[0]}</span>! 👋
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">{customer.email}</p>
              {customer.emailVerified ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Verified Account
                </span>
              ) : (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                  <Clock className="h-3 w-3" /> Email Not Verified
                </span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="hidden items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

        {/* Stats grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className={cn('grid h-10 w-10 place-items-center rounded-xl', c.bg)}>
                  <Icon className={cn('h-5 w-5', c.color)} />
                </div>
                <div className="mt-3 font-mono text-2xl font-bold text-white">{c.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{c.label}</div>
              </div>
            )
          })}
        </div>

        {/* Quick links */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/account/orders" className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-blue-500/30">
            <Package className="h-6 w-6 text-blue-400" />
            <div className="mt-3 font-semibold text-white">My Orders</div>
            <div className="mt-0.5 text-xs text-slate-400">View order history & track shipments</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
              View <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
          <Link href="/account/wishlist" className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-red-500/30">
            <Heart className="h-6 w-6 text-red-400" />
            <div className="mt-3 font-semibold text-white">Wishlist</div>
            <div className="mt-0.5 text-xs text-slate-400">{stats.wishlist} saved items</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
              View <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
          <Link href="/account/licenses" className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-violet-500/30">
            <KeyRound className="h-6 w-6 text-violet-400" />
            <div className="mt-3 font-semibold text-white">Digital Licenses</div>
            <div className="mt-0.5 text-xs text-slate-400">Access your purchased keys</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-violet-400">
              View <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
          <Link href="/account/settings" className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-emerald-500/30">
            <Settings className="h-6 w-6 text-emerald-400" />
            <div className="mt-3 font-semibold text-white">Account Settings</div>
            <div className="mt-0.5 text-xs text-slate-400">Edit profile & password</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
              Edit <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        {/* Logout mobile */}
        <div className="mt-8 sm:hidden">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
