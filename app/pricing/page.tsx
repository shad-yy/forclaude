import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqAccordion } from '@/components/pricing/faq-accordion'

export const metadata: Metadata = {
  title: 'IPTV Pricing UK — From £5.99/mo | Smart Live TV',
  description:
    'Stream Premier League, Champions League & 15,000+ channels from £5.99/mo. No contract. Start your free 24-hour trial today.',
  alternates: {
    canonical: 'https://smartlivetv.com/pricing',
  },
  openGraph: {
    title: 'IPTV Pricing UK — From £5.99/mo | Smart Live TV',
    description: 'Flexible IPTV plans from £5.99/mo. No contracts, cancel anytime. Free 24-hour trial.',
    url: 'https://smartlivetv.com/pricing',
    siteName: 'Smart Live TV',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
  },
}

const faqs = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "No. Your 24-hour free trial requires no credit card or payment details. Just sign up and start watching immediately."
  },
  {
    q: "How long does setup take?",
    a: "Most customers are watching live TV within 5 minutes. We provide step-by-step guides for every device."
  },
  {
    q: "Can I watch on multiple screens?",
    a: "Yes. Starter supports 1 screen, Sports Fan supports 2 screens, and Ultimate supports 4 screens simultaneously."
  },
  {
    q: "What sports channels are included?",
    a: "All Sky Sports channels, TNT Sports 1-4, beIN Sports 1-7, Eurosport 1-2, Premier Sports, UFC Fight Pass, NFL Game Pass, NBA League Pass, and more."
  },
  {
    q: "Is there a contract?",
    a: "No contract. Cancel any time before your next billing date. No cancellation fees."
  },
  {
    q: "What happens after the 24-hour trial?",
    a: "Nothing happens automatically. We will contact you to confirm if you want to continue. You choose your plan and pay only when you're ready."
  },
  {
    q: "Which countries can I watch from?",
    a: "Anywhere in the world. No regional restrictions or VPN needed."
  },
  {
    q: "How do I get support?",
    a: "WhatsApp support 7 days a week, 9am–11pm UK time. We typically respond within 30 minutes."
  }
]

