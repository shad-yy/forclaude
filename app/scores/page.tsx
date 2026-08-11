import type { Metadata } from "next"
import ScoresPageClient from "./ScoresPageClient"
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema"

export const metadata: Metadata = {
  title: "Live Scores & Results – Football Matches | Smart Live TV",
  description:
    "Real-time football scores, live match updates, and recent results from Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.",
  keywords: "live scores, football scores, Premier League scores, La Liga results, real-time football",
  alternates: {
    canonical: "https://smartlivetv.co.uk/scores",
  },
}

export default function ScoresPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://smartlivetv.co.uk" },
        { name: "Live Scores", url: "https://smartlivetv.co.uk/scores" },
      ]} />
      <ScoresPageClient />
    </>
  )
}

