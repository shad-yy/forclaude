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
  title: 'Watch Boxing Live | Stream Every Fight in 4K — Smart Live TV',
  description:
    'Stream every boxing fight live in 4K including Sky Sports Boxing, DAZN, TNT Sports, and PPV events. No Sky subscription needed. Watch from £12/month with a free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/boxing`,
  },
  openGraph: {
    title: 'Watch Boxing Live | Stream Every Fight in 4K — Smart Live TV',
    description: 'Stream every boxing fight live in 4K including Sky Sports Boxing, DAZN, TNT Sports, and PPV events. Free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Watch Boxing Live on Smart Live TV' }],
    url: `${ENV.BASE_URL}/watch/boxing`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Boxing Live | Stream Every Fight in 4K — Smart Live TV',
    images: ['/og-default.png'],
  },
}

/** Upcoming major boxing events — update periodically */
const UPCOMING_FIGHTS = [
  {
    headline: 'Canelo Álvarez vs Souleymane Cissokho',
    date: '2026-11-22',
    venue: 'AT&T Stadium, Arlington, Texas',
    broadcaster: 'DAZN / Sky Sports Boxing',
    weight: 'Super Middleweight Title',
    description: 'Canelo defends his undisputed super middleweight titles against Cissokho.',
  },
  {
    headline: 'Joshua Buatsi vs Craig Richards II',
    date: '2026-11-07',
    venue: 'The O2 Arena, London',
    broadcaster: 'Sky Sports Boxing',
    weight: 'Light Heavyweight',
    description: 'Buatsi faces Richards in a rematch at The O2.',
  },
  {
    headline: 'Devin Haney vs Vasily Lomachenko II',
    date: '2026-12-14',
    venue: 'MGM Grand, Las Vegas',
    broadcaster: 'DAZN',
    weight: 'Super Lightweight',
    description: 'Haney and Lomachenko meet again in a highly anticipated rematch.',
  },
]

