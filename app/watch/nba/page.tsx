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
  title: 'Watch NBA Live in the UK | Stream Regular Season & Finals \u2014 Smart Live TV',
  description:
    'Stream every NBA game live in 4K \u2014 Emirates NBA Cup, Christmas Day, All-Star 2027, playoffs, and NBA Finals. Sky Sports, ESPN, and Prime feeds included. No contract from \u00a312/month. Free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/nba`,
  },
  openGraph: {
    title: 'Watch NBA Live in the UK | Stream Regular Season & Finals \u2014 Smart Live TV',
    description: 'Stream every NBA game live in 4K. Sky Sports Arena, ESPN, Amazon Prime, and NBA TV coverage included. Free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Watch NBA Live on Smart Live TV' }],
    url: `${ENV.BASE_URL}/watch/nba`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch NBA Live in the UK | Stream Regular Season & Finals \u2014 Smart Live TV',
    images: ['/og-default.png'],
  },
}

/** Key upcoming NBA events \u2014 update periodically */
const UPCOMING_EVENTS = [
  {
    event: 'Emirates NBA Cup 2026',
    dates: '30 October \u2013 11 December 2026',
    venue: 'Hinkle Fieldhouse, Indianapolis (Championship)',
    broadcaster: 'Amazon Prime Video / Sky Sports',
    format: 'Tournament',
    description: 'The NBA\u0027s in-season tournament. Group stages run through November with knockout rounds in early December.',
  },
  {
    event: 'NBA Christmas Day 2026',
    dates: '25 December 2026',
    venue: 'Various NBA Arenas across the USA',
    broadcaster: 'Sky Sports / ESPN',
    format: 'Marquee Slate',
    description: 'Five consecutive blockbuster games broadcast live from 17:00 GMT into Boxing Day morning.',
  },
  {
    event: 'NBA All-Star Weekend 2027',
    dates: '19\u201321 February 2027',
    venue: 'Mortgage Matchup Center, Phoenix, Arizona',
    broadcaster: 'Sky Sports Arena',
    format: 'All-Star',
    description: 'Rising Stars, 3-Point Contest, Slam Dunk Contest, and the 76th NBA All-Star Game live from Phoenix.',
  },
  {
    event: 'NBA Playoffs & Finals 2027',
    dates: '17 April \u2013 June 2027',
    venue: 'Top seeds host across Eastern & Western Conferences',
    broadcaster: 'Sky Sports / Prime Video',
    format: 'Championship',
    description: 'Play-In tournament followed by best-of-seven playoff series culminating in the 2027 NBA Finals in June.',
  },
]

