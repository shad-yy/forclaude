import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { LeagueBadge } from '@/components/league/league-badge'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: 'Watch Formula 1 Live 2026 | Stream Every F1 Race | Smart Live TV',
  description: 'Stream every Formula 1 race live in 4K with no ad breaks. Sky Sports F1 included. Free 24-hour trial. Works on any device.',
  alternates: { canonical: `${ENV.BASE_URL}/watch/formula-1` },
}

export default async function Formula1Page() {
  const faqs = [
    {
      question: 'Does IPTV include Sky Sports F1?',
      answer: 'Yes, Smart Live TV includes Sky Sports F1 in full 4K UHD so you can watch every practice, qualifying, and race session live.',
    },
    {
      question: 'Can I watch F1 without a Sky subscription?',
      answer: 'Absolutely. You do not need a cable or satellite TV subscription. Just connect your device to the internet and launch the app.',
    },
    {
      question: 'Is there a way to watch F1 without ads?',
      answer: "We offer international feeds (like F1 TV Pro streams or specific international broadcasters) that often run without ad breaks during the race, giving you uninterrupted action.",
    },
    {
      question: 'How to watch F1 from abroad?',
      answer: "With Smart Live TV, there are no geo-blocks. You can stream F1 whether you're in the UK, Europe, or traveling anywhere else in the world.",
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
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-white">Every F1 Race. Zero Ad Breaks.</h1>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stream the entire 2026 Formula 1 season in 4K UHD. Enjoy Sky Sports F1, F1 TV feeds, and uninterrupted international coverage. F1 is the fastest-growing sport globally — 1.6 billion viewers in 2024.
            </p>
            <ShimmerButton
              href="/pricing"
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
                <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white text-sm"
                  style={{ backgroundColor: '#e10600' }}>
                  Watch F1 Live →
                </Link>
              </div>
            </section>
          </FadeIn>

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
                { n: 2, title: 'Set up on any device', body: <>Works on <Link href="/setup/firestick" className="text-[#00e676] hover:underline">Firestick</Link>, Smart TV, Android, iPhone and more.</> },
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
                href="/pricing"
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
