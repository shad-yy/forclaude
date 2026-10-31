import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { AnswerBlock } from '@/components/seo/AnswerBlock'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'
import { AUTHORS } from '@/lib/constants/authors'

export const metadata: Metadata = {
  title: 'About Smart Live TV | IPTV Streaming Service',
  description: 'Learn about Smart Live TV \u2014 the UK\'s premium IPTV service with 230,000+ channels, 4K streaming, and no contracts. Free 24-hour trial.',
  alternates: { canonical: `${ENV.BASE_URL}/about` },
}

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${ENV.BASE_URL}/about`,
    name: 'About Smart Live TV',
    description: 'Learn about Smart Live TV \u2014 the UK\'s premium IPTV service with 230,000+ channels, 4K streaming, and no contracts.',
    url: `${ENV.BASE_URL}/about`,
    mainEntity: { '@id': `${ENV.BASE_URL}/#organization` },
    isPartOf: { '@id': `${ENV.BASE_URL}/#website` },
    inLanguage: 'en-GB',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/about#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${ENV.BASE_URL}/about` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={aboutSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <FadeIn>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4 border-b border-[#2a2a3a]">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">About Smart Live TV</h1>

          <AnswerBlock
            answer="Smart Live TV is a UK-based IPTV subscription service that replaces Netflix (\u00a318/mo), Sky Sports (\u00a343/mo), Disney+ (\u00a311/mo), and TNT Sports (\u00a330/mo) with a single subscription starting at \u00a312/month. It streams 230,000+ channels in 4K quality to any device, with no contract and a free 24-hour trial."
            facts={[
              "Replaces an average of \u00a3120+/month in separate streaming subscriptions",
              "4K Ultra HD quality on Firestick, Smart TV, Android, iPhone, and PC",
              "Free 24-hour trial \u2014 no credit card required, activated via WhatsApp",
              "WhatsApp support 7 days a week, 9am\u201311pm UK time",
            ]}
          />

          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Smart Live TV gives UK sports fans and TV viewers the ability to watch everything they love {'\u2014'} Premier League, Champions League, UFC, Formula 1, and all their favourite shows on Netflix, Disney+, Amazon Prime and Shahid {'\u2014'} for a single monthly subscription that costs less than Sky Sports alone.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            We believe the era of paying separately for 8 different streaming services is over. Our subscribers cancel Netflix, Disney+, Sky Sports, and TNT Sports and replace everything with one service at a fraction of the cost.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { stat: '\u00a3109', label: 'Average monthly saving vs Sky + Netflix combined' },
              { stat: '4K', label: 'Ultra HD streaming quality' },
              { stat: '24H', label: 'Free trial \u2014 no card required' },
            ].map(item => (
              <div key={item.stat} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
                <div className="text-3xl font-extrabold text-[#00e676] mb-2">{item.stat}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            We believe sport and entertainment should be accessible. Our mission is simple: give every
            fan the ability to watch their team and their favourite shows, on any device, from anywhere in the
            world {'\u2014'} without paying a fortune or signing a long-term contract.
          </p>
          <Link href="/pricing" className="inline-flex items-center px-8 py-4 bg-[#00e676] text-black font-bold rounded-lg hover:bg-[#00ff87] transition-colors">
            Get My Free Trial {'\u2192'}
          </Link>
        </div>
      </section>
      </FadeIn>

      {/* EDITORIAL TEAM — E-E-A-T Section */}
      <FadeIn>
      <section id="editorial-team" className="py-16 md:py-20 px-4 border-b border-[#2a2a3a]">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Editorial Team</h2>
          <p className="text-gray-400 text-sm mb-8">
            Every guide, review, and comparison on Smart Live TV is researched and written by our in-house editorial team.
          </p>

          {Object.values(AUTHORS).map(author => (
            <div key={author.name} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#00e676]/10 border border-[#00e676]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00e676] text-xl font-bold">{'\u270D'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{author.name}</h3>
                  <p className="text-sm text-[#00e676]">{author.jobTitle}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {author.bio}
              </p>
              <div className="flex flex-wrap gap-2">
                {author.knowsAbout.map(topic => (
                  <span key={topic} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                    {topic}
                  </span>
                ))}
              </div>
              {author.sameAs.length > 0 && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-[#2a2a3a]">
                  {author.sameAs.map(link => {
                    const label = link.includes('instagram') ? 'Instagram'
                      : link.includes('twitter') ? 'Twitter/X'
                      : link.includes('trustpilot') ? 'Trustpilot'
                      : 'Profile'
                    return (
                      <a key={link} href={link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-[#00e676] transition-colors">
                        {label} {'\u2197'}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          <h3 className="text-xl font-bold mb-4">Our Editorial Standards</h3>
          <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Verified Information',
                desc: 'Every broadcaster, price, and schedule is verified against official sources before publication.',
              },
              {
                title: 'Regular Updates',
                desc: 'Guides are updated within 24 hours of any broadcaster change, price update, or schedule shift.',
              },
              {
                title: 'Real Cost Comparisons',
                desc: 'All pricing comparisons use current, publicly listed prices from Sky, TNT Sports, DAZN, and others.',
              },
              {
                title: 'Device-Tested Guides',
                desc: 'Setup instructions are tested on actual devices: Firestick, Smart TV, Android, and iOS.',
              },
            ].map(item => (
              <div key={item.title} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-5">
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </StaggerIn>
        </div>
      </section>
      </FadeIn>

      {/* Person Schema for editorial team — E-E-A-T structured data */}
      {Object.values(AUTHORS).map(author => (
        <SchemaMarkup key={author.name} schema={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': `${ENV.BASE_URL}/about#editorial-team`,
          name: author.name,
          jobTitle: author.jobTitle,
          description: author.bio,
          url: author.url,
          sameAs: author.sameAs,
          knowsAbout: author.knowsAbout,
          worksFor: { '@id': `${ENV.BASE_URL}/#organization` },
        }} />
      ))}
    </div>
  )
}
