// The gate for unattended publishing.
//
// The daily growth routine may merge a content-only PR to Version-3, which
// deploys it to production with no human reading it first. This test is what
// stands between a bad post and the live site: every rule in
// lib/content/blog-rules.ts is exercised against a known-good fixture (must
// pass) and a fixture that breaks exactly that rule (must fail), and every
// real post dated on or after RULES_APPLY_FROM must pass.
//
// Red-first: written before lib/content/blog-rules.ts existed. Run against
// the newest existing post (matchweek 5, dated 2026-09-20, re-dated to the
// cutoff for the check), the auditor reports two violations: it cites no
// sources at all, and its metaTitle is 69 characters. Its table, FAQ and
// internal links already pass. The sources rule is the one that matters:
// it is how "never make up data" becomes something CI can refuse.

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { auditPost, RULES_APPLY_FROM } from "@/lib/content/blog-rules"

const GOOD = `---
title: "Premier League Matchweek 7 TV Guide: Every Match and Channel"
date: "${RULES_APPLY_FROM}"
description: "Every Premier League matchweek 7 kick-off time and UK TV channel, what is free to watch on BBC and ITV, and what a subscription adds."
category: "news"
metaTitle: "Premier League Matchweek 7 TV Guide (October 2026)"
sources:
  - "https://www.premierleague.com/en/news/4675097/all-380-fixtures-for-202627-premier-league-season"
  - "https://www.skysports.com/share/13574076"
---

Matchweek 7 runs from Saturday 17 to Sunday 18 October. Five matches are on Sky Sports, two on TNT Sports, and Match of the Day shows highlights free on BBC One.

## Kick-off times and channels

| Match | Kick-off (BST) | UK channel |
| --- | --- | --- |
| Everton v Chelsea | Sat 17:30 | Sky Sports |
| Leeds v Manchester United | Sun 16:30 | Sky Sports |

Highlights are free on BBC. A subscription adds live coverage of every match — see [pricing](/pricing), start a [free trial](/free-trial), or follow the [Firestick setup guide](/setup/firestick).

## Frequently Asked Questions

### Which matchweek 7 games are on Sky Sports?
Five, listed above.

### Is any match free to watch live?
No live match is free-to-air this weekend.

### Where can I watch highlights for free?
Match of the Day on BBC One.

### What time is Leeds v Manchester United?
16:30 BST on Sunday.

### Can I watch on a Firestick?
Yes, see the setup guide.
`

/** Return GOOD with `from` replaced by `to`, asserting the replacement happened. */
function variant(from: string | RegExp, to: string): string {
  const out = GOOD.replace(from, to)
  if (out === GOOD) throw new Error(`fixture edit did not apply: ${from}`)
  return out
}

function violationsFor(src: string): string[] {
  return auditPost("fixture", src).violations
}

describe("the known-good fixture passes every rule", () => {
  it("has no violations", () => {
    expect(violationsFor(GOOD)).toEqual([])
  })
})

