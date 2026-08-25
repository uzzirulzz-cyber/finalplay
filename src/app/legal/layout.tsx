import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-pb-silver">
      {/* Background */}
      <div className="pb-grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-pb-gold/10 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-pb-line bg-[#0A0A0A]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              <img
                src="/playbeat-logo.png"
                alt="PlayBeat 2"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold tracking-tight text-white">PlayBeat</span>
                <span className="rounded bg-pb-gold/20 px-1 text-[10px] font-bold text-pb-gold">2</span>
                <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-pb-emerald/20 bg-pb-emerald/5 px-1.5 py-0.5 text-[9px] font-medium text-pb-emerald">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Legal
                </span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-pb-silver-3">
                Digital Marketplace
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/legal"
              className="hidden items-center gap-1.5 rounded-xl border border-pb-line bg-pb-charcoal px-3 py-2 text-xs font-medium text-pb-silver-2 transition hover:bg-pb-charcoal-2 sm:flex"
            >
              All Policies
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-pb-gradient-gold px-3.5 py-2 text-xs font-bold text-pb-ink shadow-lg shadow-pb-gold/25 transition hover:brightness-105"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">{children}</main>

      {/* Footer */}
      <footer className="relative border-t border-pb-line bg-pb-ink py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-pb-silver-4 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-pb-silver-2">PlayBeat Digital Pvt Ltd</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="transition hover:text-pb-gold">Privacy</Link>
            <Link href="/legal/terms" className="transition hover:text-pb-gold">Terms</Link>
            <Link href="/legal/refund" className="transition hover:text-pb-gold">Refunds</Link>
            <Link href="/contact" className="transition hover:text-pb-gold">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
