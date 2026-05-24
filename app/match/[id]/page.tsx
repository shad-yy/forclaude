import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'

async function getMatch(id: string) {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${id}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.events?.[0] || null
  } catch { return null }
}

function safeDateFormat(dateStr: string): string {
  if (!dateStr) return 'TBA'
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return 'TBA'
  const [y, m, d] = parts
  if (y < 2020 || y > 2030) return 'TBA'
  return new Date(Date.UTC(y, m-1, d))
    .toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric',
      month: 'long', year: 'numeric'
    })
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const match = await getMatch(params.id)
  if (!match) return { title: 'Match Preview' }
  
  const title = `How to Watch ${match.strHomeTeam} vs ${match.strAwayTeam} Live`
  const desc = `Watch ${match.strHomeTeam} vs ${match.strAwayTeam} live in 4K. ${match.strLeague}. Free 24-hour trial — no card needed.`
  
  return {
    title,
    description: desc,
    alternates: {
      canonical: `${ENV.BASE_URL}/match/${params.id}`,
    },
    openGraph: { title, description: desc, images: ['/og-default.png'] },
  }
}

export default async function MatchPage(
  { params }: { params: { id: string } }
) {
  const match = await getMatch(params.id)
  if (!match) notFound()

  const homeTeam = match.strHomeTeam
  const awayTeam = match.strAwayTeam
  const league = match.strLeague
  const date = safeDateFormat(match.dateEvent)
  const venue = match.strVenue || ''
  const isCompleted = match.strStatus?.toLowerCase() === 'match finished'
  
  // Determine watch page for this league
  const leagueWatchMap: Record<string, string> = {
    'English Premier League': '/watch/premier-league',
    'Spanish La Liga': '/watch/la-liga',
    'German Bundesliga': '/watch/bundesliga',
    'Italian Serie A': '/watch/serie-a',
    'French Ligue 1': '/watch/ligue-1',
    'UEFA Champions League': '/watch/champions-league',
    'UEFA Europa League': '/watch/europa-league',
  }
  const watchHref = leagueWatchMap[league] || '/pricing'

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${homeTeam} vs ${awayTeam}`,
    startDate: match.dateEvent,
    location: venue ? {
      '@type': 'Place',
      name: venue,
    } : undefined,
    homeTeam: { '@type': 'SportsTeam', name: homeTeam },
    awayTeam: { '@type': 'SportsTeam', name: awayTeam },
    superEvent: { '@type': 'SportsEvent', name: league },
    url: `${ENV.BASE_URL}/match/${params.id}`,
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How to watch ${homeTeam} vs ${awayTeam} live?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Watch ${homeTeam} vs ${awayTeam} live in 4K on Smart Live TV. All ${league} matches are included in the subscription from £12/month. Start a free 24-hour trial at smartlivetv.co.uk/free-trial — no card needed.`,
        },
      },
      {
        '@type': 'Question',
        name: `What channel is ${homeTeam} vs ${awayTeam} on?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${homeTeam} vs ${awayTeam} is broadcast on Sky Sports or TNT Sports in the UK depending on the fixture. Smart Live TV includes all UK broadcast channels showing this match.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I watch ${homeTeam} vs ${awayTeam} from abroad?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Smart Live TV works from any country with no VPN needed — stream from anywhere in the world.`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={eventSchema} />
      <SchemaMarkup schema={faqSchema} />

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 px-4 text-center border-b border-[#2a2a3a]" style={{ background: 'linear-gradient(135deg, #001a3a 0%, #0a0a0f 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-[#00e676] uppercase tracking-widest mb-4">
            {league}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            {homeTeam} vs {awayTeam}
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-400 text-sm mb-8 flex-wrap">
            <span>📅 {date}</span>
            {venue && <span>📍 {venue}</span>}
          </div>

          {isCompleted && match.intHomeScore !== null ? (
            <div className="text-5xl font-extrabold text-white mb-8">
              {match.intHomeScore} — {match.intAwayScore}
            </div>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/buy"
                className="bg-[#00e676] text-black font-extrabold px-8 py-4 rounded-xl text-base hover:bg-[#00ff87] transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]"
              >
                Watch This Match Live →
              </Link>
              <Link href="/free-trial" className="border border-[#2a2a3a] hover:border-[#00e676]/30 text-gray-300 font-bold px-8 py-4 rounded-xl text-base">
                Free 24H Trial
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How to Watch */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          How to Watch {homeTeam} vs {awayTeam} Live
        </h2>
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 mb-6">
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">{homeTeam} vs {awayTeam}</strong>
            {' '}is broadcast live in the UK. Smart Live TV includes every 
            channel showing this{' '}
            <Link href={watchHref} className="text-[#00e676] hover:underline">
              {league}
            </Link>
            {' '}fixture — Sky Sports, TNT Sports, beIN Sports — all in 
            HD and 4K. No VPN needed — works from anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: '1', t: 'Claim Free Trial', d: 'No card needed. Get credentials via WhatsApp in 5 minutes.' },
            { n: '2', t: 'Install on Your Device', d: 'Works on Firestick, Smart TV, Android, iPhone, and PC.' },
            { n: '3', t: 'Watch in 4K', d: `Stream ${homeTeam} vs ${awayTeam} live with no blackouts.` },
          ].map(s => (
            <div key={s.n} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-[#00e676] text-black font-extrabold text-sm flex items-center justify-center mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-white mb-1 text-sm">{s.t}</h3>
              <p className="text-gray-400 text-xs">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ visible section (matches schema) */}
      <section className="py-16 px-4 max-w-4xl mx-auto border-t border-[#2a2a3a]">
        <h2 className="text-2xl font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqSchema.mainEntity.map(f => (
            <div key={f.name} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-2">{f.name}</h3>
              <p className="text-gray-400 text-sm">
                {f.acceptedAnswer.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 text-center border-t border-[#00e676]/10" style={{ background: 'linear-gradient(to bottom, #0a0a0f, rgba(0,230,118,0.03))' }}>
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Don't Miss This Match
        </h2>
        <p className="text-gray-400 mb-8">
          Free 24-hour trial. No card. Works anywhere in the world.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/free-trial" className="bg-[#00e676] text-black font-extrabold px-10 py-4 rounded-xl hover:bg-[#00ff87] transition-all">
            Get Free Trial →
          </Link>
          <Link href={watchHref} className="border border-[#2a2a3a] hover:border-[#00e676]/30 text-gray-300 font-bold px-10 py-4 rounded-xl">
            View All {league} Matches
          </Link>
        </div>
      </section>

      {/* Mobile sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur border-t border-[#2a2a3a] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/buy" className="bg-[#00e676] text-black font-bold text-sm py-4 rounded-2xl text-center touch-manipulation">
            Watch Live
          </Link>
          <Link href="/free-trial" className="border border-[#2a2a3a] text-gray-300 font-bold text-sm py-4 rounded-2xl text-center">
            Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}
