'use client'

import { useEffect, useState } from 'react'
import { Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'Today' | 'Week' | 'Month'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'Today', label: 'Today' },
  { key: 'Week', label: 'This Week' },
  { key: 'Month', label: 'This Month' },
]

// SSR-safe tick hook: starts null on server, sets time after hydration via a scheduled callback.
function useClientClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    // Defer the first tick so setState is not called synchronously inside the effect body.
    const first = setTimeout(tick, 0)
    const interval = setInterval(tick, 1000 * 30)
    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [])
  return now
}

export function WelcomeBanner() {
  const [activeTab, setActiveTab] = useState<TabKey>('Week')
  const now = useClientClock()

  const formattedDate = now
    ? now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  const formattedTime = now
    ? now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '—'

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-900/30 p-5 lg:p-6">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: welcome */}
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300/20 to-amber-500/10 text-2xl">
            👋
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
              Welcome back, PlayBeat Admin!
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
        </div>

        {/* Right: date + tabs */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-yellow-400" />
            <span>
              {formattedDate} {formattedTime} (SGT)
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-white/5 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  activeTab === t.key
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {t.label}
              </button>
            ))}
            <button
              aria-label="Settings"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
