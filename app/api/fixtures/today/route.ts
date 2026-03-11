import { NextResponse } from "next/server"

export const revalidate = 300 // Cache for 300 seconds

export async function GET() {
    try {
        const LEAGUE_IDS = [4328, 4335, 4331, 4332, 4334]

        // Step 1 — Try today's soccer events
        // Convert to YYYY-MM-DD
        const todayDate = new Date().toISOString().split('T')[0]
        let res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${todayDate}&s=Soccer`, { next: { revalidate: 300 } })
        let rawData = await res.json()
        let matches = rawData.events || []
        let dayLabel = "today"

        matches = matches.filter((e: any) => LEAGUE_IDS.includes(parseInt(e.idLeague)))

        // Step 2 — If events array empty or null → try tomorrow
        if (matches.length === 0) {
            const tomorrowDateObj = new Date()
            tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1)
            const tomorrowDate = tomorrowDateObj.toISOString().split('T')[0]

            res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${tomorrowDate}&s=Soccer`, { next: { revalidate: 300 } })
            rawData = await res.json()
            matches = rawData.events || []
            matches = matches.filter((e: any) => LEAGUE_IDS.includes(parseInt(e.idLeague)))
            dayLabel = "tomorrow"
        }

        // Step 3 — If still empty → fetch next event per league via Promise.all
        if (matches.length === 0) {
            const promises = LEAGUE_IDS.map(id =>
                fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`, { next: { revalidate: 300 } })
                    .then(r => r.json())
                    .then(d => d.events || [])
                    .catch(() => [])
            )
            const results = await Promise.all(promises)
            matches = results.flat().filter(Boolean)
            dayLabel = "upcoming"
        }

        if (!matches) matches = []

        // Step 4 — Combine, filter, dedupe
        const uniqueMatches = Array.from(new Map(matches.filter(Boolean).map((e: any) => [e.idEvent, e])).values()) as any[]

        uniqueMatches.sort((a, b) => {
            const dateA = new Date(`${a.dateEvent || a.strDate}T${a.strTime || '00:00:00'}`).getTime()
            const dateB = new Date(`${b.dateEvent || b.strDate}T${b.strTime || '00:00:00'}`).getTime()
            return dateA - dateB
        })

        const topMatches = uniqueMatches.slice(0, 10)

        // Step 5 — Map to standard format
        const finalMatches = topMatches.map((e) => ({
            idEvent: e.idEvent,
            strEvent: e.strEvent,
            strHomeTeam: e.strHomeTeam,
            strAwayTeam: e.strAwayTeam,
            strHomeTeamBadge: e.strHomeTeamBadge,
            strAwayTeamBadge: e.strAwayTeamBadge,
            intHomeScore: e.intHomeScore ? String(e.intHomeScore) : null,
            intAwayScore: e.intAwayScore ? String(e.intAwayScore) : null,
            strTime: e.strTime || e.strTimeLocal || "",
            strDate: e.dateEvent || e.strDate || "",
            strLeague: e.strLeague,
            strStatus: e.strStatus || e.strResult || "Scheduled",
        }))

        return NextResponse.json({
            events: finalMatches,
            label: dayLabel,
            count: finalMatches.length
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        })
    } catch (error) {
        console.error(`[Fixtures Today API] Error fetching fixtures:`, error)
        return NextResponse.json({ events: [], label: "error", count: 0 }, { status: 500 })
    }
}
