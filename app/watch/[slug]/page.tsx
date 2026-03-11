import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unifiedSportsAPI } from '@/lib/api/unified-sports-api'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'

const LEAGUES = {
    'premier-league': { id: '4328', name: 'Premier League', hasBlackout: true },
    'la-liga': { id: '4335', name: 'La Liga', hasBlackout: false },
    'bundesliga': { id: '4331', name: 'Bundesliga', hasBlackout: false },
    'serie-a': { id: '4332', name: 'Serie A', hasBlackout: false },
    'ligue-1': { id: '4334', name: 'Ligue 1', hasBlackout: false },
}

const DEVICES = ['firestick', 'smart-tv', 'android', 'iphone']

type Props = { params: { slug: string } }

// Force static building for the top SEO pages
export function generateStaticParams() {
    return Object.keys(LEAGUES).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
    const league = LEAGUES[params.slug as keyof typeof LEAGUES]
    if (!league) return { title: 'League Not Found' }

    return {
        title: `How to Watch ${league.name} Live Online in 2025 | SmartLiveTV`,
        description: `Stream every ${league.name} match live in HD. No blackouts, all devices. Watch ${league.name} on Firestick, Smart TV, iPhone & Android.`,
        openGraph: {
            title: `How to Watch ${league.name} Live Online in 2025`,
            description: `Stream every ${league.name} match live in HD. No blackouts.`,
            type: 'article',
        }
    }
}

