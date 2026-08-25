import { Storefront } from '@/components/storefront/storefront'

// /storefront — same as `/`. Maintained for backwards compatibility and direct links.
export const metadata = {
  title: 'PlayBeat Digital — Premium Digital Marketplace & Smart Projectors',
  description:
    'Instant digital keys, gaming accounts, subscriptions, SaaS licenses, and high-performance 4K Smart Projectors with 24/7 automated delivery.',
  alternates: { canonical: '/' },
}

export default function StorefrontPage() {
  return <Storefront />
}
