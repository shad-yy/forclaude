import { Suspense } from "react"
import { Metadata } from "next"

import { HeroSection } from "@/components/homepage/hero-section"
import { MatchCard } from "@/components/homepage/match-card"
import { LeagueTables } from "@/components/homepage/league-tables"
import { WhyIPTV } from "@/components/homepage/why-iptv"
import { PricingPreview } from "@/components/homepage/pricing-preview"
import { NewsSection } from "@/components/homepage/news-section"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: 'Smart Live TV — Watch 15,000+ Channels | Free 24H Trial',
  description: 'Stream Premier League, La Liga, Champions League, UFC & more on any device. Get your free 24-hour trial today.',
  alternates: {
    canonical: '/',
  },
}

function NewsSkeleton() {
  return <Skeleton className="h-96 w-full rounded-3xl" />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://smartlivetv.com/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://smartlivetv.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <HeroSection />

      <ScrollReveal>
        <MatchCard />
      </ScrollReveal>

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
        <section className="py-20 bg-background border-t border-border relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <Suspense fallback={<NewsSkeleton />}>
              <NewsSection maxArticles={3} />
            </Suspense>
          </div>
        </section>
      </ScrollReveal>

    </div>
  )
}
