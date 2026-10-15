import { NextResponse } from "next/server"
import { getUpcomingEvents } from "@/lib/api/ufc"

export async function GET() {
  try {
    const data = await getUpcomingEvents()
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    // B-04.7: fault → 503+no-store per api-fault-vs-absence hybrid rule.
    console.warn("[API] GET /api/ufc/events fault:", error)
    return NextResponse.json(
      { error: "UFC events temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
