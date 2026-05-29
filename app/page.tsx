import { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { SchemaMarkup } from "@/components/SchemaMarkup"

import { HeroSection } from "@/components/homepage/hero-section"
import { MatchCard } from "@/components/homepage/match-card"
import dynamic from "next/dynamic"

const LeagueTables = dynamic(() => import("@/components/homepage/league-tables").then(mod => ({ default: mod.LeagueTables })))
const WhyIPTV = dynamic(() => import("@/components/homepage/why-iptv").then(mod => ({ default: mod.WhyIPTV })))
const PricingPreview = dynamic(() => import("@/components/homepage/pricing-preview").then(mod => ({ default: mod.PricingPreview })))
const NewsSection = dynamic(() => import("@/components/homepage/news-section").then(mod => ({ default: mod.NewsSection })))
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: 'Smart Live TV — Netflix, Sky Sports & Disney+ for £12/mo',
  description: 'Replace Netflix, Disney+, Amazon Prime and Sky Sports with one Smart Live TV subscription from £12/month. 230,000+ channels. 4K quality. Free 24-hour trial.',
  alternates: {
    canonical: ENV.BASE_URL,
  },
  openGraph: {
    title: 'Smart Live TV — Netflix, Sky Sports & Disney+ for £12/mo',
    description: 'Replace Netflix, Disney+, Amazon Prime and Sky Sports with one Smart Live TV subscription from £12/month. 230,000+ channels. 4K quality. Free 24-hour trial.',
  }
}


export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ENV.BASE_URL}/#organization`,
    name: 'Smart Live TV',
    url: ENV.BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${ENV.BASE_URL}/og-default.png`,
      width: 1200,
      height: 630,
    },
    description: 'UK IPTV service replacing Netflix, Disney+, Amazon Prime and Sky Sports with one subscription from £12/month. 230,000+ channels, 4K quality, free 24-hour trial.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English'],
      areaServed: 'GB',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday','Tuesday','Wednesday','Thursday',
          'Friday','Saturday','Sunday'
        ],
        opens: '09:00',
        closes: '23:00',
      },
    },
    knowsAbout: [
      'IPTV',
      'Internet Protocol Television',
      'Live Sports Streaming',
      'Premier League',
      'Champions League',
      'UFC',
      'Formula 1',
      'Sky Sports',
      'Netflix',
      'Disney Plus',
      'UK Television',
    ],
    sameAs: [
      // Add real URLs when available. For now use placeholder
      // that will be populated when social accounts are created.
      // Even an empty array is fine — but the structure must exist.
    ],
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '12',
      highPrice: '54',
      priceCurrency: 'GBP',
      offerCount: 4,
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${ENV.BASE_URL}/#website`,
    url: `${ENV.BASE_URL}/`,
    name: 'Smart Live TV',
    publisher: {
      '@id': `${ENV.BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${ENV.BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden text-gray-100">
      <SchemaMarkup schema={websiteSchema} />
      <SchemaMarkup schema={organizationSchema} />
      <HeroSection />

      <FadeIn direction="up">
        <ScrollReveal>
          <MatchCard />
        </ScrollReveal>
      </FadeIn>

      {/* Decorative separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

      <ScrollReveal>
        <LeagueTables />
      </ScrollReveal>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

      <ScrollReveal>
        <WhyIPTV />
      </ScrollReveal>

      <ScrollReveal>
        <PricingPreview />
      </ScrollReveal>

      <div className="contain-layout min-h-[500px]">
        <ScrollReveal>
          <section className="py-16 md:py-20 bg-[#0a0a0f] border-t border-[#2a2a3a] relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
              <NewsSection maxArticles={12} />
            </div>
          </section>
        </ScrollReveal>
      </div>

    </div>
  )
}
