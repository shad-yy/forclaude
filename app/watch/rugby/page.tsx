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
  title: 'Watch Rugby Live | Stream Six Nations, Premiership & Internationals \u2014 Smart Live TV',
  description:
    'Stream every rugby match live in 4K \u2014 Six Nations, Nations Championship, Gallagher Premiership, and World Cup. TNT Sports and international feeds included from \u00a312/month.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/rugby`,
  },
  openGraph: {
    title: 'Watch Rugby Live | Stream Six Nations, Premiership & Internationals \u2014 Smart Live TV',
    description: 'Stream every rugby match live in 4K. TNT Sports, ITV, and all international feeds included. Free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Watch Rugby Live on Smart Live TV' }],
    url: `${ENV.BASE_URL}/watch/rugby`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Rugby Live | Stream Six Nations, Premiership & Internationals \u2014 Smart Live TV',
    images: ['/og-default.png'],
  },
}

const UPCOMING_EVENTS = [
  {
    event: 'Nations Championship 2026 \u2014 Round 4',
    dates: '6\u20138 November 2026',
    venue: 'Multiple venues across Europe',
    broadcaster: 'ITV / ITVX (free-to-air) + international feeds',
    format: 'Test',
    description: 'England vs Australia at Twickenham, Scotland vs New Zealand at Murrayfield, Ireland vs Argentina, and more.',
  },
  {
    event: 'Nations Championship 2026 \u2014 Finals Weekend',
    dates: '27\u201329 November 2026',
    venue: 'Allianz Stadium, Twickenham',
    broadcaster: 'ITV / ITVX + TNT Sports',
    format: 'Test',
    description: 'All 12 nations compete in placement and championship finals at Twickenham to conclude the inaugural tournament.',
  },
  {
    event: 'Gallagher Premiership 2026\u201327',
    dates: 'September 2026 \u2014 June 2027',
    venue: 'Venues across England',
    broadcaster: 'TNT Sports (every match live)',
    format: 'Club',
    description: 'Every Gallagher Premiership match broadcast live on TNT Sports, including play-offs and the final.',
  },
  {
    event: 'Six Nations 2027',
    dates: 'February \u2014 March 2027',
    venue: 'Twickenham, Murrayfield, Cardiff, Dublin, Paris, Rome',
    broadcaster: 'ITV / BBC / S4C',
    format: 'Test',
    description: 'The greatest annual rugby championship \u2014 England, France, Ireland, Scotland, Wales, and Italy.',
  },
]

