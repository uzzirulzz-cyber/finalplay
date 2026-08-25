import { PolicyPage, Bullets } from '@/components/legal/policy-page'

export const metadata = {
  title: 'Return & Refund Policy — PlayBeat Digital',
  description:
    'Refund eligibility and process for digital products purchased from PlayBeat Digital.',
}

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Return & Refund Policy"
      effectiveDate="August 25, 2026"
      intro={
        <p>
          PlayBeat Digital provides primarily digital products and online
          services. Because digital products may be delivered immediately or
          made accessible electronically, refund eligibility depends on the
          nature of the product or service and whether it has already been
          delivered or accessed.
        </p>
      }
      sections={[
        {
          heading: 'Refund Eligibility',
          body: (
            <>
              <p>A customer may request a refund where:</p>
              <Bullets
                items={[
                  'The purchased digital product or service was not delivered after successful payment.',
                  'The delivered product or service is materially different from what was advertised.',
                  'A technical issue attributable to PlayBeat Digital prevents the purchased service from being provided and the issue cannot reasonably be resolved.',
                  'A duplicate payment was made for the same order.',
                  'A refund is otherwise approved by PlayBeat Digital.',
                ]}
              />
            </>
          ),
        },
        {
          heading: 'Non-Refundable Situations',
          body: (
            <>
              <p>A refund may not be available where:</p>
              <Bullets
                items={[
                  'The customer has successfully received and used/accessed the digital product or service.',
                  'The customer purchased the wrong product or subscription due to their own error.',
                  'The customer provided incorrect account or delivery information.',
                  'The service was suspended because of a violation of our Terms & Conditions.',
                  'The customer requests a refund solely because they changed their mind after successful delivery or activation, where the applicable product is non-refundable.',
                ]}
              />
            </>
          ),
        },
        {
          heading: 'Refund Requests',
          body: (
            <>
              <p>Customers should contact us as soon as possible with:</p>
              <Bullets
                items={[
                  'Order number',
                  'Customer name',
                  'Email address used for the purchase',
                  'Description of the issue',
                  'Relevant payment information or transaction reference',
                ]}
              />
              <p>
                We may investigate the transaction before approving a refund.
              </p>
            </>
          ),
        },
        {
          heading: 'Refund Processing',
          body: (
            <p>
              Approved refunds will be processed through the applicable payment
              method or payment provider. The time required for the funds to
              appear in the customer&apos;s account may depend on the payment
              provider or financial institution.
            </p>
          ),
        },
      ]}
      relatedLinks={[
        { href: '/legal/privacy', label: 'Privacy Policy' },
        { href: '/legal/terms', label: 'Terms & Conditions' },
        { href: '/legal/shipping', label: 'Shipping & Service Delivery Policy' },
        { href: '/contact', label: 'Contact Us' },
      ]}
    />
  )
}
