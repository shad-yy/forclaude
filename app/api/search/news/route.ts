import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"
// X-04: shared helper — this call site previously used a more
// aggressive local copy (title cutoff 40, description key enabled,
// no requireTitle). Re-created via options so the runtime behaviour
// is unchanged.
import { nuclearDedup } from "@/lib/api/dedup"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || "sports"
  try {
    const rawArticles = await getLatestSportsNews(q, 5)
    const deduped = nuclearDedup(rawArticles, {
      titleMaxChars: 40,
      titleMinChars: 11,
      requireTitle: false,
      imageMinChars: 1,
      dedupOnDescription: true,
      descriptionMaxChars: 60,
      descriptionMinChars: 21,
    })
    return NextResponse.json({ status: "success", articles: deduped, totalResults: deduped.length })
  } catch (error) {
    // Fault, not absence — 503 + no-store so a real upstream failure
    // does not read like "no results" to the search UI (api-fault-vs-absence).
    console.warn("[API] GET /api/search/news fault:", error)
    return NextResponse.json(
      { error: "Search temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
