import { PolicyPage, Bullets } from '@/components/legal/policy-page'

export const metadata = {
  title: 'Shipping & Service Delivery Policy — PlayBeat Digital',
  description:
    'How digital products are delivered and the related timelines for PlayBeat Digital.',
}

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping & Service Delivery Policy"
      effectiveDate="August 25, 2026"
      intro={
        <p>
          PlayBeat Digital primarily provides digital products and online
          services. Physical shipping is generally not applicable to our digital
          products.
        </p>
      }
      sections={[
        {
          heading: 'Digital Delivery',
          body: (
            <>
              <p>Depending on the product or service purchased, delivery may be provided through:</p>
              <Bullets
                items={[
                  'Customer account/dashboard',
                  'Email',
                  'Digital activation or access credentials',
                  'Download or access link',
                  'Other electronic delivery methods specified on the product page',
                ]}
              />
            </>
          ),
        },
        {
          heading: 'Delivery Time',
          body: (
            <p>
              Many digital products may be delivered shortly after successful
              payment verification. Some services may require additional
              processing or manual verification. Where a product requires manual
              fulfillment, the expected delivery timeframe will be communicated
              to the customer.
            </p>
          ),
        },
        {
          heading: 'Payment Verification',
          body: (
            <p>
              Orders may be subject to payment verification before digital
              delivery. Orders identified as potentially fraudulent,
              unauthorized, or requiring additional verification may be
              temporarily held for review.
            </p>
          ),
        },
        {
          heading: 'Failed Delivery',
          body: (
            <p>
              If a customer has successfully completed payment but does not
              receive the purchased digital product or service within the
              applicable delivery timeframe, they should contact PlayBeat Digital
              support. We will investigate the order and, where appropriate,
              provide the purchased service, correct the delivery issue, or
              process an eligible refund.
            </p>
          ),
        },
        {
          heading: 'Incorrect Customer Information',
          body: (
            <p>
              Customers are responsible for providing accurate email addresses,
              account information, and other information required for digital
              delivery. Delays caused by incorrect information provided by the
              customer may not be considered a delivery failure by PlayBeat
              Digital.
            </p>
          ),
        },
        {
          heading: 'Physical Products',
          body: (
            <p>
              If physical products are offered in the future, the applicable
              shipping method, delivery timeframe, and shipping charges will be
              displayed on the relevant product page or checkout before
              purchase.
            </p>
          ),
        },
      ]}
      relatedLinks={[
        { href: '/legal/privacy', label: 'Privacy Policy' },
        { href: '/legal/terms', label: 'Terms & Conditions' },
        { href: '/legal/refund', label: 'Return & Refund Policy' },
        { href: '/contact', label: 'Contact Us' },
      ]}
    />
  )
}
