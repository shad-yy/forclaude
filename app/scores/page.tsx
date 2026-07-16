import type { Metadata } from "next"
import ScoresPageClient from "./ScoresPageClient"

export const metadata: Metadata = {
  title: "Live Scores & Results – Football Matches | Smart Live TV",
  description:
    "Real-time football scores, live match updates, and recent results from Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.",
  keywords: "live scores, football scores, Premier League scores, La Liga results, real-time football",
}

export default function ScoresPage() {
  return <ScoresPageClient />
}

