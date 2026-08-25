'use client'

import { Activity, CheckCircle2 } from 'lucide-react'

const SERVICES = [
  { name: 'Web Server', status: 'Operational' },
  { name: 'Database', status: 'Operational' },
  { name: 'Payment Gateway', status: 'Operational' },
  { name: 'Email Service', status: 'Operational' },
]

export function SystemHealth() {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const percent = 100
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white">System Health</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
          All Systems Operational
        </span>
      </div>

      {/* Gauge */}
      <div className="relative mx-auto mt-5 grid h-[150px] w-[150px] place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 150 150">
          <defs>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="url(#healthGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' }}
          />
        </svg>
        <div className="text-center">
          <div className="font-mono text-3xl font-bold text-white">100%</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Healthy
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mt-5 space-y-1.5">
        {SERVICES.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs transition hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-300">{s.name}</span>
            </div>
            <span className="font-medium text-emerald-400">{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
