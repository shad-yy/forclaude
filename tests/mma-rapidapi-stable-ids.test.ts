// X-09 — mma-rapidapi.ts used `String(Math.random())` as fallback
// event IDs when the upstream response omitted one. Two calls with
// the same input event produced different IDs, which:
//   1. thrashes React keys (`key={event.id}` re-mounts every render)
//   2. defeats any downstream ID-based cache
//   3. can (very rarely) collide within one batch
//
// Fix: deterministic fallback derived from the event's own natural
// key (name + date). Same input → same id, forever.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const upstreamPayload = {
  events: [
    {
      // No id / event_id — the fallback path fires.
      name: "UFC 300",
      event_date: "2026-04-13",
      location: "Las Vegas",
      venue: "T-Mobile Arena",
      fights: [],
    },
    {
      name: "UFC 301",
      event_date: "2026-05-04",
      location: "Rio de Janeiro",
      venue: "Farmasi Arena",
      fights: [],
    },
  ],
}

describe("X-09 mma-rapidapi.ts stable fallback IDs", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("RAPIDAPI_MMA_KEY", "test-key")
    // No real HTTP: stub fetch to return the same payload each time.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(upstreamPayload), { status: 200 })),
    )
    // Redis unset → the internal cache short-circuits to fetch every time.
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("returns the SAME fallback id for the same upstream event on two separate calls", async () => {
    const { getUpcomingMMAEvents } = await import("@/lib/api/mma-rapidapi")
    const first = await getUpcomingMMAEvents()
    const second = await getUpcomingMMAEvents()

    expect(first).toHaveLength(2)
    expect(second).toHaveLength(2)
    expect(
      first.map(e => e.id),
      "fallback IDs must be deterministic (same input → same id)",
    ).toEqual(second.map(e => e.id))
  })

  it("fallback ids do not look like `Math.random()` decimals (0.xxxxxxxxxx)", async () => {
    const { getUpcomingMMAEvents } = await import("@/lib/api/mma-rapidapi")
    const events = await getUpcomingMMAEvents()
    for (const e of events) {
      expect(e.id, `${e.name} has a Math.random-shaped id`).not.toMatch(/^0\.\d{10,}$/)
    }
  })

  it("distinct events get distinct fallback ids in the same batch", async () => {
    const { getUpcomingMMAEvents } = await import("@/lib/api/mma-rapidapi")
    const events = await getUpcomingMMAEvents()
    const ids = events.map(e => e.id)
    expect(new Set(ids).size, "duplicate fallback ids collided").toBe(ids.length)
  })
})
