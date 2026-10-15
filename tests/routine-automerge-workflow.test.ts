// Content-only auto-merge (owner decision 2026-10-14) is the one place a
// change reaches production with no human merge. These tests pin the safety
// properties of .github/workflows/routine-automerge.yml and the decision
// logic of the scripts it runs, so loosening any of them fails CI.
//
// Why a workflow and not an agent permission: on 2026-10-14 the Claude Code
// auto-mode classifier refused an agent merge to Version-3 ("Merge Without
// Review"), and the scheduled routine's session has neither GitHub nor Vercel
// tools. The agent therefore only opens PRs; this workflow, which the owner
// approves once by merging it, makes the merge decision deterministically.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { evaluate, REQUIRED_CHECKS } from "../scripts/routine/wait-for-checks.mjs"
import { postSlugs, KEY_PAGES } from "../scripts/routine/verify-production.mjs"

const WF = readFileSync(".github/workflows/routine-automerge.yml", "utf8")

describe("routine-automerge.yml safety properties", () => {
  it("runs on pull_request, never pull_request_target (which would hand forks a write token)", () => {
    expect(WF).toMatch(/^on:\n  pull_request:/m)
    expect(WF).not.toMatch(/pull_request_target/)
  })

  it("only considers routine/* branches from this repository that are not drafts, targeting Version-3", () => {
    expect(WF).toMatch(/startsWith\(github\.event\.pull_request\.head\.ref, 'routine\/'\)/)
    expect(WF).toMatch(/github\.event\.pull_request\.head\.repo\.full_name == github\.repository/)
    expect(WF).toMatch(/github\.event\.pull_request\.draft == false/)
    expect(WF).toMatch(/branches: \[Version-3\]/)
  })

  it("runs the gate scripts from the Version-3 checkout, not from the PR", () => {
    expect(WF).toMatch(/uses: actions\/checkout@v\d+\n\s+with:\n\s+ref: Version-3/)
    // The PR head is fetched only as data for the diff, and its SHA is pinned.
    expect(WF).toMatch(/refs\/pull\/\$\{PR\}\/head:refs\/remotes\/origin\/pr-head/)
    expect(WF).toMatch(/test "\$\(git rev-parse origin\/pr-head\)" = "\$HEAD_SHA"/)
  })

  it("gate 1 classifies the PR's own file list with tier.mjs and stops on Tier B", () => {
    expect(WF).toMatch(/git diff --name-only "origin\/Version-3\.\.\.origin\/pr-head" \| tee changed-files\.txt \| node scripts\/routine\/tier\.mjs -/)
  })

  it("gate 2 waits for every other check, ignoring only its own job", () => {
    expect(WF).toMatch(/node scripts\/routine\/wait-for-checks\.mjs/)
    expect(WF).toMatch(/SELF_CHECK: automerge/)
    expect(WF).toMatch(/^  automerge:$/m)
  })

  it("merges with a merge commit, only the exact head that passed the gates", () => {
    expect(WF).toMatch(/gh pr merge "\$PR" --merge --match-head-commit "\$HEAD_SHA"/)
    expect(WF).not.toMatch(/--admin/)
    expect(WF).not.toMatch(/--squash|--rebase/)
  })

  it("verifies production afterwards and opens an issue when it fails", () => {
    expect(WF).toMatch(/node scripts\/routine\/verify-production\.mjs/)
    expect(WF).toMatch(/gh issue create[\s\S]*--label production-monitor/)
  })

  it("asks for no permission beyond what merging and reporting need", () => {
    const block = WF.match(/^permissions:\n((?:  .+\n)+)/m)?.[1] ?? ""
    const granted = block.trim().split("\n").map((l) => l.trim())
    expect(granted.sort()).toEqual(["checks: read", "contents: write", "issues: write", "pull-requests: write", "statuses: read"])
  })
})

describe("wait-for-checks.mjs evaluate()", () => {
  const ok = (name: string) => ({ name, status: "completed", conclusion: "success", started_at: "2026-10-14T10:00:00Z" })
  const vercel = [{ context: "Vercel", state: "success" }]
  const allRequired = REQUIRED_CHECKS.map(ok)

  it("passes only when every required check and the Vercel status succeeded", () => {
    expect(evaluate([...allRequired, ok("Vercel Preview Comments")], vercel).state).toBe("pass")
  })

  it("waits while a required check has not started or is still running", () => {
    expect(evaluate(allRequired.filter((r) => r.name !== "CodeQL"), vercel).state).toBe("pending")
    expect(evaluate([...allRequired.slice(1), { name: "test", status: "in_progress", conclusion: null, started_at: "2026-10-14T10:00:00Z" }], vercel).state).toBe("pending")
  })

  it("waits for the Vercel preview status", () => {
    expect(evaluate(allRequired, []).state).toBe("pending")
    expect(evaluate(allRequired, [{ context: "Vercel", state: "pending" }]).state).toBe("pending")
  })

  it("fails at once on any failed, cancelled or timed-out check, required or not", () => {
    for (const conclusion of ["failure", "cancelled", "timed_out", "action_required"]) {
      const r = evaluate([...allRequired, { name: "monitor", status: "completed", conclusion, started_at: "2026-10-14T10:00:00Z" }], vercel)
      expect(r.state, conclusion).toBe("fail")
    }
  })

  it("fails on a failed or errored commit status", () => {
    expect(evaluate(allRequired, [{ context: "Vercel", state: "failure" }]).state).toBe("fail")
    expect(evaluate(allRequired, [{ context: "Vercel", state: "error" }]).state).toBe("fail")
  })

  it("ignores its own check run, and judges a re-run by its latest attempt", () => {
    const self = { name: "automerge", status: "in_progress", conclusion: null, started_at: "2026-10-14T10:05:00Z" }
    expect(evaluate([...allRequired, self], vercel, REQUIRED_CHECKS, "automerge").state).toBe("pass")
    const failedThenPassed = [
      { name: "test", status: "completed", conclusion: "failure", started_at: "2026-10-14T09:00:00Z" },
      ...allRequired,
    ]
    expect(evaluate(failedThenPassed, vercel).state).toBe("pass")
  })

  it("requires the CodeQL gate check, not just the Analyze job (Trouble Registry Bug 12)", () => {
    expect(REQUIRED_CHECKS).toContain("CodeQL")
  })
})

describe("verify-production.mjs", () => {
  it("extracts only real post slugs from a PR's changed files", () => {
    expect(postSlugs(["content/blog/premier-league-matchweek-7-tv-guide.mdx", "lib/blog/posts.ts", "public/llms-full.txt", "memory-bank/ROUTINE-LOG.md", "content/blog/../../app/x.mdx"])).toEqual(["premier-league-matchweek-7-tv-guide"])
  })

  it("checks the four commercial pages after every deploy", () => {
    expect(KEY_PAGES).toEqual(["/", "/pricing", "/free-trial", "/buy"])
  })
})
