'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Package,
  CreditCard,
  KeyRound,
  Settings,
  LogOut,
  LifeBuoy,
  Zap,
  Cpu,
  Tv,
  Gift,
  Sparkles,
  TrendingUp,
  Server,
  Megaphone,
  Layers,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomer } from '@/lib/use-customer'
import { CustomerAuthModal } from './customer-auth-modal'

interface NavbarProps {
  cartCount: number
  onCartClick: () => void
  onSearchChange?: (q: string) => void
}

interface NavLink {
  label: string
  href?: string
  icon?: LucideIcon
  children?: { label: string; href: string; desc?: string }[]
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Gaming',
    icon: Cpu,
    children: [
      { label: 'Game Keys', href: '/?category=Games', desc: 'Steam, EA, PlayStation' },
      { label: 'Game Accounts', href: '/?category=Games', desc: 'Pre-leveled accounts' },
      { label: 'In-Game Currency', href: '/?category=Games', desc: 'Top-up & currency' },
    ],
  },
  {
    label: 'Software',
    icon: Package,
    children: [
      { label: 'Operating Systems', href: '/?category=Software', desc: 'Windows 11 Pro' },
      { label: 'Office Suites', href: '/?category=Software', desc: 'Microsoft Office' },
      { label: 'Antivirus', href: '/?category=Software', desc: 'NordVPN & security' },
    ],
  },
  {
    label: 'Streaming',
    icon: Tv,
    children: [
      { label: 'Netflix', href: '/?category=Streaming+Accounts', desc: '4K UHD Premium' },
      { label: 'Spotify', href: '/?category=Streaming+Accounts', desc: 'Premium music' },
      { label: 'Disney+', href: '/?category=Streaming+Accounts', desc: 'Family plans' },
    ],
  },
  {
    label: 'Gift Cards',
    icon: Gift,
    children: [
      { label: 'NFLX Gift Cards', href: '/?category=Gift+Cards', desc: 'USD, EUR, GBP' },
      { label: 'Spotify Cards', href: '/?category=Gift+Cards', desc: 'Various regions' },
      { label: 'Google Play', href: '/?category=Gift+Cards', desc: 'US, UK, EU' },
    ],
  },
  {
    label: 'AI Tools',
    icon: Sparkles,
    children: [
      { label: 'ChatGPT Plus', href: '/?category=AI+%26+Productivity', desc: '1 month' },
      { label: 'Claude Pro', href: '/?category=AI+%26+Productivity', desc: 'Anthropic' },
      { label: 'Midjourney', href: '/?category=AI+%26+Productivity', desc: 'AI image gen' },
    ],
  },
  {
    label: 'Web Hosting',
    icon: Server,
    children: [
      { label: 'Shared Hosting', href: '/?category=Software', desc: 'cPanel hosting' },
      { label: 'VPS', href: '/?category=Software', desc: 'Virtual servers' },
      { label: 'Domains', href: '/?category=Software', desc: 'Register & transfer' },
    ],
  },
  {
    label: 'Services',
    icon: Layers,
    children: [
      { label: 'Web Design', href: '/contact', desc: 'Custom websites' },
      { label: 'Digital Marketing', href: '/contact', desc: 'SEO & ads' },
      { label: 'Web3', href: '/contact', desc: 'Blockchain services' },
    ],
  },
  { label: 'Deals', href: '/#flash-deals' },
]

