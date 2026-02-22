import type { Metadata } from "next"
import ScoresPageClient from "./ScoresPageClient"

export const metadata: Metadata = {
  title: "Live Scores & Results | Smart Live TV",
  description:
    "Get real-time sports scores, live match updates, and recent results from football, basketball, and other major sports.",
  keywords: "live scores, sports results, real-time scores, football scores, basketball scores",
}

export default function ScoresPage() {
  return <ScoresPageClient />
}
