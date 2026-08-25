import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, FileText, Calendar, Home } from 'lucide-react'

export interface PolicySection {
  heading: string
  body?: ReactNode
}

export interface PolicyPageProps {
  title: string
  effectiveDate?: string
  intro?: ReactNode
  sections: PolicySection[]
  /** Sibling policy links to show at the bottom */
  relatedLinks?: { href: string; label: string }[]
}

export function PolicyPage({
  title,
  effectiveDate,
  intro,
  sections,
  relatedLinks = [],
}: PolicyPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-pb-silver-4">
        <Link
          href="/storefront"
          className="flex items-center gap-1 transition hover:text-pb-silver-2"
        >
          <Home className="h-3 w-3" />
          Store
        </Link>
        <span className="text-pb-silver-4">/</span>
        <Link href="/legal" className="transition hover:text-pb-silver-2">
          Legal
        </Link>
        <span className="text-pb-silver-4">/</span>
        <span className="text-pb-silver-3">{title}</span>
      </nav>

      {/* Title block */}
      <header className="mb-8 border-b border-pb-line pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pb-gold">
          <FileText className="h-3.5 w-3.5" />
          Legal Document
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
          {title}
        </h1>
        {effectiveDate && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-pb-silver-3">
            <Calendar className="h-3.5 w-3.5" />
            <span>Effective Date: {effectiveDate}</span>
          </div>
        )}
      </header>

      {/* Intro */}
      {intro && (
        <div className="mb-8 rounded-2xl border border-pb-gold/15 bg-pb-gold/5 p-5 text-sm leading-relaxed text-pb-silver-2">
          {intro}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i} className="scroll-mt-20">
            <h2 className="mb-3 flex items-baseline gap-3 text-lg font-bold text-white">
              <span className="font-mono text-xs text-pb-gold/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.heading}</span>
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-pb-silver-2 [&_a]:text-pb-gold [&_a]:underline [&_a]:decoration-yellow-400/40 [&_a]:transition [&_a:hover]:decoration-yellow-400 [&_li]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-pb-silver-4">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      {/* Contact card */}
      <section className="mt-12 rounded-2xl border border-pb-line bg-pb-charcoal p-6">
        <h3 className="text-base font-bold text-white">Contact</h3>
        <p className="mt-2 text-sm text-pb-silver-3">
          For questions about this policy, contact PlayBeat Digital:
        </p>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <div className="font-semibold text-white">PlayBeat Digital</div>
            <div className="text-pb-silver-3">
              House 334, Street 06, Jinnahabad
              <br />
              Abbottabad, Khyber Pakhtunkhwa
              <br />
              Pakistan · Postal Code: 22010
            </div>
          </div>
          <div className="space-y-1">
            <a
              href="mailto:playbeatdigital@proton.me"
              className="block text-pb-gold transition hover:text-yellow-300"
            >
              playbeatdigital@proton.me
            </a>
            <div className="text-pb-silver-3">Mobile / WhatsApp: 0331-8333368</div>
            <div className="text-pb-silver-3">Landline: 0992-338830</div>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-pb-gold transition hover:text-yellow-300"
            >
              All contact channels →
            </Link>
          </div>
        </div>
      </section>

      {/* Related policies */}
      {relatedLinks.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pb-silver-4">
            Related Policies
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {relatedLinks.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center justify-between rounded-xl border border-pb-line bg-pb-charcoal-2 p-3 text-sm transition hover:border-yellow-400/30 hover:bg-pb-gold/5"
              >
                <span className="text-pb-silver-2 group-hover:text-white">
                  {r.label}
                </span>
                <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-pb-silver-4 transition group-hover:text-pb-gold" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-10 flex items-center justify-between border-t border-pb-line pt-6">
        <Link
          href="/legal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-pb-silver-3 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All Legal Documents
        </Link>
        <Link
          href="/storefront"
          className="text-sm font-medium text-pb-gold transition hover:text-yellow-300"
        >
          Back to Store →
        </Link>
      </div>
    </article>
  )
}

/** Helper for bullet lists */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  )
}
