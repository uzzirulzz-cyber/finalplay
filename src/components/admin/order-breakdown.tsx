'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ChevronDown, CheckCircle2 } from 'lucide-react'

interface BreakdownItem {
  name: string
  value: number
  color: string
}

interface OrderBreakdownProps {
  items?: BreakdownItem[]
  total?: number
}

const FALLBACK = [
  { name: 'Completed', value: 2, color: '#3b82f6' },
  { name: 'Processing', value: 0, color: '#10b981' },
  { name: 'Pending', value: 0, color: '#a855f7' },
]

export function OrderBreakdown({ items = FALLBACK, total }: OrderBreakdownProps) {
  const computedTotal = total ?? items.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Order Breakdown</h3>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
          This Week
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      <div className="relative mx-auto mt-4 h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="donutBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="donutGreen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="donutPurple" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <Pie
              data={items}
              dataKey="value"
              innerRadius={62}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={6}
              startAngle={90}
              endAngle={-270}
            >
              {items.map((entry, i) => {
                const fillId =
                  entry.color === '#3b82f6' ? 'url(#donutBlue)' :
                  entry.color === '#10b981' ? 'url(#donutGreen)' :
                  entry.color === '#a855f7' ? 'url(#donutPurple)' :
                  entry.color
                return (
                  <Cell
                    key={`cell-${i}`}
                    fill={fillId}
                    stroke="transparent"
                    opacity={entry.value > 0 ? 1 : 0.15}
                    style={{
                      filter: entry.value > 0 ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none',
                    }}
                  />
                )
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-4xl font-bold text-white">{computedTotal}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {items.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: d.color,
                  boxShadow: `0 0 6px ${d.color}80`,
                }}
              />
              <span className="text-slate-300">{d.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {d.name === 'Completed' && d.value > 0 && (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              )}
              <span className="font-mono font-semibold text-white">{d.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
