import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { getF1Schedule, getF1News } from '@/lib/api/espn'

export const metadata: Metadata = {
  title: 'Watch Formula 1 Live 2026 | Stream Every F1 Race | Smart Live TV',
  description: 'Stream every Formula 1 race live in 4K with no ad breaks. Sky Sports F1 included. Free 24-hour trial. Works on any device.',
  alternates: { canonical: `${ENV.BASE_URL}/watch/formula-1` },
}

export default async function Formula1Page() {
  const [schedule, news] = await Promise.allSettled([
    getF1Schedule(),
    getF1News(),
  ])

  const races = schedule.status === 'fulfilled' ? schedule.value : []
  const articles = news.status === 'fulfilled' ? news.value : []

  // Next race
  const nextRace = races.find(r => !r.status?.type?.completed) || races[0] || null

  // Recent results
  const recentRaces = races
    .filter(r => r.status?.type?.completed)
    .slice(0, 3)

  // Upcoming races
  const upcomingRaces = races
    .filter(r => !r.status?.type?.completed)
    .slice(0, 6)

  const faqs = [
    {
      question: 'Does IPTV include Sky Sports F1?',
      answer: 'Yes. Smart Live TV includes Sky Sports F1 — every Formula 1 race live with no ad breaks, including practice sessions and qualifying.',
    },
    {
      question: 'Can I watch F1 without Sky Sports?',
      answer: 'Yes. Sky Sports F1 is included in Smart Live TV from £12/month, compared to £43/month for Sky Sports standalone. A free 24-hour trial is available.',
    },
    {
      question: 'Can I watch F1 from Morocco or abroad?',
      answer: 'Smart Live TV works worldwide with no regional restrictions or VPN required. Stream every F1 race from Morocco, France, or anywhere.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'Formula 1', item: `${ENV.BASE_URL}/watch/formula-1` },
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
            background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0f 100%)',
            borderColor: '#e10600',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">
              Formula 1 2026 — Every Race Live
            </h1>
            {nextRace && (
              <div className="inline-flex items-center gap-2 bg-[#e10600]/10 border border-[#e10600]/30 text-[#ff4444] text-sm font-bold px-4 py-2 rounded-full mb-6">
                🏎️ Next race: {nextRace.name} — {new Date(nextRace.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
              </div>
            )}
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream the entire 2026 Formula 1 season in 4K UHD. Sky Sports F1 included,
              every practice, qualifying, and race session live with no ad breaks.
            </p>
            <ShimmerButton
              href="/free-trial"
              variant="league"
              leagueColor="#e10600"
              className="px-8 py-4 text-lg rounded-lg"
            >
              Start Free Trial →
            </ShimmerButton>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
        <div className="lg:col-span-2 space-y-0">

          {/* RACE SCHEDULE */}
          {upcomingRaces.length > 0 && (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Upcoming Races</h2>
                <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingRaces.map(race => {
                    const venue = race.competitions?.[0]?.venue
                    return (
                      <div key={race.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#e10600]/40 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-white text-sm leading-tight pr-2">{race.name}</h3>
                          <span className="text-xs bg-[#e10600]/10 text-[#ff4444] px-2 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0">
                            {race.status?.type?.description || 'Scheduled'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">
                          📅 {new Date(race.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                        </p>
                        {venue && (
                          <p className="text-xs text-gray-500">
                            📍 {venue.fullName}{venue.address?.city ? `, ${venue.address.city}` : ''}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </StaggerIn>
              </section>
            </FadeIn>
          )}

          {/* RECENT RESULTS */}
          {recentRaces.length > 0 && (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20 border-t border-[#2a2a3a] pt-16 md:pt-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Recent Results</h2>
                <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentRaces.map(race => {
                    const venue = race.competitions?.[0]?.venue
                    return (
                      <div key={race.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
                        <h3 className="font-bold text-white text-sm mb-2">{race.name}</h3>
                        <p className="text-xs text-gray-400 mb-1">
                          📅 {new Date(race.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                        </p>
                        {venue && (
                          <p className="text-xs text-gray-500">
                            📍 {venue.fullName}
                          </p>
                        )}
                        <span className="inline-block mt-2 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full font-medium">
                          Completed
                        </span>
                      </div>
                    )
                  })}
                </StaggerIn>
              </section>
            </FadeIn>
          )}

          {/* FALLBACK — Static schedule when no ESPN data */}
          {races.length === 0 && (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20">
                <div className="bg-gray-950/60 rounded-2xl border border-gray-800 p-8 text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    The complete calendar for the greatest motorsport in the world.
                  </p>
                  <p className="text-white font-bold text-lg mb-4">
                    2026 Formula 1 Season
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-6">
                    {[
                      { round: 'Bahrain Grand Prix', date: 'March 2026' },
                      { round: 'Monaco Grand Prix', date: 'May 2026' },
                      { round: 'British Grand Prix', date: 'July 2026' },
                      { round: 'Abu Dhabi Finale', date: 'December 2026' },
                    ].map(item => (
                      <div key={item.round} className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                        <div className="text-gray-400 text-xs mb-1">{item.round}</div>
                        <div className="text-white font-bold text-sm">{item.date}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/free-trial" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white text-sm"
                    style={{ backgroundColor: '#e10600' }}>
                    Watch F1 Live →
                  </Link>
                </div>
              </section>
            </FadeIn>
          )}

          {/* F1 HIGHLIGHTS */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Experience The Pinnacle of Motorsport</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'All Practice & Qualifying',
                  subtitle: 'Every Session Live',
                  body:
                    'Watch every Free Practice, Sprint Shootout, and Qualifying session with live timing and full commentary.',
                },
                {
                  title: 'Sky Sports F1 Included',
                  subtitle: 'Expert Analysis',
                  body:
                    'Access all the pre-race and post-race coverage, driver interviews, and technical analysis from the Sky Sports F1 team.',
                },
                {
                  title: 'On-Board Cameras',
                  subtitle: 'Driver Perspectives',
                  body:
                    'Access multiple feeds including driver on-board cameras, pit lane feeds, and data channels.',
                },
              ].map((c) => (
                <div key={c.title} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="border-b pb-3 mb-3" style={{ borderColor: '#e10600' }}>
                    <h3 className="font-extrabold text-white">{c.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{c.subtitle}</p>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{c.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* HOW TO WATCH */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Start your free trial', body: 'Claim a 24-hour free trial and get instant access.' },
                { n: 2, title: 'Set up on any device', body: <>{`Works on `}<Link href="/setup/firestick" className="text-[#00e676] hover:underline">Firestick</Link>, Smart TV, Android, iPhone and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every F1 race live in stunning 4K.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white mb-4" style={{ backgroundColor: '#e10600' }}>
                    {s.n}
                  </div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* FAQ */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">FAQ</h2>
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
            <div className="p-6 border-b" style={{ borderColor: '#e10600' }}>
              <h3 className="text-lg font-extrabold text-white">Start Watching This Weekend</h3>
              <p className="text-sm text-gray-400 mt-2">
                Get access to every F1 session live with a 24-hour free trial.
              </p>
            </div>
            <div className="p-6">
              <ShimmerButton
                href="/free-trial"
                variant="league"
                leagueColor="#e10600"
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
