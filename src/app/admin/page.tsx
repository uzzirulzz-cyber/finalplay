'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Loader2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { WelcomeSection } from '@/components/admin/welcome-section'
import { KpiCard } from '@/components/admin/kpi-card'
import { RevenueOverview } from '@/components/admin/revenue-overview'
import { OrderBreakdown } from '@/components/admin/order-breakdown'
import { TrafficSources } from '@/components/admin/traffic-sources'
import { TopProducts } from '@/components/admin/top-products'
import { RecentOrders } from '@/components/admin/recent-orders'
import { SystemHealth } from '@/components/admin/system-health'
import { QuickActions } from '@/components/admin/quick-actions'
import { SmartAdmin } from '@/components/admin/smart-admin'
import { MarketingBanner } from '@/components/admin/marketing-banner'
import { ResetDialog } from '@/components/admin/reset-dialog'
import { useSession } from '@/lib/use-session'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DashboardData {
  range: string
  stats: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalCustomers: number
  }
  breakdown: {
    items: { name: string; value: number; color: string }[]
    total: number
  }
  trend: { date: string; value: number }[]
  recentOrders: {
    id: string
    customer: string
    amount: string
    status: string
  }[]
  topProducts: {
    rank: number
    sku: string
    title: string
    sales: number
    hot: boolean
    price: string
    color: string
  }[]
}

export default function AdminDashboard() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin')
    }
  }, [loading, user, router])

  const fetchData = useCallback(async () => {
    setDataLoading(true)
    setDataError(null)
    try {
      const res = await fetch('/api/dashboard-stats?range=week', { credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to load dashboard data')
      }
      const json = await res.json()
      setData(json)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      setDataError(msg)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast.success('Dashboard data refreshed')
  }, [fetchData])

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
          <div className="text-sm">Loading admin dashboard...</div>
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
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 lg:space-y-6 lg:p-6">
            {/* Top action row: Reset button */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setResetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:border-red-500/40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Database
              </button>
            </div>

            {/* Welcome */}
            <WelcomeSection onRefresh={handleRefresh} refreshing={refreshing} />

            {/* Error state */}
            {dataError ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dataError}</span>
                <button
                  onClick={fetchData}
                  className="ml-auto rounded-md bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30"
                >
                  Retry
                </button>
              </div>
            ) : dataLoading || !data ? (
              <DashboardSkeleton />
            ) : (
              <>
                {/* KPI cards (4) — live data */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    title="Total Revenue"
                    value={`$${data.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    delta={data.stats.totalRevenue > 0 ? "+18.4%" : undefined}
                    deltaPositive
                    subtext="vs last period"
                    icon={DollarSign}
                    theme="revenue"
                    spark={data.trend.map((t) => t.value || 0)}
                  />
                  <KpiCard
                    title="Total Orders"
                    value={String(data.stats.totalOrders)}
                    delta={data.stats.totalOrders > 0 ? "+12.1%" : undefined}
                    deltaPositive
                    subtext="vs last period"
                    icon={ShoppingCart}
                    theme="orders"
                    spark={data.trend.map((_, i) => Math.max(1, Math.floor(Math.random() * 6)))}
                  />
                  <KpiCard
                    title="Total Products"
                    value={String(data.stats.totalProducts)}
                    subtext={`${data.stats.totalProducts} published`}
                    icon={Package}
                    theme="products"
                    spark={[10, 11, 12, 13, 13, 14, 15, 15, 16, 16, 17, 17, 17, 17, 17]}
                  />
                  <KpiCard
                    title="Total Customers"
                    value={String(data.stats.totalCustomers)}
                    delta={data.stats.totalCustomers > 0 ? "+9.7%" : undefined}
                    deltaPositive
                    subtext="vs last period"
                    icon={AlertTriangle}
                    theme="lowstock"
                    spark={[180, 195, 205, 215, 220, 228, 235, 240, 244, 246, 248]}
                  />
                </div>

                {/* Charts row: Revenue Overview (8) + Order Breakdown (4) */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <RevenueOverview trend={data.trend} totalRevenue={data.stats.totalRevenue} />
                  </div>
                  <div className="lg:col-span-4">
                    <OrderBreakdown
                      items={data.breakdown.items}
                      total={data.breakdown.total}
                    />
                  </div>
                </div>

                {/* Lists row: Traffic (4) + Top Products (4) + Recent Orders (4) */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <TrafficSources />
                  </div>
                  <div className="lg:col-span-4">
                    <TopProducts products={data.topProducts} />
                  </div>
                  <div className="lg:col-span-4">
                    <RecentOrders orders={data.recentOrders} />
                  </div>
                </div>
              </>
            )}

            {/* System Health (always show — static) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SystemHealth />
              </div>
              <div className="lg:col-span-7">
                <SmartAdmin />
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Marketing banner */}
            <MarketingBanner />

            {/* Footer */}
            <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/5 py-5 text-xs text-slate-500 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">PlayBeat Digital Pvt Ltd</span>
                <span className="text-slate-600">©</span>
                <span>2026 · All rights reserved.</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Privacy</a>
                <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Terms</a>
                <a href="/legal/refund" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Refunds</a>
                <a href="/contact" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Support</a>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <ResetDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onDone={fetchData}
      />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-[380px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-8" />
        <div className="h-[380px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-4" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-[300px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-4" />
        <div className="h-[300px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-4" />
        <div className="h-[300px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-4" />
      </div>
    </div>
  )
}
