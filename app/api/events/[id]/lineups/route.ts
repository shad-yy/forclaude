import { NextRequest, NextResponse } from "next/server"
import { lookupLineup } from "@/lib/api/the-sports-db"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }
    const data = await lookupLineup(id)
    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    // B-04.9: fault → 503+no-store per hybrid rule.
    console.warn("[API] GET /api/events/[id]/lineups fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
