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
  title: 'Watch Tennis Live | Stream ATP, WTA & Grand Slams \u2014 Smart Live TV',
  description:
    'Stream every tennis tournament live in 4K \u2014 Wimbledon, Australian Open, ATP Finals, and the full ATP/WTA Tour. Sky Sports Tennis included. No contract from \u00a312/month. Free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/tennis`,
  },
  openGraph: {
    title: 'Watch Tennis Live | Stream ATP, WTA & Grand Slams \u2014 Smart Live TV',
    description: 'Stream every tennis tournament live in 4K. Sky Sports Tennis, BBC Wimbledon, and TNT Sports Grand Slams included. Free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Watch Tennis Live on Smart Live TV' }],
    url: `${ENV.BASE_URL}/watch/tennis`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Tennis Live | Stream ATP, WTA & Grand Slams \u2014 Smart Live TV',
    images: ['/og-default.png'],
  },
}

/** Key upcoming tennis events \u2014 update periodically */
const UPCOMING_EVENTS = [
  {
    event: 'Nitto ATP Finals 2026',
    dates: '15\u201322 November 2026',
    venue: 'Inalpi Arena, Turin, Italy',
    broadcaster: 'Sky Sports Tennis',
    format: 'ATP',
    description: 'The season-ending showpiece featuring the top 8 men\u0027s singles players and top 8 doubles teams.',
  },
  {
    event: 'Australian Open 2027',
    dates: '17\u201331 January 2027',
    venue: 'Melbourne Park, Melbourne',
    broadcaster: 'TNT Sports / discovery+',
    format: 'Grand Slam',
    description: 'The first Grand Slam of 2027. Two weeks of action from Melbourne Park, live in the early hours UK time.',
  },
  {
    event: 'Roland-Garros (French Open) 2027',
    dates: 'May\u2013June 2027',
    venue: 'Stade Roland-Garros, Paris',
    broadcaster: 'TNT Sports / discovery+',
    format: 'Grand Slam',
    description: 'The clay-court Grand Slam from Paris. Every match live across TNT Sports and discovery+.',
  },
  {
    event: 'Wimbledon 2027',
    dates: '28 June \u2013 11 July 2027',
    venue: 'All England Club, London',
    broadcaster: 'BBC (free-to-air)',
    format: 'Grand Slam',
    description: 'The Championships at the All England Club. BBC holds rights through 2033 \u2014 free-to-air coverage on BBC and iPlayer.',
  },
]

