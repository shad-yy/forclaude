import { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Tv, Smartphone, Monitor, Flame, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Smart Live TV Setup Guides — All Devices (Firestick, Smart TV, Android, iOS)',
    description: 'Step-by-step installation guides to set up Smart Live TV on Amazon Firestick, Samsung & LG Smart TVs, Android devices, and Apple iOS in under 5 minutes. No hardware box required.',
    alternates: {
        canonical: `${ENV.BASE_URL}/setup`,
    },
    openGraph: {
        title: 'Smart Live TV Setup Guides — All Devices (2026)',
        description: 'Step-by-step installation guides to set up Smart Live TV on Firestick, Smart TVs, Android, and Apple iOS in under 5 minutes.',
        type: 'website',
    },
}

const DEVICES = [
    {
        slug: 'firestick',
        name: 'Amazon Firestick',
        subtitle: 'Fire TV Stick 4K, Lite, Max & Fire TV Cube',
        desc: 'Install via Downloader app in under 5 minutes. Stream Premier League, Champions League, UFC, and 230,000+ live channels with zero hardware box.',
        popularApps: ['TiviMate (code: 278077)', 'IPTV Smarters Pro (code: 250931)', 'XCIPTV (code: 548268)'],
        icon: Flame,
        tag: 'Most Popular',
        color: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/30',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    {
        slug: 'smart-tv',
        name: 'Smart TV',
        subtitle: 'Samsung (Tizen), LG (webOS), Sony, TCL & Philips',
        desc: 'Download directly from your TV app store without sideloading or jailbreaking. Activate your playlist easily from your mobile phone or PC.',
        popularApps: ['IBO Player', 'Smarters Player Lite', 'Flix IPTV'],
        icon: Tv,
        tag: 'Big Screen 4K',
        color: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
        slug: 'android',
        name: 'Android Devices',
        subtitle: 'Android Smartphones, Tablets & Android TV Boxes',
        desc: 'Install directly from Google Play Store or sideload APKs on Nvidia Shield, Chromecast with Google TV, and Android TV streaming boxes.',
        popularApps: ['Televizo', 'IPTV Smarters Pro', 'XCIPTV Player'],
        icon: Monitor,
        tag: 'Mobile & Box',
        color: 'from-green-500/20 to-green-500/5 text-green-400 border-green-500/30',
        badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    },
    {
        slug: 'iphone',
        name: 'Apple iOS & iPadOS',
        subtitle: 'iPhone, iPad & Apple TV (tvOS)',
        desc: 'Download verified IPTV players directly from the official Apple App Store with full iCloud playlist sync and AirPlay support.',
        popularApps: ['UHF', 'Smarters Player Lite', 'IPTVX'],
        icon: Smartphone,
        tag: 'Apple Ecosystem',
        color: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
]

const SETUP_FAQS = [
    {
        question: 'How long does it take to set up Smart Live TV?',
        answer: 'Setup takes under 5 minutes on any device. Once you receive your Xtream Codes or M3U playlist credentials via email, simply download a free IPTV player and log in.',
    },
    {
        question: 'Do I need a special set-top box or satellite dish?',
        answer: 'No. Smart Live TV works on the hardware you already own — Amazon Firestick, Smart TVs (Samsung, LG, Sony), Android boxes, phones, tablets, and Apple devices. No dishes, cables, or proprietary boxes required.',
    },
    {
        question: 'What broadband internet speed do I need for 4K streaming?',
        answer: 'We recommend a minimum download speed of 15 Mbps for smooth 1080p and 4K UHD streaming. For multi-room setups streaming on multiple screens simultaneously, 30+ Mbps is recommended.',
    },
    {
        question: 'Can I test the setup before purchasing a subscription?',
        answer: 'Yes! We offer a full 24-hour free trial with complete access to all 230,000+ live channels, sports channels, and VOD movies so you can test performance on your device before buying.',
    },
]

export default function SetupHubPage() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${ENV.BASE_URL}/setup#breadcrumb`,
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Setup Guides', item: `${ENV.BASE_URL}/setup` },
        ],
    }

    const faqSchema = generateFAQSchema(SETUP_FAQS)

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            <SchemaMarkup schema={breadcrumbSchema} />
            <SchemaMarkup schema={faqSchema} />

            {/* Hero Section */}
            <FadeIn>
                <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-gradient-to-b from-gray-900 to-gray-950 text-center px-4 border-b border-gray-900">
                    <div className="container mx-auto max-w-3xl">
                        <span className="text-xs uppercase tracking-wider text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                            Device Configuration Guides
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold mt-4 mb-6">
                            Smart Live TV Setup Guides
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
                            Select your streaming device below for a 5-minute step-by-step setup guide. Stream Sky Sports, Premier League, UFC, and 230,000+ live channels in 4K with zero hardware box required.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-400" /> 5-Minute Install
                            </span>
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-400" /> 100% Hardware Compatible
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" /> 24-Hour Free Trial
                            </span>
                        </div>
                    </div>
                </section>
            </FadeIn>

            {/* Device Grid */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {DEVICES.map((d) => {
                        const Icon = d.icon
                        return (
                            <Link
                                key={d.slug}
                                href={`/setup/${d.slug}`}
                                className="group relative p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-green-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/5 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${d.color} border`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
                                                    {d.name}
                                                </h2>
                                                <p className="text-xs text-gray-400">{d.subtitle}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${d.badgeColor}`}>
                                            {d.tag}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-300 leading-relaxed mb-6">
                                        {d.desc}
                                    </p>

                                    <div className="mb-6 bg-gray-950/60 rounded-xl p-3.5 border border-gray-800/80">
                                        <p className="text-xs font-semibold text-gray-400 mb-2">Recommended Apps:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {d.popularApps.map((app, idx) => (
                                                <span key={idx} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-200">
                                                    {app}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-green-400 group-hover:underline">
                                        View Step-by-Step Setup Guide
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1.5 transition-transform" />
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* FAQ Section */}
                <FadeIn direction="up">
                    <section className="bg-gray-900 rounded-3xl border border-gray-800 p-8 md:p-12 mb-16">
                        <div className="max-w-3xl mb-8">
                            <span className="text-xs uppercase tracking-wider text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                Quick Answers
                            </span>
                            <h2 className="text-3xl font-bold text-white mt-3">Frequently Asked Setup Questions</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {SETUP_FAQS.map((faq, i) => (
                                <div key={i} className="p-6 bg-gray-950/60 rounded-2xl border border-gray-800/80">
                                    <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </FadeIn>

                {/* Trial CTA */}
                <FadeIn direction="up">
                    <section className="bg-gradient-to-r from-green-950/40 via-gray-900 to-green-950/30 rounded-3xl border border-green-500/30 p-8 md:p-12 text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Ready to Start Streaming on Your Device?
                        </h2>
                        <p className="text-gray-300 max-w-xl mx-auto mb-8">
                            Get instant access to 230,000+ channels, Sky Sports, TNT Sports, and all 3pm blackout Premier League fixtures from just £12/month.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <ShimmerButton
                                href="/pricing"
                                className="px-8 py-4 font-bold rounded-lg text-lg text-black bg-green-500"
                            >
                                View Plans — From £12/Month
                            </ShimmerButton>
                            <Link
                                href="/free-trial"
                                className="px-6 py-4 rounded-lg text-base font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 transition"
                            >
                                Start 24-Hour Free Trial
                            </Link>
                        </div>
                    </section>
                </FadeIn>
            </div>
        </div>
    )
}
