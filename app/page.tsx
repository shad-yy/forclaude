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
  title: 'Smart Live TV — Watch Every Match Live',
  description: 'Stream Premier League, La Liga, Champions League, UFC & more on any device. Get your 24-hour free trial today.',
  openGraph: {
    title: 'Smart Live TV — Watch Every Match Live',
    description: '15,000+ live channels. No blackouts. Cancel anytime.',
    type: 'website',
  },
}

function NewsSkeleton() {
  return <Skeleton className="h-96 w-full rounded-3xl" />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden text-gray-100">
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
        <section className="py-20 md:py-32 bg-background border-t border-border relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <Suspense fallback={<NewsSkeleton />}>
              <NewsSection maxArticles={3} />
            </Suspense>
          </div>
        </section>
      </ScrollReveal>

    </div>
  )
}
