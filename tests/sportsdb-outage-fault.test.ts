// O-26 step A — a TheSportsDB outage is a fault, not "no data", and it
// is never cached.
//
// Before: lib/api/the-sports-db.ts fetchFreshData returned [] on a final
// 5xx, a network failure or a non-JSON body, and lib/cache.ts swrGet
// stored that [] for the entry's TTL (probe 2026-09-30: after the stub
// recovered, the next call still returned 0 rows).
//
// Rule (owner decision 2026-09-30, "old data, else honest error"):
// - outage + nothing cached  → reject with UpstreamFaultError
// - outage + something cached → serve the cached data, never overwrite it
// - 404 / `{key: null}`       → [] (a real absence, unchanged)
//
// Red-first: the fault and recovery cases failed before the fix.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "./msw/server"
import { isUpstreamFault } from "@/lib/api/errors"

const TABLE = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\/lookuptable\.php/
const ROW = { idTeam: "133604", strTeam: "Probe FC", intRank: "1" }

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
  // lib/cache.ts keeps its Map on globalThis, so it survives resetModules.
  const { cache } = await import("@/lib/cache")
  cache.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown }

async function settle<T>(p: Promise<T>): Promise<Settled<T>> {
  const s = p.then((value) => ({ ok: true as const, value }), (error) => ({ ok: false as const, error }))
  await vi.runAllTimersAsync()
  return s
}

async function table() {
  const { lookupTable } = await import("@/lib/api/the-sports-db")
  return (season = "2026-2027") => settle(lookupTable("4328", season))
}

describe("O-26 step A: outage is a fault and is never cached", () => {
  it("503 with nothing cached rejects with UpstreamFaultError (not [])", async () => {
    server.use(http.get(TABLE, () => HttpResponse.json({ error: "down" }, { status: 503 })))
    const r = await (await table())()
    expect(r.ok, "an outage must not resolve to [] — that reads as 'no standings'").toBe(false)
    expect(r.ok ? null : isUpstreamFault(r.error)).toBe(true)
  })

  it("network failure rejects with UpstreamFaultError", async () => {
    server.use(http.get(TABLE, () => HttpResponse.error()))
    const r = await (await table())()
    expect(r.ok ? null : isUpstreamFault(r.error)).toBe(true)
  })

  it("non-JSON 200 body rejects with UpstreamFaultError", async () => {
    server.use(http.get(TABLE, () => new HttpResponse("<html>maintenance</html>", { status: 200, headers: { "Content-Type": "text/html" } })))
    const r = await (await table())()
    expect(r.ok ? null : isUpstreamFault(r.error)).toBe(true)
  })

  it("empty 200 body is still an absence: resolves [] (recorded for lookuptable.php, logs/sportsdb-unexpected-*.log)", async () => {
    server.use(http.get(TABLE, () => new HttpResponse("", { status: 200 })))
    const r = await (await table())()
    expect(r).toEqual({ ok: true, value: [] })
  })

  it("404 is still an absence: resolves []", async () => {
    server.use(http.get(TABLE, () => HttpResponse.json({}, { status: 404 })))
    const r = await (await table())()
    expect(r).toEqual({ ok: true, value: [] })
  })

  it("`{ table: null }` is still an absence: resolves []", async () => {
    server.use(http.get(TABLE, () => HttpResponse.json({ table: null })))
    const r = await (await table())()
    expect(r).toEqual({ ok: true, value: [] })
  })

  it("after the provider recovers, fresh data is returned (the outage was not cached)", async () => {
    let up = false
    server.use(http.get(TABLE, () => (up ? HttpResponse.json({ table: [ROW] }) : HttpResponse.json({ error: "down" }, { status: 503 }))))
    const call = await table()
    await call()
    up = true
    const r = await call()
    expect(r.ok && r.value.length, "provider is back; the outage must not have been cached").toBe(1)
  })

  it("outage after good data was cached: serves the cached rows, even past the stale window", async () => {
    let up = true
    server.use(http.get(TABLE, () => (up ? HttpResponse.json({ table: [ROW] }) : HttpResponse.json({ error: "down" }, { status: 503 }))))
    const call = await table()
    expect((await call()).ok).toBe(true)
    up = false
    // standings TTL is 300 s; the in-memory stale window is +24 h. Go past both.
    vi.setSystemTime(Date.now() + 25 * 60 * 60 * 1000)
    const r = await call()
    expect(r.ok && r.value.length, "old data beats an error when the provider is down").toBe(1)
    // …and a background refresh during the outage must not have replaced it with [].
    const again = await call()
    expect(again.ok && again.value.length).toBe(1)
  })
})
