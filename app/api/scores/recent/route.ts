import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET() {
  try {
    const data = await unifiedSportsAPI.getRecentResults()
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/scores/recent error:", error)
    return NextResponse.json(
      { data: [], error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