describe("each rule fails the post that breaks it", () => {
  const cases: Array<[string, string, RegExp]> = [
    ["no sources", variant(/sources:\n(?:  - ".*"\n)+/, ""), /sources must list/],
    ["one source only", variant(/  - "https:\/\/www\.skysports\.com[^"]*"\n/, ""), /sources must list/],
    ["sources pointing at our own site", variant(/https:\/\/www\.premierleague\.com[^"]*/, "https://smartlivetv.co.uk/pricing").replace(/https:\/\/www\.skysports\.com[^"]*/, "https://smartlivetv.co.uk/blog"), /sources must list/],
    ["description too short", variant(/description: "[^"]*"/, 'description: "Too short."'), /description must be/],
    ["metaTitle missing", variant(/metaTitle: "[^"]*"\n/, ""), /metaTitle is required/],
    ["long lead paragraph", variant("Matchweek 7 runs", "word ".repeat(70) + "Matchweek 7 runs"), /first paragraph/],
    ["missing /pricing link", variant("[pricing](/pricing)", "pricing"), /must link to \/pricing/],
    ["missing /free-trial link", variant("[free trial](/free-trial)", "free trial"), /must link to \/free-trial/],
    ["missing /setup/firestick link", variant("[Firestick setup guide](/setup/firestick)", "Firestick setup guide"), /must link to \/setup\/firestick/],
    ["no table", variant(/\| Match[\s\S]*?Sky Sports \|\n\n/, ""), /comparison table/],
    ["thin FAQ", variant(/### Can I watch on a Firestick\?\nYes, see the setup guide\.\n/, ""), /FAQ section needs at least 5/],
    ["emoji", variant("Five matches", "Five matches ⚽"), /emojis/],
    ["piracy keyword", variant("Five matches", "No piracy here. Five matches"), /must not use the term/],
    ["free stream keyword", variant("Five matches", "Find a free stream? Five matches"), /must not use the term/],
    ["BBC needs IPTV claim", variant("Match of the Day shows highlights free on BBC One.", "BBC coverage requires an IPTV box."), /BBC or ITV/],
    ["US spelling", variant("Five matches", "Your favorite matches. Five matches"), /UK spelling/],
    ["customer count", variant("Five matches", "Trusted by 12,000 happy customers. Five matches"), /customer or subscriber count/],
    ["stock phrase", variant("Five matches", "Let us delve into it. Five matches"), /machine-written/],
  ]

  for (const [name, src, expected] of cases) {
    it(name, () => {
      const v = violationsFor(src)
      expect(v.some((m) => expected.test(m)), `expected a violation matching ${expected}, got: ${JSON.stringify(v)}`).toBe(true)
    })
  }
})

describe("hosts and links are compared exactly (CodeQL, 2026-10-14)", () => {
  const withSources = (a: string, b: string) =>
    GOOD.replace(/sources:\n(?:  - ".*"\n)+/, `sources:\n  - "${a}"\n  - "${b}"\n`)

  it("a lookalike host is a different site and counts as external", () => {
    // The first version matched /^https:\/\/(?:www\.)?smartlivetv\.co\.uk/ with no end
    // anchor, so this URL was wrongly treated as our own site.
    const v = violationsFor(withSources("https://smartlivetv.co.uk.example.com/report", "https://www.premierleague.com/fixtures"))
    expect(v.filter((m) => /sources must list/.test(m))).toEqual([])
  })

  it("our own host, with or without www, never counts as an independent source", () => {
    const v = violationsFor(withSources("https://www.smartlivetv.co.uk/pricing", "https://www.premierleague.com/fixtures"))
    expect(v.some((m) => /sources must list/.test(m))).toBe(true)
  })

  it("a non-https source does not count", () => {
    const v = violationsFor(withSources("http://www.bbc.co.uk/sport", "https://www.premierleague.com/fixtures"))
    expect(v.some((m) => /sources must list/.test(m))).toBe(true)
  })

  it("a lookalike path does not satisfy a required internal link", () => {
    const v = violationsFor(GOOD.replace("[pricing](/pricing)", "[pricing](/pricing-old)"))
    expect(v.some((m) => /must link to \/pricing/.test(m))).toBe(true)
  })

  it("a sub-path, fragment or query on the required link still counts", () => {
    for (const t of ["/pricing/annual", "/pricing#plans", "/pricing?ref=blog"]) {
      expect(violationsFor(GOOD.replace("[pricing](/pricing)", `[pricing](${t})`)), t).toEqual([])
    }
  })
})

describe("scope", () => {
  it("posts dated before the cutoff are not retro-failed", () => {
    const old = GOOD.replace(`date: "${RULES_APPLY_FROM}"`, 'date: "2026-09-20"').replace(/sources:\n(?:  - ".*"\n)+/, "")
    expect(auditPost("old", old)).toEqual({ applies: false, violations: [] })
  })
})

describe("every real post under the rules passes them", () => {
  it("content/blog posts dated on or after the cutoff have no violations", () => {
    const files = readdirSync("content/blog").filter((f) => f.endsWith(".mdx"))
    const violations = files.flatMap((f) => auditPost(f.replace(/\.mdx$/, ""), readFileSync(`content/blog/${f}`, "utf8")).violations)
    expect(violations, "fix these before merging — the routine must not publish them").toEqual([])
  })
})
