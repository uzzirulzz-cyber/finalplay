import { PolicyPage, Bullets } from '@/components/legal/policy-page'

export const metadata = {
  title: 'Terms & Conditions — PlayBeat Digital',
  description:
    'The terms governing use of the PlayBeat Digital website and services.',
}

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      effectiveDate="August 25, 2026"
      intro={
        <p>
          Welcome to PlayBeat Digital. By accessing our website or purchasing our
          products and services, you agree to these Terms &amp; Conditions.
        </p>
      }
      sections={[
        {
          heading: 'About PlayBeat Digital',
          body: (
            <>
              <p>
                PlayBeat Digital is a digital services business operating from
                Abbottabad, Khyber Pakhtunkhwa, Pakistan.
              </p>
              <p>
                Our website provides digital products and online services, which
                may include software, subscriptions, digital products, gift
                cards, marketing services, web-related services, and other
                products or services displayed on our website.
              </p>
            </>
          ),
        },
        {
          heading: 'Customer Accounts',
          body: (
            <>
              <p>
                Customers are responsible for providing accurate information
                when creating an account or placing an order.
              </p>
              <p>
                Customers must keep their login credentials confidential and
                must not allow unauthorized persons to use their account.
              </p>
            </>
          ),
        },
        {
          heading: 'Orders and Payments',
          body: (
            <>
              <p>
                All orders are subject to successful payment and, where
                applicable, payment verification.
              </p>
              <p>
                Prices, product descriptions, subscription periods, and
                applicable terms will be displayed before purchase.
              </p>
              <p>
                We reserve the right to cancel or hold an order where there is
                evidence of fraud, unauthorized payment, incorrect information,
                or other suspicious activity.
              </p>
            </>
          ),
        },
        {
          heading: 'Digital Products and Services',
          body: (
            <>
              <p>
                Digital products and services are delivered electronically
                according to the applicable product description and Service
                Delivery Policy.
              </p>
              <p>
                Customers must provide accurate information necessary to fulfill
                their order.
              </p>
            </>
          ),
        },
        {
          heading: 'Refunds',
          body: (
            <>
              <p>
                Refunds are governed by our{' '}
                <a href="/legal/refund">Return &amp; Refund Policy</a>.
              </p>
              <p>
                Customers should review the applicable refund conditions before
                completing a purchase.
              </p>
            </>
          ),
        },
        {
          heading: 'Acceptable Use',
          body: (
            <p>
              Customers must not use our website or services for unlawful
              activities, fraud, unauthorized access, abuse, or activities that
              violate applicable laws or the rights of others.
            </p>
          ),
        },
        {
          heading: 'Intellectual Property',
          body: (
            <p>
              Website content, branding, graphics, software, text, and other
              materials belonging to PlayBeat Digital or its licensors may not
              be copied, reproduced, distributed, or commercially exploited
              without appropriate authorization.
            </p>
          ),
        },
        {
          heading: 'Service Availability',
          body: (
            <p>
              We make reasonable efforts to maintain website and service
              availability. However, temporary interruptions may occur because of
              maintenance, technical problems, third-party services, network
              issues, or circumstances outside our reasonable control.
            </p>
          ),
        },
        {
          heading: 'Limitation of Liability',
          body: (
            <>
              <p>
                To the extent permitted by applicable law, PlayBeat Digital will
                not be responsible for indirect or consequential losses arising
                from the use of our website or services.
              </p>
              <p>
                Nothing in these Terms is intended to exclude any liability that
                cannot legally be excluded.
              </p>
            </>
          ),
        },
        {
          heading: 'Account Suspension',
          body: (
            <p>
              We may suspend or terminate an account where we reasonably believe
              that the account is being used for fraud, abuse, unauthorized
              activity, violation of these Terms, or other unlawful activity.
            </p>
          ),
        },
        {
          heading: 'Changes to These Terms',
          body: (
            <p>
              We may update these Terms &amp; Conditions from time to time.
              Updated terms will be published on this website with a revised
              effective date.
            </p>
          ),
        },
        {
          heading: 'Governing Law',
          body: (
            <p>
              These Terms &amp; Conditions shall be interpreted and applied in
              accordance with applicable laws and regulations of Pakistan.
            </p>
          ),
        },
        {
          heading: 'Contact Information',
          body: (
            <p>
              For any questions about these Terms, please see our{' '}
              <a href="/contact">Contact Us</a> page.
            </p>
          ),
        },
      ]}
      relatedLinks={[
        { href: '/legal/privacy', label: 'Privacy Policy' },
        { href: '/legal/refund', label: 'Return & Refund Policy' },
        { href: '/legal/shipping', label: 'Shipping & Service Delivery Policy' },
        { href: '/contact', label: 'Contact Us' },
      ]}
    />
  )
}