export default async function WatchLeaguePage({ params }: Props) {
    const league = LEAGUES[params.slug as keyof typeof LEAGUES]

    if (!league) {
        notFound()
    }

    const [allFixtures, fullStandings] = await Promise.all([
        unifiedSportsAPI.getFixtures({ leagueId: league.id, next: 15 }),
        unifiedSportsAPI.getStandings(league.id)
    ])

    const fixtures = allFixtures.filter(e => e.status !== "Match Finished").slice(0, 5)
    const standings = fullStandings || []

    const faqs = [
        {
            question: `Is it legal to use IPTV for ${league.name}?`,
            answer: `Yes, using a streaming service to watch ${league.name} is completely legal. SmartLiveTV provides a secure and reliable platform for accessing your favorite sports content without restrictions.`
        },
        {
            question: `Can I watch ${league.name} on my Firestick?`,
            answer: `Absolutely! SmartLiveTV is fully compatible with Amazon Firestick. We also support Smart TVs, Android devices, iPhones, and desktop computers.`
        },
        {
            question: `How much does it cost to watch ${league.name} online?`,
            answer: `We offer a free 24-hour trial to test the service. After that, our Sports Fan package is just £9.99/month, covering all ${league.name} matches along with other major sports.`
        },
        {
            question: `Can I watch ${league.name} games abroad?`,
            answer: `Yes, you can stream ${league.name} matches from anywhere in the world using our service. No VPN is required, and there are no regional restrictions.`
        }
    ]

    const faqSchema = generateFAQSchema(faqs)

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <SchemaMarkup schema={faqSchema} />

            {/* Hero Section */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-gray-900 to-gray-950 text-center px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                        Watch {league.name} Live — Every Match, No Blackouts
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Tired of missing the biggest games because of expensive cable packages and restricted broadcasts? Get access to every single kick-off this season—crystal clear, on any device.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-block px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-lg transition-transform transform hover:-translate-y-1 shadow-lg"
                    >
                        Stream {league.name} Free For 24 Hours
                    </Link>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl">
                {/* Left Column: Content + Fixtures */}
                <div className="lg:col-span-2 space-y-16">

                    {/* SEO Content Block */}
                    <section className="prose prose-invert prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-white mb-6">How to Watch {league.name} Live Online</h2>
                        <p>
                            Following {league.name} has consistently become more frustrating for fans. Splitting subscriptions across multiple providers just to watch your team is expensive. Even when you pay, {league.hasBlackout && <strong className="text-green-400">the traditional 3pm blackout rule means you still miss crucial games. </strong>}You're left settling for delayed highlights or radio broadcasts.
                        </p>
                        <p>
                            SmartLiveTV changes everything. Our IPTV solution bypasses the restrictions entirely, bringing every single {league.name} fixture directly to you in HD at a fraction of the cost of standard cable. Best of all, our app works identically across devices, meaning you can easily <Link href="/setup/firestick" className="text-blue-400 hover:text-blue-300">set it up on your Firestick</Link>, cast it to your Smart TV, or watch live while commuting on your mobile.
                        </p>
                        <p>
                            Stop paying for missing coverage. Try our 24-hour trial and never miss a goal again.
                        </p>

                        <div className="my-10 p-8 border border-gray-800 rounded-2xl bg-gray-900/50">
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

                        <div className="my-10 p-8 border border-gray-800 rounded-2xl bg-gray-900/50">
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

                    {/* Upcoming Matches */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Upcoming {league.name} Fixtures</h2>
                        {fixtures.length > 0 ? (
                            <div className="space-y-4">
                                {fixtures.map((match: any) => (
                                    <div key={match.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gray-700 transition">
                                        <div className="flex items-center gap-6 w-full md:w-auto flex-1">
                                            <div className="flex flex-col items-center w-24">
                                                <img src={match.homeLogo ? `${match.homeLogo}/small` : '/placeholder-logo.png'} alt={match.homeTeam} className="w-12 h-12 object-contain mb-2" />
                                                <span className="text-xs text-center font-bold text-gray-300">{match.homeTeam}</span>
                                            </div>
                                            <div className="text-center px-4 text-sm text-gray-500 font-bold">
                                                VS<br /><span className="text-xs font-normal">{new Date(match.time).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-col items-center w-24">
                                                <img src={match.awayLogo ? `${match.awayLogo}/small` : '/placeholder-logo.png'} alt={match.awayTeam} className="w-12 h-12 object-contain mb-2" />
                                                <span className="text-xs text-center font-bold text-gray-300">{match.awayTeam}</span>
                                            </div>
                                        </div>
                                        <Link href="/pricing" className="whitespace-nowrap px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-transform transform hover:-translate-y-0.5 w-full md:w-auto text-center">
                                            Watch This Match →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 p-6 bg-gray-900 rounded-xl border border-gray-800 text-center">No upcoming fixtures scheduled right now.</p>
                        )}
                    </section>

                    {/* FAQ Sections */}
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
                                    <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                                    <p className="text-gray-400">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Right Column: Standings Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                            <h3 className="text-lg font-bold text-white">Live {league.name} Table</h3>
                        </div>

                        <div className="flex flex-col text-sm">
                            <div className="grid grid-cols-12 gap-2 p-3 border-b border-gray-800 text-gray-500 font-bold text-xs uppercase">
                                <div className="col-span-2 text-center">#</div>
                                <div className="col-span-6">Team</div>
                                <div className="col-span-2 text-center">P</div>
                                <div className="col-span-2 text-center">Pts</div>
                            </div>

                            {standings.slice(0, 10).map((team: any, i: number) => (
                                <div key={team.teamId} className={`grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-800/50 transition-colors ${i !== Math.min(standings.length, 10) - 1 ? 'border-b border-gray-800/50' : ''}`}>
                                    <div className="col-span-2 text-center font-bold text-gray-500">{team.rank}</div>
                                    <div className="col-span-6 flex items-center gap-2">
                                        <img src={team.logo ? `${team.logo}/small` : '/placeholder-logo.png'} alt={team.teamName} className="w-5 h-5 object-contain" />
                                        <span className="font-semibold text-gray-200 line-clamp-1 flex-1 text-xs">{team.teamName}</span>
                                    </div>
                                    <div className="col-span-2 text-center text-gray-500">{team.played}</div>
                                    <div className="col-span-2 text-center font-bold text-white">{team.points}</div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-800/20 text-center">
                            <Link href="/pricing" className="text-green-500 hover:text-green-400 font-bold text-sm">Unlock full table & all games</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <section className="py-24 bg-gradient-to-t from-gray-900 to-gray-950 text-center px-4 border-t border-gray-800">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to ditch the cable?</h2>
                    <Link
                        href="/pricing"
                        className="inline-block px-10 py-5 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-lg text-xl transition-transform transform hover:-translate-y-1 shadow-xl"
                    >
                        Start Watching {league.name} Tonight — Free Trial
                    </Link>
                </div>
            </section>
        </div>
    )
}
