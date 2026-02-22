export interface StructuredDataProps {
  type: "Organization" | "WebSite" | "SportsEvent" | "SportsTeam" | "Person"
  data: any
}

export function generateStructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-live-tv.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  return {
    __html: JSON.stringify(structuredData),
  }
}

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Smart Live TV",
  url: "https://smart-live-tv.vercel.app",
  logo: "https://smart-live-tv.vercel.app/images/logo.png",
  description: "Your ultimate sports destination for live scores, news, and updates.",
  sameAs: ["https://twitter.com/SmartLiveTV", "https://facebook.com/SmartLiveTV"],
}

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Smart Live TV",
  url: "https://smart-live-tv.vercel.app",
  description: "Get live scores, news, and updates from football, UFC, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://smart-live-tv.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export function createSportsEventStructuredData(event: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${event.homeTeam} vs ${event.awayTeam}`,
    startDate: event.date,
    location: {
      "@type": "Place",
      name: event.venue || "TBD",
    },
    competitor: [
      {
        "@type": "SportsTeam",
        name: event.homeTeam,
      },
      {
        "@type": "SportsTeam",
        name: event.awayTeam,
      },
    ],
    sport: "Football",
  }
}

export function createSportsTeamStructuredData(team: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Football",
    logo: team.logo,
    foundingDate: team.founded?.toString(),
    location: {
      "@type": "Place",
      name: team.country,
    },
  }
}
