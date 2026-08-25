'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts'
import { TrendingUp, ChevronDown } from 'lucide-react'

const FALLBACK_DATA = [
  { date: 'Aug 03', value: 15000 },
  { date: 'Aug 04', value: 20000 },
  { date: 'Aug 05', value: 30000 },
  { date: 'Aug 06', value: 25000 },
  { date: 'Aug 07', value: 32000 },
  { date: 'Aug 08', value: 28000 },
  { date: 'Aug 09', value: 38000 },
  { date: 'Aug 10', value: 30000 },
  { date: 'Aug 11', value: 45000 },
  { date: 'Aug 12', value: 42000 },
  { date: 'Aug 13', value: 55000 },
  { date: 'Aug 14', value: 48000 },
  { date: 'Aug 15', value: 60000 },
  { date: 'Aug 16', value: 52000 },
  { date: 'Aug 17', value: 44800 },
]

interface RevenueOverviewProps {
  trend?: { date: string; value: number }[]
  totalRevenue?: number
}

export function RevenueOverview({ trend, totalRevenue }: RevenueOverviewProps) {
  const chartData = trend && trend.length > 0 ? trend : FALLBACK_DATA
  const total = totalRevenue ?? chartData.reduce((s, p) => s + (p.value || 0), 0)
  const lastPoint = chartData[chartData.length - 1]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Revenue Overview</h3>
          <p className="mt-0.5 text-xs text-slate-400">Live 14-Day Performance</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
          14 Days
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {/* Big metric */}
      <div className="mt-5 flex items-end gap-3">
        <div>
          <div className="font-mono text-3xl font-bold tracking-tight text-white">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {total > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                +18.4%
              </span>
            )}
            <span className="text-slate-500">vs previous 14 days</span>
          </div>
        </div>
        {/* Latest endpoint badge */}
        {lastPoint && (
          <div className="ml-auto hidden items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-1.5 text-xs sm:flex">
            <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
            <span className="text-slate-400">{lastPoint.date}</span>
            <span className="font-mono font-bold text-yellow-400">
              ${lastPoint.value.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mt-5 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `${v / 1000}K`}
              width={42}
            />
            <Tooltip
              cursor={{ stroke: '#facc15', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                background: 'rgba(10, 16, 32, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 12px 40px -8px rgba(0,0,0,0.6)',
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#revLine)"
              strokeWidth={2.5}
              fill="url(#revArea)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#facc15',
                stroke: '#0a1020',
                strokeWidth: 2,
                style: { filter: 'drop-shadow(0 0 8px #facc15)' },
              }}
            />
            {/* Highlight final data point */}
            {lastPoint && (
              <ReferenceDot
                x={lastPoint.date}
                y={lastPoint.value}
                r={6}
                fill="#facc15"
                stroke="#0a1020"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