export default function PricingPage() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '#'

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

  return (
    <main className="min-h-screen font-sans bg-[#0a0a0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* SECTION 1 — HERO */}
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
        
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="bg-[#00e676] text-black font-bold px-6 py-2 rounded-lg text-sm cursor-default">
            Monthly
          </div>
          <div className="bg-[#12121a] border border-[#2a2a3a] text-gray-400 px-6 py-2 rounded-lg text-sm cursor-default">
            Annual — Save 20%
          </div>
        </div>
      </section>

      {/* SECTION 2 — PRICING CARDS */}
      <section className="bg-[#0a0a0f] pb-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* CARD 1 — STARTER */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Starter</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£5.99</span>
              <span className="text-gray-500 text-lg ml-1">/mo</span>
            </div>
            <div className="text-xs text-gray-600 mt-1 mb-6">Billed monthly · Cancel anytime</div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "5,000+ live channels",
                "Full UK channel package (BBC, ITV, Sky, Channel 4)",
                "Sky Sports Premier League & Football",
                "TNT Sports (Champions League)",
                "HD quality streaming",
                "Works on Firestick, Smart TV, Android, iPhone",
                "1 connection (1 screen at a time)",
                "24-hour free trial included"
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
              Start Free Trial →
            </Link>
          </div>

          {/* CARD 2 — SPORTS FAN (RECOMMENDED) */}
          <div className="bg-[#12121a] border-2 border-[#00e676] rounded-3xl p-8 relative shadow-[0_0_40px_rgba(0,230,118,0.15)] md:scale-105 flex flex-col z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00e676] text-black text-xs font-extrabold px-6 py-1.5 rounded-full whitespace-nowrap">
              ⚽ Most Popular
            </div>
            
            <div className="text-sm font-bold uppercase tracking-widest text-[#00e676] mb-2">Sports Fan</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£9.99</span>
              <span className="text-gray-500 text-lg ml-1">/mo</span>
            </div>
            <div className="text-xs text-gray-600 mt-1 mb-6">Billed monthly · Cancel anytime</div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "15,000+ live channels",
                "Everything in Starter, plus:",
                "ALL Sky Sports channels (F1, Cricket, Golf, Arena)",
                "ALL beIN Sports (7 channels)",
                "Premier Sports 1 & 2 (La Liga, Scottish Prem)",
                "Eurosport 1 & 2 (Tennis, Cycling, Olympics)",
                "UFC Fight Pass",
                "NFL Game Pass & NBA League Pass",
                "4K Ultra HD streaming",
                "2 connections (2 screens simultaneously)",
                "40,000+ on-demand movies & shows",
                "24-hour free trial included"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00e676] font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/free-trial"
              className="block text-center w-full mt-8 py-4 rounded-xl font-bold text-sm bg-[#00e676] hover:bg-[#00ff87] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all"
            >
              Get My Free Trial →
            </Link>
          </div>

          {/* CARD 3 — ULTIMATE */}
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 flex flex-col pt-8 md:pt-8 mt-4 md:mt-0">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Ultimate</div>
            <div>
              <span className="text-5xl font-extrabold text-white">£14.99</span>
              <span className="text-gray-500 text-lg ml-1">/mo</span>
            </div>
            <div className="text-xs text-gray-600 mt-1 mb-6">Billed monthly · Cancel anytime</div>
            
            <div className="border-t border-[#2a2a3a] mb-6"></div>
            
            <ul className="space-y-3 flex-grow">
              {[
                "20,000+ live channels",
                "Everything in Sports Fan, plus:",
                "Full international package (Arabic, French, German, Indian, US, and 50+ countries)",
                "Sky Cinema (all 10 channels)",
                "ALL Sky Atlantic, Sky Max, Sky Comedy",
                "Amazon Prime Video channels",
                "Adult content (18+ verified)",
                "4 connections (4 screens simultaneously)",
                "Priority customer support",
                "24-hour free trial included"
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
              Start Free Trial →
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 3 — WHAT'S INCLUDED */}
      <section className="bg-[#12121a] border-y border-[#2a2a3a] py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-4">
          What You Get Access To
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Every channel is included in your plan — no add-ons, no hidden fees, no blackouts.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-3">⚽</div>
            <div className="font-bold text-white text-sm mb-1">All UK Sport</div>
            <div className="text-xs text-gray-500">Sky Sports, TNT, Premier Sports, Eurosport</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-3">🏆</div>
            <div className="font-bold text-white text-sm mb-1">Champions League</div>
            <div className="text-xs text-gray-500">Every UCL & Europa League match live</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-3">🥊</div>
            <div className="font-bold text-white text-sm mb-1">UFC & Boxing</div>
            <div className="text-xs text-gray-500">Every UFC event + major boxing PPV</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-3">📺</div>
            <div className="font-bold text-white text-sm mb-1">UK TV Channels</div>
            <div className="text-xs text-gray-500">BBC, ITV, Channel 4, Sky Atlantic and more</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-3">🎬</div>
            <div className="font-bold text-white text-sm mb-1">Movies & Series</div>
            <div className="text-xs text-gray-500">40,000+ on-demand titles in HD & 4K</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-[#2a2a3a]">
            <div className="text-3xl mb-3">🌍</div>
            <div className="font-bold text-white text-sm mb-1">50+ Countries</div>
            <div className="text-xs text-gray-500">Arabic, French, Indian, US and more</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — DEVICES */}
      <section className="bg-[#0a0a0f] py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          Works On Every Device You Own
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
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
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Free setup guides available for all devices
        </p>
      </section>

      {/* SECTION 5 — FAQ */}
      <section className="bg-[#12121a] border-t border-[#2a2a3a] py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          Questions Answered
        </h2>
        
        <FaqAccordion />
      </section>

      {/* SECTION 6 — FINAL CTA BAND */}
      <section className="bg-gradient-to-b from-[#0a0a0f] to-[#00e676]/5 border-t border-[#00e676]/10 py-24 px-4 md:px-6 text-center container mx-auto max-w-7xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Ready to Watch Everything Live?
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Start your free 24-hour trial. No card. No contract. Cancel anytime.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <Link 
            href="/free-trial"
            className="w-full md:w-auto px-8 py-4 bg-[#00e676] text-black font-bold rounded-xl hover:bg-[#00ff87] transition-colors shadow-[0_0_15px_rgba(0,230,118,0.3)] whitespace-nowrap"
          >
            Get My Free Trial →
          </Link>
          <a 
            href="https://wa.me/message/PLACEHOLDER"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-8 py-4 bg-[#25D366] text-black font-bold rounded-xl hover:brightness-110 transition-colors whitespace-nowrap"
          >
            💬 Ask on WhatsApp
          </a>
          <Link 
            href="/channels"
            className="w-full md:w-auto px-8 py-4 border border-[#2a2a3a] text-white font-bold rounded-xl hover:border-[#00e676] transition-colors whitespace-nowrap"
          >
            Browse Channels →
          </Link>
        </div>
      </section>

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
            href="https://wa.me/message/PLACEHOLDER"
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
