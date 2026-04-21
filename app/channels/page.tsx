import { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import ChannelLibrary from '@/components/channels/channel-library'

export const metadata: Metadata = {
  title: 'IPTV Channel List UK — 15,000+ Live Channels | Smart Live TV',
  description: 'Browse 15,000+ live channels including UK, Arabic, French, German, Indian, US and more. Premier League, La Liga, UFC, Sky Sports, BT Sport & more. Free 24-hour trial, no card required.',
  alternates: { canonical: `${ENV.BASE_URL}/channels` },
  openGraph: {
    title: 'IPTV Channel List UK — 15,000+ Channels',
    description: 'Every channel you want. No blackouts. Cancel anytime.',
    images: ['/og-default.png'],
  },
}

// Just reproducing top 10 for the schema, to avoid complex imports from a "use client" component
const TOP_10_CHANNELS = [
  { name: "Sky Sports Premier League", description: "Live Premier League coverage, highlights and analysis." },
  { name: "Sky Sports Football", description: "24/7 football news, matches and exclusive coverage." },
  { name: "BT Sport 1", description: "Champions League, Europa League and top football." },
  { name: "BT Sport 2", description: "More live football including Bundesliga." },
  { name: "La Liga TV", description: "Dedicated Spanish football channel." },
  { name: "Serie A Pass", description: "Every Serie A match live from Italy." },
  { name: "Bundesliga Live", description: "German Bundesliga matches and highlights." },
  { name: "beIN Sports", description: "Ligue 1, international football and more." },
  { name: "ESPN FC", description: "Football news, analysis and live matches." },
  { name: "TNT Sports", description: "Champions League and top European football." },
]

export default function ChannelsPage() {
  const storeUrl = ENV.STORE_URL
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || '#'

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Smart Live TV Channel List",
    "description": "Complete list of 15,000+ channels available with Smart Live TV IPTV subscription",
    "numberOfItems": 15000,
    "itemListElement": TOP_10_CHANNELS.map((ch, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": ch.name,
      "description": ch.description
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#00e676] selection:text-black">
        
        {/* SECTION 1 — HERO */}
        <section className="bg-[#0a0a0f] pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center">
              <span className="bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 px-4 py-1.5 rounded-full text-sm font-bold">
                15,000+ Channels Included
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Every Channel You Love. <br className="hidden sm:block" />
              One Subscription.
            </h1>
            
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-4">
              Browse our full channel library below. Every channel shown is included in your Smart Live TV subscription — no extras, no hidden fees. Available on Firestick, Smart TV, Android and iPhone.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/free-trial"
                className="w-full md:w-auto bg-[#00e676] hover:bg-[#00ff87] text-black font-bold px-8 py-4 rounded-xl text-base transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] text-center flex items-center justify-center whitespace-nowrap"
              >
                Get My Free 24H Trial →
              </Link>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-[#25D366] hover:brightness-110 text-black font-bold px-8 py-4 rounded-xl text-base transition-all text-center flex items-center justify-center whitespace-nowrap"
              >
                💬 Ask on WhatsApp
              </a>
              
              <a
                href="/pricing"
                className="w-full md:w-auto border border-[#2a2a3a] hover:border-[#00e676] text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-base transition-all text-center flex items-center justify-center whitespace-nowrap"
              >
                View Pricing Plans
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8">
              <span className="text-sm text-gray-500 font-medium">✓ No contract</span>
              <span className="text-sm text-gray-500 font-medium">✓ 4K streaming</span>
              <span className="text-sm text-gray-500 font-medium">✓ All devices</span>
              <span className="text-sm text-gray-500 font-medium">✓ Cancel anytime</span>
            </div>
          </div>
        </section>

        {/* SECTION 2 — STATS BAR */}
        <section className="bg-[#12121a] border-y border-[#2a2a3a] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-[#2a2a3a]">
              <div className="flex flex-col p-4 border-b md:border-b-0 border-[#2a2a3a] md:border-none">
                <span className="text-3xl font-extrabold text-[#00e676]">15,000+</span>
                <span className="text-sm text-gray-400 mt-1">Live Channels</span>
              </div>
              <div className="flex flex-col p-4 border-b md:border-b-0 border-[#2a2a3a] md:border-none">
                <span className="text-3xl font-extrabold text-[#00e676]">4K</span>
                <span className="text-sm text-gray-400 mt-1">Stream Quality</span>
              </div>
              <div className="flex flex-col p-4">
                <span className="text-3xl font-extrabold text-[#00e676]">29</span>
                <span className="text-sm text-gray-400 mt-1">Countries</span>
              </div>
              <div className="flex flex-col p-4">
                <span className="text-3xl font-extrabold text-[#00e676]">24H</span>
                <span className="text-sm text-gray-400 mt-1">Free Trial</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — CHANNEL LIBRARY (Client Component) */}
        <ChannelLibrary storeUrl={storeUrl} />

        {/* SECTION 4 — REAL STATS BAND */}
        <section className="bg-[#12121a] border-y border-[#2a2a3a] py-12 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-10">Why Sports Fans Choose Smart Live TV</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-[#00e676] mb-2">10</span>
                <span className="text-sm text-white font-medium">Free trials activated daily</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-[#00e676] mb-2">5 min</span>
                <span className="text-sm text-white font-medium">Average setup time</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-[#00e676] mb-2">24H</span>
                <span className="text-sm text-white font-medium">Full trial period</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm text-center mt-8">
              Join our growing community of UK subscribers — start your free trial today.
            </p>
          </div>
        </section>

        {/* SECTION 5 — BOTTOM CTA BAND */}
        <section className="bg-gradient-to-r from-[#00e676]/10 via-[#0a0a0f] to-[#00e676]/10 border-t border-[#00e676]/20 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Ready to Watch Every Channel?</h2>
            <p className="text-gray-400 mt-4 text-lg">
              Start your free 24-hour trial. No credit card. Cancel anytime.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-10">
              <Link
                href="/free-trial"
                className="w-full md:w-auto bg-[#00e676] hover:bg-[#00ff87] text-black font-bold px-8 py-4 rounded-xl text-base transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] text-center flex items-center justify-center whitespace-nowrap"
              >
                Get My Free 24H Trial →
              </Link>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-[#25D366] hover:brightness-110 text-black font-bold px-8 py-4 rounded-xl text-base transition-all text-center flex items-center justify-center whitespace-nowrap"
              >
                💬 Ask on WhatsApp
              </a>
              
              <a
                href="/pricing"
                className="w-full md:w-auto border border-[#2a2a3a] hover:border-[#00e676] text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-base transition-all text-center flex items-center justify-center whitespace-nowrap"
              >
                View Pricing Plans
              </a>
            </div>
          </div>
        </section>

        {/* STICKY BOTTOM BAR (Mobile only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-t border-[#2a2a3a] p-4 pb-safe flex gap-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#00e676] text-black font-bold flex-1 py-3 text-center rounded-xl text-sm whitespace-nowrap overflow-hidden text-ellipsis px-2"
          >
            Get Free Trial
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-black font-bold flex-1 py-3 text-center rounded-xl text-sm whitespace-nowrap overflow-hidden text-ellipsis px-2"
          >
            💬 WhatsApp
          </a>
        </div>
        
        {/* Spacer to prevent content from hiding behind sticky bar on mobile */}
        <div className="h-20 md:h-0" />
      </div>
    </>
  )
}
