// Two components shipped the same defect independently, and the second one
// said so in a comment on its own line 7 ("mirrors EventCountdown.tsx"):
//
//   components/homepage/EventCountdown.tsx   — a curated upcoming-events list
//   components/ui/LiveEventFloat.tsx         — a "knockout fixtures" list
//
// Both hardcode kick-off times. Both silently stop rendering once those
// times pass, with nothing to say they have. LiveEventFloat's last entry was
// 2026-07-19, so by 2026-10-10 it had been rendering nothing on every page of
// the site for nearly three months — it is mounted in app/layout.tsx. One of
// its two fixtures, "Spain vs Argentina (World Cup Final)", names a match-up
// that was never scheduled.
//
// The repository rule is that fixtures come from the live API. A hardcoded
// list is allowed in exactly one place: the documented outage fallback in
// EventCountdown.tsx, which carries a review date and is reachable only when
// both live sources fail. This test pins that to one file so the pattern
// cannot spread to a third.

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

/** The one file allowed to hold a hardcoded kick-off time, and why. */
const ALLOWED = new Set(["components/homepage/EventCountdown.tsx"])

/** An ISO datetime literal in either quote style, e.g. '2026-10-11T16:30:00+01:00'. */
const HARDCODED_KICKOFF = /["']\d{4}-\d{2}-\d{2}T\d{2}:\d{2}[^"']*["']/

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return sources(full)
    return /\.tsx?$/.test(entry.name) ? [full] : []
  })
}

describe("fixtures come from the live API, not from the source tree", () => {
  it("only the documented outage fallback hardcodes a kick-off time", () => {
    const offenders = [...sources("components"), ...sources("app")]
      .filter((file) => HARDCODED_KICKOFF.test(readFileSync(file, "utf8")))
      .filter((file) => !ALLOWED.has(file))

    expect(
      offenders,
      "these files hardcode a kick-off time; read it from the unified API instead, " +
        "or delete the component if it no longer renders anything",
    ).toEqual([])
  })

  it("the allow-list names a file that exists, so it cannot rot silently", () => {
    for (const file of ALLOWED) {
      expect(() => readFileSync(file, "utf8"), `${file} is allow-listed but missing`).not.toThrow()
    }
  })
})
