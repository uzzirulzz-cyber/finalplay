'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Loader2,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Shield,
  Zap,
  Headphones,
  ArrowRight,
  ChevronDown,
  Flame,
  Crown,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  Tag,
  Gift,
  Cpu,
  Package,
  Tv,
  Layers,
  ArrowUpRight,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PremiumNavbar } from './navbar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  formatPrice,
  type CurrencyCode,
  SUPPORTED_CURRENCIES,
} from '@/lib/currency'

interface StoreProduct {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  price: number
  currency: string
  originalPrice?: number | null
  originalCurrency?: string | null
  region?: string | null
  stock: number
  image?: string | null
  tags: string[]
  digital: boolean
}

interface CartItem extends StoreProduct {
  qty: number
}

const CART_STORAGE_KEY = 'pb_cart_v2'
const CURRENCY_STORAGE_KEY = 'pb_currency'

const CATEGORY_META: Record<string, { icon: LucideIcon; accent: string; bg: string; image: string }> = {
  'AI & Productivity': { icon: Sparkles, accent: 'text-blue-400', bg: 'bg-blue-500/10', image: '/assets/images/playbeat/category-ai.png' },
  'Video Editing': { icon: Tv, accent: 'text-purple-400', bg: 'bg-purple-500/10', image: '/assets/images/playbeat/category-software.png' },
  'Email Accounts': { icon: Shield, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', image: '/assets/images/playbeat/category-free-tools.png' },
  'IPTV': { icon: Tv, accent: 'text-red-400', bg: 'bg-red-500/10', image: '/assets/images/playbeat/category-subscriptions.png' },
  'Streaming Accounts': { icon: Play, accent: 'text-red-400', bg: 'bg-red-500/10', image: '/assets/images/playbeat/category-giftcards.png' },
  'Gift Cards': { icon: Gift, accent: 'text-yellow-400', bg: 'bg-yellow-400/10', image: '/assets/images/playbeat/category-giftcards.png' },
  'Smart Projectors': { icon: Tv, accent: 'text-cyan-400', bg: 'bg-cyan-500/10', image: '/assets/images/playbeat/category-projectors.png' },
  // Fallback categories matching the spec
  'Games': { icon: Cpu, accent: 'text-blue-400', bg: 'bg-blue-500/10', image: '/assets/images/playbeat/category-games.png' },
  'Software': { icon: Package, accent: 'text-purple-400', bg: 'bg-purple-500/10', image: '/assets/images/playbeat/category-software.png' },
  'AI Tools': { icon: Sparkles, accent: 'text-blue-400', bg: 'bg-blue-500/10', image: '/assets/images/playbeat/category-ai.png' },
  'Subscriptions': { icon: TrendingUp, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', image: '/assets/images/playbeat/category-subscriptions.png' },
  'Free Tools': { icon: Tag, accent: 'text-cyan-400', bg: 'bg-cyan-500/10', image: '/assets/images/playbeat/category-free-tools.png' },
  'Bundles': { icon: Layers, accent: 'text-yellow-400', bg: 'bg-yellow-400/10', image: '/assets/images/playbeat/category-bundles.png' },
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

// Static premium categories for the landing page (matching the spec)
const LANDING_CATEGORIES = [
  { name: 'Games', desc: 'Game keys & accounts', icon: Cpu, accent: 'text-blue-400', bg: 'bg-blue-500/10', image: '/assets/images/playbeat/category-games.png' },
  { name: 'Software', desc: 'OS & productivity', icon: Package, accent: 'text-purple-400', bg: 'bg-purple-500/10', image: '/assets/images/playbeat/category-software.png' },
  { name: 'AI Tools', desc: 'ChatGPT, Claude & more', icon: Sparkles, accent: 'text-blue-400', bg: 'bg-blue-500/10', image: '/assets/images/playbeat/category-ai.png' },
  { name: 'Subscriptions', desc: 'Streaming & SaaS', icon: TrendingUp, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', image: '/assets/images/playbeat/category-subscriptions.png' },
  { name: 'Gift Cards', desc: 'Digital gift cards', icon: Gift, accent: 'text-yellow-400', bg: 'bg-yellow-400/10', image: '/assets/images/playbeat/category-giftcards.png' },
  { name: 'Smart Projectors', desc: '4K home cinema', icon: Tv, accent: 'text-cyan-400', bg: 'bg-cyan-500/10', image: '/assets/images/playbeat/category-projectors.png' },
  { name: 'Free Tools', desc: 'Free digital utilities', icon: Tag, accent: 'text-cyan-400', bg: 'bg-cyan-500/10', image: '/assets/images/playbeat/category-free-tools.png' },
  { name: 'Bundles', desc: 'Multi-product bundles', icon: Layers, accent: 'text-yellow-400', bg: 'bg-yellow-400/10', image: '/assets/images/playbeat/category-bundles.png' },
]

// Featured product mock data (matching spec — EA FC, PlayStation, Office, Netflix, Steam, Discord)
const FEATURED_PRODUCTS = [
  { name: 'EA FC 25', category: 'Games', price: 3500, originalPrice: 4500, discount: 22, gradient: 'from-blue-600 to-blue-900', accent: '#3b82f6' },
  { name: 'PlayStation Store', category: 'Gift Cards', price: 8900, originalPrice: 9500, discount: 6, gradient: 'from-blue-700 to-indigo-900', accent: '#1769ff' },
  { name: 'Microsoft Office', category: 'Software', price: 4500, originalPrice: 6500, discount: 31, gradient: 'from-orange-500 to-red-700', accent: '#f59e0b' },
  { name: 'Netflix Premium', category: 'Subscriptions', price: 1620, originalPrice: 1999, discount: 19, gradient: 'from-red-600 to-red-900', accent: '#ef4444' },
  { name: 'Steam Wallet', category: 'Gift Cards', price: 5500, originalPrice: 6000, discount: 8, gradient: 'from-slate-700 to-slate-900', accent: '#1e293b' },
  { name: 'Discord Nitro', category: 'Subscriptions', price: 19500, originalPrice: 24000, discount: 19, gradient: 'from-indigo-500 to-purple-800', accent: '#5865f2' },
]

// AI products (matching spec — ChatGPT, Midjourney, Claude, Copilot, Notion, etc.)
const AI_PRODUCTS = [
  { name: 'ChatGPT Plus', desc: '1 Month', price: 7800, gradient: 'from-emerald-600 to-teal-800', accent: '#10b981' },
  { name: 'Midjourney', desc: '1 Month', price: 12000, gradient: 'from-purple-600 to-indigo-800', accent: '#a855f7' },
  { name: 'Claude Pro', desc: '1 Month', price: 15717, gradient: 'from-orange-500 to-amber-700', accent: '#f59e0b' },
  { name: 'GitHub Copilot', desc: '1 Month', price: 1200, gradient: 'from-slate-700 to-slate-900', accent: '#64748b' },
  { name: 'Notion AI', desc: '1 Month', price: 1200, gradient: 'from-slate-600 to-slate-800', accent: '#94a3b8' },
  { name: 'Canva Pro', desc: '1 Month', price: 1500, gradient: 'from-cyan-500 to-blue-700', accent: '#06b6d4' },
  { name: 'Gemini Advanced', desc: '1 Month', price: 2500, gradient: 'from-blue-500 to-purple-700', accent: '#3b82f6' },
  { name: 'Perplexity Pro', desc: '1 Month', price: 2500, gradient: 'from-teal-600 to-cyan-800', accent: '#14b8a6' },
  { name: 'ElevenLabs', desc: '1 Month', price: 500, gradient: 'from-violet-500 to-purple-800', accent: '#8b5cf6' },
  { name: 'Jasper AI', desc: '1 Month', price: 5000, gradient: 'from-purple-500 to-pink-700', accent: '#a855f7' },
]

// Flash deals (matching spec — Windows Pro, ChatGPT Plus, Adobe CC, NordVPN, Spotify)
const FLASH_DEALS = [
  { name: 'Windows 11 Pro', desc: 'Lifetime License', price: 3500, originalPrice: 4025, discount: 13, accent: '#3b82f6', endsIn: '2h 15m' },
  { name: 'ChatGPT Plus', desc: '1 Month', price: 7800, originalPrice: 9500, discount: 18, accent: '#10b981', endsIn: '4h 30m' },
  { name: 'Adobe Creative Cloud', desc: '1 Year', price: 89000, originalPrice: 102000, discount: 13, accent: '#a855f7', endsIn: '1d 6h' },
  { name: 'NordVPN', desc: '12 Months', price: 5200, originalPrice: 6000, discount: 13, accent: '#06b6d4', endsIn: '8h 45m' },
  { name: 'Spotify Premium', desc: '3 Months', price: 4200, originalPrice: 4500, discount: 7, accent: '#22c55e', endsIn: '6h 20m' },
]

// Blog posts
const BLOG_POSTS = [
  { title: '10 AI Productivity Tools That Will Transform Your Workflow in 2026', category: 'AI Tools', readTime: '8 min read', image: '/assets/images/playbeat/blog-ai-tools.png' },
  { title: 'The Complete Guide to Digital Subscriptions for Modern Professionals', category: 'Subscriptions', readTime: '12 min read', image: '/assets/images/playbeat/blog-subscriptions.png' },
  { title: 'Essential Software Every Creator Needs in Their Toolkit', category: 'Software', readTime: '10 min read', image: '/assets/images/playbeat/blog-software.png' },
]

export function Storefront() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; total: number } | null>(null)
  const [currency, setCurrency] = useState<CurrencyCode>('PKR')
  const [showAllProducts, setShowAllProducts] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null
      if (saved && SUPPORTED_CURRENCIES.includes(saved)) setCurrency(saved)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
    } catch {
      // ignore
    }
  }, [currency])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`/api/storefront/products?${params}`)
      const data = await res.json()
      if (data?.ok) {
        setProducts(data.data || [])
        setCategories(data.categories || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (raw) setCart(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart])

  const cartTotalUSD = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  function addToCart(p: StoreProduct) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id)
      if (existing) {
        return prev.map((c) =>
          c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stock) } : c
        )
      }
      return [...prev, { ...p, qty: 1 }]
    })
    toast.success(`${p.name.slice(0, 40)}${p.name.length > 40 ? '...' : ''} added to cart`)
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c
          const next = Math.max(0, Math.min(c.qty + delta, c.stock))
          return { ...c, qty: next }
        })
        .filter((c) => c.qty > 0)
    )
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleCheckout(name: string, email: string) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email || null,
          items: cart.map((c) => ({ productId: c.id, qty: c.qty })),
          paymentMethod: 'Card',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Checkout failed')
      }
      setConfirmation(data.data)
      setCart([])
      setCheckoutOpen(false)
      toast.success('Order placed successfully!')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Checkout failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const displayedProducts = showAllProducts ? products : products.slice(0, 8)

  return (
    <div className="relative min-h-screen bg-[#050608] text-slate-200">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <PremiumNavbar
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onSearchChange={setSearch}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:px-6 lg:py-20">
          {/* Left: headline + CTA */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Verified Digital Marketplace · Instant Key Dispatch
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Gateway to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
                Worldwide Digital
              </span>{' '}
              Subscriptions
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400 lg:text-lg">
              Premium digital keys, verified subscriptions, AI tools, IPTV access & gift cards —
              backed by 24/7 automated delivery and buyer protection.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Browse Categories
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['from-blue-500 to-blue-700', 'from-violet-500 to-violet-700', 'from-emerald-500 to-emerald-700', 'from-yellow-400 to-amber-600'].map((g, i) => (
                    <div key={i} className={cn('grid h-7 w-7 place-items-center rounded-full border-2 border-[#050608] bg-gradient-to-br text-[10px] font-bold text-white', g)}>
                      {['P', 'D', 'A', 'S'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-white">12,000+ customers</div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                    <span className="ml-1 text-slate-500">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-blue-500/10">
              <img
                src="/assets/images/playbeat/hero-marketplace.png"
                alt="PlayBeat Digital Marketplace"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Floating stat cards */}
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-white/10 bg-[#0f172a]/90 p-3 backdrop-blur-md sm:block">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15">
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Instant Delivery</div>
                  <div className="text-[10px] text-slate-400">24/7 automated</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 hidden rounded-xl border border-white/10 bg-[#0f172a]/90 p-3 backdrop-blur-md sm:block">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/15">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Buyer Protection</div>
                  <div className="text-[10px] text-slate-400">100% secure</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative border-t border-white/5 bg-[#070a10]/50">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4 lg:px-6">
            {[
              { icon: Zap, title: 'Instant Delivery', desc: 'Automated 24/7 key dispatch', color: 'text-blue-400' },
              { icon: Shield, title: 'Buyer Protection', desc: 'Verified authentic products', color: 'text-emerald-400' },
              { icon: Globe, title: 'Global Coverage', desc: '200+ countries served', color: 'text-violet-400' },
              { icon: Headphones, title: '24/7 Concierge', desc: 'WhatsApp & Telegram support', color: 'text-cyan-400' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <div key={t.title} className="flex items-center gap-3">
                  <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5', t.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400">{t.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16" id="categories">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Layers className="h-3 w-3" />
            Curated Collections
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Explore our premium digital product collections
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {LANDING_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <a
                key={cat.name}
                href="#products"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/30 hover:bg-white/[0.06]"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
                  <div className={cn('absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-lg backdrop-blur-md', cat.bg)}>
                    <Icon className={cn('h-4 w-4', cat.accent)} />
                  </div>
                </div>
                <div className="text-sm font-bold text-white">{cat.name}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{cat.desc}</div>
              </a>
            )
          })}
        </div>
      </section>

      {/* Deal of the Day Banner */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20">
          <img
            src="/assets/images/playbeat/deal-creative-cloud.png"
            alt="Adobe Creative Cloud Deal"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/80 to-transparent" />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
                <Clock className="h-3 w-3" />
                Deal of the Day
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
                Adobe Creative Cloud
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-300">
                Full All-Apps subscription. 1-year access to Photoshop, Illustrator, Premiere Pro & 20+ creative apps.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-mono text-3xl font-bold text-white">Rs 89,000</span>
                <span className="font-mono text-lg text-slate-500 line-through">Rs 102,000</span>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-bold text-violet-300">-13%</span>
              </div>
              {/* Countdown */}
              <div className="mt-4 flex items-center gap-2">
                {[
                  { label: 'Days', value: '01' },
                  { label: 'Hours', value: '06' },
                  { label: 'Mins', value: '42' },
                  { label: 'Secs', value: '18' },
                ].map((t) => (
                  <div key={t.label} className="rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-center backdrop-blur-md">
                    <div className="font-mono text-lg font-bold text-white">{t.value}</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">{t.label}</div>
                  </div>
                ))}
              </div>
              <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110">
                Grab the Deal
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
              <Flame className="h-3 w-3 animate-pulse-soft" />
              Flash Deals
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
              Limited-Time Offers
            </h2>
          </div>
          <a href="#products" className="hidden items-center gap-1 text-sm font-medium text-blue-400 transition hover:text-blue-300 sm:flex">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {FLASH_DEALS.map((d) => (
            <div
              key={d.name}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-4 transition hover:border-blue-500/30"
            >
              {/* Discount badge */}
              <div className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                -{d.discount}%
              </div>
              {/* Countdown */}
              <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium text-orange-400 backdrop-blur-md">
                <Clock className="h-2.5 w-2.5" />
                {d.endsIn}
              </div>

              {/* Product visual */}
              <div className="relative mb-3 grid aspect-square place-items-center overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at center, ${d.accent}30, transparent 70%)` }}>
                <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: `linear-gradient(135deg, ${d.accent}, ${d.accent}80)` }}>
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-xs font-bold text-white">{d.name}</div>
              <div className="text-[10px] text-slate-400">{d.desc}</div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-mono text-sm font-bold text-white">Rs {d.price.toLocaleString()}</span>
                <span className="font-mono text-[10px] text-slate-500 line-through">Rs {d.originalPrice.toLocaleString()}</span>
              </div>
              <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 py-1.5 text-[10px] font-bold text-white transition hover:brightness-110">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6" id="products">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
              <Crown className="h-3 w-3" />
              Featured Products
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
              Premium Digital Products
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {loading ? 'Loading...' : `${products.length} verified products available`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid h-64 place-items-center text-sm text-slate-400">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-400" />
            Loading products...
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="grid h-64 place-items-center text-sm text-slate-400">
            No products found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedProducts.map((p) => {
                const meta = CATEGORY_META[p.category || ''] || { icon: Tag, accent: 'text-slate-400', bg: 'bg-white/5' }
                const Icon = meta.icon
                const showOriginal = p.originalCurrency && p.originalCurrency !== 'USD'
                return (
                  <article
                    key={p.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-blue-500/30 hover:bg-white/[0.06]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <div className={cn('grid h-16 w-16 place-items-center rounded-2xl', meta.bg)}>
                            <Icon className={cn('h-7 w-7', meta.accent)} />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-60" />
                      {p.digital && (
                        <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                          <Zap className="h-2.5 w-2.5" />
                          Instant Key
                        </span>
                      )}
                      {p.region && (
                        <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-blue-400 backdrop-blur-md">
                          {p.region}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className={cn('flex items-center gap-1', meta.accent)}>
                          <Icon className="h-2.5 w-2.5" />
                          <span className="uppercase tracking-wider">{p.category || 'Digital'}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-slate-400">
                          <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white" title={p.name}>
                        {p.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">{p.sku}</span>
                        <span className={cn(p.stock > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {p.stock > 0 ? 'In stock' : 'Sold out'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="font-mono text-lg font-bold text-white">
                            {formatPrice(p.price, currency)}
                          </div>
                          {showOriginal && (
                            <div className="text-[10px] text-slate-500">
                              Source: {p.originalCurrency} {p.originalPrice?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:opacity-40"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
            {!showAllProducts && products.length > 8 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAllProducts(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  View All {products.length} Products
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Smart Projectors Section */}
      <SmartProjectorsSection products={products.filter((p) => p.category === 'Smart Projectors')} />

      {/* AI Tools Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <Sparkles className="h-3 w-3" />
            AI Marketplace
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            Premium AI Tools
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Verified subscriptions for the world's leading AI platforms
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {AI_PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-500/30"
            >
              <div className="relative mb-3 grid aspect-square place-items-center overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at center, ${p.accent}25, transparent 70%)` }}>
                <div className={cn('grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br', p.gradient)}>
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="text-xs font-bold text-white">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.desc}</div>
              <div className="mt-2 font-mono text-sm font-bold text-cyan-400">
                Rs {p.price.toLocaleString()}
              </div>
              <button className="mt-3 w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-1.5 text-[10px] font-bold text-cyan-300 transition hover:bg-cyan-500/20">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
              <Tag className="h-3 w-3" />
              Latest Insights
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
              From the Blog
            </h2>
          </div>
          <a href="#" className="hidden items-center gap-1 text-sm font-medium text-blue-400 transition hover:text-blue-300 sm:flex">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.title}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-blue-500/30"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 backdrop-blur-md">
                  {post.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-white transition group-hover:text-blue-300">
                  {post.title}
                </h3>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-400">
                  Read More
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-transparent p-8 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
              Join 12,000+ customers who trust PlayBeat Digital for instant digital products,
              verified subscriptions, and 24/7 automated delivery.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030406]">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                  <img src="/playbeat-logo.png" alt="PlayBeat" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-extrabold text-white">PlayBeat</span>
                    <span className="rounded bg-blue-500/20 px-1 text-[10px] font-bold text-blue-400">2</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Digital Marketplace
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Your gateway to worldwide digital subscriptions & products. Premium keys, verified accounts,
                and 24/7 automated delivery with buyer protection.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Legal</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li><Link href="/legal/privacy" className="transition hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="transition hover:text-blue-400">Terms &amp; Conditions</Link></li>
                <li><Link href="/legal/refund" className="transition hover:text-blue-400">Return &amp; Refund Policy</Link></li>
                <li><Link href="/legal/shipping" className="transition hover:text-blue-400">Shipping &amp; Delivery</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Support</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li><Link href="/contact" className="transition hover:text-blue-400">Contact Us</Link></li>
                <li><a href="https://wa.me/923341079333" target="_blank" rel="noopener noreferrer" className="transition hover:text-blue-400">WhatsApp Concierge</a></li>
                <li><a href="https://t.me/playbeatdigital" target="_blank" rel="noopener noreferrer" className="transition hover:text-blue-400">Telegram Support</a></li>
                <li><a href="mailto:playbeatdigital@proton.me" className="transition hover:text-blue-400">playbeatdigital@proton.me</a></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Address</div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                House 334, Street 06, Jinnahabad<br />
                Abbottabad, Khyber Pakhtunkhwa<br />
                Pakistan · Postal Code: 22010
              </p>
              <p className="mt-2 text-xs text-slate-400">
                <span className="text-slate-300">Mobile:</span> 0331-8333368<br />
                <span className="text-slate-300">Landline:</span> 0992-338830
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
            <div>
              <span className="font-semibold text-slate-300">PlayBeat Digital Pvt Ltd</span> © 2026 · All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-400">SSL SECURED</span>
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-400">VERIFIED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        currency={currency}
        totalUSD={cartTotalUSD}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />

      {/* Checkout */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        totalUSD={cartTotalUSD}
        currency={currency}
        submitting={submitting}
        onCheckout={handleCheckout}
      />

      {/* Confirmation */}
      <Dialog open={!!confirmation} onOpenChange={(v) => !v && setConfirmation(null)}>
        <DialogContent className="border-emerald-500/30 bg-[#0f172a]/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Order Placed!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Your order has been received and is now pending. You&apos;ll receive your digital products via email shortly.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Order Number</span>
              <span className="font-mono font-bold text-blue-400">{confirmation?.orderNumber}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Total (USD)</span>
              <span className="font-mono font-bold text-white">$ {confirmation?.total.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setConfirmation(null)} className="bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:brightness-110">
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Smart Projectors section — displays real projector products with images
function SmartProjectorsSection({ products }: { products: StoreProduct[] }) {
  const [showAll, setShowAll] = useState(false)
  const display = showAll ? products : products.slice(0, 8)
  if (products.length === 0) return null

  return (
    <section id="projectors" className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <Tv className="h-3 w-3" />
            Flagship Hardware
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
            4K Smart Projectors
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {products.length} premium projectors · Magcubic, Zerobyte, XNANO & more
          </p>
        </div>
        {products.length > 8 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="hidden items-center gap-1 text-sm font-medium text-cyan-400 transition hover:text-cyan-300 sm:flex"
          >
            {showAll ? 'Show Less' : `View All ${products.length}`}
            <ArrowRight className={cn('h-3.5 w-3.5 transition', showAll && 'rotate-180')} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {display.map((p) => {
          const showOriginal = p.originalCurrency && p.originalCurrency !== 'USD'
          const isSoldOut = p.stock <= 0
          return (
            <article
              key={p.id}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition',
                isSoldOut ? 'opacity-70' : 'hover:border-cyan-500/30 hover:bg-white/[0.06]'
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-500/10">
                      <Tv className="h-7 w-7 text-cyan-400" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-60" />
                <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 backdrop-blur-md">
                  <Tv className="h-2.5 w-2.5" />
                  4K Projector
                </span>
                {isSoldOut && (
                  <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    Sold Out
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white" title={p.name}>
                  {p.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-400" title={p.description}>
                  {p.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">{p.sku}</span>
                  <span className="text-cyan-400">{p.region}</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-lg font-bold text-white">
                      {formatPrice(p.price, (typeof window !== 'undefined' ? localStorage.getItem('pb_currency') : null) as CurrencyCode || 'PKR')}
                    </div>
                    {showOriginal && (
                      <div className="text-[10px] text-slate-500">
                        Original: {p.originalCurrency} {p.originalPrice?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  disabled={isSoldOut}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {isSoldOut ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {products.length > 8 && (
        <div className="mt-6 text-center sm:hidden">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200"
          >
            {showAll ? 'Show Less' : `View All ${products.length}`}
            <ArrowRight className={cn('h-4 w-4', showAll && 'rotate-180')} />
          </button>
        </div>
      )}
    </section>
  )
}

function CartDrawer({ open, onOpenChange, cart, currency, totalUSD, onUpdateQty, onRemove, onCheckout }: {
  open: boolean; onOpenChange: (v: boolean) => void; cart: CartItem[]; currency: CurrencyCode
  totalUSD: number; onUpdateQty: (id: string, delta: number) => void; onRemove: (id: string) => void; onCheckout: () => void
}) {
  return (
    <div className={cn('fixed inset-0 z-50 transition', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      <div className={cn('absolute inset-0 bg-black/70 backdrop-blur-sm transition', open ? 'opacity-100' : 'opacity-0')} onClick={() => onOpenChange(false)} />
      <aside className={cn('absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0e1a] transition-transform duration-300', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <ShoppingCart className="h-5 w-5 text-blue-400" />
            Your Cart ({cart.length})
          </h3>
          <button onClick={() => onOpenChange(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-sm text-slate-400">
              <div>
                <ShoppingCart className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-2">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5 text-[10px] font-mono font-bold text-slate-300">
                    {c.sku.slice(0, 6)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-medium text-white" title={c.name}>{c.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-blue-400">{formatPrice(c.price, currency)} × {c.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQty(c.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-mono text-white">{c.qty}</span>
                    <button onClick={() => onUpdateQty(c.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => onRemove(c.id)} className="grid h-8 w-8 place-items-center rounded-lg text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Total ({currency})</span>
              <span className="font-mono text-xl font-bold text-white">{formatPrice(totalUSD, currency)}</span>
            </div>
            <button onClick={onCheckout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function CheckoutDialog({ open, onOpenChange, totalUSD, currency, submitting, onCheckout }: {
  open: boolean; onOpenChange: (v: boolean) => void; totalUSD: number; currency: CurrencyCode
  submitting: boolean; onCheckout: (name: string, email: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#0f172a]/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Checkout</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onCheckout(name, email) }} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Full Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/40" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Email (optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/40" />
            <p className="text-[11px] text-slate-500">We&apos;ll send your digital products to this email.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total ({currency})</span>
              <span className="font-mono text-lg font-bold text-white">{formatPrice(totalUSD, currency)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300 hover:bg-white/5 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:brightness-110">
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Processing...</>) : (<>Place Order · {formatPrice(totalUSD, currency)}</>)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
