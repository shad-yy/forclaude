import { NextResponse } from "next/server"
import { eventsDay, type SportsDbEvent } from "@/lib/api/the-sports-db"

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * How long this route will wait for the upstream data it actually needs.
 *
 * Every TheSportsDB call goes through makeRequest → enqueueRateLimit(), which
 * serialises requests 2400ms apart (RATE_LIMIT_MS), and retries a 5xx twice.
 * Measured on 2026-10-10 with the three original calls in place:
 *
 *   healthy, cold cache   4812 ms   (two 2400ms rate-limit gaps)
 *   total upstream outage 19236 ms  (3 calls x 3 attempts x 2400ms + backoff)
 *
 * A Vercel Node function defaults to a 10s limit, so the outage case did not
 * return the 503 below at all — it ran past the limit and the caller got a
 * gateway timeout. Worse than the raw `fetch` this replaced, which failed
 * fast. Hence one blocking call and a 3s ceiling, which allows the first
 * retry (attempts land at ~0s and ~2.6s) and cuts off the third at ~5.2s: a
 * fault now answers 503
 * well inside the function limit, and the abandoned swrGet still finishes in
 * the background and populates the cache for the next request.
 */
const REQUEST_BUDGET_MS = 3_000

/** Long enough for a cache hit, too short to queue for a rate-limit slot. */
const CACHE_HIT_MS = 300

/**
 * Reject if `work` has not settled within `ms`, so a slow or dead upstream
 * cannot hold the request open past the function limit.
 */
async function withinBudget<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const budget = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: exceeded ${ms}ms budget`)), ms)
  })
  try {
    return await Promise.race([work, budget])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Resolve to `work`'s value if it is already cached (i.e. settles almost
 * immediately), otherwise to an empty list. Never rejects: this is optional
 * data, and a failure here must not turn a good response into a 503.
 *
 * The losing promise is left running on purpose — swrGet will still fill the
 * cache — so its rejection is swallowed to avoid an unhandled rejection.
 */
async function ifAlreadyCached<T>(work: Promise<T[]>): Promise<T[]> {
  work.catch(() => {})
  try {
    return await withinBudget(work, CACHE_HIT_MS, 'cache-only read')
  } catch {
    return []
  }
}

/**
 * An event after scoring, which adds three derived fields.
 */
type ScoredEvent = SportsDbEvent & {
  importanceScore: number
  eventStatus: 'live' | 'upcoming' | 'tonight' | 'tomorrow'
  countdown: string
}

// League tier weighting for importance scoring
const TIER_1_LEAGUES = ['4328', '4480', '4481'] // PL, UCL, World Cup
const TIER_2_LEAGUES = ['4335', '4331', '4332', '4334'] // La Liga, BL, SA, L1
const TIER_3_LEAGUES = ['4346', '4344', '4337'] // MLS, Eredivisie, Liga Portugal

// Known rivalry pairs (by team IDs or names)
const RIVALRY_KEYWORDS = [
  ['Arsenal', 'Tottenham'],
  ['Manchester United', 'Manchester City'],
  ['Liverpool', 'Everton'],
  ['Barcelona', 'Real Madrid'],
  ['AC Milan', 'Inter'],
  ['Bayern', 'Dortmund'],
  ['PSG', 'Marseille'],
  ['Juventus', 'Inter'],
  ['Chelsea', 'Arsenal'],
  ['Chelsea', 'Tottenham'],
  ['Liverpool', 'Manchester United'],
  ['Real Madrid', 'Atletico Madrid'],
]

function isRivalryMatch(event: SportsDbEvent): boolean {
  const home = (event.strHomeTeam || '').toLowerCase()
  const away = (event.strAwayTeam || '').toLowerCase()
  return RIVALRY_KEYWORDS.some(([a, b]) =>
    (home.includes(a.toLowerCase()) && away.includes(b.toLowerCase())) ||
    (home.includes(b.toLowerCase()) && away.includes(a.toLowerCase()))
  )
}

function getHoursUntilEvent(event: SportsDbEvent): number {
  try {
    const dateStr = event.dateEvent || event.strDate
    const timeStr = event.strTime || ''
    if (!dateStr) return 999

    let eventDate: Date
    if (timeStr) {
      const timePart = timeStr.split('+')[0].split('-')[0]
      eventDate = new Date(`${dateStr}T${timePart}Z`)
    } else {
      eventDate = new Date(`${dateStr}T00:00:00Z`)
    }

    if (isNaN(eventDate.getTime())) return 999
    return (eventDate.getTime() - Date.now()) / (1000 * 60 * 60)
  } catch {
    return 999
  }
}

function calculateEventImportance(event: SportsDbEvent): number {
  let score = 0
  const leagueId = String(event.idLeague || '')

  // League tier weighting
  if (TIER_1_LEAGUES.includes(leagueId)) score += 50
  else if (TIER_2_LEAGUES.includes(leagueId)) score += 30
  else if (TIER_3_LEAGUES.includes(leagueId)) score += 15

  // Time proximity (events starting soon get boosted)
  const hoursUntil = getHoursUntilEvent(event)
  if (hoursUntil >= 0 && hoursUntil <= 2) score += 40
  else if (hoursUntil <= 6) score += 20
  else if (hoursUntil <= 12) score += 10

  // Live events get maximum boost
  const status = (event.strStatus || '').toLowerCase()
  if (['live', 'ht', '1h', '2h', 'in play', 'in progress'].some(s => status.includes(s))) {
    score += 100
  }

  // Has thumbnail/poster image available
  if (event.strThumb) score += 15
  if (event.strPoster) score += 10
  if (event.strBanner) score += 10

  // Derby/rivalry detection
  if (isRivalryMatch(event)) score += 25

  return score
}

function getEventStatus(event: SportsDbEvent): 'live' | 'upcoming' | 'tonight' | 'tomorrow' {
  const status = (event.strStatus || '').toLowerCase()
  if (['live', 'ht', '1h', '2h', 'in play', 'in progress'].some(s => status.includes(s))) {
    return 'live'
  }

  const hoursUntil = getHoursUntilEvent(event)
  if (hoursUntil <= 3) return 'upcoming'
  if (hoursUntil <= 12) return 'tonight'
  return 'tomorrow'
}

function formatCountdown(event: SportsDbEvent): string {
  const hoursUntil = getHoursUntilEvent(event)
  if (hoursUntil < 0) return ''
  if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}m`
  if (hoursUntil < 24) return `${Math.floor(hoursUntil)}h ${Math.round((hoursUntil % 1) * 60)}m`
  return `${Math.floor(hoursUntil / 24)}d`
}

