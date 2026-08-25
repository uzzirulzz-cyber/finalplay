'use client'

import { LayoutDashboard, BarChart3, ShieldCheck, Zap, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    title: 'Modern & Clean UI',
    desc: 'Easy to navigate and visually appealing',
    icon: LayoutDashboard,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Real-time Analytics',
    desc: 'Live data to make better decisions',
    icon: BarChart3,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    title: 'Secure & Reliable',
    desc: 'Enterprise-grade security you can trust',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Performance Focused',
    desc: 'Optimized for speed and efficiency',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
]

export function SmartAdmin() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] via-slate-900/40 to-slate-900/20 p-6 backdrop-blur-md">
      {/* Futuristic glow accents */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

      {/* Grid background overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
        {/* Left: feature list */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Admin Experience
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Smart Admin Experience
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            A modern admin interface designed for performance, security, and clarity —
            built for enterprise digital commerce.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
              >
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${f.bg}`}>
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: futuristic illustration */}
        <div className="relative hidden lg:block">
          <div className="relative grid h-72 place-items-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-blue-950/40">
            {/* Animated rings */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="absolute h-56 w-56 rounded-full border border-blue-500/20" />
              <div className="absolute h-44 w-44 rounded-full border border-cyan-500/20" />
              <div className="absolute h-32 w-32 rounded-full border border-blue-500/30" />
              <div className="absolute h-56 w-56 animate-pulse-soft rounded-full border border-blue-500/10" />
            </div>

            {/* Center admin workstation icon */}
            <div className="relative grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-md">
              <LayoutDashboard className="h-12 w-12 text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s' }}>
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              </div>
            </div>

            {/* Floating accent dots */}
            <span className="absolute right-8 top-8 h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <span className="absolute left-12 bottom-12 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span className="absolute right-16 bottom-16 h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
          </div>
        </div>
      </div>
    </div>
  )
}
