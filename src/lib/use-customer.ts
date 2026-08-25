'use client'

import { useEffect, useState, useCallback } from 'react'

export interface CustomerUser {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
  avatar?: string | null
  phone?: string | null
  country?: string | null
  address?: string | null
  orders?: number
  totalSpent?: number
  wishlist?: string[]
}

interface UseCustomerResult {
  customer: CustomerUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export function useCustomer(): UseCustomerResult {
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/customer/me', { credentials: 'include' })
      if (!res.ok) {
        setCustomer(null)
        return
      }
      const data = await res.json()
      setCustomer(data?.ok ? data.customer : null)
    } catch {
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    setCustomer(null)
    window.location.href = '/'
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { customer, loading, refresh, logout }
}
