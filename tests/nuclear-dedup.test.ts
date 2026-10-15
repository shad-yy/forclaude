// X-04 — pin the three call-site semantics against the consolidated
// `nuclearDedup` helper so a refactor cannot silently change dedup
// behaviour. Also refuses future re-copy: only ONE `function
// nuclearDedup` declaration may exist in the repo (the one in
// `lib/api/dedup.ts`).

import { describe, it, expect } from "vitest"
import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { nuclearDedup } from "@/lib/api/dedup"

describe("X-04 shared nuclearDedup helper", () => {
  it("filters articles that share an exact URL (default settings)", () => {
    const out = nuclearDedup([
      { title: "One", link: "https://a.com/1" },
      { title: "Two", link: "https://a.com/1" },
      { title: "Three", link: "https://a.com/3" },
    ])
    expect(out.map(a => a.title)).toEqual(["One", "Three"])
  })

  it("filters articles that share a normalised title prefix >= 15 chars", () => {
    // Both articles' full titles normalise to <60 alnum chars, and
    // their first 60 chars are identical.
    const out = nuclearDedup([
      { title: "Manchester United Beats Arsenal 3-0 in Premier League", link: "https://a.com/x1" },
      { title: "Manchester United Beats Arsenal 3-0 in Premier League", link: "https://a.com/x2" },
    ])
    expect(out).toHaveLength(1)
  })

  it("keeps articles that share only a very SHORT title (< 15 chars normalised)", () => {
    const out = nuclearDedup([
      { title: "Hi", link: "https://a.com/a" },
      { title: "Hi", link: "https://a.com/b" },
    ])
    // titleKey.length is only 2, < titleMinChars (15) → not deduped on title.
    expect(out).toHaveLength(2)
  })

  it("filters articles that share the same image URL sans query", () => {
    const out = nuclearDedup([
      { title: "First article about football today", link: "https://a.com/1", image_url: "https://cdn.example.com/photo-abcdefg.jpg?w=1" },
      { title: "Different article, wholly different words", link: "https://a.com/2", image_url: "https://cdn.example.com/photo-abcdefg.jpg?w=2" },
    ])
    // Same base image URL — the 2nd is a syndicated dupe.
    expect(out).toHaveLength(1)
  })

  it("with requireTitle:false, keeps articles that have no title", () => {
    const out = nuclearDedup(
      [
        { title: "", link: "https://a.com/1" },
        { title: "Some title", link: "https://a.com/2" },
      ],
      { requireTitle: false },
    )
    expect(out).toHaveLength(2)
  })

  it("with dedupOnDescription:true, filters near-identical descriptions", () => {
    const out = nuclearDedup(
      [
        { title: "First unique title A", link: "https://a.com/1", description: "Team X defeats Team Y in a stunning upset that shook the league." },
        { title: "Different unique title B", link: "https://a.com/2", description: "Team X defeats Team Y in a stunning upset that shook the league." },
      ],
      { dedupOnDescription: true },
    )
    expect(out).toHaveLength(1)
  })

  it("preserves input order (keeps first occurrence)", () => {
    const out = nuclearDedup([
      { title: "aaaaa long title one full of unique words", link: "https://a.com/1" },
      { title: "bbbbb long title two full of unique words", link: "https://a.com/2" },
      { title: "aaaaa long title one full of unique words", link: "https://a.com/3" },
    ])
    expect(out.map(a => a.link)).toEqual(["https://a.com/1", "https://a.com/2"])
  })

  it("handles empty and null input", () => {
    expect(nuclearDedup([])).toEqual([])
    expect(nuclearDedup(null)).toEqual([])
    expect(nuclearDedup(undefined)).toEqual([])
  })
})

describe("X-04 tripwire — only ONE nuclearDedup declaration in the repo", () => {
  it("no re-copy of `function nuclearDedup` outside lib/api/dedup.ts", () => {
    // `git grep` exits 1 when it finds no matches — which is exactly
    // what we want. execSync throws on non-zero, so catch that path
    // and treat it as the pass condition.
    let out = ""
    try {
      out = execSync(
        "git grep -n -E '^(export\\s+)?function\\s+nuclearDedup' -- ':(exclude)lib/api/dedup.ts'",
        { encoding: "utf8" },
      ).trim()
    } catch (err: any) {
      // exit 1 → no matches (the good outcome). Any other exit means
      // git itself failed — surface that.
      if (err?.status !== 1) throw err
    }
    expect(
      out,
      `nuclearDedup was copy-pasted again — the helper lives in lib/api/dedup.ts. Offenders:\n${out}`,
    ).toBe("")
  })

  it("all three legacy callers import from the shared helper", () => {
    const files = [
      "lib/api/news.ts",
      "app/api/news/route.ts",
      "app/api/search/news/route.ts",
    ]
    for (const f of files) {
      const src = readFileSync(f, "utf8")
      expect(src, `${f} must import nuclearDedup from @/lib/api/dedup`).toMatch(
        /import\s+\{[^}]*nuclearDedup[^}]*\}\s+from\s+["']@\/lib\/api\/dedup["']/,
      )
    }
  })
})
