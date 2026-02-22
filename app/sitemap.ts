import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://smart-live-tv.vercel.app"

  // Static pages
  const staticPages = ["", "/scores", "/news", "/leagues", "/teams", "/players", "/ufc", "/events", "/search"]

  // Popular leagues
  const popularLeagues = [
    "39", // Premier League
    "140", // La Liga
    "78", // Bundesliga
    "135", // Serie A
    "61", // Ligue 1
  ]

  // Generate sitemap entries
  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? ("daily" as const) : ("weekly" as const),
    priority: page === "" ? 1 : 0.8,
  }))

  const leagueEntries = popularLeagues.map((leagueId) => ({
    url: `${baseUrl}/leagues/${leagueId}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...leagueEntries]
}
