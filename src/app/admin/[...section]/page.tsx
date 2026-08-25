'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  BarChart3,
  CalendarDays,
  Cable,
  FileBarChart,
  KeyRound,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  PackageSearch,
  Puzzle,
  RefreshCw,
  ScrollText,
  Settings2,
  Star,
  Tag,
  Tv,
} from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { useSession } from '@/lib/use-session'

const SECTIONS: Record<string, { title: string; description: string; icon: typeof BarChart3 }> = {
  analytics: { title: 'Analytics & Traffic', description: 'Review traffic and performance once event tracking is connected.', icon: BarChart3 },
  reports: { title: 'Reports', description: 'Generate operational reports from your verified commerce data.', icon: FileBarChart },
  calendar: { title: 'Calendar', description: 'Plan campaigns, fulfillment, and operational events.', icon: CalendarDays },
  licenses: { title: 'Digital License Vault', description: 'Manage issued digital licenses and delivery records securely.', icon: KeyRound },
  subscriptions: { title: 'Subscriptions', description: 'Manage recurring customer products when subscription billing is enabled.', icon: RefreshCw },
  discounts: { title: 'Discounts & Coupons', description: 'Create and manage promotion rules for the storefront.', icon: Tag },
  tickets: { title: 'Support Tickets', description: 'Customer support workflows will appear here when ticket records exist.', icon: MessageCircle },
  reviews: { title: 'Reviews & Feedback', description: 'Moderate customer reviews linked to real products and purchases.', icon: Star },
  iptv: { title: 'IPTV M3U Servers', description: 'Monitor configured IPTV services and their delivery status.', icon: Tv },
  connections: { title: 'Connections', description: 'Review external service connections and integration health.', icon: Cable },
  'service-logs': { title: 'Service Logs', description: 'Inspect service events after logging is enabled for the relevant integration.', icon: ScrollText },
  campaigns: { title: 'Marketing Campaigns', description: 'Create campaigns using connected marketing providers.', icon: Megaphone },
  'email-templates': { title: 'Email Templates', description: 'Manage transactional email templates for configured delivery providers.', icon: Mail },
  integrations: { title: 'Integrations', description: 'Configure and verify third-party services used by PlayBeat Digital.', icon: Puzzle },
}

export default function AdminSectionPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const params = useParams<{ section?: string[] }>()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sectionKey = params.section?.[0] || ''
  const section = useMemo(() => SECTIONS[sectionKey], [sectionKey])

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?redirect=/admin/${sectionKey}`)
  }, [loading, user, router, sectionKey])

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
          Loading admin workspace...
        </div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] px-4 text-center text-slate-300">
        <div>
          <PackageSearch className="mx-auto h-10 w-10 text-slate-500" />
          <h1 className="mt-4 text-xl font-bold text-white">Admin section not found</h1>
          <button onClick={() => router.push('/admin')} className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white">Back to dashboard</button>
        </div>
      </div>
    )
  }

  const Icon = section.icon
  return (
    <div className="relative flex min-h-screen bg-[#070b18] text-foreground">
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-40" />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-[1500px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/10">
                <Icon className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-white">{section.title}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{section.description}</p>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-yellow-200">
                <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <span>This section is available in the admin navigation, but it has no connected records or actions yet. Nothing has been invented or displayed as real data.</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
