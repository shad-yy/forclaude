import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

// B-04.2: migrated to fault-vs-absence — see B-04.1 (leagues) for the pattern
// and memory-bank/PATTERNS.md hybrid rule.
export async function GET() {
  try {
    const data = await unifiedSportsAPI.getRecentResults()
    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.warn("[API] GET /api/scores/recent fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
