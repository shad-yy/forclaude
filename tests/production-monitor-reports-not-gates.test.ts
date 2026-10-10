// Enforces: the production monitor reports on a push, it does not gate it.
//
// The workflow's own header says so — "Push runs (this file, a spec or the
// Playwright config changed) only report" — but the final step did not
// honour it. The issue-tracking step carried `github.event_name != 'push'`;
// the step that fails the job did not, so a push run surfaced as a failed
// check on the pull request.
//
// That matters because this job runs against the LIVE site
// (PLAYWRIGHT_BASE_URL: https://smartlivetv.co.uk), never against the branch
// under review. A live-site problem, an edge hiccup, or a deploy still
// settling therefore turned an unrelated PR red. It did, twice:
//
//   2026-10-06  failed against Version-3 @ 6e11a76a; the 2026-10-07 run
//               against that same commit, with no code change, reported
//               "Passing again" and auto-closed issue #16.
//   2026-10-10  failed on PR #17 ("No H1 on /watch/premier-league") while a
//               direct fetch of the live page returned 200 with exactly one
//               <h1>. PR #17 does not touch that route.
//
// Scheduled and manual runs must still fail the job — that failure is the
// signal the tracking issue keys off, and nobody is waiting on it to merge.
//
// Red-first: the second assertion failed before this change, because the
// step read `if: steps.e2e.outcome == 'failure'` with no event guard.

import { describe, it, expect } from "vitest"
import { readFileSync, existsSync } from "node:fs"

const MONITOR_YML = ".github/workflows/e2e-production-monitor.yml"

describe("the production monitor gates nothing on a push", () => {
  it("workflow file exists", () => {
    expect(existsSync(MONITOR_YML), `${MONITOR_YML} missing`).toBe(true)
  })

  it("the step that fails the job is guarded against push events", () => {
    const yml = readFileSync(MONITOR_YML, "utf8")
    const failStep = yml.match(/-\s*name:\s*Fail the job when checks failed[\s\S]*?run:\s*exit 1/)

    expect(failStep, "no 'Fail the job when checks failed' step found").not.toBeNull()
    expect(
      failStep?.[0] ?? "",
      "this step must skip push events, or a live-site failure blocks an unrelated PR",
    ).toMatch(/github\.event_name\s*!=\s*'push'/)
  })

  it("still asserts against the live site, so it cannot double as PR CI", () => {
    const yml = readFileSync(MONITOR_YML, "utf8")
    expect(
      yml,
      "if this ever points at a preview or localhost, revisit the rule above — " +
        "it could then legitimately gate a pull request",
    ).toMatch(/PLAYWRIGHT_BASE_URL:\s*https:\/\/smartlivetv\.co\.uk/)
  })

  it("scheduled and manual runs are unaffected", () => {
    const yml = readFileSync(MONITOR_YML, "utf8")
    expect(yml, "the daily schedule must remain").toMatch(/schedule:/)
    expect(yml, "manual dispatch must remain").toMatch(/workflow_dispatch:/)
  })
})