export default function NBAPage() {
  const faqs = [
    {
      question: 'Can I watch NBA live in the UK without Sky or Prime?',
      answer: 'Yes. Smart Live TV includes Sky Sports Arena, ESPN, Amazon Prime sports feeds, and US regional sports networks from \u00a312/month. You don\u0027t need multiple separate subscriptions or NBA League Pass. A free 24-hour trial is available.',
    },
    {
      question: 'Are the NBA Finals included on Smart Live TV?',
      answer: 'Yes. Every game of the NBA Finals is broadcast live in 4K UHD with both UK commentary (Sky Sports) and original US broadcast feeds (ABC/ESPN).',
    },
    {
      question: 'Can I watch NBA games at UK-friendly times?',
      answer: 'Yes. The NBA schedules regular weekend afternoon games that air in UK primetime between 18:00 and 21:00 GMT on Saturdays and Sundays. Christmas Day games also start at 17:00 GMT.',
    },
    {
      question: 'What NBA channels are included?',
      answer: 'Smart Live TV includes Sky Sports Arena, Sky Sports Main Event, ESPN, ESPN2, ABC, NBA TV, and US regional sports networks (YES Network, Spectrum SportsNet, Bally/FanDuel Sports).',
    },
    {
      question: 'Can I watch NBA on Firestick and Smart TV?',
      answer: 'Yes. Smart Live TV works on Amazon Firestick, Smart TVs (Samsung, LG, Android TV), iPhone, iPad, Android phones, PC, Mac, and MAG boxes. Setup takes less than 2 minutes.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/nba#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'NBA', item: `${ENV.BASE_URL}/watch/nba` },
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
            background: 'linear-gradient(135deg, #1c0f00 0%, #0a0a0f 100%)',
            borderColor: '#e65100',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Watch NBA Live in the UK {'\u2014'} Every Game, Every Dunk
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#e65100]/10 border border-[#e65100]/30 text-[#ffb74d] text-sm font-bold px-4 py-2 rounded-full mb-6">
              {'\ud83c\udfc0'} Regular Season {'\u2022'} NBA Cup {'\u2022'} Christmas Day {'\u2022'} Playoffs {'\u2022'} NBA Finals
            </div>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream every NBA matchup live in 4K UHD. Sky Sports Arena, Amazon Prime feeds,
              and US regional coverage included {'\u2014'} from {'\u00a3'}12/month with no contract.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#e65100"
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
                answer={`Smart Live TV includes Sky Sports Arena, Amazon Prime feeds, ESPN, and NBA TV from \u00a312 per month \u2014 compared to over \u00a340 per month for combined NOW Sports, Amazon Prime, and NBA League Pass subscriptions. You get every regular-season matchup, the Emirates NBA Cup, Christmas Day slates, playoffs, and the NBA Finals live in 4K. A free 24-hour trial is available.`}
                facts={[
                  "Includes Sky Sports Arena, ESPN, ABC, NBA TV, and US Regional Sports Networks",
                  "Full coverage of Emirates NBA Cup, Christmas Day, All-Star 2027, and NBA Finals",
                  "Weekend primetime games starting at 18:00 GMT for UK viewers",
                  "Free 24-hour trial with instant activation via WhatsApp",
                ]}
              />
            </section>
          </FadeIn>

          {/* UPCOMING EVENTS */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming NBA Events</h2>
              <StaggerIn className="space-y-4">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.event} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#e65100]/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight pr-2">{event.event}</h3>
                      <span className="text-xs bg-[#e65100]/10 text-[#ffb74d] px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 border border-[#e65100]/20">
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">NBA Channels Included</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    channel: 'Sky Sports Arena',
                    desc: 'Primary UK home for 100+ regular-season games, Christmas Day, All-Star Weekend, and NBA Finals.',
                    price: '\u00a318/mo on NOW',
                  },
                  {
                    channel: 'Amazon Prime Video (NBA)',
                    desc: '67 regular-season games, Emirates NBA Cup knockout stages, and Eastern Conference Finals.',
                    price: '\u00a38.99/mo',
                  },
                  {
                    channel: 'NBA TV & NBA League Pass',
                    desc: '24/7 analysis, highlights, daily studio programming, and live out-of-market feeds.',
                    price: '\u00a314.99/mo',
                  },
                  {
                    channel: 'ESPN, ESPN2 & ABC',
                    desc: 'US flagship broadcasts for Wednesday/Friday primetime, Sunday showcases, and NBA Finals.',
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch NBA Live in the UK</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access to all NBA channels and feeds.' },
                { n: 2, title: 'Set up on any device', body: <>{'\u0057'}orks on <Link href="/setup/firestick" className="text-[#ffb74d] hover:underline">Firestick</Link>, <Link href="/setup/smart-tv" className="text-[#ffb74d] hover:underline">Smart TV</Link>, <Link href="/setup/android" className="text-[#ffb74d] hover:underline">Android</Link>, <Link href="/setup/iphone" className="text-[#ffb74d] hover:underline">iPhone</Link> and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every game live in stunning 4K UHD \u2014 regular season, NBA Cup, and Finals.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#e65100' }}>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">NBA Streaming Cost Comparison (UK)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">NBA Coverage</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">NBA Finals?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { service: 'NOW Multi-Sport', cost: '\u00a318/mo (12-mo)', coverage: 'Sky Sports Arena (100+ games)', finals: 'Yes' },
                      { service: 'Amazon Prime Video', cost: '\u00a38.99/mo', coverage: '67 regular games + NBA Cup', finals: 'No (Conf. Finals)' },
                      { service: 'NBA League Pass', cost: '\u00a314.99/mo', coverage: 'Out-of-market games only', finals: 'Yes' },
                      { service: 'Combined standalone', cost: '\u00a342/mo', coverage: 'Fragmented across 3 apps', finals: 'Yes' },
                      { service: 'Smart Live TV', cost: '\u00a312/mo', coverage: 'ALL of the above + US Regional feeds', finals: 'Yes' },
                    ].map(row => (
                      <tr key={row.service} className={`border-b border-[#1a1a2a] ${row.service === 'Smart Live TV' ? 'bg-[#e65100]/5' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${row.service === 'Smart Live TV' ? 'text-[#ffb74d]' : 'text-white'}`}>{row.service}</td>
                        <td className="py-3 px-4 text-gray-300">{row.cost}</td>
                        <td className="py-3 px-4 text-gray-300">{row.coverage}</td>
                        <td className="py-3 px-4 text-gray-300">{row.finals}</td>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">NBA FAQ</h2>
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
            <div className="p-6 border-b" style={{ borderColor: '#e65100' }}>
              <h3 className="text-lg font-extrabold text-white">Watch NBA Live</h3>
              <p className="text-sm text-gray-400 mt-2">
                Every game, every tournament {'\u2014'} 24-hour free trial.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-white">{'\u00a3'}12</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">{'\u2705'} Sky Sports Arena</li>
                <li className="flex items-center gap-2">{'\u2705'} Amazon Prime NBA feeds</li>
                <li className="flex items-center gap-2">{'\u2705'} ESPN & ABC US feeds</li>
                <li className="flex items-center gap-2">{'\u2705'} NBA TV & League Pass</li>
                <li className="flex items-center gap-2">{'\u2705'} 4K UHD streaming</li>
                <li className="flex items-center gap-2">{'\u2705'} No contract</li>
              </ul>
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#e65100"
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
