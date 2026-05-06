import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'

export const metadata: Metadata = {
  title: 'Watch FIFA World Cup 2026 Live | Stream Every Match',
  description: 'Stream every FIFA World Cup 2026 match live in 4K. No blackouts. Works on Firestick, Smart TV, Android and iPhone. Free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/world-cup-2026`,
  },
  openGraph: {
    title: 'Watch FIFA World Cup 2026 Live in 4K',
    description: 'Every match. Every goal. No blackouts. Free trial.',
    images: ['/og-default.png'],
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can I watch the World Cup 2026 live?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Smart Live TV gives you access to every FIFA World Cup 2026 match live in 4K. Works on Firestick, Smart TV, Android, and iPhone. Start your free 24-hour trial at no cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which channels are showing the World Cup 2026 in the UK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In the UK, the World Cup 2026 is shown on ITV and BBC. Smart Live TV includes both channels plus international coverage from beIN Sports, Fox Sports, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I watch the World Cup 2026 from Morocco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Smart Live TV works worldwide with no regional restrictions or VPN required. Stream every World Cup match from Morocco or anywhere else.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free trial to watch the World Cup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Smart Live TV offers a free 24-hour trial with full access to all channels. No credit card required. Perfect for watching a World Cup match before deciding.',
      },
    },
  ],
}

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'FIFA World Cup 2026',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  location: {
    '@type': 'Place',
    name: 'USA, Canada, Mexico',
  },
  description: 'The 23rd FIFA World Cup, hosted across the United States, Canada, and Mexico.',
  url: `${ENV.BASE_URL}/watch/world-cup-2026`,
}

export default function WorldCup2026Page() {
  const groups = [
    'Group A', 'Group B', 'Group C', 'Group D',
    'Group E', 'Group F', 'Group G', 'Group H',
    'Group I', 'Group J', 'Group K', 'Group L',
  ]

  const faqs = faqSchema.mainEntity.map((item: any) => ({
    question: item.name,
    answer: item.acceptedAnswer.text,
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={eventSchema} />

      {/* HERO */}
      <section className="pt-28 md:pt-36 pb-16 text-center px-4 border-b border-[#c8a951]/30"
        style={{
          background: 'linear-gradient(135deg, #0a2a00 0%, #0a0a0f 60%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full text-xs font-bold text-red-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            LIVE NOW — World Cup 2026 Underway
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Watch FIFA World Cup 2026<br />
            <span className="text-[#00e676]">Live — Every Single Match</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            The 2026 World Cup is happening right now across the USA, 
            Canada and Mexico. 48 teams. Every match. Stream it all 
            in 4K with no blackouts, from any device, anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/free-trial"
              className="bg-[#00e676] text-black font-extrabold px-10 py-4 rounded-xl text-lg hover:bg-[#00ff87] transition-all shadow-[0_0_30px_rgba(0,230,118,0.3)]">
              Stream World Cup Free for 24H →
            </Link>
            <Link href="/pricing"
              className="border border-[#2a2a3a] hover:border-[#00e676] text-white font-bold px-10 py-4 rounded-xl text-lg">
              View Pricing Plans
            </Link>
          </div>
          <div className="flex gap-6 justify-center mt-8 flex-wrap text-sm text-gray-400">
            <span>✓ No VPN needed</span>
            <span>✓ Works from Morocco, UK, France & worldwide</span>
            <span>✓ 4K quality</span>
            <span>✓ No card for trial</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 space-y-20">

        {/* WHERE TO WATCH */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8">
            Where to Watch World Cup 2026 in the UK
          </h2>
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 md:p-8">
            <p className="text-gray-300 leading-relaxed mb-6">
              In the UK, the FIFA World Cup 2026 is broadcast on 
              <strong className="text-white"> ITV</strong> and 
              <strong className="text-white"> BBC One</strong> 
              for free-to-air matches. However, not all matches 
              are available on free TV — some are shown exclusively 
              on subscription channels. Smart Live TV includes 
              every broadcast channel showing the World Cup, 
              including ITV, BBC, beIN Sports, and international 
              feeds so you never miss a match.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['ITV HD', 'BBC One HD', 'beIN Sports 1', 'Fox Sports (US Feed)'].map(ch => (
                <div key={ch} className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl p-4 text-center">
                  <div className="text-[#00e676] font-bold text-sm">
                    {ch}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Included
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO WATCH FROM ANYWHERE */}
        <section className="border-t border-[#2a2a3a] pt-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            How to Watch World Cup 2026 from Morocco & Worldwide
          </h2>
          <p className="text-gray-400 mb-8 max-w-3xl">
            Smart Live TV works in every country with no VPN required. 
            Whether you're in Morocco, France, the UAE, or anywhere 
            else — simply install the app on your device and all 
            World Cup matches are available in full HD and 4K.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: 1, t: 'Start Free Trial', d: 'Claim your 24-hour trial via WhatsApp. No card needed.' },
              { n: 2, t: 'Install in 5 Minutes', d: 'We send you a setup guide for your specific device instantly.' },
              { n: 3, t: 'Watch Every Match', d: 'Full World Cup access in 4K. No blackouts. No restrictions.' },
            ].map(s => (
              <div key={s.n} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-[#00e676] text-black font-extrabold flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold text-white mb-2">{s.t}</h3>
                <p className="text-gray-400 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[#2a2a3a] pt-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {faqs.map(f => (
              <div key={f.question} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6">
                <h3 className="font-bold text-white mb-2">
                  {f.question}
                </h3>
                <p className="text-gray-400 text-sm">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-[#00e676]/20 pt-20 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Don't Miss Another World Cup Match
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Free 24-hour trial. No credit card. Works anywhere in the world.
          </p>
          <Link href="/free-trial"
            className="inline-flex items-center bg-[#00e676] text-black font-extrabold px-12 py-5 rounded-xl text-xl hover:bg-[#00ff87] transition-all shadow-[0_0_40px_rgba(0,230,118,0.25)]">
            Watch World Cup Free →
          </Link>
        </section>
      </div>
    </div>
  )
}
