import { NextRequest, NextResponse } from "next/server"
import { lookupTimeline } from "@/lib/api/the-sports-db"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }
    const data = await lookupTimeline(id)
    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    // O-26 step C: an outage is a 503, never 200 + [] (tests/routes-outage-network.test.ts).
    console.warn("[API] GET /api/events/[id]/timeline fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
