// O-14 — the search-bar's news branch used to check
// `Array.isArray(newsJson)` on a response the route always returned as
// `{status, articles, totalResults}`. The branch was silently dead.
// This test pins the contract between the caller and the route so a
// future change to either shape breaks the build with a clear message.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"

describe("O-14 search-bar / api/search/news response-shape contract", () => {
  it("the route returns { articles: [...] } (object, not bare array)", async () => {
    // The route imports `getLatestSportsNews`; mock it so we don't
    // depend on the news scraper's env.
    const { vi } = await import("vitest")
    vi.doMock("@/lib/api/news", () => ({
      getLatestSportsNews: async () => [
        { title: "First", link: "https://a.com/1", description: "one" },
        { title: "Second", link: "https://a.com/2", description: "two" },
      ],
    }))
    // Reset the module registry so the route picks up the mock.
    vi.resetModules()
    vi.doMock("@/lib/api/news", () => ({
      getLatestSportsNews: async () => [
        { title: "First", link: "https://a.com/1", description: "one" },
        { title: "Second", link: "https://a.com/2", description: "two" },
      ],
    }))

    const { GET } = await import("@/app/api/search/news/route")
    const res = await GET(new Request("http://localhost/api/search/news?q=hi"))
    const body = await res.json()

    expect(res.status, "success path must be 2xx").toBe(200)
    expect(Array.isArray(body), "body is an OBJECT, not a bare array — the O-14 bug was reading it as an array").toBe(false)
    expect(Array.isArray(body.articles), "body.articles must be the array").toBe(true)
    expect(body.articles.length).toBeGreaterThan(0)

    vi.doUnmock("@/lib/api/news")
  })

  it("the search-bar caller reads `.articles`, not the bare response", () => {
    // Structural test: whichever shape the route settles on, the
    // caller must match. Refuse a regression that re-adds the plain
    // `Array.isArray(newsJson)` check (which was O-14).
    const src = readFileSync("components/layout/search-bar.tsx", "utf8")
    // Slice to just the newsRes branch so we do not accidentally
    // match Array.isArray usage on teams/players/leagues.
    const branchStart = src.indexOf("if (newsRes.status ===")
    const branchEnd = src.indexOf("if (leaguesRes.status ===", branchStart)
    const branch = src.slice(branchStart, branchEnd)
    expect(branch, "the news branch was found").not.toBe("")
    expect(
      // Match `Array.isArray(newsJson)` where the argument is
      // *just* `newsJson`, not `newsJson?.articles` or `newsJson.foo`.
      /Array\.isArray\s*\(\s*newsJson\s*\)/.test(branch) &&
        !/Array\.isArray\s*\(\s*newsJson\??\.[a-zA-Z]/.test(branch),
      "search-bar re-introduced the O-14 bug — reading the response as a bare array. Check newsJson.articles instead.",
    ).toBe(false)
    expect(
      /newsJson\??\.articles/.test(branch),
      "search-bar's news branch must read `.articles` from the response object",
    ).toBe(true)
  })
})
