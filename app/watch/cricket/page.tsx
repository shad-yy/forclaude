import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { AnswerBlock } from '@/components/seo/AnswerBlock'

export const metadata: Metadata = {
  title: 'Watch Cricket Live | Stream Tests, ODIs & T20s — Smart Live TV',
  description:
    'Stream every cricket match live in 4K — The Ashes, ICC Champions Trophy, IPL, and more. Sky Sports Cricket included. No contract from £12/month. Free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/cricket`,
  },
  openGraph: {
    title: 'Watch Cricket Live | Stream Tests, ODIs & T20s — Smart Live TV',
    description: 'Stream every cricket match live in 4K. Sky Sports Cricket, Willow TV, and all international feeds included. Free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Watch Cricket Live on Smart Live TV' }],
    url: `${ENV.BASE_URL}/watch/cricket`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Cricket Live | Stream Tests, ODIs & T20s — Smart Live TV',
    images: ['/og-default.png'],
  },
}

/** Key upcoming cricket events — update periodically */
const UPCOMING_EVENTS = [
  {
    event: 'ICC Champions Trophy 2025 (Super 8s/Finals)',
    dates: 'February–March 2026 (rescheduled stages)',
    venue: 'Pakistan & UAE',
    broadcaster: 'Sky Sports Cricket',
    format: 'ODI',
    description: 'The top 8 cricket nations compete in the ICC\'s premier 50-over knockout tournament.',
  },
  {
    event: 'The Ashes 2026/27',
    dates: 'November 2026 – January 2027',
    venue: 'Australia (5-match Test series)',
    broadcaster: 'TNT Sports / BT Sport',
    format: 'Test',
    description: 'England tour Australia for the iconic Ashes Test series. Five Tests across Australian venues.',
  },
  {
    event: 'Indian Premier League (IPL) 2027',
    dates: 'March – May 2027',
    venue: 'India',
    broadcaster: 'Sky Sports Cricket',
    format: 'T20',
    description: 'The world\'s biggest T20 franchise league — every match live from India.',
  },
  {
    event: 'ICC T20 World Cup 2026',
    dates: 'February–March 2026',
    venue: 'India & Sri Lanka',
    broadcaster: 'Sky Sports Cricket',
    format: 'T20I',
    description: 'The global T20 showcase with 20 nations competing across Indian and Sri Lankan venues.',
  },
]

