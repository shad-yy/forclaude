// Two project rules pulled against each other.
//
// CLAUDE.md requires a fault to be loud:
//   "An upstream outage is a fault: API routes return 503 with
//    Cache-Control: no-store, never 200 with []."
//
// And the production monitor requires the homepage to be quiet:
//   e2e/smartlivetv.spec.ts — "no console errors on homepage"
//
// A browser logs "Failed to load resource ... 503" for any non-2xx response
// no matter how cleanly the application handles it. So for as long as any
// upstream was down, the second rule failed because the first was obeyed —
// and the check could not tell "the site is broken" from "an upstream is
// down and the site did exactly what it was told to".
//
// It bit on 2026-10-10: /api/spotlight answered 503, hero-section.tsx and
// spotlight-events.tsx both call it, and the check counted two errors on a
// homepage that was otherwise fine.
//
// Owner decision (2026-10-10): excuse a 503 from our own API routes, keep
// failing on everything else. The console message carries no URL, so the
// 503s are identified from the response event and matched on same-origin +
// /api/ before being excused.
//
// Red-first: every assertion below failed before that change.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"

const SPEC = "e2e/smartlivetv.spec.ts"
const TEST_NAME = "no console errors on homepage"

/** The body of the console-errors test, from its own `test(` to the next. */
function consoleTestBody(): string {
  const spec = readFileSync(SPEC, "utf8")
  const start = spec.indexOf(TEST_NAME)
  expect(start, `"${TEST_NAME}" not found in ${SPEC} — was it renamed?`).toBeGreaterThan(-1)

  const rest = spec.slice(start)
  const nextTest = rest.indexOf("\n    test(")
  return nextTest === -1 ? rest : rest.slice(0, nextTest)
}

describe("the homepage console check excuses our own 503s, and only those", () => {
  it("identifies faulting routes from the response event, not the message text", () => {
    const body = consoleTestBody()
    expect(
      body,
      "the console message does not include the URL, so a 503 must be " +
        "attributed via page.on('response') before it can be excused",
    ).toMatch(/page\.on\(\s*['"]response['"]/)
  })

  it("only excuses a 503 that is same-origin and under /api/", () => {
    const body = consoleTestBody()
    expect(body, "must check the response status is 503").toMatch(/status\(\)\s*===\s*503/)
    expect(
      body,
      "a third party's 503 is not ours to excuse — the URL must be same-origin",
    ).toMatch(/startsWith\(\s*BASE\s*\)/)
    expect(body, "and must be an API route").toMatch(/includes\(\s*['"]\/api\/['"]\s*\)/)
  })

  it("still fails on every other console error", () => {
    const body = consoleTestBody()
    // The assertion itself must survive: this is an exemption, not a mute.
    expect(body, "the check must still assert zero real errors").toMatch(
      /realErrors\.length[\s\S]*\)\.toBe\(0\)/,
    )
    expect(body, "pageerror must still be collected").toMatch(/page\.on\(\s*['"]pageerror['"]/)
  })

  it("reports the faulting routes even when it excuses them", () => {
    const body = consoleTestBody()
    expect(
      body,
      "a route stuck on 503 is still worth knowing about — it must be logged, " +
        "not silently swallowed",
    ).toMatch(/console\.(warn|error)\([\s\S]*faultingRoutes/)
  })
})
