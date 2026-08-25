'use client'

import { BarChart3, ChevronDown, ArrowRight } from 'lucide-react'

const SOURCES = [
  { name: 'Direct / URL', percent: 52, visits: 1492, color: '#3b82f6' },
  { name: 'TikTok Leads & Pixel', percent: 28, visits: 832, color: '#a855f7' },
  { name: 'Organic Google Search', percent: 14, visits: 481, color: '#10b981' },
  { name: 'Affiliate Referrals', percent: 6, visits: 172, color: '#facc15' },
]

export function TrafficSources() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-purple-400" />
          <h3 className="text-base font-bold text-white">Traffic Sources</h3>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
          This Week
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        {SOURCES.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-white">{s.percent}%</span>
                <span className="text-slate-500">({s.visits.toLocaleString()})</span>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.percent}%`,
                  background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
                  boxShadow: `0 0 12px ${s.color}80`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
        View Full Analytics
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
