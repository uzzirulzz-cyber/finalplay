import Link from 'next/link'
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  FileText,
  Mail,
  ArrowRight,
  Home,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Documents — PlayBeat Digital',
  description:
    'Privacy Policy, Terms & Conditions, Refund Policy, and Service Delivery Policy for PlayBeat Digital.',
}

const POLICIES = [
  {
    href: '/legal/privacy',
    title: 'Privacy Policy',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    description:
      'How we collect, use, and protect your personal information when you use our website and services.',
    date: 'August 25, 2026',
  },
  {
    href: '/legal/terms',
    title: 'Terms & Conditions',
    icon: FileText,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description:
      'The terms and conditions that govern your use of the PlayBeat Digital website and the purchase of our products.',
    date: 'August 25, 2026',
  },
  {
    href: '/legal/refund',
    title: 'Return & Refund Policy',
    icon: RotateCcw,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    description:
      'Refund eligibility, non-refundable situations, and how to submit a refund request for digital products.',
    date: 'August 25, 2026',
  },
  {
    href: '/legal/shipping',
    title: 'Shipping & Service Delivery Policy',
    icon: Truck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    description:
      'How digital products are delivered, expected delivery times, and what happens if delivery fails.',
    date: 'August 25, 2026',
  },
]

export default function LegalIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6 lg:py-16">
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
        <span className="text-slate-400">Legal</span>
      </nav>

      {/* Hero */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Legal Center
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
          Legal Documents &amp; Policies
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          This page lists all official policies that govern your use of the
          PlayBeat Digital website and the products and services we provide.
          Please review these documents carefully before placing an order.
        </p>
      </header>

      {/* Policies grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {POLICIES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-yellow-400/30 hover:bg-white/[0.06]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${p.bg} ${p.color}`}
              >
                <p.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-white">{p.title}</h2>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  Effective: {p.date}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-yellow-400" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {p.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Contact CTA */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-white">
              Have questions about our policies?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Our support team is happy to help with any clarification you need.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
          >
            <Mail className="h-4 w-4" />
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
