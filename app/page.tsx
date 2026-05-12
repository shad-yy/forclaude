import { Suspense } from "react"
import { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { SchemaMarkup } from "@/components/SchemaMarkup"

import { HeroSection } from "@/components/homepage/hero-section"
import { MatchCard } from "@/components/homepage/match-card"
import { LeagueTables } from "@/components/homepage/league-tables"
import { WhyIPTV } from "@/components/homepage/why-iptv"
import { PricingPreview } from "@/components/homepage/pricing-preview"
import { NewsSection } from "@/components/homepage/news-section"
import { Skeleton } from "@/components/ui/skeleton"
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

function NewsSkeleton() {
  return <Skeleton className="h-96 w-full rounded-3xl" />
}

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Smart Live TV',
    url: ENV.BASE_URL,
    logo: `${ENV.BASE_URL}/og-default.png`,
    description: 'UK IPTV service providing 230,000+ live channels including all Sky Sports, TNT Sports, beIN Sports and Premier League coverage from £12/month.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'French', 'Arabic'],
      areaServed: ['GB', 'MA', 'FR', 'IE'],
      hoursAvailable: 'Mo-Su 09:00-23:00'
    },
    sameAs: [
      process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
      process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
      process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
    ].filter(Boolean),
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '12',
      highPrice: '54',
      priceCurrency: 'GBP',
      offerCount: 4,
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: `${ENV.BASE_URL}/`,
            potentialAction: {
              "@type": "SearchAction",
              target: `${ENV.BASE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <SchemaMarkup schema={organizationSchema} />
      <FadeIn delay={0.1}>
        <HeroSection />
      </FadeIn>

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

      <ScrollReveal>
        <section className="py-16 md:py-20 bg-[#0a0a0f] border-t border-[#2a2a3a] relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <Suspense fallback={<NewsSkeleton />}>
              <NewsSection maxArticles={12} />
            </Suspense>
          </div>
        </section>
      </ScrollReveal>

    </div>
  )
}
