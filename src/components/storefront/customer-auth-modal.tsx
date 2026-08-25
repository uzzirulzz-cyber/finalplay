'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface CustomerAuthModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAuthed?: () => void
  initialMode?: 'login' | 'signup'
}

export function CustomerAuthModal({ open, onOpenChange, onAuthed, initialMode = 'login' }: CustomerAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', referralCode: '', confirmPassword: '', agreeToTerms: false })
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'login') {
        const res = await fetch('/api/customer/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        const data = await res.json()
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Login failed.')
        toast.success(`Welcome back, ${data.customer.name}!`)
        onOpenChange(false)
        onAuthed?.()
      } else {
        // Signup
        const res = await fetch('/api/customer/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Signup failed.')
        if (data.requiresVerification) {
          toast.success('Account created! Please check your email for verification.')
          window.location.href = '/signup'
        } else {
          toast.success('Welcome to PlayBeat!')
          onOpenChange(false)
          onAuthed?.()
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#0a0e1a]/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Full Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Phone (optional)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 ..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Referral code</label>
                <input value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} placeholder="Optional" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Confirm Password</label>
              <input required type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                required
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-slate-400">
                <input type="checkbox" className="h-3.5 w-3.5 accent-blue-500" />
                Remember me
              </label>
              <button type="button" className="text-blue-400 hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <label className="flex items-start gap-2 text-xs text-slate-400">
              <input
                required
                type="checkbox"
                checked={form.agreeToTerms}
                onChange={(e) => setForm({ ...form, agreeToTerms: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-blue-500"
              />
              <span>
                I agree to the{' '}
                <a href="/legal/terms" target="_blank" className="text-blue-400 hover:underline">Terms</a> and{' '}
                <a href="/legal/privacy" target="_blank" className="text-blue-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('signup')} className="font-medium text-blue-400 hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-medium text-blue-400 hover:underline">
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-600">
          By continuing, you agree to PlayBeat Digital&apos;s Terms & Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}
