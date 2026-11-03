import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { SpeedChecker } from '@/components/ui/SpeedChecker'
import { FirestickWizard } from '@/components/setup/FirestickWizard'
import { RecommendedApps } from '@/components/setup/RecommendedApps'

const DEVICES = {
    'firestick': { name: 'Firestick' },
    'smart-tv': { name: 'Smart TV' },
    'android': { name: 'Android' },
    'iphone': { name: 'iPhone' },
}

const LEAGUES = [
    { id: '4328', slug: 'premier-league', name: 'Premier League', logo: '/leagues/premier-league.png' },
    { id: '4335', slug: 'la-liga', name: 'La Liga', logo: '/leagues/la-liga.png' },
    { id: '4331', slug: 'bundesliga', name: 'Bundesliga', logo: '/leagues/bundesliga.png' },
    { id: '4332', slug: 'serie-a', name: 'Serie A', logo: '/leagues/serie-a.png' },
    { id: '4334', slug: 'ligue-1', name: 'Ligue 1', logo: '/leagues/ligue-1.png' },
]

type Props = { params: { device: string } }

// Force static building for the top SEO pages
export function generateStaticParams() {
    return Object.keys(DEVICES).map((device) => ({ device }))
}

export function generateMetadata({ params }: Props): Metadata {
    const device = DEVICES[params.device as keyof typeof DEVICES]
    if (!device) return { title: 'Device Not Found' }

    const canonical = `${ENV.BASE_URL}/setup/${params.device}`

    if (params.device === 'firestick') {
        return {
            title: 'Smart Live TV on Firestick — Setup Guide 2026',
            description:
                'Official Smart Live TV setup guide for Amazon Firestick. Install in 5 minutes, get 230,000+ channels including Sky Sports Premier League, Netflix and Champions League. No box required.',
            alternates: { canonical },
            openGraph: {
                title: 'Smart Live TV on Firestick — Setup Guide 2026',
                description:
                    'Official Smart Live TV setup guide for Amazon Firestick. Install in 5 minutes, get 230,000+ channels including Sky Sports Premier League, Netflix and Champions League.',
                type: 'article',
            },
        }
    }

    if (params.device === 'smart-tv') {
        return {
            title: 'Smart Live TV on Samsung & LG Smart TV — Setup Guide 2026',
            description:
                'Install Smart Live TV on your Samsung, LG, or Sony Smart TV in 5 minutes. Get Sky Sports, Netflix, 230,000+ channels. Official setup guide.',
            alternates: { canonical },
            openGraph: {
                title: 'Smart Live TV on Samsung & LG Smart TV — Setup Guide 2026',
                description:
                    'Install Smart Live TV on your Samsung, LG, or Sony Smart TV in 5 minutes. Get Sky Sports, Netflix, 230,000+ channels. Official setup guide.',
                type: 'article',
            },
        }
    }

    return {
        title: `How to Watch Live Sports on ${device.name} in 2026 | Smart Live TV`,
        description: `Stream Premier League, La Liga, UFC and more on your ${device.name}. Step-by-step setup guide. Works with all major IPTV apps.`,
        alternates: { canonical },
        openGraph: {
            title: `How to Watch Live Sports on ${device.name} in 2026`,
            description: `Stream Premier League, La Liga, UFC and more on your ${device.name}.`,
            type: 'article',
        },
    }
}

