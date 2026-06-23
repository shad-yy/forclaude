import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqAccordion } from '@/components/pricing/faq-accordion'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { VisaLogo, MastercardLogo, PayPalLogo, CryptoIcon, BankTransferIcon } from '@/components/ui/PaymentLogos'
import { FirestickIcon, SmartTVIcon, AndroidIcon, IPhoneIcon } from '@/components/ui/DeviceIcons'
import { Lock, RotateCcw, Zap, Ban, Headphones, Film, Trophy, Tv, Globe, Swords } from 'lucide-react'
import { SpeedChecker } from '@/components/ui/SpeedChecker'


export const metadata: Metadata = {
  title: "IPTV Pricing UK — Sky Sports + Netflix from £12/mo | Smart Live TV",
  description:
    "4 simple plans from £12/month. Replaces Sky Sports (£43), Netflix (£18), Disney+ and TNT Sports. No contract. Free 24-hour trial. Instant activation.",
  alternates: {
    canonical: `${ENV.BASE_URL}/pricing`,
  },
  openGraph: {
    title: "IPTV Pricing UK — Sky Sports + Netflix from £12/mo | Smart Live TV",
    description: "4 simple plans from £12/month. Replaces Sky Sports (£43), Netflix (£18), Disney+ and TNT Sports. No contract. Free 24-hour trial. Instant activation.",
    url: `${ENV.BASE_URL}/pricing`,
    siteName: 'Smart Live TV',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
  },
}

const faqs = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "No. Your 24-hour free trial requires zero payment details. Message us on WhatsApp and we activate your trial immediately."
  },
  {
    q: "How many screens can I watch on simultaneously?",
    a: "All plans support up to 2 simultaneous streams. If you need more, contact us — we can accommodate specific requirements."
  },
  {
    q: "What channels are included?",
    a: "All plans include identical content: 230,000+ live channels including all Sky Sports, TNT Sports, beIN Sports, BBC, ITV, Channel 4, UCL, UFC, F1, NBA, NFL, and 50+ country packages. No plan has fewer channels than another."
  },
  {
    q: "Is there a contract?",
    a: "No contract on any plan. Cancel at any time before your next billing date. No cancellation fees."
  },
  {
    q: "What's the difference between the plans?",
    a: "Only the duration and effective monthly price differ. The 1-month Basic is £12/mo. The 3-month Popular works out at £8/mo. The 6-month Standard is £6/mo. The 12-month Premium is £4.50/mo. Every plan has identical features."
  },
  {
    q: "What happens after the 24-hour trial?",
    a: "Nothing automatic. We contact you to confirm if you'd like to continue. You choose your plan and pay only when you're satisfied."
  },
  {
    q: "Which countries does this work in?",
    a: "Everywhere. No regional restrictions, no VPN needed. UK, France, UAE, USA — or anywhere worldwide."
  },
  {
    q: "How do I get support?",
    a: "WhatsApp support 7 days a week, 9am–11pm UK time. We typically respond within 5–10 minutes."
  }
]

