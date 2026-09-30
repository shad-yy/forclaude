// O-26 step B — unifiedSportsAPI resolvers pass an upstream fault on
// instead of turning it into [] / null.
//
// Before: every resolver caught everything and rethrew only
// RateLimitError, so an outage reached routes and pages as "no data"
// (and getTeam/getPlayer returned null, which pages turn into a 404).
// The multi-league getUpcomingFixtures turned each league's failure into
// [], so a full outage read as "no upcoming matches".
//
// Red-first: the fault cases failed before the resolvers were changed.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "./msw/server"
import { isUpstreamFault } from "@/lib/api/errors"

const SPORTSDB = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\//
const EVENTS_NEXT_LEAGUE = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\/eventsnextleague\.php/

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
  const { cache } = await import("@/lib/cache")
  cache.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

async function settle<T>(p: Promise<T>) {
  const s = p.then((value) => ({ ok: true as const, value }), (error: unknown) => ({ ok: false as const, error }))
  await vi.runAllTimersAsync()
  return s
}

async function api() {
  return (await import("@/lib/api/unified-sports-api")).unifiedSportsAPI
}

describe("O-26 step B: resolvers pass outage faults on", () => {
  it("getStandings rejects with UpstreamFaultError during an outage (was [])", async () => {
    server.use(http.get(SPORTSDB, () => HttpResponse.json({ error: "down" }, { status: 503 })))
    const r = await settle((await api()).getStandings("4328", 2026))
    expect(r.ok ? "resolved" : isUpstreamFault(r.error)).toBe(true)
  })

  it("getPlayer rejects with UpstreamFaultError during an outage (was null → pages 404)", async () => {
    server.use(http.get(SPORTSDB, () => HttpResponse.json({ error: "down" }, { status: 503 })))
    const r = await settle((await api()).getPlayer("34145937"))
    expect(r.ok ? "resolved" : isUpstreamFault(r.error)).toBe(true)
  })

  it("getPlayer still returns null for a player that does not exist", async () => {
    server.use(http.get(SPORTSDB, () => HttpResponse.json({ players: null })))
    const r = await settle((await api()).getPlayer("1"))
    expect(r).toEqual({ ok: true, value: null })
  })

  it("getUpcomingFixtures rejects when every league fails with an outage (was [])", async () => {
    server.use(http.get(EVENTS_NEXT_LEAGUE, () => HttpResponse.json({ error: "down" }, { status: 503 })))
    const r = await settle((await api()).getUpcomingFixtures())
    expect(r.ok ? "resolved" : isUpstreamFault(r.error)).toBe(true)
  })

  it("getUpcomingFixtures keeps partial results when only some leagues fail", async () => {
    server.use(
      http.get(EVENTS_NEXT_LEAGUE, ({ request }) =>
        new URL(request.url).searchParams.get("id") === "4328"
          ? HttpResponse.json({ events: [{ idEvent: "1", strEvent: "A vs B", dateEvent: "2026-10-01", strTime: "15:00:00", idLeague: "4328" }] })
          : HttpResponse.json({ error: "down" }, { status: 503 }),
      ),
    )
    const r = await settle((await api()).getUpcomingFixtures())
    expect(r.ok && r.value.length).toBe(1)
  })
})
