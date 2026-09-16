import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Team id is required" }, { status: 400 })
    }
    const data = await unifiedSportsAPI.getTeam(id)
    if (!data) {
      return NextResponse.json({ data: null, error: "Team not found" }, { status: 200 })
    }
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (error) {
    // B-04.5: fault → 503+no-store. The absence path above (getTeam →
    // null → "Team not found") stays 200 — that's a legitimate absence.
    console.warn("[API] GET /api/teams/[id] fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
