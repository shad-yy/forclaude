import type { Metadata } from 'next'
import Link from 'next/link'
import { BuyForm } from '@/components/buy/BuyForm'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'
import { Check } from 'lucide-react'
import { VisaLogo, MastercardLogo, PayPalLogo, CryptoIcon, BankTransferIcon } from '@/components/ui/PaymentLogos'
import { AnswerBlock } from '@/components/seo/AnswerBlock'

export const metadata: Metadata = {
  title: 'Get Smart Live TV — Start Watching in 5 Minutes',
  description: 'Choose your plan and get instant access to 230,000+ channels including Netflix, Sky Sports, Disney+. Activation within 5 minutes.',
  alternates: { canonical: `${ENV.BASE_URL}/buy` },
  robots: { index: true, follow: true },
}

const plans = [
  { id: '1month', name: 'Basic', period: '1 Month', price: '£12', monthly: '£12/mo', popular: false },
  { id: '3month', name: 'Popular', period: '3 Months', price: '£24', monthly: '£8/mo', popular: true },
  { id: '6month', name: 'Standard', period: '6 Months', price: '£36', monthly: '£6/mo', popular: false },
  { id: '12month', name: 'Premium', period: '12 Months', price: '£54', monthly: '£4.50/mo', popular: false },
]

export default function BuyPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${ENV.BASE_URL}/buy#product`,
    name: 'Smart Live TV IPTV Subscription',
    description: 'Get instant access to 230,000+ live TV channels including Netflix, Disney+, Amazon Prime, Sky Sports, TNT Sports, and more. 4K streaming quality, setup in 5 minutes.',
    sku: 'SLTV-IPTV-SUB-BUY',
    brand: {
      '@type': 'Brand',
      name: 'Smart Live TV',
    },
    image: `${ENV.BASE_URL}/og-default.png`,
    url: `${ENV.BASE_URL}/buy`,
    offers: [
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/buy#offer-1month`,
        name: 'Basic 1 Month Subscription',
        price: '12.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/buy`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@type': 'Organization',
          '@id': `${ENV.BASE_URL}/#organization`,
        },
      },
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/buy#offer-3month`,
        name: 'Popular 3 Month Subscription',
        price: '24.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/buy`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@type': 'Organization',
          '@id': `${ENV.BASE_URL}/#organization`,
        },
      },
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/buy#offer-6month`,
        name: 'Standard 6 Month Subscription',
        price: '36.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/buy`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@type': 'Organization',
          '@id': `${ENV.BASE_URL}/#organization`,
        },
      },
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/buy#offer-12month`,
        name: 'Premium 12 Month Subscription',
        price: '54.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/buy`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@type': 'Organization',
          '@id': `${ENV.BASE_URL}/#organization`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={productSchema} />
      <div className="max-w-2xl mx-auto px-4 pt-28 md:pt-36 pb-20">

        {/* Trust banner */}
        <div className="flex items-center justify-center gap-6 mb-10 flex-wrap text-xs text-gray-500">
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#00e676]" /> Instant activation</span>
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#00e676]" /> 7-day money back</span>
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#00e676]" /> No contract</span>
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#00e676]" /> 24/7 support</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-3">
          Get Instant Access
        </h1>
        <p className="text-gray-400 text-center mb-10 text-sm">
          230,000+ channels including Netflix, Sky Sports and Disney+. Active within 5 minutes.
        </p>

          <AnswerBlock
            answer="Smart Live TV subscriptions start at £12 for one month, with longer plans reducing the cost to £4.50/month. All plans include identical content: 230,000+ channels, Sky Sports, TNT Sports, Netflix, Disney+, and 4K streaming. Activation takes under 5 minutes via WhatsApp."
            facts={[
              'Starter: £12/1 month — Popular: £24/3 months — Standard: £36/6 months — Ultimate: £54/12 months',
              'No contract, cancel anytime, 7-day money-back guarantee',
              'Payment via card, PayPal, bank transfer, or cryptocurrency',
            ]}
            className="max-w-2xl mx-auto text-left"
          />

        <BuyForm plans={plans} />

        <div className="text-center mt-8 mb-4">
          <p className="text-xs text-gray-600 mb-3 uppercase tracking-wide">Secure Payment Methods</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <VisaLogo className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <MastercardLogo className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <PayPalLogo className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <BankTransferIcon className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
            <CryptoIcon className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-gray-700 mt-3">256-bit SSL encrypted · Secure checkout</p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Not ready to buy?{' '}
          <Link href="/free-trial" className="text-[#00e676] hover:underline">
            Try free for 24 hours first →
          </Link>
        </p>
      </div>
    </div>
  )
}
