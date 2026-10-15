import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    if (!q || q.length < 2 || q.length > 64) {
      return NextResponse.json(
        { data: { teams: [], players: [], events: [] } },
        { status: 200 }
      )
    }
    const data = await unifiedSportsAPI.searchAll(q)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    // B-04.8: fault → 503+no-store per hybrid rule.
    console.warn("[API] GET /api/search fault:", error)
    return NextResponse.json(
      { error: "Search temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
