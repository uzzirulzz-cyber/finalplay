import { PolicyPage, Bullets } from '@/components/legal/policy-page'

export const metadata = {
  title: 'Privacy Policy — PlayBeat Digital',
  description:
    'How PlayBeat Digital collects, uses, and protects customer information.',
}

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      effectiveDate="August 25, 2026"
      intro={
        <p>
          PlayBeat Digital respects your privacy and is committed to protecting
          the personal information of our customers and website visitors.
        </p>
      }
      sections={[
        {
          heading: 'Information We Collect',
          body: (
            <>
              <p>
                When you create an account, place an order, contact us, or use
                our services, we may collect information such as:
              </p>
              <Bullets
                items={[
                  'Full name',
                  'Email address',
                  'Mobile/WhatsApp number',
                  'Billing and transaction information',
                  'Account information',
                  'Order and purchase history',
                  'Information you voluntarily provide to customer support',
                ]}
              />
              <p>
                Payment information may be processed securely through authorized
                payment service providers. PlayBeat Digital does not intentionally
                store complete payment-card details on its own systems.
              </p>
            </>
          ),
        },
        {
          heading: 'How We Use Information',
          body: (
            <>
              <p>We may use customer information to:</p>
              <Bullets
                items={[
                  'Create and manage customer accounts',
                  'Process and fulfill orders',
                  'Provide purchased digital products and services',
                  'Process payments and refunds',
                  'Provide customer support',
                  'Communicate about orders and services',
                  'Prevent fraud, abuse, and unauthorized transactions',
                  'Improve our website and services',
                  'Meet applicable legal and regulatory requirements',
                ]}
              />
            </>
          ),
        },
        {
          heading: 'Information Security',
          body: (
            <p>
              We use reasonable administrative and technical measures to protect
              customer information from unauthorized access, misuse, alteration,
              or disclosure. However, no internet-based system can be guaranteed
              to be completely secure.
            </p>
          ),
        },
        {
          heading: 'Third-Party Services',
          body: (
            <p>
              We may use third-party service providers for payment processing,
              hosting, analytics, communication, authentication, or service
              delivery. Such providers may process information as necessary to
              provide their services.
            </p>
          ),
        },
        {
          heading: 'Cookies',
          body: (
            <p>
              Our website may use cookies and similar technologies to maintain
              sessions, remember preferences, improve functionality, and
              understand website usage.
            </p>
          ),
        },
        {
          heading: 'Data Retention',
          body: (
            <p>
              We retain information for as long as reasonably necessary to
              provide our services, maintain business and transaction records,
              resolve disputes, prevent fraud, and comply with applicable legal
              requirements.
            </p>
          ),
        },
        {
          heading: 'Your Rights',
          body: (
            <p>
              Customers may contact us to request information regarding their
              personal data or to request correction of inaccurate information,
              subject to applicable legal requirements.
            </p>
          ),
        },
      ]}
      relatedLinks={[
        { href: '/legal/terms', label: 'Terms & Conditions' },
        { href: '/legal/refund', label: 'Return & Refund Policy' },
        { href: '/legal/shipping', label: 'Shipping & Service Delivery Policy' },
        { href: '/contact', label: 'Contact Us' },
      ]}
    />
  )
}