export function PremiumNavbar({ cartCount, onCartClick, onSearchChange }: NavbarProps) {
  const { customer, loading, logout } = useCustomer()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-30 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[11px] font-medium lg:text-xs">
          <Zap className="h-3 w-3 shrink-0 animate-pulse-soft" />
          <span>
            <span className="font-bold">FLASH SALE</span> — Get 15% OFF with code{' '}
            <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono font-bold">PLAYBEAT15</span> · Instant 24/7 Delivery
          </span>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-30 border-b transition-all duration-300',
          scrolled
            ? 'border-white/10 bg-[#050608]/95 backdrop-blur-xl shadow-lg shadow-black/20'
            : 'border-transparent bg-[#050608]/70 backdrop-blur-md'
        )}
      >
        <div className={cn('mx-auto flex max-w-7xl items-center justify-between px-4 transition-all lg:px-6', scrolled ? 'h-14' : 'h-16')}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-lg shadow-blue-500/20">
              <img src="/playbeat-logo.png" alt="PlayBeat" className="h-7 w-7 object-contain" />
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="flex items-center gap-1">
                <span className="text-sm font-extrabold tracking-tight text-white">PlayBeat</span>
                <span className="rounded bg-blue-500/20 px-1 text-[9px] font-bold text-blue-400">2</span>
              </div>
              <div className="text-[8px] uppercase tracking-[0.2em] text-slate-500">
                Digital Marketplace
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setOpenMenu(link.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {link.href ? (
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                    {link.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                )}

                {/* Mega menu */}
                {link.children && openMenu === link.label && (
                  <div className="absolute left-0 top-full z-50 w-64 pt-2">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0e1a]/95 shadow-2xl backdrop-blur-xl">
                      <div className="p-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 transition hover:bg-white/5"
                          >
                            <div className="text-xs font-semibold text-white">{child.label}</div>
                            {child.desc && (
                              <div className="mt-0.5 text-[10px] text-slate-400">{child.desc}</div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth / Profile */}
            {loading ? (
              <div className="ml-1 h-8 w-8 animate-pulse rounded-full bg-white/10" />
            ) : customer ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-white/5"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium text-white sm:inline">
                    {customer.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn('hidden h-3 w-3 text-slate-400 transition sm:block', profileOpen && 'rotate-180')} />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0a0e1a]/95 shadow-2xl backdrop-blur-xl">
                      <div className="border-b border-white/5 p-3">
                        <div className="text-sm font-semibold text-white">{customer.name}</div>
                        <div className="truncate text-[11px] text-slate-400">{customer.email}</div>
                        {customer.role === 'vip' && (
                          <span className="mt-1 inline-block rounded-full bg-yellow-400/15 px-2 py-0.5 text-[9px] font-bold text-yellow-400">
                            ⭐ VIP MEMBER
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <User className="h-3.5 w-3.5 text-slate-400" /> My Profile
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <Package className="h-3.5 w-3.5 text-slate-400" /> My Orders
                        </Link>
                        <Link href="/account/wishlist" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <Heart className="h-3.5 w-3.5 text-slate-400" /> Wishlist
                        </Link>
                        <Link href="/account/licenses" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <KeyRound className="h-3.5 w-3.5 text-slate-400" /> Digital Licenses
                        </Link>
                        <Link href="/account/notifications" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <Bell className="h-3.5 w-3.5 text-slate-400" /> Notifications
                        </Link>
                        <Link href="/account/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <Settings className="h-3.5 w-3.5 text-slate-400" /> Account Settings
                        </Link>
                        <Link href="/contact" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                          <LifeBuoy className="h-3.5 w-3.5 text-slate-400" /> Support
                        </Link>
                      </div>
                      <div className="border-t border-white/5 py-1">
                        <button
                          onClick={() => {
                            setProfileOpen(false)
                            logout()
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/5"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setAuthOpen(true) }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setAuthOpen(true) }}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-[#050608]/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 lg:px-6">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  onSearchChange?.(e.target.value)
                }}
                placeholder="Search for products, brands, categories..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-[#0a0e1a]">
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-2">
                <img src="/playbeat-logo.png" alt="PlayBeat" className="h-7 w-auto" />
                <span className="text-sm font-bold text-white">PlayBeat</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="scrollbar-thin flex-1 overflow-y-auto p-2">
              {NAV_LINKS.map((link) => (
                <div key={link.label} className="mb-1">
                  {link.href ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {link.label}
                      </div>
                      {link.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-2 pl-6 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </nav>
            {customer && (
              <div className="border-t border-white/5 p-3">
                <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{customer.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{customer.email}</div>
                  </div>
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}

      <CustomerAuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </>
  )
}
