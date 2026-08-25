'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Heart, ShoppingCart } from 'lucide-react'
import { useCustomer } from '@/lib/use-customer'
import { ProductCard } from '@/components/storefront/product-card'
import type { CurrencyCode } from '@/lib/currency'

export default function WishlistPage() {
  const { customer, loading } = useCustomer()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !customer) router.replace('/login?redirect=/account/wishlist')
  }, [loading, customer, router])

  useEffect(() => {
    if (!customer) return
    fetch('/api/customer/wishlist', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || [])
        setWishlist((data.products || []).map((p: any) => p.id))
      })
      .finally(() => setLoadingProducts(false))
  }, [customer])

  if (loading || !customer) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050608] text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
        <p className="mt-1 text-sm text-slate-400">{products.length} saved items</p>

        {loadingProducts ? (
          <div className="mt-8 grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 flex flex-col items-center py-16 text-center">
            <Heart className="h-12 w-12 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">Your wishlist is empty</p>
            <a href="/" className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white">Browse Products</a>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                currency="USD" as CurrencyCode
                isInWishlist={wishlist.includes(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
