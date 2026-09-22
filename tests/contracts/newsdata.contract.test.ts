// C-03 — Contract tests for NewsData.io, mirroring the TheSportsDB
// pilot (tests/contracts/thesportsdb.contract.test.ts). Serves the
// recorded capture via MSW and asserts the schema both accepts the
// real shape and rejects a mangled one.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { readFileSync } from "node:fs"
import { http, HttpResponse } from "msw"
import { server } from "../msw/server"
import { NewsDataResponseSchema } from "@/lib/api/schemas/newsdata"

function loadFixture<T = unknown>(relPath: string): T {
  const raw = readFileSync(`tests/fixtures/newsdata/${relPath}`, "utf8")
  return JSON.parse(raw) as T
}

const NEWSDATA_ANY = /^https:\/\/newsdata\.io\/api\/1\//

describe("C-03 NewsData.io contract", () => {
  it("Zod schema parses the recorded capture cleanly", () => {
    const fixture = loadFixture("success-football-news.json")
    const parsed = NewsDataResponseSchema.safeParse(fixture)
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues, null, 2)).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.results).toHaveLength(2)
    expect(parsed.data.results?.[0]?.title).toContain("Arsenal")
  })

  it("Zod schema REJECTS a mangled article missing required `article_id`", () => {
    const fixture = loadFixture<any>("success-football-news.json")
    delete fixture.results[0].article_id
    const parsed = NewsDataResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject an article missing article_id").toBe(false)
  })

  it("Zod schema REJECTS a mangled article with an empty required `link`", () => {
    const fixture = loadFixture<any>("success-football-news.json")
    fixture.results[0].link = ""
    const parsed = NewsDataResponseSchema.safeParse(fixture)
    expect(parsed.success, "schema must reject an empty required link").toBe(false)
  })

  it("tolerates the many nullable fields being null (row 2 in the fixture)", () => {
    const fixture = loadFixture<any>("success-football-news.json")
    const rowTwoOnly = { status: fixture.status, totalResults: 1, results: [fixture.results[1]] }
    const parsed = NewsDataResponseSchema.safeParse(rowTwoOnly)
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues, null, 2)).toBe(true)
  })

  describe("resolver code path (requires NEWS_API_KEY to reach fetch at all)", () => {
    beforeEach(() => {
      vi.resetModules()
      vi.stubEnv("NEWS_API_KEY", "test-key-for-contract-test")
    })
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it("handles the captured shape without throwing (via MSW)", async () => {
      const fixture = loadFixture("success-football-news.json")
      server.use(http.get(NEWSDATA_ANY, () => HttpResponse.json(fixture)))

      const { getLatestSportsNews } = await import("@/lib/api/news")
      const articles = await getLatestSportsNews("football", 10)
      expect(articles.length).toBeGreaterThan(0)
      expect(articles[0].title).toContain("Arsenal")
    })

    it("treats a non-'success' status as a fault, not a crash (falls back gracefully)", async () => {
      server.use(
        http.get(NEWSDATA_ANY, () =>
          HttpResponse.json({ status: "error", totalResults: 0, results: null }),
        ),
      )
      const { getLatestSportsNews } = await import("@/lib/api/news")
      const articles = await getLatestSportsNews("football", 10)
      // lib/api/news.ts's existing behaviour: non-success status -> FALLBACK_ARTICLES, never throws.
      expect(Array.isArray(articles)).toBe(true)
    })
  })
})
