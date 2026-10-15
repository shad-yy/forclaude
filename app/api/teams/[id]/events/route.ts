import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "next" // next | last
    if (!id) {
      return NextResponse.json({ error: "Team id is required" }, { status: 400 })
    }
    const data =
      type === "last"
        ? await unifiedSportsAPI.getFixtures({ teamId: id, last: 15 })
        : await unifiedSportsAPI.getFixtures({ teamId: id, next: 15 })
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    // O-26 step C: an outage is a 503, never 200 + [] (tests/routes-outage-network.test.ts).
    console.warn("[API] GET /api/teams/[id]/events fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
