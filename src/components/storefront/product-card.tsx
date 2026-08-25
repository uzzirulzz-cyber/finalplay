'use client'

import { useState } from 'react'
import {
  ShoppingCart,
  Zap,
  Truck,
  Clock,
  Heart,
  Eye,
  CheckCircle2,
  Star,
  Layers,
  TrendingUp,
  Flame,
  Sparkles,
  Crown,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, type CurrencyCode } from '@/lib/currency'

export interface Product {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  brand?: string | null
  price: number // USD base (selling price)
  originalPrice?: number | null
  compareAtPrice?: number | null
  currency: string
  originalCurrency?: string | null
  region?: string | null
  stock: number
  status: string
  image?: string | null
  images?: string[]
  digital: boolean
  deliveryMethod?: string | null
  tags: string[]
  rating?: number
  reviewCount?: number
  salesCount?: number
  featured?: boolean
  trending?: boolean
  bestSeller?: boolean
  flashDeal?: boolean
}

interface ProductCardProps {
  product: Product
  currency: CurrencyCode
  onAddToCart?: (p: Product) => void
  onBuyNow?: (p: Product) => void
  onQuickView?: (p: Product) => void
  onToggleWishlist?: (p: Product) => void
  isInWishlist?: boolean
}

export function ProductCard({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  onQuickView,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  const gallery = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []
  const currentImage = gallery[imgIndex] || null

  // Badge logic — only show badges that are actually true
  const badges: { label: string; color: string; bg: string }[] = []
  if (product.bestSeller) badges.push({ label: 'BEST SELLER', color: 'text-yellow-400', bg: 'bg-yellow-400/15 border-yellow-400/30' })
  if (product.flashDeal) badges.push({ label: 'FLASH DEAL', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' })
  if (product.trending) badges.push({ label: 'TRENDING', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' })
  if (product.featured) badges.push({ label: 'FEATURED', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' })

  // Stock status
  const inStock = product.stock > 0
  const lowStock = inStock && product.stock <= 5
  const soldOut = !inStock

  // Discount calculation
  const compareAt = product.compareAtPrice || product.originalPrice
  const hasDiscount = compareAt && compareAt > product.price
  const discountPct = hasDiscount ? Math.round(((compareAt - product.price) / compareAt) * 100) : 0
  const savings = hasDiscount ? compareAt - product.price : 0

  // Delivery indicator
  const deliveryMethod = product.deliveryMethod || (product.digital ? 'instant' : 'shipping')
  const deliveryIcon = deliveryMethod === 'instant' ? Zap : deliveryMethod === 'shipping' ? Truck : Clock
  const deliveryText = deliveryMethod === 'instant' ? 'Instant Digital Delivery' : deliveryMethod === 'shipping' ? 'Express Shipping' : 'Manual Delivery'
  const DeliveryIcon = deliveryIcon

  // Rating
  const rating = product.rating || 0
  const reviewCount = product.reviewCount || 0
  const salesCount = product.salesCount || 0

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] backdrop-blur-md transition-all duration-300',
        'hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10',
        soldOut && 'opacity-75'
      )}
    >
      {/* Image Stage */}
      <div
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-950/50"
        onMouseEnter={() => gallery.length > 1 && setImgIndex(Math.min(1, gallery.length - 1))}
        onMouseLeave={() => setImgIndex(0)}
      >
        {/* Primary image */}
        {currentImage && !imgError ? (
          <img
            src={currentImage}
            alt={`${product.name} — ${product.brand || ''} ${product.category || ''}`.trim()}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5">
                <Tag className="h-7 w-7" />
              </div>
              <span className="text-[10px] uppercase tracking-wider">Image unavailable</span>
            </div>
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {badges.slice(0, 2).map((b) => (
            <span
              key={b.label}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md',
                b.bg,
                b.color
              )}
            >
              {b.label === 'BEST SELLER' && <Crown className="h-2.5 w-2.5" />}
              {b.label === 'FLASH DEAL' && <Flame className="h-2.5 w-2.5" />}
              {b.label === 'TRENDING' && <TrendingUp className="h-2.5 w-2.5" />}
              {b.label === 'FEATURED' && <Sparkles className="h-2.5 w-2.5" />}
              {b.label}
            </span>
          ))}
        </div>

        {/* Top-right wishlist */}
        <button
          onClick={() => onToggleWishlist?.(product)}
          aria-label={`Wishlist ${product.name}`}
          className={cn(
            'absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border backdrop-blur-md transition',
            isInWishlist
              ? 'border-red-500/40 bg-red-500/20 text-red-400'
              : 'border-white/10 bg-black/50 text-slate-300 hover:text-white hover:bg-black/70'
          )}
        >
          <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-current')} />
        </button>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute right-3 bottom-3 z-10 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
            -{discountPct}%
          </div>
        )}

        {/* Quick View overlay (desktop hover) */}
        <button
          onClick={() => onQuickView?.(product)}
          className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/80 py-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-black/90 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        >
          <Eye className="h-3 w-3" />
          Quick View
        </button>

        {/* Image dots (if gallery) */}
        {gallery.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {gallery.slice(0, 4).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition',
                  i === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Verified + category */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-blue-400">
            <Layers className="h-2.5 w-2.5" />
            {product.category || 'Digital'}
          </span>
          {product.region && (
            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-slate-400">
              {product.region}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-white"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
            {product.description}
          </p>
        )}

        {/* Rating + sold */}
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          {rating > 0 ? (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                  )}
                />
              ))}
              <span className="ml-1 font-medium text-slate-300">{rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-slate-500">No ratings</span>
          )}
          {salesCount > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{salesCount}+ sold</span>
            </>
          )}
          {reviewCount > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{reviewCount} reviews</span>
            </>
          )}
        </div>

        {/* Verified purchase indicator */}
        {salesCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Verified Digital</span>
          </div>
        )}

        {/* Stock status */}
        <div className="mt-2">
          {soldOut ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Out of Stock
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-yellow-400">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              Only {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              In Stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2.5 flex items-end gap-2">
          <div className="font-mono text-lg font-bold text-white">
            {formatPrice(product.price, currency)}
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-slate-500 line-through">
                {formatPrice(compareAt, currency)}
              </span>
            </div>
          )}
        </div>

        {/* Savings */}
        {hasDiscount && savings > 0 && (
          <div className="mt-0.5 text-[10px] text-emerald-400">
            Save {formatPrice(savings, currency)} ({discountPct}%)
          </div>
        )}

        {/* Delivery indicator */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <DeliveryIcon className="h-3 w-3 text-blue-400" />
          <span>{deliveryText}</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onAddToCart?.(product)}
            disabled={soldOut}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart className="mx-auto h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
          <button
            onClick={() => onBuyNow?.(product)}
            disabled={soldOut}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  )
}
