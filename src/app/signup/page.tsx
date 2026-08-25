'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Phone, Gift, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#050608] text-slate-400">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get('redirect') || '/account'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false,
  })
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<'signup' | 'verify' | 'done'>('signup')
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Signup failed.')
      }
      setStage('verify')
      setCountdown(60)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const code = verifyCode.join('')
      const res = await fetch('/api/customer/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Verification failed.')
      }
      setStage('done')
      setTimeout(() => {
        window.location.href = redirect
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (countdown > 0) return
    try {
      const res = await fetch('/api/customer/resend-verification', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (data?.ok) {
        setCountdown(60)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050608] px-4 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-2xl bg-white/5 p-2 backdrop-blur-md">
            <img src="/playbeat-logo.png" alt="PlayBeat" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Create Your <span className="text-gradient-gold">PlayBeat</span> Account
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Join 12,000+ customers for instant digital products.
          </p>
        </div>

        {stage === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Field label="Full Name *">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Muhammad Ali"
                  className="input"
                />
              </div>
            </Field>

            <Field label="Email Address *">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>
            </Field>

            <Field label="Phone Number">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 331 8333368"
                  className="input"
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Password *">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input"
                  />
                </div>
              </Field>
              <Field label="Confirm Password *">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="input"
                  />
                </div>
              </Field>
            </div>

            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-[11px] text-slate-400 transition hover:text-white"
            >
              {showPw ? '🙈 Hide passwords' : '👁 Show passwords'}
            </button>

            <Field label="Referral Code (optional)">
              <div className="relative">
                <Gift className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={form.referralCode}
                  onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                  placeholder="PB-FRIEND-2026"
                  className="input"
                />
              </div>
            </Field>

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

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Create Account
            </button>

            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <a href={`/login${redirect !== '/account' ? `?redirect=${redirect}` : ''}`} className="font-medium text-blue-400 hover:underline">
                Sign in
              </a>
            </div>
          </form>
        )}

        {stage === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md">
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-500/15">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold">Verify your email</h2>
              <p className="mt-1 text-xs text-slate-400">
                Enter the 6-digit code sent to <span className="font-semibold text-white">{form.email}</span>
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2">
              {verifyCode.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    const next = [...verifyCode]
                    next[i] = val
                    setVerifyCode(next)
                    if (val && i < 5) {
                      const nextInput = document.getElementById(`code-${i + 1}`)
                      nextInput?.focus()
                    }
                  }}
                  id={`code-${i}`}
                  className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-lg font-bold text-white outline-none focus:border-blue-500/40"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || verifyCode.join('').length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Verify Email
            </button>

            <div className="text-center text-xs text-slate-500">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0}
                className="font-medium text-blue-400 hover:underline disabled:opacity-50"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {stage === 'done' && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold">Email Verified!</h2>
            <p className="mt-1 text-sm text-slate-400">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
          <span>Secured with bcrypt + JWT · Your data is protected</span>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.625rem 0.75rem 0.625rem 2.25rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: all 0.15s;
        }
        :global(.input:focus) {
          border-color: rgba(59, 130, 246, 0.4);
          background: rgba(255, 255, 255, 0.07);
        }
        :global(.input::placeholder) {
          color: rgb(100, 116, 139);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  )
}
