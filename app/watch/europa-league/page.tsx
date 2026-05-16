import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { LeagueBadge } from '@/components/league/league-badge'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { getUEFAMatches, getUEFAResults, UEFA_COMPETITIONS } from '@/lib/api/football-data'

export const metadata: Metadata = {
  title: 'Watch UEFA Europa League Live | Free Trial',
  description:
    'Stream every UEFA Europa League match in 4K. Watch from anywhere with a free 24-hour trial.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/europa-league`,
  },
  openGraph: {
    title: 'Watch UEFA Europa League Live | Free Trial',
    description: 'Stream every UEFA Europa League match in 4K. Watch from anywhere with a free 24-hour trial.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch UEFA Europa League Live | Free Trial',
    images: ['/og-default.png'],
  },
}

const fetchWithTimeout = async (url: string, ms = 5000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)
    return res.ok ? res.json() : null
  } catch {
    clearTimeout(timeout)
    return null
  }
}

function safeBadge(url: string | null | undefined, size: 'tiny' | 'small' | 'medium' = 'small'): string {
  if (!url) return '/placeholder-logo.png'
  if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
  return `${url}/${size}`
}

function safeParseSportsDBDate(date: string, time?: string): Date | null {
  if (!date) return null
  const parts = date.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [year, month, day] = parts
  if (year < 2020 || year > 2030) return null
  if (time) {
    const t = time.split('+')[0].split('-')[0]
    const [h, m] = t.split(':').map(Number)
    return new Date(Date.UTC(year, month - 1, day, h || 0, m || 0))
  }
  return new Date(Date.UTC(year, month - 1, day))
}