export async function GET() {
  try {
    const now = new Date()
    const todayUTC = now.toISOString().split('T')[0]
    const tomorrowUTC = new Date(now.getTime() + 86400000).toISOString().split('T')[0]

    // One blocking upstream call, not three. See the note on REQUEST_BUDGET_MS.
    //
    // `eventsDay({ date })` with no sport returns every sport for that date,
    // so it covers what the old `{ date, sport: 'Soccer' }` call fetched
    // separately — and the dedupe by idEvent below already merged the two.
    const todayAll = await withinBudget(
      eventsDay({ date: todayUTC }),
      REQUEST_BUDGET_MS,
      `spotlight: today (${todayUTC})`,
    )

    // Tomorrow is a bonus, not a requirement. Ask for it, but only wait long
    // enough for a cache hit: a cold read has to queue behind the 2400ms
    // rate-limit slot, and that is not worth a visitor's time for the
    // "tomorrow" row. On a warm cache this resolves in single-digit ms, so
    // in steady state tomorrow's fixtures are still here.
    const tomorrowSoccer = await ifAlreadyCached(
      eventsDay({ date: tomorrowUTC, sport: 'Soccer' }),
    )

    // Combine and deduplicate by idEvent
    const eventMap = new Map<string, SportsDbEvent>()
    for (const event of [...todayAll, ...tomorrowSoccer]) {
      if (event.idEvent && !eventMap.has(event.idEvent)) {
        eventMap.set(event.idEvent, event)
      }
    }

    // Filter out finished events (we only want live + upcoming)
    const activeEvents = Array.from(eventMap.values()).filter(e => {
      const status = (e.strStatus || '').toLowerCase()
      return !status.includes('finished') && status !== 'ft' && status !== 'aet'
    })

    // Score and sort events
    const scoredEvents: ScoredEvent[] = activeEvents
      .map(event => ({
        ...event,
        importanceScore: calculateEventImportance(event),
        eventStatus: getEventStatus(event),
        countdown: formatCountdown(event),
      }))
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, 6) // Top 6 events

    // Map to spotlight format
    const spotlight = scoredEvents.map(event => ({
      idEvent: event.idEvent,
      strEvent: event.strEvent,
      strHomeTeam: event.strHomeTeam,
      strAwayTeam: event.strAwayTeam,
      strHomeTeamBadge: event.strHomeTeamBadge || null,
      strAwayTeamBadge: event.strAwayTeamBadge || null,
      intHomeScore: event.intHomeScore !== null && event.intHomeScore !== undefined ? String(event.intHomeScore) : null,
      intAwayScore: event.intAwayScore !== null && event.intAwayScore !== undefined ? String(event.intAwayScore) : null,
      strLeague: event.strLeague,
      idLeague: event.idLeague || null,
      strSport: event.strSport || 'Soccer',
      strDate: event.dateEvent || event.strDate || '',
      strTime: event.strTime || event.strTimeLocal || '',
      strVenue: event.strVenue || null,
      strThumb: event.strThumb || null,
      strPoster: event.strPoster || null,
      strBanner: event.strBanner || null,
      strFanart: event.strFanart || null,
      importanceScore: event.importanceScore,
      eventStatus: event.eventStatus,
      countdown: event.countdown,
    }))

    // Also return hero images — league and team fanart for background
    const heroImages = scoredEvents
      .map(e => e.strBanner || e.strFanart || e.strThumb || e.strPoster)
      .filter(Boolean)
      .slice(0, 5)

    return NextResponse.json({
      spotlight,
      heroImages,
      count: spotlight.length,
      generated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      }
    })
  } catch (error) {
    // B-04.10: fault → 503+no-store per hybrid rule. Previously returned
    // an empty spotlight with status 200 — invisible degradation.
    console.error('[Spotlight API] fault:', error)
    return NextResponse.json(
      { error: "Spotlight temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
