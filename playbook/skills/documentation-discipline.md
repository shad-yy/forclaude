---
name: documentation-discipline
description: Four files carry the standing state of an API-driven project — QA-LOG (per-fix history), OPEN-WORK (register of live items with exceptions), FLAKY-TESTS (quarantine table), SETUP-REQUIRED (env vars, config gotchas). Each is enforced by a test so it cannot drift silently. Every fix gets an entry with date, layer, severity, symptom, cause, test evidence, commit hash, and result.
---

# The docs are tests

Documentation that isn't enforced rots. In an API-driven project the state moves quickly (providers change, keys rotate, defects land), and prose that used to describe reality soon describes a fiction the reader trusts.

Four files, each enforced by a test:

## The four files

### 1. QA-LOG.md — per-fix history

Every meaningful defect gets one entry, ordered newest first, with:

- **ID** (`A-01`, `T-ENV-20`, `F-01`) — stable, referred to elsewhere.
- **Title** — short, informational.
- **Date** — YYYY-MM-DD, absolute, no "yesterday".
- **Commit hash** — the fix commit; must resolve.
- **Layer** — L1 UI, L2 client, L3 API route, L4 orchestration, L5 provider, L6 cache, L7 monitoring.
- **Severity** — critical / high / medium / low.
- **Was** — the previous behaviour, described precisely.
- **Now** — the current behaviour, and why it is safe.
- **Test** — the file that locks it; before/after counts (red 3/4 before, green 4/4 after).
- **Skill/agent used** — none, MSW, module mock, structural, spy — states which seam.
- **Run it** — the exact command to reproduce.
- **Result** — a full-suite figure with a date.
- **Still open in A-XX** — a link to items in the same series that remain.

Enforcement: a test parses this file and asserts every commit hash resolves in git.

### 2. OPEN-WORK.md — the register

The set of items currently open. Each entry:

- **Since** — YYYY-MM-DD.
- **Layer** — which one.
- **Owner** — the last person to touch it.
- **Why it isn't done** — a specific reason (data dependency, business gate, waiting on a maintainer).
- **What would close it** — a stateable criterion.

Enforcement: a test refuses entries older than N days without an updated "Why". The register is not a to-do list; it is a claim about the state of the world.

### 3. FLAKY-TESTS.md — the quarantine table

For any test skipped due to flakiness (see `flaky-test-policy`), a row with:

- **Test** — full path plus test name.
- **Since** — YYYY-MM-DD.
- **Why it flakes** — a specific reason, not "sometimes fails".
- **Owner** — who is fixing it.

Enforcement:

- Every `test.skip` in `tests/` and `e2e/` must have a row.
- Every row must have a matching `test.skip`.
- No row older than 30 days.
- No `test.only` anywhere.

### 4. SETUP-REQUIRED.md — env vars and config gotchas

- Every env var the site uses: name, purpose, whether required, what happens when it's missing (empty picker, silent 404, degraded film section, error).
- Every "invisible" config value (`process.env.NEXT_PUBLIC_*`) with the note that changing it needs a redeploy.
- Every deleted-secret story: "this was removed on <date>, do not reintroduce".
- Runtime vs build-time distinction called out for each variable.

Enforcement: a test walks `lib/config/env.ts` (or wherever), extracts every `process.env.<NAME>` reference, and asserts each name appears in this file.

## Rules

1. **Every fix is logged.** No merged PR without a QA-LOG entry, no exceptions.
2. **Every date is absolute.** "Two weeks ago" is a bug in a document; a reader in six months will not know what day that means.
3. **Every commit hash is verifiable.** A test asserts every hash in `PROGRESS.md`, `QA-LOG.md`, and `SETUP-REQUIRED.md` resolves in git. This project cited `174d51c` in three places; the hash never existed.
4. **Every count is derived.** A doc quoting "381 tests" gets a test that pulls the number from the Vitest JSON reporter.
5. **Standing corrections at the top of QA-LOG.** When an earlier document has misquoted (e.g. wrong count, wrong hash), the correction lives at the top of `QA-LOG.md` with the date it was found and where it appeared.
6. **A rule with exceptions has an exception register.** See `repo-hygiene.test.ts` in this project — the rule is "no forbidden domain in executable code"; comments explaining the rule are allowed. The register is testable and each entry has a reason.
7. **No draft, no TODO, no "later".** If it isn't ready to publish, it isn't merged. `OPEN-WORK.md` is where "later" lives.

## The one-page test

```ts
// tests/log-hygiene.test.ts
import { readFileSync } from "node:fs"
import { execSync } from "node:child_process"

const files = ["memory-bank/QA-LOG.md", "memory-bank/PROGRESS.md", "memory-bank/SETUP-REQUIRED.md"]

it("every commit hash mentioned resolves in git", () => {
  const missing: string[] = []
  for (const f of files) {
    const text = readFileSync(f, "utf8")
    const hashes = [...text.matchAll(/\b([0-9a-f]{7,40})\b/g)].map(m => m[1])
    for (const h of hashes) {
      try { execSync(`git rev-parse --verify ${h}^{commit}`, { stdio: "ignore" }) }
      catch { missing.push(`${f}: ${h}`) }
    }
  }
  expect(missing).toEqual([])
})

it("every date is YYYY-MM-DD", () => {
  const relative = /\b(yesterday|today|last week|recently|soon|later)\b/i
  for (const f of files) {
    const t = readFileSync(f, "utf8").replace(/```[\s\S]*?```/g, "")
    const hit = t.match(relative)
    expect(hit, `${f} contains relative date "${hit?.[0]}"`).toBeNull()
  }
})
```

## Anti-patterns

- "Recently we fixed…" — a date exists; use it.
- Commit hashes cited without a git check.
- Counts quoted without derivation.
- A quarantine table with no expiry.
- A "still open" list with no exceptions register — items either get fixed or the reason gets stated.
- Docs that duplicate what git and grep already know (file structure, dependencies, function signatures).

## Related

- `never-count-with-grep` — counts in docs are derived, not typed.
- `flaky-test-policy` — the quarantine half.
- `runtime-env-and-middleware-safety` — the env-var half.
