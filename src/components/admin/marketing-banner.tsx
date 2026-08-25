'use client'

import { Megaphone, ArrowRight, Sparkles } from 'lucide-react'

export function MarketingBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-[#0c1424] via-[#0a1020] to-[#020617] p-6 lg:p-8">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-yellow-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,201,40,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
        {/* Left: text */}
        <div className="min-w-0 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
            <Sparkles className="h-3 w-3" />
            PlayBeat Marketing Tools
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Boost Your Sales with{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              PlayBeat Marketing
            </span>
          </h3>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Create powerful campaigns, grow your audience and increase conversions.
            Everything you need to manage your digital business — all in one powerful dashboard.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105">
            Launch Campaign
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: megaphone illustration */}
        <div className="hidden shrink-0 lg:block">
          <div className="relative grid h-32 w-32 place-items-center rounded-3xl bg-gradient-to-br from-yellow-500/15 to-amber-500/5 backdrop-blur-md">
            <Megaphone className="h-16 w-16 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
            {/* Sound waves */}
            <span className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-end gap-1">
              <span className="h-3 w-1 rounded-full bg-yellow-400/60" />
              <span className="h-5 w-1 rounded-full bg-yellow-400/80" />
              <span className="h-7 w-1 rounded-full bg-yellow-400" />
              <span className="h-4 w-1 rounded-full bg-yellow-400/70" />
            </span>
            <span className="absolute inset-0 -z-10 animate-pulse-soft rounded-3xl bg-yellow-500/20 blur-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
