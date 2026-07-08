import { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { SchemaMarkup } from "@/components/SchemaMarkup"

import { HeroSection } from "@/components/homepage/hero-section"
import { LiveNowBanner } from '@/components/homepage/LiveNowBanner'
import { EventCountdown } from '@/components/homepage/EventCountdown'
import { MatchCard } from "@/components/homepage/match-card"
import dynamic from "next/dynamic"

const ServicePillars = dynamic(() => import("@/components/homepage/service-pillars").then(mod => ({ default: mod.ServicePillars })))
const SpotlightEvents = dynamic(() => import("@/components/homepage/spotlight-events").then(mod => ({ default: mod.SpotlightEvents })))
const LeagueTables = dynamic(() => import("@/components/homepage/league-tables").then(mod => ({ default: mod.LeagueTables })))
const WhyIPTV = dynamic(() => import("@/components/homepage/why-iptv").then(mod => ({ default: mod.WhyIPTV })))
const PricingPreview = dynamic(() => import("@/components/homepage/pricing-preview").then(mod => ({ default: mod.PricingPreview })))
const NewsSection = dynamic(() => import("@/components/homepage/news-section").then(mod => ({ default: mod.NewsSection })))
const RecentPosts = dynamic(() => import("@/components/homepage/recent-posts").then(mod => ({ default: mod.RecentPosts })))
import { SiteNavigationLinks } from "@/components/seo/site-navigation-links"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: 'Smart Live TV | IPTV UK from £12/mo — Free Trial',
  description:
    'Smart Live TV is the premium UK IPTV service from £12/mo. Stream Sky Sports, TNT Sports, Netflix, Disney+ and 230k+ channels. Get a free 24-hour trial.',
  alternates: {
    canonical: ENV.BASE_URL,
  },
  openGraph: {
    title: 'Smart Live TV | IPTV UK from £12/mo — Free Trial',
    description:
      'Smart Live TV is the premium UK IPTV service from £12/mo. Stream Sky Sports, TNT Sports, Netflix, Disney+ and 230k+ channels. Get a free 24-hour trial.',
  },
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
          'Monday', 'Tuesday', 'Wednesday', 'Thursday',
          'Friday', 'Saturday', 'Sunday'
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
      'https://smartlivetv.co.uk',
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

  const homepageFAQSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Smart Live TV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Smart Live TV is a UK IPTV subscription service that replaces Sky Sports, Netflix, Disney+ and TNT Sports with a single subscription from £12/month. It includes 230,000+ channels, movies and series, and works on Firestick, Smart TV, Android, iPhone and PC.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does Smart Live TV cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Smart Live TV plans start from £12/month (1-month Starter plan). The 3-month Popular plan costs £24 (£8/month effective). The 6-month Standard plan is £36 (£6/month). The 12-month Ultimate plan is £54 (£4.50/month). All plans include identical features.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Smart Live TV include Sky Sports?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Smart Live TV includes all Sky Sports channels: Sky Sports Premier League, Sky Sports Main Event, Sky Sports Football, Sky Sports F1, Sky Sports Cricket and Sky Sports Golf — all for £12/month with no Sky Sports subscription required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a free trial for Smart Live TV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Smart Live TV offers a free 24-hour trial with access to all 230,000+ channels. No credit card is required. Activation is via WhatsApp and typically takes under 5 minutes.',
        },
      },
    ],
  }

  // VideoObject schema — ready for your homepage video
  // Replace the placeholder URL with your actual YouTube/video URL when ready
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${ENV.BASE_URL}/#video`,
    name: 'How Smart Live TV Works — Replace Sky Sports, Netflix & Disney+ for £12/mo',
    description: 'See how Smart Live TV replaces Sky Sports (£43/mo), Netflix (£18/mo) and Disney+ with one UK IPTV subscription from £12/month. 230,000+ channels, 4K quality, free 24-hour trial.',
    // TODO: Replace these with actual video URLs when your HuggingFace video is ready
    // thumbnailUrl: `${ENV.BASE_URL}/video-thumbnail.jpg`,
    // uploadDate: '2026-06-24',
    // contentUrl: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
    // embedUrl: 'https://www.youtube.com/embed/YOUR_VIDEO_ID',
    // duration: 'PT1M',
    publisher: {
      '@id': `${ENV.BASE_URL}/#organization`,
    },
  }

  // SpeakableSpecification for voice assistants (AEO)
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${ENV.BASE_URL}/#webpage`,
    name: 'Smart Live TV — Sky Sports & Netflix for £12/mo | Free Trial',
    url: `${ENV.BASE_URL}/`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-speakable', '.faq-speakable'],
    },
    mainEntity: {
      '@id': `${ENV.BASE_URL}/#organization`,
    },
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden text-gray-100">
      <SchemaMarkup schema={websiteSchema} />
      <SchemaMarkup schema={organizationSchema} />
      <SchemaMarkup schema={homepageFAQSchema} />
      <SchemaMarkup schema={speakableSchema} />
      {/* Uncomment the line below when your video is ready */}
      {/* <SchemaMarkup schema={videoSchema} /> */}

      {/* ─── 1. HERO ─── */}
      <HeroSection />

      {/* Service Pillars (clarity strip) */}
      <ServicePillars />

      {/* Spotlight Events (wow section) */}
      <SpotlightEvents />

      {/* ─── 2. NEWS (above match cards) ─── */}
      <section className="py-12 md:py-16 bg-[#0a0a0f] border-t border-[#1a1a2a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <NewsSection />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 3. LIVE FIXTURES / MATCH CARDS ─── */}
      <ScrollReveal>
        <MatchCard />
      </ScrollReveal>

      {/* ─── 4. STANDINGS / LEAGUE TABLES ─── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      <ScrollReveal>
        <LeagueTables />
      </ScrollReveal>

      {/* ─── 5. WHY IPTV / FEATURES ─── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      <ScrollReveal>
        <WhyIPTV />
      </ScrollReveal>

      {/* ─── 6. PRICING PREVIEW ─── */}
      <ScrollReveal>
        <PricingPreview />
      </ScrollReveal>

      {/* ─── 7. LIVE NOW BANNER ─── */}
      <LiveNowBanner />

      <EventCountdown />

      {/* ─── 8. BLOG POSTS (recent posts at bottom) ─── */}
      <ScrollReveal>
        <RecentPosts />
      </ScrollReveal>

      {/* ─── 9. SITE NAVIGATION (SEO internal links) ─── */}
      <SiteNavigationLinks />

    </div>
  )
}
