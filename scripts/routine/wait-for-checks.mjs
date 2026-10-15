#!/usr/bin/env node
/**
 * Wait until every other check on a commit has passed, for the routine
 * auto-merge workflow (.github/workflows/routine-automerge.yml).
 *
 * Passes only when:
 *   - every required check run exists and concluded success, and
 *   - every other completed check run concluded success, neutral or skipped, and
 *   - every commit status (Vercel posts one) is success.
 * Fails at once on any failure, cancellation, timeout or error. Exits 1 on
 * failure or when the deadline passes; 0 when everything has passed.
 *
 * Environment: GITHUB_TOKEN, GITHUB_REPOSITORY, SHA, SELF_CHECK (this job's
 * check-run name, ignored), optional TIMEOUT_MINUTES (default 35).
 */
import { pathToFileURL } from "node:url"

/** Checks a routine PR must pass. "CodeQL" is the gate, not the Analyze job. */
export const REQUIRED_CHECKS = ["test", "scan", "CodeQL"]
const OK = new Set(["success", "neutral", "skipped"])

/**
 * Decide from one snapshot. Returns { state: "pass" | "fail" | "pending", why }.
 */
export function evaluate(checkRuns, statuses, required = REQUIRED_CHECKS, self = "") {
  const runs = checkRuns.filter((r) => r.name !== self)
  // Latest run per name wins (re-runs append).
  const byName = new Map()
  for (const r of runs) {
    const prev = byName.get(r.name)
    if (!prev || new Date(r.started_at ?? 0) >= new Date(prev.started_at ?? 0)) byName.set(r.name, r)
  }
  for (const r of byName.values()) {
    if (r.status === "completed" && !OK.has(r.conclusion)) return { state: "fail", why: `${r.name} concluded ${r.conclusion}` }
  }
  for (const s of statuses) {
    if (s.state === "failure" || s.state === "error") return { state: "fail", why: `status ${s.context} is ${s.state}` }
  }
  for (const name of required) {
    const r = byName.get(name)
    if (!r) return { state: "pending", why: `${name} has not started` }
    if (r.status !== "completed") return { state: "pending", why: `${name} is ${r.status}` }
  }
  const unfinished = [...byName.values()].find((r) => r.status !== "completed")
  if (unfinished) return { state: "pending", why: `${unfinished.name} is ${unfinished.status}` }
  if (!statuses.length) return { state: "pending", why: "no commit status yet (Vercel preview)" }
  const waiting = statuses.find((s) => s.state !== "success")
  if (waiting) return { state: "pending", why: `status ${waiting.context} is ${waiting.state}` }
  return { state: "pass", why: "all checks and statuses passed" }
}

async function gh(path) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${path}`, {
    headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: "application/vnd.github+json" },
  })
  if (!res.ok) throw new Error(`GitHub ${path}: HTTP ${res.status}`)
  return res.json()
}

async function main() {
  const sha = process.env.SHA
  const deadline = Date.now() + Number(process.env.TIMEOUT_MINUTES ?? 35) * 60_000
  for (;;) {
    const runs = (await gh(`/commits/${sha}/check-runs?per_page=100`)).check_runs ?? []
    const combined = await gh(`/commits/${sha}/status`)
    const latest = new Map()
    for (const s of combined.statuses ?? []) if (!latest.has(s.context)) latest.set(s.context, s)
    const verdict = evaluate(runs, [...latest.values()], REQUIRED_CHECKS, process.env.SELF_CHECK ?? "")
    console.log(`${new Date().toISOString()} ${verdict.state}: ${verdict.why}`)
    if (verdict.state === "pass") return
    if (verdict.state === "fail") process.exit(1)
    if (Date.now() > deadline) {
      console.log("deadline passed — not merging")
      process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 30_000))
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main().catch((e) => { console.error(e.message); process.exit(1) })
