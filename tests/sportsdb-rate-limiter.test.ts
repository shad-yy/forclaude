// X-08 — pins the internal rate-limiter's OBSERVABLE behaviour
// (requests to TheSportsDB are spaced >= RATE_LIMIT_MS apart, even
// when callers fire concurrently) before simplifying its
// implementation. `enqueueRateLimit` currently combines a
// `queueLock` spin-wait (`while (queueLock) await sleep(10)`) with a
// promise chain (`rateLimitQueue = rateLimitQueue.then(run, run)`).
// The two are redundant: JS guarantees synchronous execution between
// `await` points, and there is no `await` between reading and
// reassigning `rateLimitQueue` inside one call, so concurrent callers
// already serialize correctly through the promise chain alone. This
// test proves that claim empirically — pin it before the
// simplification, then re-run unchanged after to prove no regression.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "./msw/server"

const SPORTSDB_ANY = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\//
const RATE_LIMIT_MS = 2400 // must match lib/api/the-sports-db.ts's own constant

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("X-08 TheSportsDB rate limiter: concurrent calls serialize correctly", () => {
  it("spaces 3 concurrent sportsdbFetch calls >= RATE_LIMIT_MS apart, in call order", async () => {
    const callTimestamps: number[] = []
    server.use(
      http.get(SPORTSDB_ANY, () => {
        callTimestamps.push(Date.now())
        return HttpResponse.json({ ok: true })
      }),
    )

    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")

    // Three distinct endpoints so the circuit breaker (keyed
    // per-endpoint) never enters the picture — this test is only
    // about the shared rate limiter, not the breaker.
    const promise = Promise.all([
      sportsdbFetch("path-a.php"),
      sportsdbFetch("path-b.php"),
      sportsdbFetch("path-c.php"),
    ])
    await vi.runAllTimersAsync()
    await promise

    expect(callTimestamps).toHaveLength(3)
    expect(
      callTimestamps[1] - callTimestamps[0],
      "2nd request must wait at least RATE_LIMIT_MS after the 1st",
    ).toBeGreaterThanOrEqual(RATE_LIMIT_MS)
    expect(
      callTimestamps[2] - callTimestamps[1],
      "3rd request must wait at least RATE_LIMIT_MS after the 2nd",
    ).toBeGreaterThanOrEqual(RATE_LIMIT_MS)
  })

  it("does NOT throttle a single call — it fires immediately", async () => {
    const callTimestamps: number[] = []
    server.use(
      http.get(SPORTSDB_ANY, () => {
        callTimestamps.push(Date.now())
        return HttpResponse.json({ ok: true })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const start = Date.now()
    const promise = sportsdbFetch("path-solo.php")
    await vi.runAllTimersAsync()
    await promise
    expect(callTimestamps[0] - start).toBeLessThan(RATE_LIMIT_MS)
  })

  it("preserves call order under concurrency (a, b, c fire in that order, not interleaved)", async () => {
    const order: string[] = []
    server.use(
      http.get(SPORTSDB_ANY, ({ request }) => {
        order.push(new URL(request.url).pathname)
        return HttpResponse.json({ ok: true })
      }),
    )
    const { sportsdbFetch } = await import("@/lib/api/the-sports-db")
    const promise = Promise.all([
      sportsdbFetch("path-a.php"),
      sportsdbFetch("path-b.php"),
      sportsdbFetch("path-c.php"),
    ])
    await vi.runAllTimersAsync()
    await promise
    expect(order.map(p => p.split("/").pop())).toEqual(["path-a.php", "path-b.php", "path-c.php"])
  })
})
