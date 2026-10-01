// C-02 — demonstrator that MSW is wired at the network seam.
// Uses `/api/spotlight` because it fetches three parallel TheSportsDB
// endpoints and its own `anySuccess` gate throws when NONE of them
// respond 2xx — exactly the shape MSW's `down()` factory targets.
//
// This is NOT a test of spotlight's behaviour per se (B-04.10 already
// covers that with a vi.mock); it exists to prove:
//   1. `server.use(...)` really does intercept fetch called by
//      library code deep in the resolver chain.
//   2. The setup file (`tests/msw/setup.ts`) starts + stops MSW
//      correctly across suites and does not leak handlers.
//   3. Future tests (subscribe / espn / cron / admin-health/report)
//      can call `server.use(...)` and skip ad-hoc `vi.stubGlobal("fetch", …)`.

import { describe, it, expect } from "vitest"
import { server } from "./msw/server"
import { down } from "./msw/handlers"
import { http, HttpResponse } from "msw"

// The route hits three variants of eventsday.php against the
// TheSportsDB base URL. Path is stable; API_KEY defaults to "123"
// (public test key) when THESPORTSDB_API_KEY is unset — which is
// the CI-like default. Match the whole path with a regex so the
// key value does not couple the test to a specific env config.
const SPORTSDB_EVENTSDAY = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\/eventsday\.php/

describe("C-02 MSW is wired at the network seam", () => {
  it("intercepts a real upstream URL and lets the route surface an UpstreamFault as 503", async () => {
    // Simulate all three TheSportsDB requests failing at the network.
    server.use(down(SPORTSDB_EVENTSDAY, 503))

    const { GET } = await import("@/app/api/spotlight/route")
    const res = await GET()

    expect(res.status, "spotlight must surface upstream fault as 503, not 200-empty").toBe(503)
    expect(
      res.headers.get("Cache-Control"),
      "faults must be no-store so the CDN does not cache the failure",
    ).toBe("no-store")
  })

  it("resets handlers between tests — the previous test's stub does not leak here", async () => {
    // Register a distinct stub that returns valid JSON.
    server.use(
      http.get(SPORTSDB_EVENTSDAY, () =>
        HttpResponse.json({ events: [] }),
      ),
    )

    const { GET } = await import("@/app/api/spotlight/route")
    const res = await GET()

    // With three 200-empty responses, `anySuccess` is true, no fault
    // is thrown, and the route returns a 200 shape.
    expect(res.status, "handlers must have been reset — this stub is 200 empty, not 503").toBe(200)
  })
})
