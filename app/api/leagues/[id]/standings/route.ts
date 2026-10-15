import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const seasonNum = season ? parseInt(season, 10) : undefined
    if (!id) {
      return NextResponse.json({ error: "League id is required" }, { status: 400 })
    }
    const data = await unifiedSportsAPI.getStandings(id, seasonNum)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (error) {
    // O-26 step C: an outage is a 503, never 200 + [] (tests/routes-outage-network.test.ts).
    console.warn("[API] GET /api/leagues/[id]/standings fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