const FormPill = ({ result }: { result: string }) => {
  const colors: Record<string, string> = {
    W: 'bg-green-500 text-black',
    D: 'bg-gray-500 text-white',
    L: 'bg-red-500 text-white',
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[result] || 'bg-gray-700 text-white'
        }`}
    >
      {result}
    </span>
  )
}

const renderForm = (formStr?: string) => {
  if (!formStr) return null
  const results = formStr.replace(/[^WDL]/g, '').split('').slice(-5)
  if (results.length === 0) return null
  return (
    <div className="flex items-center gap-1 justify-center">
      {results.map((r, idx) => (
        <FormPill key={`${r}-${idx}`} result={r} />
      ))}
    </div>
  )
}

export default async function EuropaLeaguePage() {
  const [upcoming, results] = await Promise.allSettled([
    getUEFAMatches(UEFA_COMPETITIONS.UEL, 8),
    getUEFAResults(UEFA_COMPETITIONS.UEL, 4),
  ])
  const upcomingMatches = upcoming.status === 'fulfilled' ? upcoming.value : []
  const recentResults = results.status === 'fulfilled' ? results.value : []

  const [nextEvent, standings, pastEvents] = await Promise.allSettled([
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4735'),
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4735&s=2025-2026'),
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4735'),
  ])

  const nextJson = nextEvent.status === 'fulfilled' ? nextEvent.value : null
  const tableJson = standings.status === 'fulfilled' ? standings.value : null
  const pastJson = pastEvents.status === 'fulfilled' ? pastEvents.value : null

  const nextFixture = nextJson?.events?.[0] ?? null
  const tableRows: any[] = Array.isArray(tableJson?.table) ? tableJson.table : []
  const recent: any[] = Array.isArray(pastJson?.events) ? pastJson.events.slice(0, 3) : []

  const faqs = [
    {
      question: 'Where can I watch Europa League live?',
      answer:
        'Smart Live TV carries all Europa League matches live in 4K, including qualifying rounds and the final.',
    },
    {
      question: 'Is Europa League on free TV in the UK?',
      answer:
        'Some Europa League matches may air on free TV, but the vast majority are on paid networks. Smart Live TV covers every match with no blackouts.',
    },
    {
      question: 'How to watch Europa League abroad?',
      answer: "Smart Live TV lets you stream from anywhere. Get a free 24-hour trial and watch tonight's match in 4K without needing a VPN.",
    },
  ]

  const faqSchema = generateFAQSchema(faqs)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'UEFA Europa League', item: `${ENV.BASE_URL}/watch/europa-league` },
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
            background: 'linear-gradient(135deg, #2a1000 0%, #0a0a0f 100%)',
            borderColor: '#f97316',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <LeagueBadge
                src="https://www.thesportsdb.com/images/media/league/badge/yvwvqu1432120355.png"
                localSrc="/leagues/europa-league.png"
                alt="UEFA Europa League"
                size={64}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6">The Europa League — Every Match Live</h1>
            {nextFixture ? (
              <p className="text-gray-300 text-sm md:text-base mb-10">
                Next fixture:{' '}
                <span className="text-white font-bold">
                  {nextFixture.strEvent || `${nextFixture.strHomeTeam} vs ${nextFixture.strAwayTeam}`}
                </span>{' '}
                —{' '}
                <span className="text-gray-300">
                  {nextFixture.dateEvent ? safeParseSportsDBDate(nextFixture.dateEvent)?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                </span>
              </p>
            ) : (
              <p className="text-gray-300 text-sm md:text-base mb-10">Next fixture: TBA</p>
            )}
            <ShimmerButton
              href="/pricing"
              variant="league"
              leagueColor="#f97316"
              className="px-8 py-4 text-lg rounded-lg"
            >
              Watch Europa League in 4K →
            </ShimmerButton>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
        <div className="lg:col-span-2 space-y-0">
          {/* UPCOMING MATCHES */}
          {upcomingMatches.length > 0 && (
            <section className="pb-16 md:pb-20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Upcoming Matches
              </h2>
              <div className="space-y-3">
                {upcomingMatches.map(match => (
                  <div key={match.id}
                    className="bg-[#12121a] border border-[#2a2a3a] 
                      rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1 
                        justify-end">
                        <span className="text-white font-semibold text-sm 
                          text-right truncate max-w-[120px]">
                          {match.homeTeam.name}
                        </span>
                        <img src={match.homeTeam.crest} 
                          alt={match.homeTeam.name}
                          className="w-6 h-6 object-contain" />
                      </div>
                      <div className="text-center px-3 flex-shrink-0">
                        <span className="font-extrabold text-white text-lg">
                          v
                        </span>
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {new Date(match.utcDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <img src={match.awayTeam.crest}
                          alt={match.awayTeam.name}
                          className="w-6 h-6 object-contain" />
                        <span className="text-white font-semibold text-sm 
                          truncate max-w-[120px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RECENT RESULTS (football-data) */}
          {recentResults.length > 0 && (
            <section className="pb-16 md:pb-20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Results
              </h2>
              <div className="space-y-3">
                {recentResults.map(match => (
                  <div key={match.id}
                    className="bg-[#12121a] border border-[#2a2a3a] 
                      rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1 
                        justify-end">
                        <span className="text-white font-semibold text-sm 
                          text-right truncate max-w-[120px]">
                          {match.homeTeam.name}
                        </span>
                        <img src={match.homeTeam.crest} 
                          alt={match.homeTeam.name}
                          className="w-6 h-6 object-contain" />
                      </div>
                      <div className="text-center px-3 flex-shrink-0">
                        <span className="font-extrabold text-white text-lg">
                          {match.score.fullTime.home ?? '-'}
                          {' — '}
                          {match.score.fullTime.away ?? '-'}
                        </span>
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {new Date(match.utcDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <img src={match.awayTeam.crest}
                          alt={match.awayTeam.name}
                          className="w-6 h-6 object-contain" />
                        <span className="text-white font-semibold text-sm 
                          truncate max-w-[120px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* STANDINGS */}
          {tableRows.length > 0 ? (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Standings</h2>
              <div className="bg-gray-950/60 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: '#0f1118' }}>
                      <tr className="text-xs font-bold uppercase border-b" style={{ borderColor: '#f97316' }}>
                        <th className="py-3 px-3 text-center w-10">#</th>
                        <th className="py-3 px-3 text-left">Team</th>
                        <th className="py-3 px-3 text-center w-10">P</th>
                        <th className="py-3 px-3 text-center w-10">W</th>
                        <th className="py-3 px-3 text-center w-10">D</th>
                        <th className="py-3 px-3 text-center w-10">L</th>
                        <th className="py-3 px-3 text-center w-10">GD</th>
                        <th className="py-3 px-3 text-center">Form</th>
                        <th className="py-3 px-3 text-center w-12 text-white">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((t: any, idx: number) => {
                        const rank = Number(t.intRank ?? idx + 1)
                        const played = Number(t.intPlayed ?? 0)
                        const win = Number(t.intWin ?? 0)
                        const draw = Number(t.intDraw ?? 0)
                        const loss = Number(t.intLoss ?? 0)
                        const gd = Number(t.intGoalDifference ?? 0)
                        const pts = Number(t.intPoints ?? 0)
                        const top8 = rank <= 8
                        return (
                          <tr
                            key={`${t.idTeam || t.strTeam || idx}`}
                            className="border-b border-gray-800/60 hover:bg-gray-900/40 transition-colors even:bg-white/[0.02]"
                          >
                            <td className="py-3 px-3 text-center text-gray-400 font-bold">{rank}</td>
                            <td className="py-3 px-3">
                              <div
                                className={`flex items-center gap-3 pl-3 ${top8 ? 'border-l-2' : ''}`}
                                style={top8 ? { borderColor: '#f97316' } : undefined}
                              >
                                <img
                                  src={safeBadge(t.strTeamBadge || t.strBadge)}
                                  alt={t.strTeam}
                                  className="w-6 h-6 object-contain"
                                />
                                <span className="font-bold text-white line-clamp-1">{t.strTeam}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center text-gray-400">{played}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{win}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{draw}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{loss}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{gd}</td>
                            <td className="py-3 px-3 text-center">{renderForm(t.strForm)}</td>
                            <td className="py-3 px-3 text-center font-extrabold text-white">{pts}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              </section>
            </FadeIn>
          ) : (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20">
              <div className="bg-gray-950/60 rounded-2xl border border-gray-800 p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Live group standings are available to verified league data partners.
                </p>
                <p className="text-white font-bold text-lg mb-4">
                  2024–25 UEFA Europa League
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-6">
                  {[
                    { round: 'Quarter-Finals', date: 'Apr 2025' },
                    { round: 'Semi-Finals', date: 'Apr/May 2025' },
                    { round: 'Final', date: '21 May 2025 · Bilbao' },
                    { round: 'Champions', date: 'TBD' },
                  ].map(item => (
                    <div key={item.round} className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">{item.round}</div>
                      <div className="text-white font-bold text-sm">{item.date}</div>
                    </div>
                  ))}
                </div>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-black text-sm"
                  style={{ backgroundColor: '#f97316' }}>
                  Watch Every Match Live →
                </Link>
              </div>
              </section>
            </FadeIn>
          )}


          {/* EUROPA LEAGUE GREATEST MOMENTS */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Europa League Greatest Moments</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Sevilla\'s Dominance',
                  subtitle: 'Record Winners',
                  body:
                    'Sevilla has dominated the Europa League, winning it a record number of times and making the competition their own.',
                },
                {
                  title: 'Atalanta\'s Triumph',
                  subtitle: '2024 Final',
                  body:
                    'Atalanta shocked the world by defeating the previously unbeaten Bayer Leverkusen 3-0 in Dublin.',
                },
                {
                  title: 'Chelsea\'s Amsterdam Win',
                  subtitle: '2013 Final',
                  body:
                    'Branislav Ivanović scored a looping header in stoppage time to secure the trophy against Benfica.',
                },
              ].map((c) => (
                <div key={c.title} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="border-b pb-3 mb-3" style={{ borderColor: '#f97316' }}>
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
                { n: 2, title: 'Set up on any device', body: <>Works on <Link href="/setup/firestick" className="text-[#00e676] hover:underline">Firestick</Link>, Smart TV, Android, iPhone and more.</> },
                { n: 3, title: 'Watch in 4K', body: 'Stream every Europa League match with no blackouts.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-black mb-4" style={{ backgroundColor: '#f97316' }}>
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
            <div className="p-6 border-b" style={{ borderColor: '#f97316' }}>
              <h3 className="text-lg font-extrabold text-white">Start Watching Tonight</h3>
              <p className="text-sm text-gray-400 mt-2">
                Get access to every Europa League match with a 24-hour free trial.
              </p>
            </div>
            <div className="p-6">
              <ShimmerButton
                href="/pricing"
                variant="league"
                leagueColor="#f97316"
                className="w-full text-center py-4 rounded-xl text-black font-extrabold"
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
