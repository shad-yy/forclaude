import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  venue?: string
  status?: string
  homeScore?: number | null
  awayScore?: number | null
}

interface Standing {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  points: number
  form?: string
}

interface DynamicSEOContentProps {
  leagueName: string
  leagueSlug: string
  fixtures: Match[]
  standings: Standing[]
  baseUrl?: string
}

export function DynamicSEOContent({
  leagueName,
  leagueSlug,
  fixtures,
  standings,
  baseUrl = ENV.BASE_URL,
}: DynamicSEOContentProps) {

  const nextMatch = fixtures[0]
  const topTeam = standings[0]
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  // Generate SportsEvent schemas for next 3 fixtures
  const eventSchemas = fixtures.slice(0, 3).map(match => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam} vs ${match.awayTeam}`,
    startDate: match.date,
    location: match.venue ? {
      '@type': 'Place',
      name: match.venue,
    } : undefined,
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam },
    superEvent: {
      '@type': 'SportsEvent',
      name: leagueName,
    },
    url: `${baseUrl}/match/${match.id}`,
  }))

  // Dynamic FAQ based on real data
  const dynamicFAQs = [
    nextMatch && {
      question: `When is the next ${leagueName} match?`,
      answer: `The next ${leagueName} match is ${nextMatch.homeTeam} vs ${nextMatch.awayTeam} on ${new Date(nextMatch.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. Watch it live in 4K on Smart Live TV from £12/month.`,
    },
    topTeam && {
      question: `Who is top of the ${leagueName} table?`,
      answer: `As of ${today}, ${topTeam.team} leads the ${leagueName} with ${topTeam.points} points from ${topTeam.played} games (${topTeam.won}W ${topTeam.drawn}D ${topTeam.lost}L). Follow every match live on Smart Live TV.`,
    },
    {
      question: `How to watch ${leagueName} live in the UK?`,
      answer: `Watch every ${leagueName} match live in HD and 4K on Smart Live TV. All UK broadcast channels showing ${leagueName} are included — Sky Sports, TNT Sports, and beIN Sports — from £12/month with no contract. Start a free 24-hour trial at smartlivetv.co.uk/free-trial.`,
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dynamicFAQs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <div className="space-y-0">
      {/* Render schemas */}
      {eventSchemas.map((schema, i) => (
        <SchemaMarkup key={i} schema={schema} />
      ))}
      <SchemaMarkup schema={faqSchema} />

      {/* Upcoming fixtures with "how to watch" context */}
      {fixtures.length > 0 && (
        <section className="py-16 border-t border-[#2a2a3a]">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            How to Watch Upcoming {leagueName} Matches
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-2xl">
            Every {leagueName} match listed below is available live 
            on Smart Live TV in HD and 4K. No blackouts, no 
            extra subscriptions.
          </p>

          <div className="space-y-3 mb-8">
            {fixtures.slice(0, 5).map((match, i) => {
              const matchDate = (() => {
                const parts = match.date?.split('-').map(Number)
                if (!parts || parts.length !== 3) return 'TBA'
                const [y, m, d] = parts
                if (y < 2020 || y > 2030) return 'TBA'
                return new Date(Date.UTC(y, m-1, d))
                  .toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
              })()

              return (
                <div key={match.id}
                  className="flex items-center justify-between 
                    bg-[#12121a] border border-[#2a2a3a] 
                    rounded-xl px-5 py-4 
                    hover:border-[#00e676]/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {matchDate}
                      {match.venue && ` · ${match.venue}`}
                    </p>
                  </div>
                  <Link
                    href={`/match/${match.id}`}
                    className="text-xs font-semibold text-[#00e676] 
                      hover:underline flex-shrink-0 ml-4"
                  >
                    How to watch →
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Dynamic FAQ — visible and schema-backed */}
      {dynamicFAQs.length > 0 && (
        <section className="py-16 border-t border-[#2a2a3a]">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            {leagueName} — Common Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {dynamicFAQs.map(faq => (
              <div key={faq.question}
                className="bg-[#12121a] border border-[#2a2a3a] 
                  rounded-2xl p-5">
                <h3 className="font-bold text-white text-sm mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
