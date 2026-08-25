'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  FileBarChart,
  CalendarDays,
  ShoppingCart,
  Package,
  KeyRound,
  RefreshCw,
  Tag,
  Users,
  MessageCircle,
  Star,
  Tv,
  Cable,
  ScrollText,
  Megaphone,
  Mail,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  icon: typeof LayoutDashboard
  href: string
  badge?: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
      { label: 'Analytics & Traffic', icon: BarChart3, href: '/admin/analytics' },
      { label: 'Reports', icon: FileBarChart, href: '/admin/reports' },
      { label: 'Calendar', icon: CalendarDays, href: '/admin/calendar' },
    ],
  },
  {
    title: 'Commerce & Inventory',
    items: [
      { label: 'Orders & Fulfillment', icon: ShoppingCart, href: '/admin/orders', badge: '2' },
      { label: 'Catalog Products', icon: Package, href: '/admin/products', badge: '17' },
      { label: 'Digital License Vault', icon: KeyRound, href: '/admin/licenses' },
      { label: 'Subscriptions', icon: RefreshCw, href: '/admin/subscriptions' },
      { label: 'Discounts & Coupons', icon: Tag, href: '/admin/discounts' },
    ],
  },
  {
    title: 'Customers & Support',
    items: [
      { label: 'Customer Accounts', icon: Users, href: '/admin/customers', badge: '248' },
      { label: 'Support Tickets', icon: MessageCircle, href: '/admin/tickets', badge: '6' },
      { label: 'Reviews & Feedback', icon: Star, href: '/admin/reviews' },
    ],
  },
  {
    title: 'IPTV & Services',
    items: [
      { label: 'IPTV M3U Servers', icon: Tv, href: '/admin/iptv', badge: '3' },
      { label: 'Connections', icon: Cable, href: '/admin/connections' },
      { label: 'Service Logs', icon: ScrollText, href: '/admin/service-logs' },
    ],
  },
  {
    title: 'Marketing & Integrations',
    items: [
      { label: 'Marketing Campaigns', icon: Megaphone, href: '/admin/campaigns' },
      { label: 'Email Templates', icon: Mail, href: '/admin/email-templates' },
      { label: 'Integrations', icon: Puzzle, href: '/admin/integrations' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 lg:z-30 h-screen shrink-0 flex flex-col',
          'bg-[#070b18] border-r border-white/5 transition-all duration-300',
          collapsed ? 'w-[76px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 transition',
              collapsed && 'lg:justify-center lg:w-full'
            )}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-lg shadow-yellow-500/20">
              <img
                src="/playbeat-logo.png"
                alt="PlayBeat"
                className="h-8 w-8 object-contain"
              />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-base font-extrabold italic tracking-tight text-transparent">
                    PlayBeat
                  </span>
                  <span className="rounded bg-yellow-400/20 px-1 text-[10px] font-bold text-yellow-400">
                    2
                  </span>
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Digital Products
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={onToggle}
            className={cn(
              'hidden lg:grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white',
              collapsed && 'lg:hidden'
            )}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse-expand button (mobile + tablet) */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="mx-auto mb-2 hidden h-7 w-7 place-items-center rounded-md bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:grid"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        collapsed && 'lg:justify-center lg:px-0',
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          collapsed && 'lg:mx-auto',
                          active && 'drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]'
                        )}
                      />
                      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-yellow-400/15 text-yellow-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {/* Tooltip for collapsed */}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block lg:z-50">
                          {item.label}
                          {item.badge && (
                            <span className="ml-1.5 rounded-full bg-yellow-400/20 px-1.5 py-0.5 text-[10px] text-yellow-400">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status card */}
        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              'rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 transition',
              collapsed && 'lg:px-2'
            )}
          >
            <div className={cn('flex items-center gap-2.5', collapsed && 'lg:justify-center')}>
              <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
                </span>
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-xs font-semibold text-white">All Systems Operational</div>
                  <div className="text-[10px] text-slate-400">Uptime 99.98% · 24/7</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
