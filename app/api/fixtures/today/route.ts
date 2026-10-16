import { NextResponse } from "next/server"
import { eventsDay } from "@/lib/api/the-sports-db"
import { REQUEST_BUDGET_MS, ifAlreadyCached, withinBudget } from "@/lib/api/request-budget"
import type { SportsDbEvent } from "@/lib/types/sportsdb"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// O-37: this route used to call TheSportsDB with raw `fetch` and
// `cache: 'no-store'` — two or three uncached, unthrottled requests per visit,
// with no time limit. On 2026-10-15 22:29–22:35 UTC it did not answer within
// 30s for six production-monitor requests in a row. It also turned an outage
// into a 200 with empty lists, so the homepage said "No matches found".
//
// Now: one blocking call through eventsDay() (cache + rate limiter) under
// REQUEST_BUDGET_MS, same as /api/spotlight. Tomorrow's and yesterday's
// fixtures are only used when already cached. A fault answers 503 + no-store;
// a day with no matches answers 200 with empty lists.

type Event = SportsDbEvent & { strLeagueBadge?: string | null }

function mapEvent(e: Event) {
  return {
    idLeague: e.idLeague ?? null,
    idEvent: e.idEvent,
    strEvent: e.strEvent,
    strHomeTeam: e.strHomeTeam,
    strAwayTeam: e.strAwayTeam,
    strHomeTeamBadge: e.strHomeTeamBadge ?? null,
    strAwayTeamBadge: e.strAwayTeamBadge ?? null,
    intHomeScore: e.intHomeScore != null ? String(e.intHomeScore) : null,
    intAwayScore: e.intAwayScore != null ? String(e.intAwayScore) : null,
    strTime: e.strTime || e.strTimeLocal || "",
    strDate: e.dateEvent || e.strDate || "",
    strLeague: e.strLeague,
    strLeagueBadge: e.strLeagueBadge ?? null,
    strStatus: e.strStatus || e.strResult || "Scheduled",
  }
}

function isFinished(e: Event): boolean {
  const status = (e.strStatus || '').toLowerCase()
  return status.includes('finished') || status === 'ft'
}

const isoDate = (ms: number) => new Date(ms).toISOString().split('T')[0]

export async function GET() {
  try {
    const now = Date.now()
    const today = isoDate(now)

    const todayEvents: Event[] = await withinBudget(
      eventsDay({ date: today, sport: 'Soccer' }),
      REQUEST_BUDGET_MS,
      `fixtures: today (${today})`,
    )
    const tomorrowEvents: Event[] = await ifAlreadyCached(
      eventsDay({ date: isoDate(now + 86_400_000), sport: 'Soccer' }),
    )

    const allEvents = [...todayEvents, ...tomorrowEvents]

    const upcoming = allEvents
      .filter((e) => !isFinished(e) && e.intHomeScore == null)
      .slice(0, 8)
      .map(mapEvent)

    const results = allEvents
      .filter((e) => isFinished(e) || (e.intHomeScore != null && e.intHomeScore !== ''))
      .slice(0, 8)
      .map(mapEvent)

    // No results yet today: show yesterday's, but only if they are cached.
    const finalResults = results.length > 0
      ? results
      : (await ifAlreadyCached<Event>(eventsDay({ date: isoDate(now - 86_400_000), sport: 'Soccer' })))
          .filter(isFinished)
          .slice(0, 6)
          .map((e) => ({ ...mapEvent(e), isYesterday: true }))

    return NextResponse.json({
      upcoming,
      events: upcoming, // backwards compat
      results: finalResults,
      label: upcoming.length > 0 ? 'today' : 'upcoming',
      count: upcoming.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    // Fault → 503 + no-store per the hybrid rule (CLAUDE.md).
    console.error(`[Fixtures Today API] fault:`, error)
    return NextResponse.json(
      { error: "Fixtures temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
