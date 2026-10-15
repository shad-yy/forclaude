import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"
// X-04: shared helper (was a local copy of the same code).
import { nuclearDedup } from "@/lib/api/dedup"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const rawArticles = await getLatestSportsNews()
    const deduped = nuclearDedup(rawArticles)

    return NextResponse.json({
      status: "success",
      articles: deduped.slice(0, 10),
      totalResults: deduped.length,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    // B-04.12: already returned 500 (correct status), but the body said
    // `articles: []` which reads like an absence claim on a fault. Now
    // the body just names the error so clients don't misinterpret it.
    console.warn("[API] GET /api/news fault:", error)
    return NextResponse.json(
      { error: "News temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
