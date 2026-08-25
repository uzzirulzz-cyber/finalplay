'use client'

import { useState } from 'react'
import { Calendar, Download, RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const RANGES = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'] as const
type Range = (typeof RANGES)[number]

interface WelcomeSectionProps {
  onRefresh?: () => void
  refreshing?: boolean
}

export function WelcomeSection({ onRefresh, refreshing }: WelcomeSectionProps) {
  const [range, setRange] = useState<Range>('This Week')
  const [open, setOpen] = useState(false)

  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-slate-900/10 p-5 lg:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: welcome */}
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300/20 to-amber-500/10 text-2xl shadow-lg shadow-yellow-500/10">
            👋
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
              Welcome back, PlayBeat Admin!
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Here&apos;s what&apos;s happening with your business today.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3 w-3 text-yellow-400" />
              <span>
                {formattedDate} · {formattedTime} (PKT)
              </span>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              {range}
              <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition', open && 'rotate-180')} />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 pb-shadow-lg backdrop-blur-xl">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRange(r)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-white/5',
                        range === r ? 'text-blue-400' : 'text-slate-300'
                      )}
                    >
                      {r}
                      {range === r && <CheckIcon />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export */}
          <button
            onClick={() => {}}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Refresh (gold) */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105 disabled:opacity-60"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
