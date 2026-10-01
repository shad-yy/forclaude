// C-03 — Contract tests for TheSportsDB v1. Serves the recorded
// captures via MSW (real HTTP interception at the seam) and asserts
// three things per endpoint:
//
//   1. The Zod schema parses the captured shape cleanly.
//   2. Mangling the fixture (removing a required field) makes the
//      schema REJECT — proves the schema discriminates rather than
//      rubber-stamping anything.
//   3. Our resolver code path (`theSportsDB.lookupLeague(...)`)
//      handles the captured shape without throwing.
//
// The point of (2) is the exact anti-pattern the
// `contract-tests-recorded-captures` skill was written to prevent:
// a "contract" test that never fails when the contract is broken.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { http, HttpResponse } from "msw"
import { server } from "../msw/server"
import {
  LookupLeagueResponseSchema,
  EventsDayResponseSchema,
} from "@/lib/api/schemas/thesportsdb"

function loadFixture<T = unknown>(relPath: string): T {
  const raw = readFileSync(`tests/fixtures/thesportsdb/${relPath}`, "utf8")
  return JSON.parse(raw) as T
}

// TheSportsDB URL: `https://www.thesportsdb.com/api/v1/json/<KEY>/<endpoint>`.
// The key defaults to "123" (public test key) when THESPORTSDB_API_KEY is unset.
const SPORTSDB_ANY = /^https:\/\/www\.thesportsdb\.com\/api\/v1\/json\/[^/]+\//

describe("C-03 TheSportsDB lookupleague contract", () => {
  it("Zod schema parses the recorded Premier League capture cleanly", () => {
    const fixture = loadFixture("lookupleague-4328.json")
    const parsed = LookupLeagueResponseSchema.safeParse(fixture)
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues, null, 2)).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.leagues).not.toBeNull()
    expect(parsed.data.leagues?.[0]?.idLeague).toBe("4328")
    expect(parsed.data.leagues?.[0]?.strLeague).toBe("English Premier League")
  })

  it("Zod schema REJECTS a mangled fixture missing `strLeague` (proves discrimination)", () => {
    const fixture = loadFixture<any>("lookupleague-4328.json")
    // Hand-mangle: remove a required field. If the schema still
    // passes this, the schema is not actually enforcing anything.
    delete fixture.leagues[0].strLeague
    const parsed = LookupLeagueResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject a payload missing `strLeague`").toBe(false)
  })

  it("Zod schema REJECTS a mangled fixture where `idLeague` becomes an empty string", () => {
    const fixture = loadFixture<any>("lookupleague-4328.json")
    fixture.leagues[0].idLeague = ""
    const parsed = LookupLeagueResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject an empty required id").toBe(false)
  })

  it("resolver code path handles the captured shape without throwing (via MSW)", async () => {
    const fixture = loadFixture("lookupleague-4328.json")
    server.use(
      http.get(SPORTSDB_ANY, ({ request }) => {
        if (!request.url.includes("lookupleague.php")) return HttpResponse.json({ leagues: null })
        return HttpResponse.json(fixture)
      }),
    )

    // Freshly import the resolver each test so any module-level cache
    // doesn't hold onto a previous suite's stub.
    const { theSportsDB } = await import("@/lib/api/the-sports-db")
    const league = await theSportsDB.lookupLeague("4328")
    expect(league, "resolver must return the parsed league row from the captured payload").not.toBeNull()
    expect(league?.idLeague).toBe("4328")
    expect(league?.strLeague).toBe("English Premier League")
  })
})

describe("C-03 TheSportsDB eventsday contract", () => {
  it("Zod schema parses the recorded matchday capture cleanly", () => {
    const fixture = loadFixture("eventsday-soccer-2024-10-19.json")
    const parsed = EventsDayResponseSchema.safeParse(fixture)
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues, null, 2)).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.events).toHaveLength(2)
    expect(parsed.data.events?.[0]?.strHomeTeam).toBe("Tottenham")
  })

  it("Zod schema REJECTS a mangled event missing required `dateEvent`", () => {
    const fixture = loadFixture<any>("eventsday-soccer-2024-10-19.json")
    delete fixture.events[0].dateEvent
    const parsed = EventsDayResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject an event missing dateEvent").toBe(false)
  })

  it("Zod schema tolerates optional/nullable fields being absent (row 2 in the fixture omits many)", () => {
    // Fixture row 2 omits ~15 optional fields present on row 1. The
    // schema must still parse it — this exists so a maintainer
    // trimming the fixture doesn't accidentally start requiring the
    // wrong fields.
    const fixture = loadFixture<any>("eventsday-soccer-2024-10-19.json")
    const rowTwoOnly = { events: [fixture.events[1]] }
    const parsed = EventsDayResponseSchema.safeParse(rowTwoOnly)
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues, null, 2)).toBe(true)
  })
})
