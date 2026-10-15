import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(request: Request, { params }: { params: { leagueId: string } }) {
    try {
        const { leagueId } = params

        // Fetch upcoming events directly using the shared API layer
        const allEvents = await unifiedSportsAPI.getFixtures({ leagueId, next: 15 })

        // Filter to only upcoming matches that haven't finished
        const upcomingEvents = allEvents.filter((e: any) => e.status !== "Match Finished").slice(0, 5)

        return NextResponse.json({
            data: upcomingEvents
        })
    } catch (error) {
        console.warn("[Fixtures API] fault:", error)
        return NextResponse.json(
            { error: "Upstream temporarily unavailable — we could not check just now." },
            { status: 503, headers: { "Cache-Control": "no-store" } }
        )
    }
}