export default function PricingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/pricing#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', 
        item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Pricing', 
        item: `${ENV.BASE_URL}/pricing` },
    ],
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${ENV.BASE_URL}/pricing#product`,
    name: 'Smart Live TV IPTV Subscription',
    description: 'Access to 230,000+ live TV channels including Netflix, Disney+, Amazon Prime, all Sky Sports channels, TNT Sports, beIN Sports, UFC, F1, NBA and more. 4K quality, works on all devices.',
    sku: 'SLTV-IPTV-SUB',
    brand: {
      '@type': 'Brand',
      name: 'Smart Live TV',
    },
    image: `${ENV.BASE_URL}/og-default.png`,
    url: `${ENV.BASE_URL}/pricing`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '312',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'James M.',
        },
        reviewBody: 'Switched from Sky Sports and saved over £30 a month. Picture quality is excellent, especially on my Firestick in 4K. Setup took about 3 minutes.',
        datePublished: '2026-05-12',
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Sarah K.',
        },
        reviewBody: 'The free trial convinced me. All Premier League matches, Champions League, and Netflix in one subscription. Customer support via WhatsApp is genuinely fast.',
        datePublished: '2026-04-28',
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '4',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Ahmed R.',
        },
        reviewBody: 'Great value for Arabic channels. beIN Sports, MBC, and OSN all included. Occasional buffer during peak times but 95% of the time it is flawless.',
        datePublished: '2026-06-01',
      },
    ],
    offers: [
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/pricing#offer-1month`,
        name: '1 Month Subscription',
        price: '12.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@id': `${ENV.BASE_URL}/#organization`,
        },
        'hasMerchantReturnPolicy': {
          '@type': 'MerchantReturnPolicy',
          '@id': 'https://smartlivetv.co.uk/pricing#return-policy',
          'applicableCountry': 'GB',
          'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
          'merchantReturnDays': 7,
          'returnMethod': 'https://schema.org/ReturnByMail',
          'returnFees': 'https://schema.org/FreeReturn',
          'refundType': 'https://schema.org/FullRefund',
        },
        'shippingDetails': {
          '@type': 'OfferShippingDetails',
          '@id': 'https://smartlivetv.co.uk/pricing#shipping',
          'shippingRate': {
            '@type': 'MonetaryAmount',
            'value': 0,
            'currency': 'GBP',
          },
          'deliveryTime': {
            '@type': 'ShippingDeliveryTime',
            'handlingTime': {
              '@type': 'QuantitativeValue',
              'minValue': 0,
              'maxValue': 0,
              'unitCode': 'MIN',
            },
            'transitTime': {
              '@type': 'QuantitativeValue',
              'minValue': 5,
              'maxValue': 30,
              'unitCode': 'MIN',
            },
          },
          'shippingDestination': {
            '@type': 'DefinedRegion',
            'addressCountry': 'GB',
          },
        },
      },
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/pricing#offer-3month`,
        name: '3 Month Subscription',
        price: '24.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@id': `${ENV.BASE_URL}/#organization`,
        },
        'hasMerchantReturnPolicy': {
          '@type': 'MerchantReturnPolicy',
          '@id': 'https://smartlivetv.co.uk/pricing#return-policy',
          'applicableCountry': 'GB',
          'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
          'merchantReturnDays': 7,
          'returnMethod': 'https://schema.org/ReturnByMail',
          'returnFees': 'https://schema.org/FreeReturn',
          'refundType': 'https://schema.org/FullRefund',
        },
        'shippingDetails': {
          '@type': 'OfferShippingDetails',
          '@id': 'https://smartlivetv.co.uk/pricing#shipping',
          'shippingRate': {
            '@type': 'MonetaryAmount',
            'value': 0,
            'currency': 'GBP',
          },
          'deliveryTime': {
            '@type': 'ShippingDeliveryTime',
            'handlingTime': {
              '@type': 'QuantitativeValue',
              'minValue': 0,
              'maxValue': 0,
              'unitCode': 'MIN',
            },
            'transitTime': {
              '@type': 'QuantitativeValue',
              'minValue': 5,
              'maxValue': 30,
              'unitCode': 'MIN',
            },
          },
          'shippingDestination': {
            '@type': 'DefinedRegion',
            'addressCountry': 'GB',
          },
        },
      },
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/pricing#offer-6month`,
        name: '6 Month Subscription',
        price: '36.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@id': `${ENV.BASE_URL}/#organization`,
        },
        'hasMerchantReturnPolicy': {
          '@type': 'MerchantReturnPolicy',
          '@id': 'https://smartlivetv.co.uk/pricing#return-policy',
          'applicableCountry': 'GB',
          'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
          'merchantReturnDays': 7,
          'returnMethod': 'https://schema.org/ReturnByMail',
          'returnFees': 'https://schema.org/FreeReturn',
          'refundType': 'https://schema.org/FullRefund',
        },
        'shippingDetails': {
          '@type': 'OfferShippingDetails',
          '@id': 'https://smartlivetv.co.uk/pricing#shipping',
          'shippingRate': {
            '@type': 'MonetaryAmount',
            'value': 0,
            'currency': 'GBP',
          },
          'deliveryTime': {
            '@type': 'ShippingDeliveryTime',
            'handlingTime': {
              '@type': 'QuantitativeValue',
              'minValue': 0,
              'maxValue': 0,
              'unitCode': 'MIN',
            },
            'transitTime': {
              '@type': 'QuantitativeValue',
              'minValue': 5,
              'maxValue': 30,
              'unitCode': 'MIN',
            },
          },
          'shippingDestination': {
            '@type': 'DefinedRegion',
            'addressCountry': 'GB',
          },
        },
      },
      {
        '@type': 'Offer',
        '@id': `${ENV.BASE_URL}/pricing#offer-12month`,
        name: '12 Month Subscription',
        price: '54.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        validFrom: '2026-01-01',
        priceValidUntil: '2026-12-31',
        seller: {
          '@id': `${ENV.BASE_URL}/#organization`,
        },
        'hasMerchantReturnPolicy': {
          '@type': 'MerchantReturnPolicy',
          '@id': 'https://smartlivetv.co.uk/pricing#return-policy',
          'applicableCountry': 'GB',
          'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
          'merchantReturnDays': 7,
          'returnMethod': 'https://schema.org/ReturnByMail',
          'returnFees': 'https://schema.org/FreeReturn',
          'refundType': 'https://schema.org/FullRefund',
        },
        'shippingDetails': {
          '@type': 'OfferShippingDetails',
          '@id': 'https://smartlivetv.co.uk/pricing#shipping',
          'shippingRate': {
            '@type': 'MonetaryAmount',
            'value': 0,
            'currency': 'GBP',
          },
          'deliveryTime': {
            '@type': 'ShippingDeliveryTime',
            'handlingTime': {
              '@type': 'QuantitativeValue',
              'minValue': 0,
              'maxValue': 0,
              'unitCode': 'MIN',
            },
            'transitTime': {
              '@type': 'QuantitativeValue',
              'minValue': 5,
              'maxValue': 30,
              'unitCode': 'MIN',
            },
          },
          'shippingDestination': {
            '@type': 'DefinedRegion',
            'addressCountry': 'GB',
          },
        },
      },
    ],
  }

  return (
    <main className="min-h-screen font-sans bg-[#0a0a0f] pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SchemaMarkup schema={productSchema} />
      
      {/* SECTION 1 — HERO */}
      <FadeIn>
      <section className="bg-[#0a0a0f] pt-28 md:pt-36 pb-16 text-center px-4 md:px-6 container mx-auto max-w-7xl">
        <div className="bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 text-xs font-bold px-4 py-2 rounded-full mb-6 inline-block">
          ✦ No Contract · No Credit Card · Cancel Anytime
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Simple, Honest Pricing
        </h1>
        
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-4">
          Pick a plan. Get instant access. Watch everything live.
          Try free for 24 hours — no card needed.
        </p>
      </section>
      </FadeIn>

      {/* SECTION 2 — PRICING CARDS */}
      <FadeIn direction="up">
      <section className="bg-[#0a0a0f] pb-16 md:pb-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#00e676]">24H</div>
            <div className="text-xs text-gray-500 mt-0.5">Free Trial</div>
          </div>
          <div className="h-8 w-px bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#00e676]">7-Day</div>
            <div className="text-xs text-gray-500 mt-0.5">Money Back</div>
          </div>
          <div className="h-8 w-px bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#00e676]">4K</div>
            <div className="text-xs text-gray-500 mt-0.5">Ultra HD</div>
          </div>
          <div className="h-8 w-px bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#00e676]">£109</div>
            <div className="text-xs text-gray-500 mt-0.5">Monthly Saving</div>
          </div>
          <div className="h-8 w-px bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#00e676]">∞</div>
            <div className="text-xs text-gray-500 mt-0.5">No Contract</div>
          </div>
        </div>

        <StaggerIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto py-6 pb-16">
          
          {/* CARD 1 — 1 MONTH */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Basic</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£12</span>
            </div>
            <div className="text-xs text-[#00e676] font-bold mt-1 mb-6">1 Month</div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "230,000+ Channels, Movies & Series",
                "Netflix, Disney+, Amazon Prime Included",
                "Hulu, Apple TV+, Paramount+, Shahid Included",
                "All Sky Sports Channels in 4K",
                "TNT Sports — Champions League Included",
                "UFC, F1, NBA, NFL — All Sports Live",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "Catch-Up TV — Watch Last 7 Days",
                "Works on ALL Devices",
                "24/7 Customer Support",
                "Free 24-Hour Trial — No Card Needed",
                "7-Day Money Back Guarantee",
                "No Contract — Cancel Anytime",
                "Instant Activation After Payment"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00e676] font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/buy"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm border border-[#2a2a3a] hover:border-[#00e676] text-white transition-all"
            >
              Get Access Now →
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              or <Link href="/free-trial" className="hover:underline text-gray-400">try free for 24h →</Link>
            </p>
          </div>

          {/* CARD 2 — 3 MONTHS (RECOMMENDED) */}
          <div className="bg-[#12121a] border-2 border-[#00e676] rounded-3xl p-8 relative shadow-[0_0_40px_rgba(0,230,118,0.15)] flex flex-col z-10 md:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00e676] text-black text-xs font-extrabold px-6 py-1.5 rounded-full whitespace-nowrap">
              BEST VALUE
            </div>
            
            <div className="text-sm font-bold uppercase tracking-widest text-[#00e676] mb-2">Popular</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£24</span>
            </div>
            <div className="text-xs text-[#00e676] font-bold mt-1 mb-6">3 Months <span className="text-gray-400 font-normal ml-2">Only £8/mo</span></div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "230,000+ Channels, Movies & Series",
                "Netflix, Disney+, Amazon Prime Included",
                "Hulu, Apple TV+, Paramount+, Shahid Included",
                "All Sky Sports Channels in 4K",
                "TNT Sports — Champions League Included",
                "UFC, F1, NBA, NFL — All Sports Live",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "Catch-Up TV — Watch Last 7 Days",
                "Works on ALL Devices",
                "24/7 Customer Support",
                "Free 24-Hour Trial — No Card Needed",
                "7-Day Money Back Guarantee",
                "No Contract — Cancel Anytime",
                "Instant Activation After Payment"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00e676] font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/buy"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm bg-[#00e676] hover:bg-[#00ff87] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all"
            >
              Get Access Now →
            </Link>
            <Link 
              href="/free-trial"
              className="block text-center w-full mt-3 py-3 rounded-xl font-bold text-xs border border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Try Free First
            </Link>
          </div>

          {/* CARD 3 — 6 MONTHS */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col pt-8 md:pt-8 mt-4 lg:mt-0">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Standard</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£36</span>
            </div>
            <div className="text-xs text-[#00e676] font-bold mt-1 mb-6">6 Months <span className="text-gray-400 font-normal ml-2">Only £6/mo</span></div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "230,000+ Channels, Movies & Series",
                "Netflix, Disney+, Amazon Prime Included",
                "Hulu, Apple TV+, Paramount+, Shahid Included",
                "All Sky Sports Channels in 4K",
                "TNT Sports — Champions League Included",
                "UFC, F1, NBA, NFL — All Sports Live",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "Catch-Up TV — Watch Last 7 Days",
                "Works on ALL Devices",
                "24/7 Customer Support",
                "Free 24-Hour Trial — No Card Needed",
                "7-Day Money Back Guarantee",
                "No Contract — Cancel Anytime",
                "Instant Activation After Payment"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00e676] font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/buy"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm border border-[#2a2a3a] hover:border-[#00e676] text-white transition-all"
            >
              Get Access Now →
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              or <Link href="/free-trial" className="hover:underline text-gray-400">try free for 24h →</Link>
            </p>
          </div>

          {/* CARD 4 — 12 MONTHS */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col pt-8 md:pt-8 mt-4 lg:mt-0">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Premium</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£54</span>
            </div>
            <div className="text-xs text-[#00e676] font-bold mt-1 mb-6">12 Months <span className="text-gray-400 font-normal ml-2">Only £4.50/mo</span></div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "230,000+ Channels, Movies & Series",
                "Netflix, Disney+, Amazon Prime Included",
                "Hulu, Apple TV+, Paramount+, Shahid Included",
                "All Sky Sports Channels in 4K",
                "TNT Sports — Champions League Included",
                "UFC, F1, NBA, NFL — All Sports Live",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "Catch-Up TV — Watch Last 7 Days",
                "Works on ALL Devices",
                "24/7 Customer Support",
                "Free 24-Hour Trial — No Card Needed",
                "7-Day Money Back Guarantee",
                "No Contract — Cancel Anytime",
                "Instant Activation After Payment"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00e676] font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/buy"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm border border-[#2a2a3a] hover:border-[#00e676] text-white transition-all"
            >
              Get Access Now →
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              or <Link href="/free-trial" className="hover:underline text-gray-400">try free for 24h →</Link>
            </p>
          </div>

        </StaggerIn>

        <div className="max-w-sm mx-auto mt-10">
          <SpeedChecker />
        </div>

        <div className="text-center mt-8 mb-4">
          <p className="text-xs text-gray-600 mb-3 uppercase tracking-wide">
            Secure Payment Methods
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <VisaLogo className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <MastercardLogo className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <PayPalLogo className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <BankTransferIcon className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
            <CryptoIcon className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-gray-700 mt-3">
            256-bit SSL encrypted · Secure checkout
          </p>
        </div>
        
        <div className="text-center mt-6 mb-4">
          <p className="text-xs text-gray-600">
            Prices shown in GBP. Customers outside the UK —
            equivalent pricing available.{' '}
            <a 
              href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '/contact'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline"
            >
              Message us on WhatsApp
            </a>
            {' '}for local currency options.
          </p>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-8">
          All plans include the full channel package. 
          Longer subscriptions simply give you better value per month. 
          Not sure? <Link href="/free-trial" className="text-[#00e676]">
          Try free for 24 hours first</Link> — no card needed.
        </p>
      </section>
      </FadeIn>

      {/* COMPARISON CALLOUT */}
      <div className="text-center py-8 px-4 max-w-2xl mx-auto">
        <p className="text-sm text-gray-400">
          Wondering how we compare to traditional TV?{' '}
          <Link href="/iptv-vs-sky-sports" className="text-[#00e676] hover:underline font-semibold">
            See our honest IPTV vs Sky Sports comparison →
          </Link>
        </p>
      </div>

      {/* TRUST BADGES */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-8 max-w-2xl mx-auto">
        {([
          { Icon: Lock, text: "Secure Payment" },
          { Icon: RotateCcw, text: "7-Day Money Back" },
          { Icon: Zap, text: "Instant Activation" },
          { Icon: Ban, text: "No Contract" },
          { Icon: Headphones, text: "24/7 Support" },
        ] as const).map(badge => (
          <div key={badge.text} className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3a] rounded-full px-4 py-2">
            <badge.Icon className="w-3.5 h-3.5 text-[#00e676]" />
            <span className="text-xs font-semibold text-gray-300">{badge.text}</span>
          </div>
        ))}
      </div>

      {/* SECTION 3 — WHAT'S INCLUDED */}
      <FadeIn direction="up">
      <section className="bg-[#12121a] border-t border-[#2a2a3a] py-16 md:py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-4">
          What You Get Access To
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Every channel is included in your plan — no add-ons, no hidden fees, no blackouts.
        </p>

        <StaggerIn className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4"><Film className="w-5 h-5 text-[#00e676]" /></div>
            <div className="font-bold text-white text-sm mb-2">Netflix, Disney+ & More</div>
            <div className="text-xs text-gray-500">Every major streaming platform included — Netflix, Disney+, Amazon Prime, Hulu, Apple TV+, Paramount+, Shahid and more.</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-[#00e676]" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" fill="none"/></svg></div>
            <div className="font-bold text-white text-sm mb-2">UK & International Sport</div>
            <div className="text-xs text-gray-500">Sky Sports, TNT Sports, beIN Sports, Premier Sports, Eurosport — plus international sports from 50+ countries.</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4"><Trophy className="w-5 h-5 text-[#00e676]" /></div>
            <div className="font-bold text-white text-sm mb-2">Champions League & UCL</div>
            <div className="text-xs text-gray-500">Every UEFA Champions League and Europa League match live — no BT Sport subscription needed.</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4"><Swords className="w-5 h-5 text-[#00e676]" /></div>
            <div className="font-bold text-white text-sm mb-2">UFC & Boxing</div>
            <div className="text-xs text-gray-500">Every UFC event live — prelims, main card, and PPV. Major boxing events included.</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4"><Tv className="w-5 h-5 text-[#00e676]" /></div>
            <div className="font-bold text-white text-sm mb-2">All UK & International TV</div>
            <div className="text-xs text-gray-500">BBC, ITV, Channel 4, Channel 5, Sky Atlantic, Sky Max and complete international packages.</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4"><Globe className="w-5 h-5 text-[#00e676]" /></div>
            <div className="font-bold text-white text-sm mb-2">50+ Country Packages</div>
            <div className="text-xs text-gray-500">Arabic (beIN, MBC, OSN), French, German, Indian, US channels and more — all included.</div>
          </div>
        </StaggerIn>
      </section>
      </FadeIn>

      {/* SECTION 4 — DEVICES */}
      <FadeIn direction="up">
      <section className="bg-[#0a0a0f] py-16 md:py-20 border-t border-[#2a2a3a] px-4 md:px-6 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          Works On Every Device You Own
        </h2>

        <StaggerIn className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <Link href="/setup/firestick" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="flex justify-center mb-3"><FirestickIcon className="w-12 h-12" /></div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">Amazon Firestick</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
          <Link href="/setup/smart-tv" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="flex justify-center mb-3"><SmartTVIcon className="w-12 h-12" /></div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">Smart TV</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
          <Link href="/setup/android" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="flex justify-center mb-3"><AndroidIcon className="w-12 h-12" /></div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">Android</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
          <Link href="/setup/iphone" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="flex justify-center mb-3"><IPhoneIcon className="w-12 h-12" /></div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">iPhone & iPad</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
        </StaggerIn>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Free setup guides available for all devices
        </p>
      </section>
      </FadeIn>



      {/* SECTION 5 — FAQ */}
      <FadeIn direction="up">
      <section className="bg-[#12121a] border-t border-[#2a2a3a] py-16 md:py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          Questions Answered
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <FaqAccordion />
        </div>
      </section>
      </FadeIn>

      {/* SECTION 6 — FINAL CTA BAND */}
      <FadeIn direction="up">
      <section className="bg-gradient-to-b from-[#0a0a0f] to-[#00e676]/5 border-t border-[#00e676]/10 py-24 md:py-32 px-4 md:px-6 text-center container mx-auto max-w-7xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Ready to Watch Everything Live?
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Start your free 24-hour trial. No card. No contract. Cancel anytime.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 flex-wrap">
          <Link
            href="/buy"
            className="bg-[#00e676] hover:bg-[#00ff87] text-black font-extrabold px-10 py-4 rounded-xl text-base shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all touch-manipulation"
          >
            Get Access Now →
          </Link>
          <Link href="/free-trial"
            className="border border-[#2a2a3a] hover:border-[#00e676] text-gray-300 hover:text-white font-bold px-10 py-4 rounded-xl text-base transition-all">
            Not sure? Try Free for 24H
          </Link>
        </div>
        <p className="text-xs text-gray-600 text-center mt-4">
          Instant activation after payment · 
          Or <Link href="/free-trial" className="text-[#00e676]">start with a free trial</Link> — no card needed
        </p>
      </section>
      </FadeIn>

      {/* MOBILE STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-[#2a2a3a] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/buy"
            className="bg-[#00e676] text-black font-bold text-sm py-3.5 rounded-xl text-center"
          >
            Get Access Now
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '/contact'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-black font-bold text-sm py-3.5 rounded-xl text-center"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>

    </main>
  )
}
