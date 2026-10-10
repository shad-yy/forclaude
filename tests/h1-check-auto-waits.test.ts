// O-29: the "H1 exists and is unique on every page" check in
// e2e/smartlivetv.spec.ts reported "No H1" five times across five runs, on a
// different page each time, always passing on retry:
//
//   /free-trial (Mobile Chrome)   /ufc   /watch/champions-league
//   /free-trial (Desktop Chrome, run 36902488798)
//   /watch/premier-league (2026-10-10, run 38017922181)
//
// A genuinely missing H1 fails the same page every run. A single rotating
// failure that clears on retry is a timing artefact, and the check had a
// mechanism for one: `page.$$('h1')` is a one-shot DOM snapshot that does
// not auto-wait, unlike a locator, which retries until the timeout. It also
// never checked the navigation's status, so a 404 or 500 would render an
// error page and be reported as "No H1".
//
// Tonight's instance was verified not to be a real missing H1: a direct
// fetch of /watch/premier-league on the deployment then serving production
// returned 200 with exactly one <h1>, and a single re-run of the job passed.
//
// This test pins the shape of that one check. It cannot run Playwright
// against the live site, so it asserts the source instead — the same way
// tests/ci-trigger-covers-active-branches.test.ts asserts ci.yml.
//
// Red-first: both assertions below failed before the fix.
//
// NOT covered: the rest of e2e/smartlivetv.spec.ts still uses page.$ /
// page.$$ / $eval in roughly 28 places. Most are preceded by a wait or
// assert only on absence, so they are not all races — but they are not all
// safe either. Logged in OPEN-WORK.md rather than changed here, to keep this
// PR to the check that actually failed.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"

const SPEC = "e2e/smartlivetv.spec.ts"
const TEST_NAME = "H1 exists and is unique on every page"

/** The body of the H1 test, from its own `test(` up to the next one. */
function h1TestBody(): string {
  const spec = readFileSync(SPEC, "utf8")
  const start = spec.indexOf(TEST_NAME)
  expect(start, `"${TEST_NAME}" not found in ${SPEC} — was it renamed?`).toBeGreaterThan(-1)

  const rest = spec.slice(start)
  const nextTest = rest.indexOf("\n    test(")
  return nextTest === -1 ? rest : rest.slice(0, nextTest)
}

describe("O-29: the H1 check waits for the page instead of snapshotting it", () => {
  it("uses a locator, not a non-waiting page.$$ / page.$ snapshot", () => {
    const body = h1TestBody()

    expect(
      body,
      "page.$$ and page.$ return whatever is in the DOM that instant. Use " +
        "page.locator(...) with a web-first assertion so the check retries.",
    ).not.toMatch(/await\s+page\.\$\$?\(/)

    expect(
      body,
      "the H1 must be read through a locator so the assertion auto-waits",
    ).toMatch(/page\.locator\(\s*['"]h1['"]\s*\)/)
  })

  it("asserts the navigation returned a usable status", () => {
    const body = h1TestBody()

    expect(
      body,
      "without a status check, a 404 or 500 renders an error page and is " +
        'reported as "No H1", which hides the real failure',
    ).toMatch(/response\??\.status\(\)/)
  })

  it("still fails a genuinely missing or duplicated H1", () => {
    const body = h1TestBody()

    // toHaveCount(1) covers both of the original assertions: zero H1s and
    // more than one. If this is ever relaxed to a bare visibility check, the
    // "only one H1" half of the rule is silently lost.
    expect(body, "the check must still require exactly one H1").toMatch(/toHaveCount\(\s*1\s*\)/)
    expect(body, "the empty-H1 assertion must survive").toMatch(/H1 is empty on/)
    expect(body, "the UFCOCTAGON concatenation check must survive").toMatch(/UFCOCTAGON/)
  })
})
