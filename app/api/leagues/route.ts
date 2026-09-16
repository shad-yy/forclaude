import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

// B-04 (route 1/12): migrated off the grandfathered S-03 "return [] on
// fault" shape. Distinguishes fault (thrown → 503, Cache-Control: no-store)
// from absence (resolver returned [] legitimately → 200 with empty data).
// See memory-bank/PATTERNS.md hybrid rule + playbook/skills/api-fault-vs-absence.md.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country") ?? undefined
    const sport = searchParams.get("sport") ?? undefined
    const data = await unifiedSportsAPI.getLeagues(country, sport)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/leagues fault:", error)
    return NextResponse.json(
      { error: "Upstream temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
