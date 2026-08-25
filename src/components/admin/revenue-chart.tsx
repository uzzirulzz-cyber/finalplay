'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Flame, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'Revenue' | 'Orders' | 'Customers'

interface RevenueChartProps {
  data?: { date: string; value: number }[]
}

const FALLBACK_DATA = [
  { date: 'Aug 08', value: 28000 },
  { date: 'Aug 09', value: 32000 },
  { date: 'Aug 10', value: 30500 },
  { date: 'Aug 11', value: 36000 },
  { date: 'Aug 12', value: 33500 },
  { date: 'Aug 13', value: 39000 },
  { date: 'Aug 14', value: 37800 },
  { date: 'Aug 15', value: 42000 },
  { date: 'Aug 16', value: 40500 },
  { date: 'Aug 17', value: 44000 },
  { date: 'Aug 18', value: 42500 },
  { date: 'Aug 19', value: 45000 },
  { date: 'Aug 20', value: 43200 },
  { date: 'Aug 21', value: 44800 },
]

const TABS: Tab[] = ['Revenue', 'Orders', 'Customers']

export function RevenueChart({ data }: RevenueChartProps) {
  const [active, setActive] = useState<Tab>('Revenue')
  const chartData = useMemo(() => (data && data.length ? data : FALLBACK_DATA), [data])
  const total = useMemo(
    () => chartData.reduce((s, p) => s + (p.value || 0), 0),
    [chartData]
  )

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Revenue & Sales Trend</h3>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
          Last 14 Days
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-1 self-start rounded-xl bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              active === t
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Big metric */}
      <div className="mt-5 flex items-end gap-3">
        <div>
          <div className="font-mono text-3xl font-bold tracking-tight text-white">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-400">
              ↑ +18.4% growth
            </span>
            <span className="text-slate-500">vs last 14 days</span>
          </div>
        </div>
        <div className="ml-auto hidden items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-1.5 text-xs sm:flex">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="text-slate-400">Total</span>
          <span className="font-mono font-semibold text-yellow-400">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
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
              stroke="#facc15"
              strokeWidth={2.5}
              fill="url(#revArea)"
              dot={{ r: 3, fill: '#facc15', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#facc15', stroke: '#0a1020', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
