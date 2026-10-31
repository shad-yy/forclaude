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
  title: 'Watch NFL Live in the UK | Stream Every Game \u2014 Smart Live TV',
  description:
    'Stream every NFL game live in 4K \u2014 Sunday double-headers, RedZone, playoffs, and Super Bowl LXI. Sky Sports NFL included. No contract from \u00a312/month. Free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/nfl`,
  },
  openGraph: {
    title: 'Watch NFL Live in the UK | Stream Every Game \u2014 Smart Live TV',
    description: 'Stream every NFL game live in 4K. Sky Sports NFL, RedZone, and Channel 5 coverage included. Free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Watch NFL Live on Smart Live TV' }],
    url: `${ENV.BASE_URL}/watch/nfl`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch NFL Live in the UK | Stream Every Game \u2014 Smart Live TV',
    images: ['/og-default.png'],
  },
}

/** Key upcoming NFL events \u2014 update periodically */
const UPCOMING_EVENTS = [
  {
    event: 'NFL 2026 Regular Season',
    dates: 'September 2026 \u2013 January 2027',
    venue: 'Stadiums across the USA & London',
    broadcaster: 'Sky Sports NFL',
    format: 'Regular Season',
    description: 'The full 18-week NFL regular season with 170+ live games on Sky Sports, including Sunday double-headers and primetime slots.',
  },
  {
    event: 'NFL London Games 2026',
    dates: 'October 2026 (expected)',
    venue: 'Tottenham Hotspur Stadium & Wembley',
    broadcaster: 'Sky Sports NFL / Channel 5',
    format: 'International Series',
    description: 'Regular-season NFL games in London. All London games broadcast free-to-air on Channel 5 alongside Sky Sports NFL.',
  },
  {
    event: 'NFL Playoffs 2027',
    dates: 'January 2027',
    venue: 'Various (highest seeds host)',
    broadcaster: 'Sky Sports NFL / Channel 5',
    format: 'Playoffs',
    description: 'Wild Card, Divisional Round, and Conference Championships. Every playoff game live on Sky Sports NFL.',
  },
  {
    event: 'Super Bowl LXI',
    dates: '14 February 2027',
    venue: 'SoFi Stadium, Los Angeles',
    broadcaster: 'Sky Sports / Channel 5 / BBC',
    format: 'Championship',
    description: 'The NFL\u0027s championship game from SoFi Stadium in Inglewood, California. Kick-off around 23:30 GMT.',
  },
]

