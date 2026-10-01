// X-05 — pins sportsdbFetch's retry POLICY after migrating its
// backoff/attempt-counting mechanics onto the shared withRetry()
// helper (lib/api/retry.ts). These assertions exist so a future
// change to lib/api/retry.ts, or to sportsdbFetch's own status-code
// branching, cannot silently alter TheSportsDB's retry behaviour:
// 5xx and network errors retry up to 2 times (3 total attempts);
// 429 and other 4xx never retry.
//
// sportsdbFetch also throttles every attempt through an internal
// rate limiter (2400ms between requests) and, on 5xx, sleeps a
// [200,600,1800]ms backoff schedule between retries. Both use real
// setTimeout. Fake timers + vi.runAllTimersAsync() let the test
// resolve instantly instead of waiting on real wall-clock time.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "./msw/server"

const SPORTSDB_ANY = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\//
const ENDPOINT = "lookupleague.php?id=4328"

beforeEach(() => {
  // Fresh module instance per test so the internal rate-limiter
  // (lastRequestTime) and circuit-breaker Map never leak state
  // between assertions.
  vi.resetModules()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("X-05 sportsdbFetch retry policy", () => {
  it("retries a 500 up to 2 times then succeeds on the 3rd attempt", async () => {
    let calls = 0
    server.use(
      http.get(SPORTSDB_ANY, () => {
        calls++
        if (calls < 3) return HttpResponse.json({ error: "boom" }, { status: 500 })
        return HttpResponse.json({ leagues: [{ idLeague: "4328" }] })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const promise = sportsdbFetch(ENDPOINT)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(calls, "must retry twice (3 total attempts) before succeeding").toBe(3)
    expect(result.ok).toBe(true)
    expect(result.status).toBe(200)
  })

  it("gives up after 2 retries (3 total attempts) on persistent 500s", async () => {
    let calls = 0
    server.use(
      http.get(SPORTSDB_ANY, () => {
        calls++
        return HttpResponse.json({ error: "boom" }, { status: 500 })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const promise = sportsdbFetch(ENDPOINT)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(calls, "must stop at 3 total attempts (1 + 2 retries)").toBe(3)
    expect(result.ok).toBe(false)
    expect(result.status).toBe(500)
  })

  it("does NOT retry a 429 — fails fast on the first attempt", async () => {
    let calls = 0
    server.use(
      http.get(SPORTSDB_ANY, () => {
        calls++
        return HttpResponse.json({ error: "rate limited" }, { status: 429 })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const promise = sportsdbFetch(ENDPOINT)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(calls, "a 429 must never be retried").toBe(1)
    expect(result.ok).toBe(false)
    expect(result.status).toBe(429)
  })

  it("does NOT retry a 404 — fails fast on the first attempt", async () => {
    let calls = 0
    server.use(
      http.get(SPORTSDB_ANY, () => {
        calls++
        return HttpResponse.json({ error: "not found" }, { status: 404 })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const promise = sportsdbFetch(ENDPOINT)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(calls, "a 4xx (non-429) must never be retried").toBe(1)
    expect(result.ok).toBe(false)
    expect(result.status).toBe(404)
  })

  it("retries a network-level failure up to 2 times then succeeds", async () => {
    let calls = 0
    server.use(
      http.get(SPORTSDB_ANY, () => {
        calls++
        if (calls < 3) return HttpResponse.error()
        return HttpResponse.json({ leagues: [{ idLeague: "4328" }] })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const promise = sportsdbFetch(ENDPOINT)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(calls).toBe(3)
    expect(result.ok).toBe(true)
  })
})
