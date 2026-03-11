import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

const VALID_LEAGUE_IDS = ["4328", "4335", "4331", "4332", "4334"]

export async function GET(request: Request, { params }: { params: { leagueId: string } }) {
    try {
        const { leagueId } = params

        if (!VALID_LEAGUE_IDS.includes(leagueId)) {
            return NextResponse.json({ error: "Invalid league ID" }, { status: 400 })
        }

        const allStandings = await unifiedSportsAPI.getStandings(leagueId)

        // Sort and limit based on our UI requirements
        const sortedStandings = allStandings
            .sort((a, b) => a.position - b.position)
            .slice(0, 5)

        return NextResponse.json({
            data: sortedStandings
        })

    } catch (error) {
        console.error(`[Standings API] Error fetching standings for league ${params.leagueId}: `, error)
        return NextResponse.json({ error: "Failed to fetch standings data" }, { status: 500 })
    }
}