export default async function SetupDevicePage({ params }: Props) {
    const deviceParams = DEVICES[params.device as keyof typeof DEVICES]

    if (!deviceParams) {
        notFound()
    }

    const firestickExtraFaqs = params.device === 'firestick' ? [
        {
            question: 'Does Smart Live TV have an official Firestick app?',
            answer: 'Smart Live TV provides a dedicated setup guide and player app for Amazon Firestick. Installation takes under 5 minutes using the steps below.',
        },
        {
            question: 'Is Smart Live TV different from Axia TV or other IPTV boxes?',
            answer: 'Yes. Smart Live TV is a subscription streaming service that works on your existing devices — including Amazon Firestick — without requiring any additional hardware or set-top box.',
        },
    ] : []

    const faqs = [
        {
            question: `Is the SmartLiveTV app free to download on ${deviceParams.name}?`,
            answer: `Yes, you can use any free IPTV player available on your ${deviceParams.name} app store. You only pay for your SmartLiveTV streaming subscription.`
        },
        {
            question: `Do I need a VPN to watch sports on my ${deviceParams.name}?`,
            answer: `No VPN is required. Our streams are securely delivered to your ${deviceParams.name} without any regional blocking or throttling.`
        },
        {
            question: `Can I use my subscription on multiple devices?`,
            answer: `Yes, depending on the tier you choose during sign-up, you can stream simultaneously on up to 4 devices including your ${deviceParams.name}, smartphones, and computers.`
        },
        ...firestickExtraFaqs,
    ]

    const faqSchema = generateFAQSchema(faqs)

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${ENV.BASE_URL}/setup/${params.device}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', 
          item: `${ENV.BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Setup Guides', 
          item: `${ENV.BASE_URL}/setup` },
        { '@type': 'ListItem', position: 3, name: `${deviceParams.name} Setup`, 
          item: `${ENV.BASE_URL}/setup/${params.device}` },
      ],
    }

    const howToSteps: Record<string, Array<{name: string; text: string}>> = {
      firestick: [
        { name: 'Enable Unknown Sources', text: 'Go to Settings → My Fire TV → About → click device name 7 times to enable Developer Mode. Then return to My Fire TV → Developer Options → Install Unknown Apps → turn ON for Downloader.' },
        { name: 'Install Downloader App', text: 'Search for "Downloader" in the Amazon Appstore and install it for free (orange icon by AFTVnews).' },
        { name: 'Choose and Install Your IPTV Player', text: 'Open Downloader and enter the numeric code for your chosen app. We recommend TiviMate (code: 278077), IPTV Smarters Pro (code: 250931), or XCIPTV (code: 548268).' },
        { name: 'Enter Your Smart Live TV Credentials', text: 'Open the installed player app, select "Xtream Codes API" or "Login", and enter the server URL, username, and password from your Smart Live TV confirmation email.' },
        { name: 'Start Watching in 4K', text: 'The player will load your channel list and EPG guide automatically. Navigate to Live TV → Sports for Premier League, UEFA Champions League, Formula 1, UFC, and more.' },
      ],
      'smart-tv': [
        { name: 'Open Your TV App Store', text: 'Press the Home button on your remote and navigate to Apps, Smart Hub (Samsung Tizen), or LG Content Store (LG webOS).' },
        { name: 'Choose and Install an IPTV Player', text: 'Search for "IBO Player" (recommended — lets you activate playlists from your phone or PC), "Smarters Player Lite", or "Flix IPTV" and click install.' },
        { name: 'Enter Your Smart Live TV Details', text: 'Open the app and select "Xtream Codes" login. Enter the server URL, username, and password provided in your subscription email. For IBO Player, link your device at iboplayer.com using your TV\'s Device ID and Device Key.' },
        { name: 'Start Watching in 4K', text: 'The app will synchronize 230,000+ live channels and VOD automatically. Browse to Sports for live football, rugby, tennis, and PPV combat sports.' },
      ],
      android: [
        { name: 'Download an IPTV Player', text: 'Open the Google Play Store on your Android phone, tablet, or Android TV box. Search for "Televizo" (best mobile UX), "IPTV Smarters Pro", or "XCIPTV" and install.' },
        { name: 'Open and Add Your Account', text: 'Launch the app, select "Xtream Codes API" or "Add User", and fill in your Smart Live TV server portal URL, username, and password.' },
        { name: 'Browse and Stream', text: 'Choose Live TV for live sports networks, Movies for on-demand cinema, or Series for box sets. All 230,000+ channels stream at up to 60fps with zero buffering.' },
      ],
      iphone: [
        { name: 'Download an IPTV Player from App Store', text: 'Open the Apple App Store on your iPhone or iPad. Search for "UHF" (recommended for Apple devices with iCloud sync), "Smarters Player Lite" (free), or "IPTVX".' },
        { name: 'Add Your Smart Live TV Account', text: 'Open the app, tap "Add Playlist", select "Xtream Codes API", and input your server address, username, and password received upon ordering.' },
        { name: 'Start Streaming Live Sports', text: 'Your full channel lineup and electronic programme guide will load. Stream Premier League, Champions League, and international channels in HD and 4K.' },
      ],
    }

    const defaultSteps = [
      { name: 'Get Your Smart Live TV Credentials', text: 'Sign up for a subscription or 24-hour free trial on our website to receive your Xtream Codes or M3U playlist credentials.' },
      { name: 'Install a Compatible IPTV Player', text: `Download an IPTV player from the application store on your ${deviceParams.name}.` },
      { name: 'Enter Your Account Credentials', text: 'Launch the player app, choose Xtream Codes API login, and enter your server URL, username, and password.' },
      { name: 'Start Streaming', text: 'Your 230,000+ live channels and VOD library will load automatically.' },
    ]

    const deviceSteps = howToSteps[params.device] || defaultSteps

    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${ENV.BASE_URL}/setup/${params.device}#howto`,
      name: `How to Set Up Smart Live TV on ${deviceParams.name} (2026)`,
      description: `Step-by-step guide to installing and configuring Smart Live TV IPTV service on ${deviceParams.name}. Takes under 5 minutes with zero technical hardware required.`,
      totalTime: 'PT5M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'GBP',
        value: '0',
      },
      tool: [
        {
          '@type': 'HowToTool',
          name: `${deviceParams.name} device connected to a display`,
        },
        {
          '@type': 'HowToTool',
          name: 'High-speed broadband Internet connection (minimum 15 Mbps for 4K streaming)',
        },
      ],
      supply: [
        {
          '@type': 'HowToSupply',
          name: 'Smart Live TV subscription or 24-hour trial credentials (M3U / Xtream Codes)',
        },
        {
          '@type': 'HowToSupply',
          name: `${deviceParams.name} compatible IPTV Player app (e.g., TiviMate, IBO Player, IPTV Smarters)`,
        },
      ],
      step: deviceSteps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.name,
        text: step.text,
        url: `${ENV.BASE_URL}/setup/${params.device}#step-${i + 1}`,
      })),
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            <SchemaMarkup schema={faqSchema} />
            <SchemaMarkup schema={breadcrumbSchema} />
            <SchemaMarkup schema={howToSchema} />

            {/* Hero Section */}
            <FadeIn>
            <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-gradient-to-b from-gray-900 to-gray-950 text-center px-4 border-b border-gray-900">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                        {params.device === 'firestick' 
                          ? 'How to Set Up Smart Live TV on Amazon Firestick (2026)'
                          : `How to Watch Live Sports on ${deviceParams.name}`
                        }
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        {params.device === 'firestick'
                          ? 'This guide covers setting up Smart Live TV — the UK IPTV service — on your Amazon Firestick. Stream Premier League, UFC, and 230,000+ live channels in under 5 minutes.'
                          : `Turn your ${deviceParams.name} into the ultimate sports hub in under 5 minutes. Stream Premier League, UFC, and 230,000+ live channels instantly.`
                        }
                    </p>
                </div>
            </section>
            </FadeIn>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
                {/* Left Column: Instructions */}
                <div className="lg:col-span-2 space-y-0">

                    <FadeIn direction="up">
                    <section id="setup-steps" className="bg-gray-900 p-8 md:p-10 rounded-3xl border border-gray-800 mb-16 md:mb-20">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-white">Step-by-Step Setup Guide</h2>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700">⏱️ Est. Time: 5 Minutes</span>
                                <span className="px-2.5 py-1 rounded-full bg-green-950/60 border border-green-800/40 text-green-400 font-semibold">Cost: Free Setup / 24h Free Trial</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {deviceSteps.map((step, idx) => (
                                <div key={idx} id={`step-${idx + 1}`} className="flex gap-4 scroll-mt-24">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-lg shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{step.name}</h3>
                                        <p className="text-gray-400 leading-relaxed">{step.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
                            <ShimmerButton
                                href="/pricing"
                                className="w-full md:w-auto px-8 py-4 font-bold rounded-lg text-lg text-black bg-green-500"
                            >
                                Set Up on My {deviceParams.name} — Start Free Trial
                            </ShimmerButton>
                        </div>
                    </section>
                    </FadeIn>

                    {/* Recommended Apps Section */}
                    <FadeIn direction="up">
                      <RecommendedApps device={params.device} />
                    </FadeIn>

                    {params.device === 'firestick' && (
                      <FadeIn direction="up">
                      <section className="mt-16 md:mt-20 mb-16 md:mb-20">
                        <h2 className="text-3xl font-bold text-white mb-3">Having trouble?</h2>
                        <p className="text-gray-400 mb-6">Use our interactive troubleshooter to diagnose and fix common Firestick setup issues in under 2 minutes.</p>
                        <FirestickWizard />
                      </section>
                      </FadeIn>
                    )}

                    <div className="max-w-sm mt-10">
                        <SpeedChecker />
                    </div>

                    <FadeIn direction="up">
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
                    </FadeIn>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Why {deviceParams.name} users love SmartLiveTV</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                <span><strong>Zero Buffering:</strong> Our 60FPS servers are optimized for native {deviceParams.name} playback hardware.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                <span><strong>100% Legitimate Apps:</strong> Use official store apps without jailbreaking or risky sideloading.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                <span><strong>4K UHD Support:</strong> True ultra-HD sports streams looking beautiful on large screens.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                        <h3 className="text-xl font-bold text-white mb-2">Access 230,000+ Channels</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Your subscription includes every single channel and sports network worldwide, including these top leagues and much more:
                        </p>
                        <div className="flex flex-col gap-3">
                            {LEAGUES.map(league => (
                                <Link key={league.slug} href={`/watch/${league.slug}`} className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-700">
                                    <img
                                        src={league.logo}
                                        alt={league.name}
                                        className="w-10 h-10 object-contain bg-white rounded-full p-1"
                                    />
                                    <span className="font-bold text-gray-200">{league.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                        <h3 className="text-xl font-bold text-white mb-4">Other Devices</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(DEVICES).filter(d => d !== params.device).map(device => (
                                <Link key={device} href={`/setup/${device}`} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 capitalize transition">
                                    {device.replace('-', ' ')}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
