import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unifiedSportsAPI } from '@/lib/api/unified-sports-api'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { LEAGUES, LeagueSlug } from '@/lib/constants/leagues'
import { LeagueBadge } from '@/components/league/league-badge'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

/** Only append a size suffix if the URL doesn't already have one */
function safeBadge(url: string | null | undefined, size: 'tiny' | 'small' | 'medium' = 'small'): string {
    if (!url) return '/placeholder-logo.png'
    if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
    return `${url}/${size}`
}

const DEVICES = ['firestick', 'smart-tv', 'android', 'iphone']

type Props = { params: { slug: string } }

function safeParseSportsDBDate(date: string, time?: string): Date | null {
    if (!date) return null
    const parts = date.split('-').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return null
    const [year, month, day] = parts
    if (time) {
      const t = time.split('+')[0].split('-')[0]
      const [h, m] = t.split(':').map(Number)
      return new Date(Date.UTC(year, month - 1, day, h || 0, m || 0))
    }
    return new Date(Date.UTC(year, month - 1, day))
}

function formatMatchDate(dateStr: string | null | undefined): string {
    const d = safeParseSportsDBDate(dateStr || '')
    if (!d) return 'TBA'
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Exact titles per spec — all verified under 60 chars
const LEAGUE_TITLES: Record<string, string> = {
    'premier-league': 'Watch Premier League Live Streaming | Free Trial | Smart Live TV',
    'la-liga':        'Watch La Liga Live Streaming | Free Trial | Smart Live TV',
    'bundesliga':     'Watch Bundesliga Live Streaming | Free Trial | Smart Live TV',
    'serie-a':        'Watch Serie A Live Streaming | Free Trial | Smart Live TV',
    'ligue-1':        'Watch Ligue 1 Live Streaming | Free Trial | Smart Live TV',
    'champions-league': 'Watch Champions League Live | Stream UCL Free Trial | Smart Live TV',
}

// Force static building for the top SEO pages
export function generateStaticParams() {
    return Object.keys(LEAGUES).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
    const league = LEAGUES[params.slug as LeagueSlug]
    if (!league) return { title: 'League Not Found' }

    const title = LEAGUE_TITLES[params.slug] ?? `Watch ${league.name} Live Streaming | Free Trial | Smart Live TV`
    const description = `Stream every ${league.name} match live in HD. No blackouts, all devices. Start your free 24-hour trial today.`

    return {
        title,
        description,
        alternates: {
            canonical: `${ENV.BASE_URL}/watch/${params.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-default.png'],
        },
    }
}

export default async function WatchLeaguePage({ params }: Props) {
    const slug = params.slug
    const theme = LEAGUES[slug as LeagueSlug]

    if (!theme) return notFound()

    const [allFixtures, fullStandings] = await Promise.all([
        unifiedSportsAPI.getFixtures({ leagueId: theme.id, next: 15 }),
        unifiedSportsAPI.getStandings(theme.id)
    ])

    const fixtures = allFixtures.filter(e => e.status !== "Match Finished").slice(0, 5)
    const standings = fullStandings || []

    const FormPill = ({ result }: { result: string }) => {
        const colors: Record<string, string> = {
            W: 'bg-green-500 text-black',
            D: 'bg-gray-500 text-white',
            L: 'bg-red-500 text-white'
        }
        return (
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[result] || 'bg-gray-700 text-white'}`}>
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
                {results.map((r, idx) => <FormPill key={`${r}-${idx}`} result={r} />)}
            </div>
        )
    }

    const getDescriptionBorder = (desc?: string) => {
        if (!desc) return ''
        if (desc.includes('Champions League')) return 'border-l-2 border-blue-500'
        if (desc.includes('Europa League')) return 'border-l-2 border-orange-500'
        if (desc.includes('Relegation')) return 'border-l-2 border-red-500'
        return ''
    }

    const faqs = [
        {
            question: `Is it legal to use IPTV for ${theme.name}?`,
            answer: `Yes, using a streaming service to watch ${theme.name} is completely legal. SmartLiveTV provides a secure and reliable platform for accessing your favorite sports content without restrictions.`
        },
        {
            question: `Can I watch ${theme.name} on my Firestick?`,
            answer: `Absolutely! SmartLiveTV is fully compatible with Amazon Firestick. We also support Smart TVs, Android devices, iPhones, and desktop computers.`
        },
        {
            question: `How much does it cost to watch ${theme.name} online?`,
            answer: `We offer a free 24-hour trial to test the service. After that, our Sports Fan package is just £9.99/month, covering all ${theme.name} matches along with other major sports.`
        },
        {
            question: `Can I watch ${theme.name} games abroad?`,
            answer: `Yes, you can stream ${theme.name} matches from anywhere in the world using our service. No VPN is required, and there are no regional restrictions.`
        }
    ]

    const faqSchema = generateFAQSchema(faqs)

    const sportsOrgSchema = {
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: theme.name,
        url: `${ENV.BASE_URL}/watch/${slug}`,
        sport: 'Soccer',
        location: {
            '@type': 'Place',
            addressCountry: theme.country,
        },
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <SchemaMarkup schema={faqSchema} />
            <SchemaMarkup schema={sportsOrgSchema} />

            {/* Hero Section */}
            <FadeIn>
                <section
                    className="pt-28 md:pt-36 pb-16 text-center px-4 border-b"
                    style={{
                        background: `linear-gradient(135deg, ${theme.primary} 0%, #0a0a0f 100%)`,
                        borderColor: theme.secondary,
                    }}
                >
                    <div className="container mx-auto max-w-4xl">
                        <div className="flex items-center justify-center mb-6">
                            <LeagueBadge src={theme.badgeUrl} alt={theme.name} size={64} className="object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6">
                            {theme.heroText}
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            Tired of missing the biggest games because of expensive cable packages and restricted broadcasts? Get access to every single kick-off this season—crystal clear, on any device.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <ShimmerButton
                                href="/free-trial"
                                variant="league"
                                leagueColor={theme.secondary}
                                className="px-8 py-4 text-lg rounded-lg w-full sm:w-auto"
                            >
                                Stream {theme.name} Free For 24 Hours
                            </ShimmerButton>
                            <a
                                href={process.env.NEXT_PUBLIC_STORE_URL || '/pricing'}
                                target="_blank" rel="noopener noreferrer"
                                className="px-8 py-4 text-lg rounded-lg font-bold bg-white text-black hover:bg-gray-200 transition-colors w-full sm:w-auto text-center"
                            >
                                Buy Now
                            </a>
                        </div>
                    </div>
                </section>
            </FadeIn>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
                {/* Left Column: Content + Fixtures */}
                <div className="lg:col-span-2 space-y-0">

                    {/* SEO Content Block */}
                    <FadeIn direction="up">
                        <section className="prose prose-invert prose-lg max-w-none">
                            <h2 className="text-3xl font-bold text-white mb-8 md:mb-12">How to Watch {theme.name} Live Online</h2>
                            <p className="max-w-2xl">
                                Following {theme.name} has consistently become more frustrating for fans. Splitting subscriptions across multiple providers just to watch your team is expensive. Even when you pay, you&apos;re left settling for delayed highlights or radio broadcasts.
                            </p>
                            <p className="max-w-2xl">
                                SmartLiveTV changes everything. Our IPTV solution bypasses the restrictions entirely, bringing every single {theme.name} fixture directly to you in HD & 4K at a fraction of the cost of standard cable. Best of all, our app works identically across devices — you can easily{' '}
                                <Link href="/setup/firestick" className="text-blue-400 hover:text-blue-300">set it up on your Firestick</Link>,
                                cast it to your Smart TV, or watch live while commuting on your mobile.
                            </p>
                            <p className="max-w-2xl">
                                Start your{' '}
                                <Link href="/pricing" className="text-green-400 hover:text-green-300">free trial</Link>
                                {' '}and never miss a goal again.
                                {slug !== 'champions-league' && (
                                    <> Also available: stream the{' '}
                                    <Link href="/watch/champions-league" className="text-blue-400 hover:text-blue-300">Champions League</Link>
                                    {' '}on the same subscription.</>
                                )}
                            </p>

                            <div className="my-10 p-6 border border-gray-800 rounded-2xl bg-gray-900/50">
                                <h3 className="text-2xl font-bold text-white mb-6">Supported Devices</h3>
                                <p className="mb-4">Need help setting up? Check our quick installation guides:</p>
                                <div className="flex flex-wrap gap-4">
                                    {DEVICES.map(device => (
                                        <Link key={device} href={`/setup/${device}`} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium capitalize text-white border border-gray-700 transition">
                                            {device.replace('-', ' ')}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="my-10 p-6 border border-gray-800 rounded-2xl bg-gray-900/50">
                                <h3 className="text-2xl font-bold text-white mb-6">Other Top Leagues Supported</h3>
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(LEAGUES)
                                        .filter(([s]) => s !== params.slug)
                                        .map(([s, l]) => (
                                            <Link key={s} href={`/watch/${s}`} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-white border border-gray-700 transition">
                                                {l.name}
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        </section>
                    </FadeIn>

                    {/* Upcoming Matches */}
                    <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
                        <h2 className="text-2xl font-bold text-white mb-8 md:mb-12">Upcoming {theme.name} Fixtures</h2>
                        {fixtures.length > 0 ? (
                            <StaggerIn className="space-y-6">
                                {fixtures.map((match: any) => (
                                    <div key={match.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gray-700 transition">
                                        <div className="flex items-center gap-6 w-full md:w-auto flex-1">
                                            <div className="flex flex-col items-center w-24">
                                                <img src={safeBadge(match.homeLogo)} alt={match.homeTeam} className="w-12 h-12 object-contain mb-2" />
                                                <span className="text-xs text-center font-bold text-gray-300">{match.homeTeam}</span>
                                            </div>
                                            <div className="text-center px-4 text-sm text-gray-500 font-bold">
                                                VS<br /><span className="text-xs font-normal">{formatMatchDate(match.date)}</span>
                                            </div>
                                            <div className="flex flex-col items-center w-24">
                                                <img src={safeBadge(match.awayLogo)} alt={match.awayTeam} className="w-12 h-12 object-contain mb-2" />
                                                <span className="text-xs text-center font-bold text-gray-300">{match.awayTeam}</span>
                                            </div>
                                        </div>
                                        <ShimmerButton
                                            href="/free-trial"
                                            variant="league"
                                            leagueColor={theme.secondary}
                                            className="px-6 py-3 text-sm rounded-lg whitespace-nowrap w-full md:w-auto"
                                        >
                                            Watch This Match →
                                        </ShimmerButton>
                                    </div>
                                ))}
                            </StaggerIn>
                        ) : (
                            <p className="text-gray-500 p-6 bg-gray-900 rounded-xl border border-gray-800 text-center">No upcoming fixtures scheduled right now.</p>
                        )}
                    </section>

                    {/* FAQ Sections */}
                    <FadeIn direction="up">
                        <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
                            <h2 className="text-3xl font-bold text-white mb-8 md:mb-12">Frequently Asked Questions</h2>
                            <StaggerIn className="space-y-6">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
                                        <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                                        <p className="text-gray-400">{faq.answer}</p>
                                    </div>
                                ))}
                            </StaggerIn>
                        </section>
                    </FadeIn>

                </div>

                {/* Right Column: Standings Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
                        <div className="p-4 border-b bg-gray-800/50" style={{ borderColor: theme.secondary }}>
                            <h3 className="text-lg font-bold text-white">Live {theme.name} Table</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 z-10" style={{ backgroundColor: '#0f1118' }}>
                                    <tr className="text-gray-200 font-bold uppercase border-b" style={{ borderColor: theme.secondary }}>
                                        <th className="py-2 px-2 text-center w-8">#</th>
                                        <th className="py-2 px-2 text-left">Team</th>
                                        <th className="py-2 px-2 text-center w-8">P</th>
                                        <th className="py-2 px-2 text-center w-8">W</th>
                                        <th className="py-2 px-2 text-center w-8">D</th>
                                        <th className="py-2 px-2 text-center w-8">L</th>
                                        <th className="py-2 px-2 text-center w-8 hidden md:table-cell">GF</th>
                                        <th className="py-2 px-2 text-center w-8 hidden md:table-cell">GA</th>
                                        <th className="py-2 px-2 text-center w-8 hidden md:table-cell">GD</th>
                                        <th className="py-2 px-2 text-center">Form</th>
                                        <th className="py-2 px-2 text-center w-10 text-white">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.slice(0, 10).map((team: any, i: number) => (
                                        <tr
                                            key={team.teamId || i}
                                            className={`border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors even:bg-white/[0.02]`}
                                        >
                                            <td className="py-2 px-2 text-center font-bold text-gray-500">{team.position}</td>
                                            <td className="py-2 px-2">
                                                <div className={`flex items-center gap-2 pl-2 ${getDescriptionBorder(team.description)}`}>
                                                    <img src={safeBadge(team.teamLogo)} alt={team.team} className="w-5 h-5 object-contain" />
                                                    <span className="font-semibold text-gray-200 line-clamp-1 flex-1">{team.team}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 text-center text-gray-500">{team.played}</td>
                                            <td className="py-2 px-2 text-center text-gray-500">{team.won}</td>
                                            <td className="py-2 px-2 text-center text-gray-500">{team.drawn}</td>
                                            <td className="py-2 px-2 text-center text-gray-500">{team.lost}</td>
                                            <td className="py-2 px-2 text-center text-gray-500 hidden md:table-cell">{team.goalsFor}</td>
                                            <td className="py-2 px-2 text-center text-gray-500 hidden md:table-cell">{team.goalsAgainst}</td>
                                            <td className="py-2 px-2 text-center text-gray-500 hidden md:table-cell">{team.goalDifference}</td>
                                            <td className="py-2 px-2 text-center">{renderForm(team.form)}</td>
                                            <td className="py-2 px-2 text-center font-bold text-white">{team.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-800/20 text-center">
                            <Link href="/pricing" className="text-green-500 hover:text-green-400 font-bold text-sm">Unlock full table &amp; all games</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <FadeIn direction="up">
                <section className="py-16 md:py-20 text-center px-4 border-t" style={{ borderColor: theme.secondary, background: `linear-gradient(180deg, #0a0a0f 0%, ${theme.primary}33 100%)` }}>
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to ditch the cable?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                            <ShimmerButton
                                href="/free-trial"
                                variant="league"
                                leagueColor={theme.secondary}
                                className="px-10 py-5 text-xl rounded-xl w-full sm:w-auto"
                            >
                                Start Watching {theme.name} Tonight — Free Trial
                            </ShimmerButton>
                            <a
                                href={process.env.NEXT_PUBLIC_STORE_URL || '/pricing'}
                                target="_blank" rel="noopener noreferrer"
                                className="px-10 py-5 text-xl rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-colors w-full sm:w-auto text-center"
                            >
                                Buy Now
                            </a>
                        </div>
                    </div>
                </section>
            </FadeIn>

      {/* Mobile Sticky CTA — md:hidden */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-[#2a2a3a] p-4">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || '/pricing'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#00e676] text-black font-bold text-base py-4 rounded-2xl text-center touch-manipulation active:scale-95 transition-transform cta-button"
          >
            Get Free Trial
          </a>
          <a
            href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-black font-bold text-base py-4 rounded-2xl text-center touch-manipulation active:scale-95 transition-transform cta-button"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
        </div>
    )
}
