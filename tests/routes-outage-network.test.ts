// O-26 step C (closes O-20) — eight routes answer a TheSportsDB outage
// with 503 + no-store, proven at the network seam (MSW), with the real
// resolvers and provider client in the chain.
//
// B-04's tests mocked the resolver to throw, which the real resolvers
// did not do (QA-LOG standing correction 2026-09-30). These tests stub
// only the network, so they fail if any layer turns the fault back
// into [] / null.
//
// Red-first: every case failed before the route catches were changed
// (they returned 200 + [] or a bare []).

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { NextRequest } from "next/server"
import { server } from "./msw/server"

const SPORTSDB = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\//

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
  const { cache } = await import("@/lib/cache")
  cache.clear()
  server.use(http.get(SPORTSDB, () => HttpResponse.json({ error: "down" }, { status: 503 })))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

async function run(p: Promise<Response>): Promise<Response> {
  const settled = p.then((r) => r)
  await vi.runAllTimersAsync()
  return settled
}

const req = (path: string) => new NextRequest(`http://localhost:3000${path}`)

type Handler = (r: NextRequest, ctx: { params: { id: string } }) => Promise<Response>

const idRoutes: Array<[string, string, string]> = [
  ["teams/[id]/players", "@/app/api/teams/[id]/players/route", "/api/teams/133604/players"],
  ["teams/[id]/events", "@/app/api/teams/[id]/events/route", "/api/teams/133604/events"],
  ["leagues/[id]/standings", "@/app/api/leagues/[id]/standings/route", "/api/leagues/4328/standings"],
  ["events/[id]/stats", "@/app/api/events/[id]/stats/route", "/api/events/2269515/stats"],
  ["events/[id]/timeline", "@/app/api/events/[id]/timeline/route", "/api/events/2269515/timeline"],
]

describe("O-26 step C: outage → 503 + no-store at the network seam", () => {
  for (const [name, mod, path] of idRoutes) {
    it(name, async () => {
      const { GET } = (await import(mod)) as { GET: Handler }
      const id = path.split("/")[3]
      const res = await run(GET(req(path), { params: { id } }))
      expect(res.status, `${name} must not answer an outage with 200`).toBe(503)
      expect(res.headers.get("Cache-Control")).toBe("no-store")
    })
  }

  for (const name of ["teams", "players", "leagues"]) {
    it(`search/${name}`, async () => {
      const { GET } = (await import(`@/app/api/search/${name}/route`)) as { GET: (r: NextRequest) => Promise<Response> }
      const res = await run(GET(req(`/api/search/${name}?q=arsenal`)))
      expect(res.status, `search/${name} must not answer an outage with []`).toBe(503)
      expect(res.headers.get("Cache-Control")).toBe("no-store")
    })
  }

  it("B-04 route players/[id] now really returns 503 through the real chain", async () => {
    const { GET } = (await import("@/app/api/players/[id]/route")) as { GET: Handler }
    const res = await run(GET(req("/api/players/34145937"), { params: { id: "34145937" } }))
    expect(res.status).toBe(503)
  })
})
