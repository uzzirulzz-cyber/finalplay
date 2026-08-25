import { Storefront } from '@/components/storefront/storefront'

// Root `/` — public storefront. This is the canonical URL for SEO indexing.
// No admin-related content is rendered here.
export const metadata = {
  title: 'PlayBeat Digital — Premium Digital Marketplace & Smart Projectors',
  description:
    'Instant digital keys, gaming accounts, subscriptions, SaaS licenses, and high-performance 4K Smart Projectors with 24/7 automated delivery.',
  alternates: { canonical: '/' },
}

export default function Home() {
  return <Storefront />
}
