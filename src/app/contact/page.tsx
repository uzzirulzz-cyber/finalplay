import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Mail,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Send,
  Home,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — PlayBeat Digital',
  description:
    'Contact PlayBeat Digital for customer support, payment queries, orders, refunds, and service-related assistance.',
}

interface Channel {
  label: string
  handle: string
  href: string
  icon: typeof MessageCircle
  color: string
  bg: string
  note?: string
}

const CHANNELS: Channel[] = [
  {
    label: 'WhatsApp',
    handle: '+92 334 1079333',
    href: 'https://wa.me/923341079333',
    icon: MessageCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    note: 'Fastest response',
  },
  {
    label: 'WhatsApp',
    handle: '+92 319 9980011',
    href: 'https://wa.me/923199980011',
    icon: MessageCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Telegram',
    handle: '@playbeatdigital',
    href: 'https://t.me/playbeatdigital',
    icon: Send,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'WeChat',
    handle: '@playbeatdigital',
    href: '#',
    icon: MessageCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    note: 'Add via WeChat ID',
  },
  {
    label: 'Email',
    handle: 'playbeatdigital@proton.me',
    href: 'mailto:playbeatdigital@proton.me',
    icon: Mail,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    note: 'For official records',
  },
  {
    label: 'Mobile / WhatsApp',
    handle: '0331-8333368',
    href: 'tel:+923318333368',
    icon: Phone,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    label: 'Landline',
    handle: '0992-338830',
    href: 'tel:+92992338830',
    icon: Phone,
    color: 'text-slate-300',
    bg: 'bg-white/5',
  },
  {
    label: 'Website',
    handle: 'playbeat.digital',
    href: 'https://playbeat.digital',
    icon: Globe,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
]

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-[#070b18] text-white">
      {/* Background */}
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#070b18]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Link href="/storefront" className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              <img
                src="/playbeat-logo.png"
                alt="PlayBeat 2"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-sm font-extrabold italic tracking-tight text-transparent">
                  PlayBeat
                </span>
                <span className="rounded bg-yellow-400/20 px-1 text-[10px] font-bold text-yellow-400">
                  2
                </span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Digital Pvt Ltd
              </div>
            </div>
          </Link>
          <Link
            href="/storefront"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
          >
            Back to Store
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-12 lg:px-6 lg:py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/storefront"
            className="flex items-center gap-1 transition hover:text-slate-300"
          >
            <Home className="h-3 w-3" />
            Store
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">Contact</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 text-xs font-medium text-yellow-300">
            <Mail className="h-3.5 w-3.5" />
            Customer Support
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            For customer support, payment-related queries, orders, refunds, and
            service-related assistance, customers can contact PlayBeat Digital
            using any of the channels below. We typically respond within a few
            hours during business hours.
          </p>
        </header>

        {/* Channels grid */}
        <section className="mb-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Direct Channels
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map((c, i) => {
              const Icon = c.icon
              const isLink = c.href !== '#'
              return (
                <a
                  key={`${c.label}-${i}`}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`group flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-yellow-400/30 hover:bg-white/[0.06] ${
                    !isLink ? 'cursor-default' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.bg} ${c.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {isLink && (
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-yellow-400" />
                    )}
                  </div>
                  <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {c.label}
                  </div>
                  <div className="mt-1 font-mono text-base font-semibold text-white">
                    {c.handle}
                  </div>
                  {c.note && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      {c.note}
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        </section>

        {/* Office address */}
        <section className="mb-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Local Office Address
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-white">
                  PlayBeat Digital
                </div>
                <div className="mt-2 text-sm leading-relaxed text-slate-400">
                  House 334, Street 06, Jinnahabad
                  <br />
                  Abbottabad, Khyber Pakhtunkhwa
                  <br />
                  Pakistan · Postal Code: 22010
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/legal"
            className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Legal Documents
                </div>
                <div className="text-xs text-slate-400">
                  Privacy, Terms, Refunds &amp; Service Delivery
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-emerald-400" />
          </Link>

          <Link
            href="/storefront"
            className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-yellow-400/30 hover:bg-yellow-400/[0.04]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Browse Products
                </div>
                <div className="text-xs text-slate-400">
                  Digital gift cards, streaming &amp; more
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-yellow-400" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              PlayBeat Digital Pvt Ltd
            </span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="transition hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/legal/terms" className="transition hover:text-slate-300">
              Terms
            </Link>
            <Link href="/legal/refund" className="transition hover:text-slate-300">
              Refunds
            </Link>
            <Link href="/storefront" className="transition hover:text-slate-300">
              Store
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
