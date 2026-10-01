import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "League id is required" }, { status: 400 })
    }
    const data = await unifiedSportsAPI.getFixtures({ leagueId: id, next: 20 })
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    // B-04.4: fault → 503+no-store per api-fault-vs-absence hybrid rule.
    console.warn("[API] GET /api/leagues/[id]/events fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