export default function CricketPage() {
  const faqs = [
    {
      question: 'Can I watch cricket live without Sky Sports?',
      answer: 'Yes. Smart Live TV includes Sky Sports Cricket, Willow TV, and all international cricket feeds from £12/month. That\'s compared to £43/month for Sky Sports standalone. A free 24-hour trial is available.',
    },
    {
      question: 'Does IPTV include The Ashes coverage?',
      answer: 'Yes. Smart Live TV carries the full Ashes series including TNT Sports (formerly BT Sport) and all Australian broadcast feeds. Every ball of every Test, live in 4K.',
    },
    {
      question: 'Can I watch IPL live in the UK?',
      answer: 'Yes. Smart Live TV includes Sky Sports Cricket which holds UK rights to the IPL. Every IPL match is available live, including the playoffs and final.',
    },
    {
      question: 'What cricket channels are included?',
      answer: 'Smart Live TV includes Sky Sports Cricket, TNT Sports, Willow TV, Star Sports, SuperSport, beIN Sports, and PTV Sports. Coverage spans Tests, ODIs, T20Is, IPL, BBL, PSL, and county cricket.',
    },
    {
      question: 'Can I watch cricket from abroad?',
      answer: 'Smart Live TV works worldwide with no regional restrictions. Watch cricket from any country — no VPN required.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/cricket#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'Cricket', item: `${ENV.BASE_URL}/watch/cricket` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      {/* HERO */}
      <FadeIn>
        <section
          className="pt-28 md:pt-36 pb-16 text-center px-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #0a1a00 0%, #0a0a0f 100%)',
            borderColor: '#2e7d32',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Watch Cricket Live — Every Format, Every Tour
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#66bb6a] text-sm font-bold px-4 py-2 rounded-full mb-6">
              🏏 Tests • ODIs • T20Is • IPL • The Ashes • ICC Events
            </div>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream every cricket match live in 4K UHD. Sky Sports Cricket, Willow TV,
              and all international feeds included — from £12/month with no contract.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#2e7d32"
              className="px-8 py-4 text-lg rounded-lg"
            >
              Start Free Trial →
            </ShimmerButton>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
        <div className="lg:col-span-2 space-y-0">

          {/* AEO/GEO ANSWER BLOCK */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20">
              <AnswerBlock
                answer="Smart Live TV includes Sky Sports Cricket, Willow TV, and all international cricket channels from £12 per month — compared to £43 per month for Sky Sports standalone. You get every Test, ODI, T20I, IPL, and ICC tournament match live in 4K. A free 24-hour trial is available."
                facts={[
                  "Includes Sky Sports Cricket, TNT Sports, Willow TV, and Star Sports",
                  "Complete coverage of The Ashes, IPL, ICC tournaments, and international Tests",
                  "Stream in 4K Ultra HD on Firestick, Smart TV, iOS, and Android",
                  "Free 24-hour trial with instant activation via WhatsApp",
                ]}
              />
            </section>
          </FadeIn>

          {/* UPCOMING EVENTS */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming Cricket Events</h2>
              <StaggerIn className="space-y-4">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.event} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#2e7d32]/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight pr-2">{event.event}</h3>
                      <span className="text-xs bg-[#2e7d32]/10 text-[#66bb6a] px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 border border-[#2e7d32]/20">
                        {event.format}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>📅 {event.dates}</span>
                      <span>📍 {event.venue}</span>
                      <span>📺 {event.broadcaster}</span>
                    </div>
                  </div>
                ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* CHANNELS INCLUDED */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Cricket Channels Included</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    channel: 'Sky Sports Cricket',
                    desc: 'England home Tests, ODIs, T20Is, IPL, The Hundred, and county cricket.',
                    price: '£43/mo on Sky',
                  },
                  {
                    channel: 'TNT Sports',
                    desc: 'The Ashes (Australia tours), selected international series.',
                    price: '£25/mo on discovery+',
                  },
                  {
                    channel: 'Willow TV / Willow Cricket',
                    desc: 'Comprehensive international cricket, ICC events, and bilateral series.',
                    price: 'Geo-restricted (US/CA)',
                  },
                  {
                    channel: 'Star Sports / SuperSport',
                    desc: 'Indian domestic cricket, South African tours, and Asian broadcast feeds.',
                    price: 'Geo-restricted',
                  },
                ].map(ch => (
                  <div key={ch.channel} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white">{ch.channel}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{ch.price}</span>
                    </div>
                    <p className="text-sm text-gray-400">{ch.desc}</p>
                  </div>
                ))}
              </StaggerIn>
              <p className="text-center text-gray-500 text-sm mt-6">
                All channels included in every Smart Live TV plan from £12/month. No add-ons required.
              </p>
            </section>
          </FadeIn>

          {/* HOW TO WATCH */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch Cricket Live</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access to all cricket channels.' },
                { n: 2, title: 'Set up on any device', body: <>Works on <Link href="/setup/firestick" className="text-[#66bb6a] hover:underline">Firestick</Link>, <Link href="/setup/smart-tv" className="text-[#66bb6a] hover:underline">Smart TV</Link>, <Link href="/setup/android" className="text-[#66bb6a] hover:underline">Android</Link>, <Link href="/setup/iphone" className="text-[#66bb6a] hover:underline">iPhone</Link> and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every session live in stunning 4K UHD — Tests, ODIs, and T20s.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#2e7d32' }}>
                    {s.n}
                  </div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* COST COMPARISON */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Cricket Streaming Cost Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Cricket Coverage</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">The Ashes?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { service: 'Sky Sports', cost: '£43/mo', coverage: 'England home, IPL, The Hundred', ashes: 'No' },
                      { service: 'TNT Sports', cost: '£25/mo', coverage: 'The Ashes only', ashes: 'Yes' },
                      { service: 'Both combined', cost: '£68/mo', coverage: 'Most UK cricket', ashes: 'Yes' },
                      { service: 'Smart Live TV', cost: '£12/mo', coverage: 'ALL of the above + international', ashes: 'Yes' },
                    ].map(row => (
                      <tr key={row.service} className={`border-b border-[#1a1a2a] ${row.service === 'Smart Live TV' ? 'bg-[#2e7d32]/5' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${row.service === 'Smart Live TV' ? 'text-[#66bb6a]' : 'text-white'}`}>{row.service}</td>
                        <td className="py-3 px-4 text-gray-300">{row.cost}</td>
                        <td className="py-3 px-4 text-gray-300">{row.coverage}</td>
                        <td className="py-3 px-4 text-gray-300">{row.ashes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          {/* FAQ */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Cricket FAQ</h2>
              <StaggerIn className="space-y-6">
              {faqs.map((f) => (
                <div key={f.question} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <h3 className="font-bold text-white mb-2">{f.question}</h3>
                  <p className="text-sm text-gray-400">{f.answer}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>
        </div>

        {/* Right Column CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-950/60 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b" style={{ borderColor: '#2e7d32' }}>
              <h3 className="text-lg font-extrabold text-white">Watch Cricket Live</h3>
              <p className="text-sm text-gray-400 mt-2">
                Every Test, ODI, T20I, and franchise league — 24-hour free trial.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-white">£12</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">✅ Sky Sports Cricket</li>
                <li className="flex items-center gap-2">✅ TNT Sports (The Ashes)</li>
                <li className="flex items-center gap-2">✅ Willow TV</li>
                <li className="flex items-center gap-2">✅ Star Sports</li>
                <li className="flex items-center gap-2">✅ 4K UHD streaming</li>
                <li className="flex items-center gap-2">✅ No contract</li>
              </ul>
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#2e7d32"
                className="w-full text-center py-4 rounded-xl text-white font-extrabold"
              >
                Claim Free Trial →
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
