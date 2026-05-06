import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqAccordion } from '@/components/pricing/faq-accordion'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: 'IPTV Subscription UK — Plans from £12/mo',
  description:
    'Simple IPTV pricing from £12/month. 230,000+ channels, 4K quality, no contract. Free 24-hour trial included.',
  alternates: {
    canonical: `${ENV.BASE_URL}/pricing`,
  },
  openGraph: {
    title: 'IPTV Subscription UK — Plans from £12/mo',
    description: 'Simple IPTV pricing from £12/month. 230,000+ channels, 4K quality, no contract. Free 24-hour trial included.',
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
    a: "Only the duration and effective monthly price differ. The 1-month Starter is £12/mo. The 3-month Popular works out at £8/mo. The 6-month Standard is £6/mo. The 12-month Ultimate is £4.50/mo. Every plan has identical features."
  },
  {
    q: "What happens after the 24-hour trial?",
    a: "Nothing automatic. We contact you to confirm if you'd like to continue. You choose your plan and pay only when you're satisfied."
  },
  {
    q: "Which countries does this work in?",
    a: "Everywhere. No regional restrictions, no VPN needed. UK, Morocco, France, UAE, USA — any country worldwide."
  },
  {
    q: "How do I get support?",
    a: "WhatsApp support 7 days a week, 9am–11pm UK time. We typically respond within 5–10 minutes."
  }
]

