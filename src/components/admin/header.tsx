'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Menu,
  Store,
  ChevronDown,
  Bell,
  Plus,
  Package,
  ShoppingCart,
  FileBarChart,
  Users,
  Tag,
  Settings,
  LogOut,
  User,
  Zap,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  onReset?: () => void
}

interface Notification {
  id: string
  title: string
  desc: string
  time: string
  icon: LucideIcon
  color: string
  bg: string
  unread: boolean
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'New order received',
    desc: 'Order #PB-00025 · Rs 8,999',
    time: '2 min ago',
    icon: ShoppingCart,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Low stock alert',
    desc: 'Netflix Premium 1M — 3 left',
    time: '1 hour ago',
    icon: Package,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    unread: true,
  },
  {
    id: 'n3',
    title: 'New customer registered',
    desc: 'tom.w@example.com joined',
    time: '3 hours ago',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    unread: true,
  },
  {
    id: 'n4',
    title: 'Database backup completed',
    desc: 'Automated backup · 1.2 GB',
    time: '6 hours ago',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    unread: false,
  },
]

interface QuickAction {
  label: string
  icon: LucideIcon
  color: string
  bg: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Add Product', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Create Order', icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'View Reports', icon: FileBarChart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Manage Users', icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { label: 'Discounts', icon: Tag, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'Settings', icon: Settings, color: 'text-slate-300', bg: 'bg-white/5' },
]

export function Header({ onMenuClick }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // CTRL+/ focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setNotifOpen(false)
        setProfileOpen(false)
        setQuickOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-[#070b18]/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-300 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-xl md:block">
        <Search
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition',
            searchFocused ? 'text-blue-400' : 'text-slate-500'
          )}
        />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search anything..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            'w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-16 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition',
            searchFocused
              ? 'border-blue-500/40 bg-white/[0.07] shadow-lg shadow-blue-500/10'
              : 'border-white/5'
          )}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:flex">
          <span>CTRL</span>
          <span>/</span>
        </kbd>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        {/* Storefront button (gold) */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105 sm:flex"
        >
          <Store className="h-4 w-4" />
          <span>Storefront</span>
        </a>

        {/* Quick Actions dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickOpen((v) => !v)
              setNotifOpen(false)
              setProfileOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="hidden md:inline">Quick Actions</span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition', quickOpen && 'rotate-180')} />
          </button>
          {quickOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 p-2 pb-shadow-lg backdrop-blur-xl">
                <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-300 transition hover:bg-white/5"
                    >
                      <div className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-md', a.bg)}>
                        <a.icon className={cn('h-3.5 w-3.5', a.color)} />
                      </div>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v)
              setQuickOpen(false)
              setProfileOpen(false)
            }}
            className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 pb-shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <div className="text-sm font-bold text-white">Notifications</div>
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                    {unreadCount} new
                  </span>
                </div>
                <div className="scrollbar-thin max-h-80 overflow-y-auto py-1">
                  {NOTIFICATIONS.map((n) => (
                    <button
                      key={n.id}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5',
                        n.unread && 'bg-blue-500/[0.04]'
                      )}
                    >
                      <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', n.bg)}>
                        <n.icon className={cn('h-4 w-4', n.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-xs font-semibold text-white">
                            {n.title}
                          </div>
                          {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-slate-400">{n.desc}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{n.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/5 p-2">
                  <button className="w-full rounded-lg bg-white/5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((v) => !v)
              setNotifOpen(false)
              setQuickOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/5"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/20">
              P
            </div>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-sm font-semibold text-white">PlayBeat Admin</div>
              <div className="text-[11px] text-slate-400">Administrator</div>
            </div>
            <ChevronDown
              className={cn('hidden h-4 w-4 text-slate-400 transition md:block', profileOpen && 'rotate-180')}
            />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 pb-shadow-lg backdrop-blur-xl">
                <div className="border-b border-white/5 p-3">
                  <div className="text-sm font-semibold text-white">PlayBeat Admin</div>
                  <div className="text-[11px] text-slate-400">admin@playbeat.digital</div>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-white/5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    My Profile
                  </button>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-white/5">
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    Account Settings
                  </button>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 transition hover:bg-red-500/5">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
