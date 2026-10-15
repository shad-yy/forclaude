// C-03 — Contract tests for football-data.org v4, mirroring the
// TheSportsDB and NewsData.io pilots. Serves the recorded capture via
// MSW and asserts the schema both accepts the real shape and rejects
// a mangled one. Scope: only the `matches` endpoint — the only one
// this app's resolvers actually call.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { http, HttpResponse } from "msw"
import { server } from "../msw/server"
import { FDMatchesResponseSchema } from "@/lib/api/schemas/football-data"

function loadFixture<T = unknown>(relPath: string): T {
  const raw = readFileSync(`tests/fixtures/football-data/${relPath}`, "utf8")
  return JSON.parse(raw) as T
}

const FOOTBALL_DATA_ANY = /^https:\/\/api\.football-data\.org\/v4\//

describe("C-03 football-data.org contract", () => {
  it("Zod schema parses the recorded UCL matches capture cleanly", () => {
    const fixture = loadFixture("ucl-matches.json")
    const parsed = FDMatchesResponseSchema.safeParse(fixture)
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues, null, 2)).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.matches).toHaveLength(2)
    expect(parsed.data.matches[0].homeTeam.name).toBe("Manchester City FC")
  })

  it("Zod schema REJECTS a match missing required `homeTeam`", () => {
    const fixture = loadFixture<any>("ucl-matches.json")
    delete fixture.matches[0].homeTeam
    const parsed = FDMatchesResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject a match missing homeTeam").toBe(false)
  })

  it("Zod schema REJECTS a match whose score.fullTime is missing", () => {
    const fixture = loadFixture<any>("ucl-matches.json")
    delete fixture.matches[0].score.fullTime
    const parsed = FDMatchesResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject a match missing score.fullTime").toBe(false)
  })

  it("tolerates a finished match's null-free score alongside a scheduled match's null scores", () => {
    // Fixture row 1 (SCHEDULED) has fullTime {null, null}; row 2
    // (FINISHED) has real numbers. Both must parse under the same schema.
    const fixture = loadFixture("ucl-matches.json")
    const parsed = FDMatchesResponseSchema.safeParse(fixture)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.matches[0].score.fullTime.home).toBeNull()
    expect(parsed.data.matches[1].score.fullTime.home).toBe(3)
  })

  it("tolerates a match with no `venue` (row 2 in the fixture omits it)", () => {
    const fixture = loadFixture<any>("ucl-matches.json")
    const rowTwoOnly = { matches: [fixture.matches[1]] }
    const parsed = FDMatchesResponseSchema.safeParse(rowTwoOnly)
    expect(parsed.success, parsed.success ? "" : JSON.stringify((parsed as any).error?.issues, null, 2)).toBe(true)
  })

  it("resolver code path handles the captured shape without throwing (via MSW)", async () => {
    const fixture = loadFixture("ucl-matches.json")
    server.use(http.get(FOOTBALL_DATA_ANY, () => HttpResponse.json(fixture)))

    const { getUEFAMatches, UEFA_COMPETITIONS } = await import("@/lib/api/football-data")
    const matches = await getUEFAMatches(UEFA_COMPETITIONS.UCL, 8)
    expect(matches).toHaveLength(2)
    expect(matches[0].homeTeam.name).toBe("Manchester City FC")
  })

  it("resolver treats a 429 as an absence (returns []), not a crash", async () => {
    server.use(
      http.get(FOOTBALL_DATA_ANY, () => HttpResponse.json({ message: "rate limited" }, { status: 429 })),
    )
    const { getUEFAMatches, UEFA_COMPETITIONS } = await import("@/lib/api/football-data")
    const matches = await getUEFAMatches(UEFA_COMPETITIONS.UCL, 8)
    // lib/api/football-data.ts's existing behaviour: 429/!ok -> null -> [].
    expect(matches).toEqual([])
  })
})