export default function BoxingPage() {
  const faqs = [
    {
      question: 'Can I watch boxing live without Sky Sports?',
      answer: 'Yes. Smart Live TV includes Sky Sports Boxing, DAZN, TNT Sports, and all major PPV boxing channels from £12/month — compared to £43/month for Sky Sports standalone. A free 24-hour trial is available.',
    },
    {
      question: 'Does IPTV include boxing PPV events?',
      answer: 'Yes. Smart Live TV carries all major PPV boxing events including DAZN, Sky Sports Box Office, and international PPV broadcasts. No separate pay-per-view purchase required.',
    },
    {
      question: 'Can I watch boxing from abroad?',
      answer: 'Smart Live TV works worldwide with no regional restrictions. Stream every boxing event from anywhere — no VPN required.',
    },
    {
      question: 'What boxing channels are included?',
      answer: 'Smart Live TV includes Sky Sports Boxing, DAZN, TNT Sports, ESPN+, Fox Sports, beIN Sports, and international boxing broadcasts. All major promoters covered: Matchroom, Top Rank, PBC, and Queensberry.',
    },
    {
      question: 'How do I watch boxing on Firestick?',
      answer: 'Download the Smart Live TV app on your Amazon Firestick, log in, and navigate to the Sports section. Sky Sports Boxing and DAZN are available immediately. See our Firestick setup guide for step-by-step instructions.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/boxing#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'Boxing', item: `${ENV.BASE_URL}/watch/boxing` },
    ],
  }

  const sportsEventSchemas = UPCOMING_FIGHTS.map((fight, i) => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': `${ENV.BASE_URL}/watch/boxing#event-${i}`,
    name: fight.headline,
    startDate: fight.date,
    location: {
      '@type': 'Place',
      name: fight.venue,
    },
    sport: 'Boxing',
    description: fight.description,
    organizer: {
      '@type': 'Organization',
      name: 'Smart Live TV',
      url: ENV.BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      url: `${ENV.BASE_URL}/free-trial`,
      price: '12.00',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      {sportsEventSchemas.map((schema, i) => (
        <SchemaMarkup key={i} schema={schema} />
      ))}

      {/* HERO */}
      <FadeIn>
        <section
          className="pt-28 md:pt-36 pb-16 text-center px-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #1a0a00 0%, #0a0a0f 100%)',
            borderColor: '#c8a22c',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Watch Boxing Live — Every Fight, Every Card
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#c8a22c]/10 border border-[#c8a22c]/30 text-[#e6c84a] text-sm font-bold px-4 py-2 rounded-full mb-6">
              🥊 All promoters: Matchroom • Top Rank • PBC • Queensberry
            </div>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream every boxing event live in 4K UHD. Sky Sports Boxing, DAZN, and all PPV
              cards included — no separate pay-per-view purchases required.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#c8a22c"
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
                answer="Smart Live TV includes Sky Sports Boxing, DAZN, TNT Sports, and all PPV boxing channels from £12 per month. You get every major fight — Matchroom, Top Rank, PBC, and Queensberry promotions — without a Sky subscription. A free 24-hour trial is available so you can watch tonight's fight before committing."
                facts={[
                  "Includes Sky Sports Boxing, DAZN, TNT Sports, and all major PPV cards",
                  "Stream in 4K Ultra HD on Firestick, Smart TV, iOS, and Android",
                  "Free 24-hour trial with instant activation via WhatsApp",
                  "No annual contract — cancel anytime from £12/month",
                ]}
              />
            </section>
          </FadeIn>

          {/* UPCOMING FIGHTS */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming Major Fights</h2>
              <StaggerIn className="space-y-4">
                {UPCOMING_FIGHTS.map(fight => (
                  <div key={fight.headline} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#c8a22c]/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight pr-2">{fight.headline}</h3>
                      <span className="text-xs bg-[#c8a22c]/10 text-[#e6c84a] px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 border border-[#c8a22c]/20">
                        {fight.weight}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{fight.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>📅 {new Date(fight.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>📍 {fight.venue}</span>
                      <span>📺 {fight.broadcaster}</span>
                    </div>
                  </div>
                ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* CHANNELS INCLUDED */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Boxing Channels Included</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    channel: 'Sky Sports Boxing',
                    desc: 'All Matchroom and BOXXER events. Joshua Buatsi, Anthony Joshua, and more.',
                    price: '£43/mo on Sky',
                  },
                  {
                    channel: 'DAZN',
                    desc: 'Canelo, GGG, and top international boxing. Global Fight Night cards.',
                    price: '£10/mo standalone',
                  },
                  {
                    channel: 'TNT Sports',
                    desc: 'Top Rank boxing, Tyson Fury undercards, and US fight nights.',
                    price: '£25/mo on discovery+',
                  },
                  {
                    channel: 'ESPN+ / Fox Sports',
                    desc: 'PBC and Top Rank US cards. Crawford, Spence, and more.',
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch Boxing Live</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access to all boxing channels.' },
                { n: 2, title: 'Set up on any device', body: <>Works on <Link href="/setup/firestick" className="text-[#c8a22c] hover:underline">Firestick</Link>, <Link href="/setup/smart-tv" className="text-[#c8a22c] hover:underline">Smart TV</Link>, <Link href="/setup/android" className="text-[#c8a22c] hover:underline">Android</Link>, <Link href="/setup/iphone" className="text-[#c8a22c] hover:underline">iPhone</Link> and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every fight in stunning 4K UHD with zero buffering.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#c8a22c' }}>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Boxing Streaming Cost Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Boxing Coverage</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">PPV Extra?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { service: 'Sky Sports', cost: '£43/mo', coverage: 'Matchroom, BOXXER', ppv: 'Yes — £20–£27' },
                      { service: 'TNT Sports', cost: '£25/mo', coverage: 'Top Rank only', ppv: 'Varies' },
                      { service: 'DAZN', cost: '£10/mo', coverage: 'Canelo, international', ppv: 'Yes — up to £20' },
                      { service: 'Smart Live TV', cost: '£12/mo', coverage: 'ALL of the above', ppv: 'No — included' },
                    ].map(row => (
                      <tr key={row.service} className={`border-b border-[#1a1a2a] ${row.service === 'Smart Live TV' ? 'bg-[#c8a22c]/5' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${row.service === 'Smart Live TV' ? 'text-[#e6c84a]' : 'text-white'}`}>{row.service}</td>
                        <td className="py-3 px-4 text-gray-300">{row.cost}</td>
                        <td className="py-3 px-4 text-gray-300">{row.coverage}</td>
                        <td className="py-3 px-4 text-gray-300">{row.ppv}</td>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Boxing FAQ</h2>
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
            <div className="p-6 border-b" style={{ borderColor: '#c8a22c' }}>
              <h3 className="text-lg font-extrabold text-white">Watch Tonight&apos;s Fight</h3>
              <p className="text-sm text-gray-400 mt-2">
                Get access to every boxing channel with a 24-hour free trial. No PPV fees.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-white">£12</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">✅ Sky Sports Boxing</li>
                <li className="flex items-center gap-2">✅ DAZN</li>
                <li className="flex items-center gap-2">✅ TNT Sports</li>
                <li className="flex items-center gap-2">✅ All PPV events included</li>
                <li className="flex items-center gap-2">✅ 4K UHD streaming</li>
                <li className="flex items-center gap-2">✅ No contract</li>
              </ul>
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#c8a22c"
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