export default function NFLPage() {
  const faqs = [
    {
      question: 'Can I watch NFL live in the UK without Sky?',
      answer: 'Yes. Smart Live TV includes Sky Sports NFL, ESPN, and all international NFL feeds from \u00a312/month. That\u0027s compared to \u00a318/month for a NOW Multi-Sport membership (12-month contract). A free 24-hour trial is available.',
    },
    {
      question: 'Is NFL RedZone included with Smart Live TV?',
      answer: 'Yes. Smart Live TV includes NFL RedZone alongside Sky Sports NFL. Watch every touchdown from every Sunday game with Scott Hanson\u0027s commercial-free coverage.',
    },
    {
      question: 'Can I watch the Super Bowl live in the UK?',
      answer: 'Yes. Super Bowl LXI (14 February 2027) is available on Smart Live TV via Sky Sports, plus it\u0027s broadcast free-to-air on Channel 5 and BBC. Kick-off is approximately 23:30 GMT.',
    },
    {
      question: 'What NFL channels are included?',
      answer: 'Smart Live TV includes Sky Sports NFL, Sky Sports Action, NFL RedZone, ESPN, ESPN2, NFL Network, and Channel 5. That covers every regular-season game, playoff matchup, and the Super Bowl.',
    },
    {
      question: 'Are the NFL London games included?',
      answer: 'Yes. All NFL London games at Tottenham Hotspur Stadium and Wembley are available live on Smart Live TV. They\u0027re also broadcast free-to-air on Channel 5.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/nfl#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'NFL', item: `${ENV.BASE_URL}/watch/nfl` },
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
            background: 'linear-gradient(135deg, #1a0a0a 0%, #0a0a0f 100%)',
            borderColor: '#c62828',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Watch NFL Live in the UK {'\u2014'} Every Game, Every Week
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#c62828]/10 border border-[#c62828]/30 text-[#ef9a9a] text-sm font-bold px-4 py-2 rounded-full mb-6">
              {'\ud83c\udfc8'} Sunday Games {'\u2022'} RedZone {'\u2022'} Playoffs {'\u2022'} Super Bowl {'\u2022'} London Games
            </div>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream every NFL game live in 4K UHD. Sky Sports NFL, RedZone,
              and all primetime games included {'\u2014'} from {'\u00a3'}12/month with no contract.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#c62828"
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
                answer={`Smart Live TV includes Sky Sports NFL, NFL RedZone, and all international American football channels from \u00a312 per month \u2014 compared to \u00a318 per month for a NOW Multi-Sport membership on a 12-month contract. You get every regular-season game, every playoff matchup, and the Super Bowl live in 4K. A free 24-hour trial is available.`}
                facts={[
                  "Includes Sky Sports NFL, RedZone, ESPN, NFL Network, and Channel 5",
                  "170+ live games per season including Sunday double-headers and primetime",
                  "All NFL London games at Tottenham and Wembley",
                  "Free 24-hour trial with instant activation via WhatsApp",
                ]}
              />
            </section>
          </FadeIn>

          {/* UPCOMING EVENTS */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming NFL Events</h2>
              <StaggerIn className="space-y-4">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.event} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#c62828]/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight pr-2">{event.event}</h3>
                      <span className="text-xs bg-[#c62828]/10 text-[#ef9a9a] px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 border border-[#c62828]/20">
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">NFL Channels Included</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    channel: 'Sky Sports NFL',
                    desc: 'Sunday double-headers, Thursday/Sunday/Monday Night Football, all playoff games, and Super Bowl.',
                    price: '\u00a318/mo on NOW',
                  },
                  {
                    channel: 'NFL RedZone',
                    desc: 'Every touchdown from every Sunday game. Commercial-free whip-around coverage with Scott Hanson.',
                    price: 'Included with Sky',
                  },
                  {
                    channel: 'Channel 5 / 5Action',
                    desc: 'Free-to-air NFL coverage. Sunday 6pm and 9pm games, London games, playoffs, and Super Bowl.',
                    price: 'Free (Freeview)',
                  },
                  {
                    channel: 'ESPN / NFL Network',
                    desc: 'Monday Night Football, NFL draft, combine coverage, and 24/7 NFL programming.',
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch NFL Live in the UK</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access to all NFL channels.' },
                { n: 2, title: 'Set up on any device', body: <>{'\u0057'}orks on <Link href="/setup/firestick" className="text-[#ef9a9a] hover:underline">Firestick</Link>, <Link href="/setup/smart-tv" className="text-[#ef9a9a] hover:underline">Smart TV</Link>, <Link href="/setup/android" className="text-[#ef9a9a] hover:underline">Android</Link>, <Link href="/setup/iphone" className="text-[#ef9a9a] hover:underline">iPhone</Link> and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every game live in stunning 4K UHD \u2014 regular season, playoffs, and Super Bowl.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#c62828' }}>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">NFL Streaming Cost Comparison (UK)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">NFL Coverage</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">RedZone?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { service: 'NOW Multi-Sport', cost: '\u00a318/mo (12-mo)', coverage: 'Sky Sports NFL, primetime games', redzone: 'Yes' },
                      { service: 'NOW All Sports', cost: '\u00a328/mo (12-mo)', coverage: 'Sky Sports NFL + football', redzone: 'Yes' },
                      { service: 'Channel 5 (free)', cost: 'Free', coverage: 'Sunday 6pm & 9pm, London, Super Bowl', redzone: 'No' },
                      { service: 'Smart Live TV', cost: '\u00a312/mo', coverage: 'ALL of the above + ESPN, NFL Network', redzone: 'Yes' },
                    ].map(row => (
                      <tr key={row.service} className={`border-b border-[#1a1a2a] ${row.service === 'Smart Live TV' ? 'bg-[#c62828]/5' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${row.service === 'Smart Live TV' ? 'text-[#ef9a9a]' : 'text-white'}`}>{row.service}</td>
                        <td className="py-3 px-4 text-gray-300">{row.cost}</td>
                        <td className="py-3 px-4 text-gray-300">{row.coverage}</td>
                        <td className="py-3 px-4 text-gray-300">{row.redzone}</td>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">NFL FAQ</h2>
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
            <div className="p-6 border-b" style={{ borderColor: '#c62828' }}>
              <h3 className="text-lg font-extrabold text-white">Watch NFL Live</h3>
              <p className="text-sm text-gray-400 mt-2">
                Every game, every week {'\u2014'} 24-hour free trial.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-white">{'\u00a3'}12</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">{'\u2705'} Sky Sports NFL</li>
                <li className="flex items-center gap-2">{'\u2705'} NFL RedZone</li>
                <li className="flex items-center gap-2">{'\u2705'} ESPN & NFL Network</li>
                <li className="flex items-center gap-2">{'\u2705'} Channel 5 (London games)</li>
                <li className="flex items-center gap-2">{'\u2705'} 4K UHD streaming</li>
                <li className="flex items-center gap-2">{'\u2705'} No contract</li>
              </ul>
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#c62828"
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
