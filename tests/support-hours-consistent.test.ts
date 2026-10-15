// O-29 follow-up (owner decision 2026-10-01): support runs 9am–11pm UK time,
// 7 days a week. The site also said "24/7 support" on /buy, /pricing and in
// the /faq meta description, and "GMT" on /contact (wrong during BST).
// The homepage ContactPoint schema already says 09:00–23:00 every day.

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name)
    if (e.isDirectory()) return sources(full)
    return /\.tsx?$/.test(e.name) ? [full] : []
  })
}

describe("support hours say the same thing everywhere", () => {
  it("no page claims 24/7 support or GMT-only hours", () => {
    const offenders = [...sources("app"), ...sources("components")].filter((f) =>
      /24\/7 ?support|9am–11pm GMT/i.test(readFileSync(f, "utf8")),
    )
    expect(offenders).toEqual([])
  })

  it("/faq meta description fits the monitor's 160-character limit", () => {
    const m = readFileSync("app/faq/page.tsx", "utf8").match(/description: '([^']+)'/)
    expect(m?.[1].length ?? 0).toBeGreaterThan(0)
    expect(m?.[1].length ?? 999).toBeLessThan(160)
  })

  it("the homepage ContactPoint schema keeps 09:00–23:00", () => {
    const home = readFileSync("app/page.tsx", "utf8")
    expect(home).toMatch(/opens: '09:00'/)
    expect(home).toMatch(/closes: '23:00'/)
  })
})
