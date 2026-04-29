import { NextResponse } from "next/server"

export const revalidate = 300 // Cache for 300 seconds

const LEAGUE_IDS = [4328, 4335, 4331, 4332, 4334]

function safeParseSportsDBDate(date: string, time?: string): Date | null {
    if (!date) return null
    const parts = date.split('-').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return null
    const [year, month, day] = parts
    if (time) {
      const t = time.split('+')[0].split('-')[0]
      const [h, m] = t.split(':').map(Number)
      return new Date(Date.UTC(year, month - 1, day, h || 0, m || 0))
    }
    return new Date(Date.UTC(year, month - 1, day))
}

function mapEvent(e: any) {
    return {
        idLeague: e.idLeague ?? null,
        idEvent: e.idEvent,
        strEvent: e.strEvent,
        strHomeTeam: e.strHomeTeam,
        strAwayTeam: e.strAwayTeam,
        strHomeTeamBadge: e.strHomeTeamBadge ?? null,
        strAwayTeamBadge: e.strAwayTeamBadge ?? null,
        intHomeScore: e.intHomeScore !== null && e.intHomeScore !== undefined ? String(e.intHomeScore) : null,
        intAwayScore: e.intAwayScore !== null && e.intAwayScore !== undefined ? String(e.intAwayScore) : null,
        strTime: e.strTime || e.strTimeLocal || "",
        strDate: e.dateEvent || e.strDate || "",
        strLeague: e.strLeague,
        strLeagueBadge: e.strLeagueBadge ?? null,
        strStatus: e.strStatus || e.strResult || "Scheduled",
    }
}

export async function GET() {
    try {
        const now = new Date()
        const today = now.toISOString().split('T')[0] // always YYYY-MM-DD in UTC
        const yesterday = new Date(now)
        yesterday.setUTCDate(yesterday.getUTCDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        // Step 1 — Convert to YYYY-MM-DD
        const todayDate = today
        let res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${todayDate}&s=Soccer`, { next: { revalidate: 300 } })
        let rawData = await res.json()
        let matches = rawData.events || []
        let dayLabel = "today"

        matches = matches.filter((e: any) => LEAGUE_IDS.includes(parseInt(e.idLeague)))

        // Step 2 — If events array empty → try tomorrow
        if (matches.length === 0) {
            const tomorrowDateObj = new Date()
            tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1)
            const tomorrowDate = tomorrowDateObj.toISOString().split('T')[0]
            res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${tomorrowDate}&s=Soccer`, { next: { revalidate: 300 } })
            rawData = await res.json()
            matches = rawData.events || []
            matches = matches.filter((e: any) => LEAGUE_IDS.includes(parseInt(e.idLeague)))
            dayLabel = "tomorrow"
        }

        // Step 3 — If still empty → fetch next event per league
        if (matches.length === 0) {
            const promises = LEAGUE_IDS.map(id =>
                fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=${id}`, { next: { revalidate: 300 } })
                    .then(r => r.json())
                    .then(d => d.events || [])
                    .catch(() => [])
            )
            const results = await Promise.all(promises)
            matches = results.flat().filter(Boolean)
            dayLabel = "upcoming"
        }

        if (!matches) matches = []

        // Step 4 — Dedupe and sort
        const uniqueMatches: any[] = Array.from(new Map(matches.filter(Boolean).map((e: any) => [e.idEvent, e])).values())
        uniqueMatches.sort((a, b) => {
            const dateA = safeParseSportsDBDate(a.dateEvent || a.strDate, a.strTime || '00:00:00')?.getTime() || 0
            const dateB = safeParseSportsDBDate(b.dateEvent || b.strDate, b.strTime || '00:00:00')?.getTime() || 0
            return dateA - dateB
        })

        const finalMatches = uniqueMatches.slice(0, 10).map(mapEvent)

        // Step 5 — Fetch today's results (non-blocking)
        let resultsData: ReturnType<typeof mapEvent>[] = []
        try {
            const tRes = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${today}&s=Soccer`, { next: { revalidate: 300 } })
            const tRaw = await tRes.json()
            const tMatches: any[] = (tRaw.events || [])
                .filter((e: any) => LEAGUE_IDS.includes(parseInt(e.idLeague)))
                .filter((e: any) => {
                    const d = e.dateEvent || e.strDate || ''
                    return d === today || d === yesterdayStr
                })
                .filter((e: any) => {
                    const status = (e.strStatus || '').toLowerCase().trim()
                    const hasScore = e.intHomeScore !== null &&
                        e.intHomeScore !== undefined &&
                        e.intHomeScore !== '' &&
                        e.intAwayScore !== null &&
                        e.intAwayScore !== undefined &&
                        e.intAwayScore !== ''
                    const isFinished = status.includes('finished') ||
                        status === 'ft' ||
                        status === 'aet' ||
                        status === 'pen' ||
                        status === 'fulltime' ||
                        status === 'full time'
                    return isFinished || hasScore
                })
            const uniqueToday: any[] = Array.from(new Map(tMatches.map((e: any) => [e.idEvent, e])).values())
            resultsData = uniqueToday.slice(0, 8).map(mapEvent)
        } catch {
            // Non-critical — show empty results if this fails
        }

        return NextResponse.json({
            upcoming: finalMatches,
            events: finalMatches, // backwards compat
            results: resultsData,
            label: dayLabel,
            count: finalMatches.length
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
    } catch (error) {
        console.error(`[Fixtures Today API] Error:`, error)
        return NextResponse.json({ events: [], results: [], label: "error", count: 0 })
    }
}
