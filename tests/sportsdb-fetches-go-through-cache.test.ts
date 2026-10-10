// CLAUDE.md, two non-negotiables:
//
//   "Every external fetch goes through the cache in lib/cache.ts (swrGet)"
//   "25 req/min ceiling on TheSportsDB (free tier is 30). RATE_LIMIT_MS = 2400"
//
// Three API routes broke both by calling thesportsdb.com with a raw `fetch`,
// most of them with `cache: 'no-store'` on top, which defeats Next's caching
// as well. /api/spotlight was the worst case and the one that bit:
//
//   - it fired THREE uncached, unthrottled requests per invocation
//   - two homepage components call it (hero-section, spotlight-events)
//   - on a fault it answered 503 with `Cache-Control: no-store`, correctly
//     per the hybrid rule — but with nothing cached, every subsequent
//     request re-fired all three upstream calls
//
// So once the key was throttled the route could not recover: each attempt
// spent three more requests against the same ceiling it had just exceeded.
// Observed 2026-10-10: /api/spotlight returned 503 on the live site and the
// homepage logged two console errors (one per calling component), failing
// "no console errors on homepage" in the production monitor.
//
// The fix routes those calls through eventsDay(), which goes
// eventsDay → makeRequest → swrGet, picking up both the cache and
// enqueueRateLimit(). swrGet serves stale inside its grace window while a
// rate-limit pause is active, which is what lets the route climb back out.
// The 503 keeps `no-store`: that is required by CLAUDE.md, and with the
// cache in front of it the repeat-request problem is gone anyway.
//
// Red-first: this failed listing app/api/spotlight/route.ts before the fix.

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

/**
 * The one route allowed to name the upstream host: it IS the proxy, so
 * naming thesportsdb.com is its whole job.
 */
const PROXY = "app/api/thesportsdb/[...path]/route.ts"

/**
 * Routes that still reach TheSportsDB directly. Listed so that a NEW
 * occurrence fails this test — not to bless these two.
 *
 * O-37: both are the same shape as the spotlight bug. /api/fixtures/today is
 * also called from the homepage (match-card.tsx), so it carries the same
 * spiral risk and should be converted next.
 */
const KNOWN_DEBT = new Set([
  "app/api/fixtures/today/route.ts",
  "app/api/scores/today/route.ts",
])

/**
 * Detect by the hostname, not by `fetch(`. The first version of this test
 * matched `fetch(` with the URL inline, and missed app/api/scores/today,
 * which assigns the URL to a variable first:
 *
 *   const url = `https://www.thesportsdb.com/.../eventsday.php?...`
 *   const res = await fetch(url)
 *
 * A route has no reason to name the upstream host at all — that is what the
 * client in lib/api/the-sports-db.ts is for — so the hostname itself is the
 * signal, and it catches every shape.
 */
function namesUpstreamHost(source: string): boolean {
  return source
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .some((line) => line.includes("thesportsdb.com"))
}

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return routeFiles(full)
    return entry.name === "route.ts" ? [full] : []
  })
}

describe("TheSportsDB calls go through the cached, rate-limited client", () => {
  it("no new route reaches thesportsdb.com directly", () => {
    const offenders = routeFiles("app/api")
      .filter((file) => namesUpstreamHost(readFileSync(file, "utf8")))
      .filter((file) => file !== PROXY && !KNOWN_DEBT.has(file))

    expect(
      offenders,
      "these routes bypass lib/cache.ts and the 25 req/min ceiling. Call the " +
        "client in lib/api/the-sports-db.ts (eventsDay, lookupTable, …) instead, " +
        "which routes through makeRequest → swrGet → enqueueRateLimit",
    ).toEqual([])
  })

  it("/api/spotlight uses eventsDay and no longer builds its own URL", () => {
    const route = readFileSync("app/api/spotlight/route.ts", "utf8")

    expect(route, "spotlight must call the shared client").toMatch(/eventsDay\(/)
    expect(
      route,
      "spotlight must not rebuild a TheSportsDB base URL — that is how it " +
        "escaped the cache and the rate limiter in the first place",
    ).not.toMatch(/thesportsdb\.com/)
    expect(
      route,
      "cache: 'no-store' on an upstream call defeats both caches",
    ).not.toMatch(/cache:\s*['"]no-store['"]/)
  })

  it("spotlight still answers a real fault with 503 + no-store", () => {
    // The hybrid rule is not relaxed by the caching fix. eventsDay() rejects
    // with UpstreamFaultError on a fault, and a legitimately empty day
    // resolves to [] — so absence stays 200 and only a fault reaches here.
    const route = readFileSync("app/api/spotlight/route.ts", "utf8")
    expect(route, "fault must still be 503").toMatch(/status:\s*503/)
    expect(route, "the 503 must still be no-store, per CLAUDE.md").toMatch(
      /["']Cache-Control["']:\s*["']no-store["']/,
    )
  })

  it("the debt list names files that exist, so it cannot rot silently", () => {
    for (const file of KNOWN_DEBT) {
      expect(() => readFileSync(file, "utf8"), `${file} is listed but missing`).not.toThrow()
    }
  })

  it("every file on the debt list really does still reach the host directly", () => {
    // If one gets fixed, it must leave the list — otherwise the list grows
    // stale and stops meaning anything.
    for (const file of KNOWN_DEBT) {
      expect(
        namesUpstreamHost(readFileSync(file, "utf8")),
        `${file} no longer names thesportsdb.com — remove it from KNOWN_DEBT`,
      ).toBe(true)
    }
  })
})