export default function PricingPage() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '/pricing'

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
    name: 'Smart Live TV IPTV Subscription',
    description: 'Access to 230,000+ live TV channels including all Sky Sports, TNT Sports, beIN Sports, UFC, NBA, Premier League and 50+ countries. 4K quality, works on Firestick, Smart TV, Android and iPhone.',
    brand: {
      '@type': 'Brand',
      name: 'Smart Live TV',
    },
    image: `${ENV.BASE_URL}/og-default.png`,
    url: `${ENV.BASE_URL}/pricing`,
    offers: [
      {
        '@type': 'Offer',
        name: '1 Month Subscription',
        price: '12.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        validFrom: new Date().toISOString().split('T')[0],
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toISOString().split('T')[0],
        seller: {
          '@type': 'Organization',
          name: 'Smart Live TV',
        },
      },
      {
        '@type': 'Offer',
        name: '3 Month Subscription',
        price: '24.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        validFrom: new Date().toISOString().split('T')[0],
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toISOString().split('T')[0],
        seller: {
          '@type': 'Organization',
          name: 'Smart Live TV',
        },
      },
      {
        '@type': 'Offer',
        name: '6 Month Subscription',
        price: '36.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        seller: { '@type': 'Organization', name: 'Smart Live TV' },
      },
      {
        '@type': 'Offer',
        name: '12 Month Subscription',
        price: '54.00',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `${ENV.BASE_URL}/free-trial`,
        seller: { '@type': 'Organization', name: 'Smart Live TV' },
      },
    ],
    // NOTE: Only add AggregateRating once you have real reviews
    // Fake ratings are a Google manual action — do not fabricate
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
        <StaggerIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto py-6 pb-16">
          
          {/* CARD 1 — 1 MONTH */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Starter</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£12</span>
            </div>
            <div className="text-xs text-[#00e676] font-bold mt-1 mb-6">1 Month</div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "230,000+ Live Channels & VOD",
                "4K / Ultra HD Quality",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "VPN Privacy Protection Built-in",
                "Works on ALL Devices",
                "Firestick, Smart TV, Android, iPhone, PC, Mac",
                "Dedicated 24/7 Customer Support",
                "Free 24-Hour Trial Before You Pay",
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
              href="/free-trial"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm border border-[#2a2a3a] hover:border-[#00e676] text-white transition-all"
            >
              Claim Free Trial →
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              or <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-400">buy directly →</a>
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
                "230,000+ Live Channels & VOD",
                "4K / Ultra HD Quality",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "VPN Privacy Protection Built-in",
                "Works on ALL Devices",
                "Firestick, Smart TV, Android, iPhone, PC, Mac",
                "Dedicated 24/7 Customer Support",
                "Free 24-Hour Trial Before You Pay",
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
            
            <a 
              href={storeUrl} target="_blank" rel="noopener noreferrer"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm bg-[#00e676] hover:bg-[#00ff87] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all"
            >
              Buy Now →
            </a>
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
                "230,000+ Live Channels & VOD",
                "4K / Ultra HD Quality",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "VPN Privacy Protection Built-in",
                "Works on ALL Devices",
                "Firestick, Smart TV, Android, iPhone, PC, Mac",
                "Dedicated 24/7 Customer Support",
                "Free 24-Hour Trial Before You Pay",
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
              href="/free-trial"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm border border-[#2a2a3a] hover:border-[#00e676] text-white transition-all"
            >
              Claim Free Trial →
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              or <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-400">buy directly →</a>
            </p>
          </div>

          {/* CARD 4 — 12 MONTHS */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col pt-8 md:pt-8 mt-4 lg:mt-0">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Ultimate</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£54</span>
            </div>
            <div className="text-xs text-[#00e676] font-bold mt-1 mb-6">12 Months <span className="text-gray-400 font-normal ml-2">Only £4.50/mo</span></div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "230,000+ Live Channels & VOD",
                "4K / Ultra HD Quality",
                "Anti-Buffer Technology",
                "Electronic Program Guide (EPG)",
                "VPN Privacy Protection Built-in",
                "Works on ALL Devices",
                "Firestick, Smart TV, Android, iPhone, PC, Mac",
                "Dedicated 24/7 Customer Support",
                "Free 24-Hour Trial Before You Pay",
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
              href="/free-trial"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm border border-[#2a2a3a] hover:border-[#00e676] text-white transition-all"
            >
              Claim Free Trial →
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              or <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-400">buy directly →</a>
            </p>
          </div>

        </StaggerIn>
        
        <p className="text-center text-gray-500 text-sm mt-8">
          All plans include the full channel package. 
          Longer subscriptions simply give you better value per month. 
          Not sure? <Link href="/free-trial" className="text-[#00e676]">
          Try free for 24 hours first</Link> — no card needed.
        </p>
      </section>
      </FadeIn>

      {/* TRUST BADGES */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-8 max-w-2xl mx-auto">
        {[
          { icon: "🔒", text: "Secure Payment" },
          { icon: "↩️", text: "7-Day Money Back" },
          { icon: "⚡", text: "Instant Activation" },
          { icon: "🚫", text: "No Contract" },
          { icon: "📞", text: "24/7 Support" },
        ].map(badge => (
          <div key={badge.text} className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3a] rounded-full px-4 py-2">
            <span className="text-sm">{badge.icon}</span>
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
            <div className="text-3xl mb-4">⚽</div>
            <div className="font-bold text-white text-sm mb-2">All UK Sport</div>
            <div className="text-xs text-gray-500">Sky Sports, TNT, Premier Sports, Eurosport</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-4">🏆</div>
            <div className="font-bold text-white text-sm mb-2">Champions League</div>
            <div className="text-xs text-gray-500">Every UCL & Europa League match live</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-4">🥊</div>
            <div className="font-bold text-white text-sm mb-2">UFC & Boxing</div>
            <div className="text-xs text-gray-500">Every UFC event + major boxing PPV</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-4">📺</div>
            <div className="font-bold text-white text-sm mb-2">UK TV Channels</div>
            <div className="text-xs text-gray-500">BBC, ITV, Channel 4, Sky Atlantic and more</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-4">🎬</div>
            <div className="font-bold text-white text-sm mb-2">Movies & Series</div>
            <div className="text-xs text-gray-500">40,000+ on-demand titles in HD & 4K</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-4">🌍</div>
            <div className="font-bold text-white text-sm mb-2">50+ Countries</div>
            <div className="text-xs text-gray-500">Arabic, French, Indian, US and more</div>
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
            <div className="text-4xl mb-3">📺</div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">Amazon Firestick</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
          <Link href="/setup/smart-tv" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="text-4xl mb-3">📺</div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">Smart TV</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
          <Link href="/setup/android" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="text-4xl mb-3">📱</div>
            <div className="font-bold text-white text-sm group-hover:text-[#00e676] transition-colors">Android</div>
            <div className="text-xs text-[#00e676] mt-1">Setup guide →</div>
          </Link>
          <Link href="/setup/iphone" className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center hover:border-[#00e676]/30 transition-colors block group">
            <div className="text-4xl mb-3">📱</div>
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
          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || '/pricing'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#00e676] hover:bg-[#00ff87] text-black font-extrabold px-10 py-4 rounded-xl text-base shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all touch-manipulation"
          >
            Buy Now — Get Instant Access →
          </a>
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
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#00e676] text-black font-bold text-sm py-3.5 rounded-xl text-center"
          >
            Get Free Trial
          </a>
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
