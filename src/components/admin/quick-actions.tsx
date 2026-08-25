'use client'

import {
  Package,
  ShoppingCart,
  FileBarChart,
  Users,
  Tag,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  desc: string
  icon: LucideIcon
  color: string
  bg: string
  glow: string
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Add Product',
    desc: 'Add new SKU',
    icon: Package,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    label: 'Create Order',
    desc: 'Manual order',
    icon: ShoppingCart,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    label: 'View Reports',
    desc: 'Analytics',
    icon: FileBarChart,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    label: 'Manage Users',
    desc: 'Staff accounts',
    icon: Users,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    glow: 'group-hover:shadow-yellow-500/20',
  },
  {
    label: 'Discounts',
    desc: 'Coupons & promos',
    icon: Tag,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    label: 'Settings',
    desc: 'System config',
    icon: Settings,
    color: 'text-slate-300',
    bg: 'bg-white/5',
    glow: 'group-hover:shadow-slate-500/20',
  },
]

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Quick Actions &amp; Shortcuts</h3>
          <p className="mt-0.5 text-xs text-slate-400">Common tasks, one click away</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            className={cn(
              'group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/[0.06] hover:pb-shadow-lg',
              a.glow
            )}
          >
            <div
              className={cn(
                'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition group-hover:scale-110',
                a.bg
              )}
            >
              <a.icon className={cn('h-5 w-5', a.color)} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">{a.label}</div>
              <div className="truncate text-[10px] text-slate-500">{a.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
