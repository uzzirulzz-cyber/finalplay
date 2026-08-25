'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Zap,
  Truck,
  Clock,
  CheckCircle2,
  Star,
  Heart,
  ArrowRight,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, type CurrencyCode } from '@/lib/currency'
import type { Product } from './product-card'

interface QuickViewModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (v: boolean) => void
  currency: CurrencyCode
  onAddToCart?: (p: Product) => void
  onBuyNow?: (p: Product) => void
  onToggleWishlist?: (p: Product) => void
  isInWishlist?: boolean
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
  currency,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isInWishlist = false,
}: QuickViewModalProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  if (!product) return null

  const gallery = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []
  const currentImage = gallery[imgIndex] || null

  const inStock = product.stock > 0
  const lowStock = inStock && product.stock <= 5
  const soldOut = !inStock

  const compareAt = product.compareAtPrice || product.originalPrice
  const hasDiscount = compareAt && compareAt > product.price
  const discountPct = hasDiscount ? Math.round(((compareAt - product.price) / compareAt) * 100) : 0
  const savings = hasDiscount ? compareAt - product.price : 0

  const deliveryMethod = product.deliveryMethod || (product.digital ? 'instant' : 'shipping')
  const DeliveryIcon = deliveryMethod === 'instant' ? Zap : deliveryMethod === 'shipping' ? Truck : Clock
  const deliveryText = deliveryMethod === 'instant' ? 'Instant Digital Delivery' : deliveryMethod === 'shipping' ? 'Express Shipping' : 'Manual Delivery'

  const rating = product.rating || 0
  const reviewCount = product.reviewCount || 0
  const salesCount = product.salesCount || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-[#0a0e1a]/95 text-white backdrop-blur-xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Image gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50">
              {currentImage && !imgError ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-slate-600">
                  <Tag className="h-12 w-12" />
                </div>
              )}
              {hasDiscount && (
                <div className="absolute right-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                  -{discountPct}%
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-thin">
                {gallery.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={cn(
                      'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition',
                      i === imgIndex ? 'border-blue-500' : 'border-white/10 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category + brand */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-blue-400">
              <span className="font-semibold">{product.category || 'Digital'}</span>
              {product.brand && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{product.brand}</span>
                </>
              )}
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn('h-3.5 w-3.5', i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600')}
                    />
                  ))}
                </div>
                <span className="font-medium text-white">{rating.toFixed(1)}</span>
                <span className="text-slate-500">({reviewCount} reviews)</span>
              </div>
            )}

            {/* Sold */}
            {salesCount > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {salesCount}+ sold
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mt-4 flex items-end gap-3">
              <div className="font-mono text-3xl font-bold text-white">
                {formatPrice(product.price, currency)}
              </div>
              {hasDiscount && (
                <div className="flex flex-col">
                  <span className="font-mono text-sm text-slate-500 line-through">
                    {formatPrice(compareAt, currency)}
                  </span>
                  <span className="text-[10px] font-bold text-red-400">-{discountPct}%</span>
                </div>
              )}
            </div>
            {hasDiscount && savings > 0 && (
              <div className="mt-1 text-xs text-emerald-400">
                You save {formatPrice(savings, currency)}
              </div>
            )}

            {/* Stock */}
            <div className="mt-3">
              {soldOut ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Out of Stock
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-400">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  Only {product.stock} left — Order soon!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Delivery */}
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
              <DeliveryIcon className="h-4 w-4 text-blue-400" />
              <div>
                <div className="font-semibold text-white">{deliveryText}</div>
                <div className="text-[10px] text-slate-400">
                  {product.digital ? 'Digital product — delivered via email' : 'Physical product — ships to your address'}
                </div>
              </div>
            </div>

            {/* SKU */}
            <div className="mt-3 font-mono text-[10px] text-slate-500">
              SKU: {product.sku}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  onAddToCart?.(product)
                  onOpenChange(false)
                }}
                disabled={soldOut}
                variant="outline"
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                onClick={() => {
                  onBuyNow?.(product)
                  onOpenChange(false)
                }}
                disabled={soldOut}
                className="flex-1 bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:brightness-110"
              >
                Buy Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex justify-center">
              <button
                onClick={() => onToggleWishlist?.(product)}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium transition',
                  isInWishlist ? 'text-red-400' : 'text-slate-400 hover:text-white'
                )}
              >
                <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-current')} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
