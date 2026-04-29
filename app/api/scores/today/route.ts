import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(_request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const url = `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${today}&s=Soccer`

    // Instead of using unifiedSportsAPI.getTodayFixtures(), we fetch directly per requirements
    // to strictly control the parsing and avoid rate limit error throws for empty arrays.
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const events = data.events || []

    if (events.length === 0) {
      return NextResponse.json({ matches: [], message: "No matches scheduled today" })
    }

    // Pass through unified transformations for the frontend
    const matches = events.map((event: any) => ({
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : null,
      awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : null,
      status: event.strStatus || "Scheduled",
      date: event.dateEvent,
      time: event.strTime || "00:00",
      venue: event.strVenue || undefined,
      league: event.strLeague || "Unknown League",
      homeLogo: event.strHomeTeamBadge ? `${event.strHomeTeamBadge}/tiny` : undefined,
      awayLogo: event.strAwayTeamBadge ? `${event.strAwayTeamBadge}/tiny` : undefined,
      isLive: event.strStatus === "In Progress" || event.strStatus === "Halftime"
    }))

    return NextResponse.json(
      { matches, message: "Success" },
      { headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
      } }
    )
  } catch (error) {
    console.warn("[API] GET /api/scores/today error:", error)
    return NextResponse.json(
      { matches: [], message: "No matches scheduled today" },
      { status: 200 }
    )
  }
}