export default function RugbyPage() {
  const faqs = [
    {
      question: 'Can I watch rugby live without TNT Sports?',
      answer: 'International rugby (Six Nations, Nations Championship) is free-to-air on ITV and BBC in the UK. However, the Gallagher Premiership requires TNT Sports (\u00a325/month standalone). Smart Live TV includes TNT Sports, ITV, BBC, and all international rugby feeds from \u00a312/month.',
    },
    {
      question: 'Does IPTV include the Gallagher Premiership?',
      answer: 'Yes. Smart Live TV includes TNT Sports which broadcasts every Gallagher Premiership match live, including the play-offs and final. No separate subscription needed.',
    },
    {
      question: 'Can I watch the Six Nations on Smart Live TV?',
      answer: 'Yes. The Six Nations is broadcast free-to-air on ITV and BBC, both of which are included in Smart Live TV. You also get international commentary feeds and 4K streaming.',
    },
    {
      question: 'What rugby channels are included?',
      answer: 'Smart Live TV includes TNT Sports (Premiership), ITV (Six Nations, Nations Championship), BBC (Six Nations), Sky Sports (selected internationals), beIN Sports, SuperSport, and Stan Sport for Southern Hemisphere coverage.',
    },
    {
      question: 'Can I watch rugby from abroad?',
      answer: 'Smart Live TV works worldwide with no regional restrictions. Watch Six Nations, Premiership, and international rugby from any country \u2014 no VPN required.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/rugby#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'Rugby', item: `${ENV.BASE_URL}/watch/rugby` },
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
            background: 'linear-gradient(135deg, #0a1a0a 0%, #0a0a0f 100%)',
            borderColor: '#1b5e20',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Watch Rugby Live {'\u2014'} Every Match, Every Competition
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#1b5e20]/10 border border-[#1b5e20]/30 text-[#4caf50] text-sm font-bold px-4 py-2 rounded-full mb-6">
              {'\uD83C\uDFC9'} Six Nations {'\u2022'} Nations Championship {'\u2022'} Premiership {'\u2022'} World Cup
            </div>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream every rugby match live in 4K UHD. TNT Sports, ITV, BBC, and all
              international feeds included {'\u2014'} from {'\u00A3'}12/month with no contract.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#1b5e20"
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
                answer="Smart Live TV includes TNT Sports (Gallagher Premiership), ITV and BBC (Six Nations, Nations Championship), and all international rugby channels from \u00a312 per month. You get every Test, club match, and tournament live in 4K. A free 24-hour trial is available."
                facts={[
                  "Includes TNT Sports, ITV, BBC, Sky Sports, and international rugby feeds",
                  "Every Gallagher Premiership match live plus Six Nations and Nations Championship",
                  "Stream in 4K Ultra HD on Firestick, Smart TV, iOS, and Android",
                  "Free 24-hour trial with instant activation via WhatsApp",
                ]}
              />
            </section>
          </FadeIn>

          {/* UPCOMING EVENTS */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming Rugby Events</h2>
              <StaggerIn className="space-y-4">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.event} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#1b5e20]/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight pr-2">{event.event}</h3>
                      <span className="text-xs bg-[#1b5e20]/10 text-[#4caf50] px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 border border-[#1b5e20]/20">
                        {event.format}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>{'\uD83D\uDCC5'} {event.dates}</span>
                      <span>{'\uD83D\uDCCD'} {event.venue}</span>
                      <span>{'\uD83D\uDCFA'} {event.broadcaster}</span>
                    </div>
                  </div>
                ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* CHANNELS INCLUDED */}
          <FadeIn direction="up">
            <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Rugby Channels Included</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    channel: 'TNT Sports',
                    desc: 'Every Gallagher Premiership match live, plus European Champions Cup and Challenge Cup.',
                    price: '\u00a325/mo on discovery+',
                  },
                  {
                    channel: 'ITV / ITVX',
                    desc: 'Six Nations (shared with BBC), Nations Championship, and Autumn Internationals. Free-to-air.',
                    price: 'Free (UK only)',
                  },
                  {
                    channel: 'BBC / iPlayer',
                    desc: 'Six Nations coverage (shared with ITV), highlights, and selected international matches.',
                    price: 'Free (UK only)',
                  },
                  {
                    channel: 'Sky Sports / SuperSport / Stan Sport',
                    desc: 'International rugby, Rugby Championship (Southern Hemisphere), and selected World Cup qualifiers.',
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
                All channels included in every Smart Live TV plan from {'\u00A3'}12/month. No add-ons required.
              </p>
            </section>
          </FadeIn>

          {/* HOW TO WATCH */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch Rugby Live</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access to all rugby channels.' },
                { n: 2, title: 'Set up on any device', body: <>{`Works on `}<Link href="/setup/firestick" className="text-[#4caf50] hover:underline">Firestick</Link>, <Link href="/setup/smart-tv" className="text-[#4caf50] hover:underline">Smart TV</Link>, <Link href="/setup/android" className="text-[#4caf50] hover:underline">Android</Link>, <Link href="/setup/iphone" className="text-[#4caf50] hover:underline">iPhone</Link> and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every match in stunning 4K UHD with zero buffering.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#1b5e20' }}>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Rugby Streaming Cost Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Rugby Coverage</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Premiership?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { service: 'TNT Sports', cost: '\u00a325/mo', coverage: 'Premiership, European cups', prem: 'Yes' },
                      { service: 'ITV/BBC (free)', cost: 'Free', coverage: 'Six Nations, Nations Champ.', prem: 'No' },
                      { service: 'TNT + TV licence', cost: '\u00a338/mo', coverage: 'Most UK rugby', prem: 'Yes' },
                      { service: 'Smart Live TV', cost: '\u00a312/mo', coverage: 'ALL of the above + international', prem: 'Yes' },
                    ].map(row => (
                      <tr key={row.service} className={`border-b border-[#1a1a2a] ${row.service === 'Smart Live TV' ? 'bg-[#1b5e20]/5' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${row.service === 'Smart Live TV' ? 'text-[#4caf50]' : 'text-white'}`}>{row.service}</td>
                        <td className="py-3 px-4 text-gray-300">{row.cost}</td>
                        <td className="py-3 px-4 text-gray-300">{row.coverage}</td>
                        <td className="py-3 px-4 text-gray-300">{row.prem}</td>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Rugby FAQ</h2>
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
            <div className="p-6 border-b" style={{ borderColor: '#1b5e20' }}>
              <h3 className="text-lg font-extrabold text-white">Watch Rugby Live</h3>
              <p className="text-sm text-gray-400 mt-2">
                Every Test, every Premiership match, every tournament {'\u2014'} 24-hour free trial.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-white">{'\u00A3'}12</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">{'\u2705'} TNT Sports (Premiership)</li>
                <li className="flex items-center gap-2">{'\u2705'} ITV + BBC (Six Nations)</li>
                <li className="flex items-center gap-2">{'\u2705'} Nations Championship</li>
                <li className="flex items-center gap-2">{'\u2705'} International feeds</li>
                <li className="flex items-center gap-2">{'\u2705'} 4K UHD streaming</li>
                <li className="flex items-center gap-2">{'\u2705'} No contract</li>
              </ul>
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#1b5e20"
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
