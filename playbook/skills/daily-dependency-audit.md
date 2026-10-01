---
name: daily-dependency-audit
description: CI on push catches an advisory the moment someone commits, and never otherwise. Advisories arrive on their own schedule. Add a separate scheduled workflow that fails only on critical prod-tree advisories; the full dev tree is reported for context but does not gate. Fail on unreadable JSON — a tool that produced no report has told you nothing.
---

# CI-on-push is not enough

Advisories are asynchronous: they appear when a maintainer publishes an issue, not when you push. If your only trigger is `push` or `pull_request`, an advisory can sit hot for weeks on a repository nobody touched.

## The incident

**2026-09-08.** `pnpm audit --prod` reports 0. Clean. Green.

**2026-09-10.** Same command reports **2 critical remote-code-execution advisories** in Next.js, one of them in the Image Optimization API the site uses.

**Nothing had been pushed in between.** CI had not run. Nothing alerted. Both advisories were found because a person happened to type the command while answering an unrelated question. The vulnerability itself is routine; the *absence of anything that checks* is the defect.

The file `SECURITY-ADVISORIES.md`, whose own first line warned that its numbers "have a shelf life", had gone stale in **two days**.

## Rules

1. **A separate scheduled workflow** (`dependency-audit.yml`), not a schedule added to CI. Running the whole suite daily to answer a question that takes 15 seconds makes a daily red X ambiguous — was it the tests or the audit? A job that does one thing fails for one reason.
2. **Daily is enough.** The signal is "does this dependency tree carry a critical advisory *today*"; the answer changes on the provider's schedule, not yours. Hourly is noise; weekly is too coarse.
3. **Off-hour minute** (e.g. `23 6 * * *`), not on the hour. Cron at :00 queues behind everything else; a queued run is a delayed answer to a "how long has this been open" question.
4. **Fail on critical prod only.** The full dev tree carries advisories that don't ship (build tooling, test libraries) — vite, eslint, tailwindcss, autoprefixer, autocannon, lint-staged. A gate red every morning gets disabled inside a fortnight, taking the credibility of every other check with it.
5. **High/moderate/low in prod tree** → warning in the run summary, not a failure. Raise the threshold deliberately if this becomes normal; do not gate on it by default.
6. **Unreadable JSON = failure.** A tool that failed to produce a report has told you nothing. "Nothing" must never be read as "nothing wrong" — the same distinction the health probe draws.
7. **Report both trees**, gate on one. The workflow prints the full-tree audit in the summary "so a reader can see the whole picture", but only the prod-tree critical count fails the job.
8. **`--ignore-scripts` on install for the audit job.** The job only needs the tree, never runs code, and a postinstall script is precisely the thing an audit exists to warn about.

## Implementation

```yaml
# .github/workflows/dependency-audit.yml
name: Dependency audit
on:
  schedule: [{ cron: "23 6 * * *" }]                # off-hour minute
  workflow_dispatch:
concurrency: { group: dependency-audit, cancel-in-progress: true }
permissions: { contents: read }
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile --ignore-scripts
      - name: Audit production dependencies
        run: |
          set +e
          pnpm audit --prod --json > audit.json
          set -e
          node scripts/audit-gate.mjs
      - name: Full tree, for context
        if: always()
        run: pnpm audit || true
```

```js
// scripts/audit-gate.mjs
import { readFileSync, existsSync, appendFileSync } from "node:fs"

const path = process.argv[2] ?? "audit.json"
const summary = process.env.GITHUB_STEP_SUMMARY
const line = s => { console.log(s); if (summary) appendFileSync(summary, s + "\n") }

if (!existsSync(path)) {
  console.error("::error::audit.json missing. pnpm audit produced no report.")
  process.exit(1)
}

let report
try { report = JSON.parse(readFileSync(path, "utf8")) }
catch (e) {
  console.error(`::error::audit.json is unparseable (${e.message}). Treating unreadable as failure.`)
  process.exit(1)
}

const counts = report.metadata?.vulnerabilities ?? {}
line("## Production dependency audit\n\n| Severity | Count |\n| :-- | --: |")
for (const l of ["critical","high","moderate","low","info"]) line(`| ${l} | ${counts[l] ?? 0} |`)

if ((counts.critical ?? 0) > 0) {
  console.error(`::error::${counts.critical} critical in production. These ship to visitors.`)
  process.exit(1)
}
if ((counts.high ?? 0) > 0) {
  console.log(`::warning::${counts.high} high in production. Raise the threshold deliberately if this is normal.`)
}
```

## Verification

- Trigger the workflow manually (`workflow_dispatch`); confirm the summary carries both severity table and full-tree section.
- Simulate a critical prod advisory (edit `audit.json` to synthesize one) and rerun `audit-gate.mjs` locally — it must exit 1.
- Delete `audit.json` and rerun — it must exit 1, not exit 0.
- Add a broken `audit.json` (truncated) and rerun — exit 1.

## Anti-patterns

- Adding `schedule:` to `ci.yml` and hoping the failure is legible.
- Gating on `high` in the dev tree — a build tool DoS advisory is not a shipping risk.
- Suppressing an advisory by removing it from output (`grep -v`).
- Running the audit without `--ignore-scripts`.
- Cron on the hour.
- No JSON summary — nobody reads a run without seeing the tree.

## Related

- `runtime-env-and-middleware-safety` — the other class of failure that requires monitoring, not tests.
- `documentation-discipline` — `SECURITY-ADVISORIES.md` needs a date and an explicit shelf-life note.