export default function TennisPage() {
  const faqs = [
    {
      question: 'Can I watch tennis live without Sky Sports?',
      answer: 'Yes. Smart Live TV includes Sky Sports Tennis, TNT Sports, and all international tennis feeds from \u00a312/month. That\u0027s compared to \u00a327/month for a NOW Sports membership. A free 24-hour trial is available.',
    },
    {
      question: 'Is Wimbledon included with Smart Live TV?',
      answer: 'Wimbledon is broadcast free-to-air on the BBC in the UK. Smart Live TV includes BBC channels, plus every other tennis tournament via Sky Sports Tennis and TNT Sports.',
    },
    {
      question: 'Can I watch the Australian Open live in the UK?',
      answer: 'Yes. The Australian Open is shown on TNT Sports / discovery+ in the UK. Smart Live TV includes TNT Sports, so every match is available live \u2014 typically from 00:00\u201310:00 GMT.',
    },
    {
      question: 'What tennis channels are included?',
      answer: 'Smart Live TV includes Sky Sports Tennis (ATP/WTA Tour, US Open, ATP Finals), TNT Sports (Australian Open, French Open), BBC (Wimbledon), ESPN, beIN Sports, and Eurosport. Every Grand Slam and tour event is covered.',
    },
    {
      question: 'Can I watch tennis from abroad?',
      answer: 'Smart Live TV works worldwide with no regional restrictions. Watch tennis from any country \u2014 no VPN required.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/tennis#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'Tennis', item: `${ENV.BASE_URL}/watch/tennis` },
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
            background: 'linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%)',
            borderColor: '#7b1fa2',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Watch Tennis Live {'\u2014'} Every Grand Slam & Tour Event
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#7b1fa2]/10 border border-[#7b1fa2]/30 text-[#ce93d8] text-sm font-bold px-4 py-2 rounded-full mb-6">
              {'\ud83c\udfbe'} Wimbledon {'\u2022'} ATP Tour {'\u2022'} WTA Tour {'\u2022'} Grand Slams {'\u2022'} ATP Finals
            </div>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream every tennis match live in 4K UHD. Sky Sports Tennis, TNT Sports Grand Slams,
              and BBC Wimbledon included {'\u2014'} from {'\u00a3'}12/month with no contract.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#7b1fa2"
              className="px-8 py-4 text-lg rounded-lg"
            >
              Start Free Trial {'\u2192'}
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
                answer={`Smart Live TV includes Sky Sports Tennis, TNT Sports, and all international tennis channels from \u00a312 per month \u2014 compared to \u00a327 per month for a NOW Sports membership. You get every Grand Slam, every ATP and WTA tour event, and the season-ending ATP Finals live in 4K. A free 24-hour trial is available.`}
                facts={[
                  "Includes Sky Sports Tennis, TNT Sports, BBC, ESPN, and Eurosport",
                  "All four Grand Slams: Australian Open, Roland-Garros, Wimbledon, US Open",
                  "Full ATP Masters 1000s, ATP 500s, WTA 1000s, and WTA 500s",
                  "Free 24-hour trial with instant activation via WhatsApp",
                ]}
              />
            </section>
          </FadeIn>

          {/* UPCOMING EVENTS */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming Tennis Events</h2>
              <StaggerIn className="space-y-4">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.event} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#7b1fa2]/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight pr-2">{event.event}</h3>
                      <span className="text-xs bg-[#7b1fa2]/10 text-[#ce93d8] px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 border border-[#7b1fa2]/20">
                        {event.format}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>{'\ud83d\udcc5'} {event.dates}</span>
                      <span>{'\ud83d\udccd'} {event.venue}</span>
                      <span>{'\ud83d\udcfa'} {event.broadcaster}</span>
                    </div>
                  </div>
                ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* CHANNELS INCLUDED */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Tennis Channels Included</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    channel: 'Sky Sports Tennis',
                    desc: 'ATP Masters 1000s, ATP 500s/250s, WTA 1000s/500s, US Open, and ATP Finals.',
                    price: '\u00a327/mo on NOW',
                  },
                  {
                    channel: 'TNT Sports / discovery+',
                    desc: 'Australian Open, Roland-Garros (French Open), and selected ATP/WTA events.',
                    price: '\u00a325/mo on discovery+',
                  },
                  {
                    channel: 'BBC (Wimbledon)',
                    desc: 'Full Wimbledon coverage free-to-air. BBC holds rights through 2033.',
                    price: 'Free (TV licence)',
                  },
                  {
                    channel: 'ESPN / Eurosport / beIN Sports',
                    desc: 'International feeds covering all Grand Slams, WTA Finals, and global tour events.',
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
                All channels included in every Smart Live TV plan from {'\u00a3'}12/month. No add-ons required.
              </p>
            </section>
          </FadeIn>

          {/* HOW TO WATCH */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch Tennis Live</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access to all tennis channels.' },
                { n: 2, title: 'Set up on any device', body: <>Works on <Link href="/setup/firestick" className="text-[#ce93d8] hover:underline">Firestick</Link>, <Link href="/setup/smart-tv" className="text-[#ce93d8] hover:underline">Smart TV</Link>, <Link href="/setup/android" className="text-[#ce93d8] hover:underline">Android</Link>, <Link href="/setup/iphone" className="text-[#ce93d8] hover:underline">iPhone</Link> and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every match live in stunning 4K UHD \u2014 Grand Slams, Masters, and tour events.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#7b1fa2' }}>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Tennis Streaming Cost Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Tennis Coverage</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">All Grand Slams?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { service: 'NOW Sports (Sky)', cost: '\u00a327/mo', coverage: 'ATP/WTA Tour, US Open, ATP Finals', slams: 'No (2 of 4)' },
                      { service: 'TNT Sports', cost: '\u00a325/mo', coverage: 'Australian Open, French Open', slams: 'No (2 of 4)' },
                      { service: 'Both combined', cost: '\u00a352/mo', coverage: 'All pay-TV tennis', slams: 'Yes (with BBC)' },
                      { service: 'Smart Live TV', cost: '\u00a312/mo', coverage: 'ALL of the above + international', slams: 'Yes' },
                    ].map(row => (
                      <tr key={row.service} className={`border-b border-[#1a1a2a] ${row.service === 'Smart Live TV' ? 'bg-[#7b1fa2]/5' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${row.service === 'Smart Live TV' ? 'text-[#ce93d8]' : 'text-white'}`}>{row.service}</td>
                        <td className="py-3 px-4 text-gray-300">{row.cost}</td>
                        <td className="py-3 px-4 text-gray-300">{row.coverage}</td>
                        <td className="py-3 px-4 text-gray-300">{row.slams}</td>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Tennis FAQ</h2>
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
            <div className="p-6 border-b" style={{ borderColor: '#7b1fa2' }}>
              <h3 className="text-lg font-extrabold text-white">Watch Tennis Live</h3>
              <p className="text-sm text-gray-400 mt-2">
                Every Grand Slam, every tour event {'\u2014'} 24-hour free trial.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-white">{'\u00a3'}12</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">{'\u2705'} Sky Sports Tennis</li>
                <li className="flex items-center gap-2">{'\u2705'} TNT Sports (Aus Open, French Open)</li>
                <li className="flex items-center gap-2">{'\u2705'} BBC (Wimbledon)</li>
                <li className="flex items-center gap-2">{'\u2705'} ESPN & Eurosport</li>
                <li className="flex items-center gap-2">{'\u2705'} 4K UHD streaming</li>
                <li className="flex items-center gap-2">{'\u2705'} No contract</li>
              </ul>
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#7b1fa2"
                className="w-full text-center py-4 rounded-xl text-white font-extrabold"
              >
                Claim Free Trial {'\u2192'}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
