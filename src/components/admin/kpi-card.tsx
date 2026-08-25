'use client'

import { TrendingUp, TrendingDown, AlertTriangle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'revenue' | 'orders' | 'products' | 'lowstock'

interface KpiCardProps {
  title: string
  value: string
  delta?: string
  deltaPositive?: boolean
  subtext?: string
  warning?: boolean
  icon: LucideIcon
  theme: Theme
  spark: number[]
}

const THEME_MAP: Record<
  Theme,
  {
    iconBg: string
    iconColor: string
    glow: string
    spark: string
    sparkFill: string
    border: string
  }
> = {
  revenue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    spark: '#3b82f6',
    sparkFill: 'url(#sparkBlue)',
    border: 'from-blue-500/40 via-blue-500/0 to-blue-500/0',
  },
  orders: {
    iconBg: 'bg-yellow-400/15',
    iconColor: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    spark: '#facc15',
    sparkFill: 'url(#sparkGold)',
    border: 'from-yellow-400/40 via-yellow-400/0 to-yellow-400/0',
  },
  products: {
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    spark: '#a855f7',
    sparkFill: 'url(#sparkPurple)',
    border: 'from-purple-500/40 via-purple-500/0 to-purple-500/0',
  },
  lowstock: {
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    glow: 'shadow-red-500/20',
    spark: '#ef4444',
    sparkFill: 'url(#sparkRed)',
    border: 'from-red-500/40 via-red-500/0 to-red-500/0',
  },
}

export function KpiCard({
  title,
  value,
  delta,
  deltaPositive = true,
  subtext,
  warning,
  icon: Icon,
  theme,
  spark,
}: KpiCardProps) {
  const t = THEME_MAP[theme]

  // Build sparkline path
  const w = 80
  const h = 32
  const max = Math.max(...spark, 1)
  const min = Math.min(...spark, 0)
  const range = max - min || 1
  const points = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const linePath = `M ${points.join(' L ')}`
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition hover:bg-white/[0.06] hover:pb-shadow-lg',
        t.glow
      )}
    >
      {/* Top accent gradient */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r',
          t.border
        )}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Circular icon */}
          <div
            className={cn(
              'relative grid h-12 w-12 shrink-0 place-items-center rounded-full',
              t.iconBg
            )}
          >
            <Icon className={cn('h-5 w-5', t.iconColor)} />
            {/* Pulsing ring */}
            <span
              className={cn('absolute inset-0 rounded-full opacity-50')}
              style={{ boxShadow: `0 0 0 4px ${t.spark}15` }}
            />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {title}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-white">
              {value}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
                deltaPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              )}
            >
              {deltaPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3 rotate-180" />
              )}
              {delta}
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
          {warning && (
            <span className="inline-flex items-center gap-1 text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Needs attention</span>
            </span>
          )}
        </div>

        {/* Sparkline */}
        <svg width={w} height={h} className="opacity-90">
          <defs>
            <linearGradient id={`spark-${theme}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.spark} stopOpacity="0.4" />
              <stop offset="100%" stopColor={t.spark} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#spark-${theme})`} />
          <path
            d={linePath}
            fill="none"
            stroke={t.spark}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 4px ${t.spark}80)` }}
          />
          {/* End dot */}
          <circle
            cx={w}
            cy={h - ((spark[spark.length - 1] - min) / range) * h}
            r="2"
            fill={t.spark}
            style={{ filter: `drop-shadow(0 0 3px ${t.spark})` }}
          />
        </svg>
      </div>
    </div>
  )
}
