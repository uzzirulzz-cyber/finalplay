'use client'

import { Rocket, ArrowRight, Play } from 'lucide-react'

export function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-[#0c1424] via-[#0a1020] to-[#020617] p-5">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-yellow-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 to-amber-500">
              <Play className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
            </div>
            <span className="text-sm font-bold text-white">playbeat</span>
          </div>
          <h3 className="mt-3 text-base font-bold leading-tight text-white lg:text-lg">
            Boost Your Sales with{' '}
            <span className="text-gradient-gold">PlayBeat Tools!</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Launch AI-powered campaigns, automate upsells, and convert visitors
            into loyal customers.
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105">
            Launch Campaign
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="hidden shrink-0 lg:block">
          <div className="relative grid h-24 w-24 place-items-center rounded-2xl bg-white/[0.03]">
            <Rocket className="h-12 w-12 text-yellow-400" />
            <span className="absolute inset-0 -z-10 animate-pulse-soft rounded-2xl bg-yellow-500/20 blur-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
