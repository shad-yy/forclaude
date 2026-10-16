// /api/fixtures/today did not answer within 30s for six production-monitor
// requests in a row on 2026-10-15 between 22:29 and 22:35 UTC (run
// 38817356999, "fixtures API returns valid dates not year 5998", all three
// Playwright projects, both attempts). The homepage match card loads from it.
//
// The route awaited raw `fetch` calls with no time limit, so a slow upstream
// held the request open; and it turned an outage into 200 + empty lists, so
// the homepage said "No matches found". These tests pin the replacement:
// one cached, rate-limited call under REQUEST_BUDGET_MS (same as spotlight).
//
// Red-first: against the previous route, "a hanging upstream" ran into the
// test timeout and "an outage" returned 200.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "./msw/server"
import { down, hangs, ok } from "./msw/handlers"

const EVENTSDAY = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\/eventsday\.php/

/** Loose enough for a slow CI runner, far below the 30s the monitor saw. */
const FAULT_CEILING_MS = 8_000

beforeEach(async () => {
  vi.resetModules()
  // In-memory cache only, cleared, so a cached value cannot mask the fault.
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
  const { cache } = await import("@/lib/cache")
  cache.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function timedGet() {
  const { GET } = await import("@/app/api/fixtures/today/route")
  const startedAt = Date.now()
  const res = await GET()
  return { res, elapsedMs: Date.now() - startedAt }
}

describe("/api/fixtures/today answers in bounded time", () => {
  it("a hanging upstream → 503 + no-store, not a request that never ends", async () => {
    server.use(hangs(EVENTSDAY))
    const { res, elapsedMs } = await timedGet()

    expect(res.status).toBe(503)
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(elapsedMs, `took ${elapsedMs}ms`).toBeLessThan(FAULT_CEILING_MS)
  }, 30_000)

  it("an outage → 503 + no-store, never 200 with empty lists", async () => {
    server.use(down(EVENTSDAY, 503))
    const { res, elapsedMs } = await timedGet()

    expect(res.status, "a fault must surface as 503 (CLAUDE.md fault vs absence)").toBe(503)
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(elapsedMs, `took ${elapsedMs}ms`).toBeLessThan(FAULT_CEILING_MS)
  }, 30_000)
})

describe("/api/fixtures/today on a healthy upstream", () => {
  const event = (over: Record<string, unknown>) => ({
    idEvent: "1", strEvent: "A vs B", strSport: "Soccer", idLeague: "4328",
    strLeague: "English Premier League", strSeason: "2026-2027",
    strHomeTeam: "A", strAwayTeam: "B", idHomeTeam: "10", idAwayTeam: "20",
    dateEvent: "2026-10-17", strTime: "14:00:00", intHomeScore: null, intAwayScore: null,
    strStatus: "Not Started",
    ...over,
  })

  it("a day with no matches is absence: 200 with empty lists", async () => {
    server.use(ok(EVENTSDAY, { events: null }))
    const { res } = await timedGet()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.upcoming).toEqual([])
    expect(body.results).toEqual([])
  }, 30_000)

  it("splits upcoming and finished matches and keeps the response shape", async () => {
    server.use(ok(EVENTSDAY, {
      events: [
        event({ idEvent: "1" }),
        event({ idEvent: "2", strStatus: "Match Finished", intHomeScore: "2", intAwayScore: "1" }),
      ],
    }))
    const { res } = await timedGet()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.upcoming.map((e: { idEvent: string }) => e.idEvent)).toEqual(["1"])
    expect(body.events).toEqual(body.upcoming)
    expect(body.results.map((e: { idEvent: string }) => e.idEvent)).toEqual(["2"])
    expect(body.results[0].intHomeScore).toBe("2")
    expect(body.label).toBe("today")
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=60")
  }, 30_000)
})
