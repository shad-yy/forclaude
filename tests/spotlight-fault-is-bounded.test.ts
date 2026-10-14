// The structural guard in sportsdb-fetches-go-through-cache.test.ts proves
// /api/spotlight uses the cached, rate-limited client. It does NOT prove the
// route still answers in time — and that is the mistake this test exists to
// catch, because I made it.
//
// Routing the route's three raw fetches through eventsDay() was correct per
// CLAUDE.md, but every call then queued behind enqueueRateLimit()'s 2400ms
// slot (RATE_LIMIT_MS) and retried a 5xx twice. Measured 2026-10-10:
//
//   three cached calls, healthy cold cache    4812 ms
//   three cached calls, total outage         19236 ms
//
// A Vercel Node function defaults to a 10s limit, so the outage case never
// reached the route's own 503 — the caller got a gateway timeout instead.
// That is strictly worse than the uncached fetch it replaced, which failed
// fast. The fix: one blocking upstream call plus REQUEST_BUDGET_MS.
//
//   one call + 3s budget, healthy cold cache   321 ms
//   one call + 3s budget, total outage        3006 ms, 503 + no-store
//
// The assertion below is deliberately loose (8s against a 3s budget) so it
// does not flake on a slow runner, while still failing hard if the fault
// path ever creeps back toward the function limit.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "./msw/server"
import { down } from "./msw/handlers"

const EVENTSDAY = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\/eventsday\.php/

/** Vercel's default Node function limit. The fault path must finish inside it. */
const FUNCTION_LIMIT_MS = 10_000

/** Loose enough for a slow CI runner, tight enough to catch a regression. */
const FAULT_CEILING_MS = 8_000

beforeEach(async () => {
  vi.resetModules()
  // Force the in-memory cache path so a cached value cannot mask the fault.
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
  const { cache } = await import("@/lib/cache")
  cache.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("/api/spotlight answers a fault before the function limit", () => {
  it("returns 503 + no-store well inside Vercel's 10s ceiling", async () => {
    server.use(down(EVENTSDAY, 503))

    const { GET } = await import("@/app/api/spotlight/route")
    const startedAt = Date.now()
    const res = await GET()
    const elapsedMs = Date.now() - startedAt

    expect(res.status, "a fault must surface as 503, not 200-empty").toBe(503)
    expect(
      res.headers.get("Cache-Control"),
      "the fault must stay no-store per CLAUDE.md, so the CDN never caches it",
    ).toBe("no-store")
    expect(
      elapsedMs,
      `took ${elapsedMs}ms. Over ${FUNCTION_LIMIT_MS}ms the function is killed and ` +
        `the caller gets a gateway timeout instead of this 503. Check how many ` +
        `upstream calls the route awaits — each one queues behind a ${2400}ms ` +
        `rate-limit slot and retries twice.`,
    ).toBeLessThan(FAULT_CEILING_MS)
  }, 30_000)
})
