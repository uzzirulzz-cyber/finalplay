'use client'

import { useEffect, useState, useCallback } from 'react'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
}

interface UseSessionResult {
  user: AdminUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      setUser(data?.ok ? data.user : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    setUser(null)
    window.location.href = '/login'
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { user, loading, refresh, logout }
}
