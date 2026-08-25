'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const search = useSearchParams()
  const redirect = search.get('redirect') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)

  // If already logged in, redirect
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data?.user?.role === 'admin') {
          setAuthed(true)
          window.location.href = redirect
        }
      })
      .catch(() => {})
  }, [redirect])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Login failed.')
        setSubmitting(false)
        return
      }
      // Use hard navigation for reliable redirect after cookie is set
      window.location.href = redirect
    } catch (err) {
      console.error(err)
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting...
        </div>
      </div>
    )
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#070b18] px-4 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-2xl border border-slate-400/20 bg-gradient-to-br from-slate-200/10 via-sky-400/10 to-transparent p-3 shadow-[0_0_36px_rgba(56,189,248,0.18)] backdrop-blur-md">
            <img
              src="/playbeat-logo.png"
              alt="PlayBeat Digital super admin"
              className="h-24 w-auto object-contain drop-shadow-[0_0_16px_rgba(56,189,248,0.45)]"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Welcome to <span className="text-gradient-gold">PlayBeat 2</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md"
        >
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-slate-400">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@playbeat.digital"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-4 space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Hint */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>Authorized admin access only</span>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
          <a href="/storefront" className="transition hover:text-slate-300">
            View Storefront →
          </a>
        </div>
      </div>
    </div>
  )
}
