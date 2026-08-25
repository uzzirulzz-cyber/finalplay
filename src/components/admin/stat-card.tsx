'use client'

import { TrendingUp, type LucideIcon } from 'lucide-react'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import { cn } from '@/lib/utils'

type Theme = 'blue' | 'gold' | 'purple' | 'green'

interface StatCardProps {
  title: string
  value: string
  delta: string
  deltaPositive: boolean
  subtext: string
  icon: LucideIcon
  theme: Theme
  spark: number[]
}

const THEME_MAP: Record<
  Theme,
  { text: string; bg: string; glow: string; spark: string }
> = {
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    glow: 'card-glow-blue',
    spark: '#3b82f6',
  },
  gold: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    glow: 'card-glow-gold',
    spark: '#facc15',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    glow: 'card-glow-purple',
    spark: '#a855f7',
  },
  green: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    glow: 'card-glow-green',
    spark: '#10b981',
  },
}

export function StatCard({
  title,
  value,
  delta,
  deltaPositive,
  subtext,
  icon: Icon,
  theme,
  spark,
}: StatCardProps) {
  const t = THEME_MAP[theme]
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04] p-5 backdrop-blur-md transition hover:bg-white/[0.06]',
        t.glow
      )}
    >
      {/* Top decorative bar */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-[3px]',
          theme === 'blue' && 'bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-blue-500/0',
          theme === 'gold' && 'bg-gradient-to-r from-yellow-500/0 via-yellow-500/80 to-yellow-500/0',
          theme === 'purple' && 'bg-gradient-to-r from-purple-500/0 via-purple-500/80 to-purple-500/0',
          theme === 'green' && 'bg-gradient-to-r from-emerald-500/0 via-emerald-500/80 to-emerald-500/0'
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {title}
          </div>
          <div className="mt-2 font-mono text-3xl font-bold tracking-tight text-white">
            {value}
          </div>
        </div>
        <div
          className={cn(
            'grid h-11 w-11 place-items-center rounded-xl',
            t.bg,
            t.text
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
              deltaPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            <TrendingUp
              className={cn('h-3 w-3', !deltaPositive && 'rotate-180')}
            />
            {delta}
          </span>
          <span className="text-slate-500">{subtext}</span>
        </div>
        <div className="h-8 w-20 opacity-90">
          <Sparklines data={spark} height={32} svgWidth={80}>
            <SparklinesLine
              color={t.spark}
              style={{ fill: 'none', strokeWidth: 1.6 }}
            />
          </Sparklines>
        </div>
      </div>
    </div>
  )
}
