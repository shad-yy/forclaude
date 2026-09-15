# QA-LOG — Smart Live TV

Per-fix history, newest first. Enforced by `tests/log-hygiene.test.ts`.

Fields (from `playbook/skills/documentation-discipline.md`):
ID · Title · Date · Commit · Layer · Severity · Was · Now · Test · Skill · Run · Result.

Layer key: L1 UI · L2 client · L3 API route · L4 orchestration · L5 provider · L6 cache · L7 monitoring · L0 tooling/CI/docs.

---

## Standing corrections

Corrections carried at the top per `documentation-discipline` rule 5. When an earlier document misquoted a fact, the correction lives here with the date it was found and where it appeared.

- **2026-09-15 — `vitest.config.ts:10` embeds a 512-bit hex fallback for `JWT_SECRET` in a checked-in file.** The value is 128 hex characters, i.e., a real signing-appropriate secret, not a random-looking placeholder. If this value was ever the production `JWT_SECRET`, it is leaked in git history and must be rotated. Not verified this session which production value was in use when the fallback was added. Registered in `memory-bank/OPEN-WORK.md` (O-01). Do not delete the fallback until the rotation decision is made — see `runtime-env-and-middleware-safety` rule 4 (env-var deletion needs a full-file grep).
- **2026-09-15 — `.github/workflows/ci.yml` fires only on push/PR to `main`, but the active branch is `Version-3`.** So CI has not been running on any change to the production branch. This is a systemic gap, not a one-off. Registered in `OPEN-WORK.md` (O-02). Local `tsc --noEmit` and `vitest run` are the only gates until the trigger is corrected.
- **2026-09-15 — `memory-bank/PATTERNS.md` §Error Handling instructs code to return `[]` on API error.** This is the exact anti-pattern `api-fault-vs-absence` exists to prevent. The two rules are mutually exclusive; PATTERNS.md is older but encoded in existing code. Registered in `OPEN-WORK.md` (O-03) as a design decision the maintainer must make.

---

## Entries

### A-01 — Install playbook skill pack + documentation-discipline enforcement

- **Date**: 2026-09-15
- **Commit**: `d7461ba` (batch 1: 5 skills), `d1a8796` (batches 2-4: 9 skills + integration prompt), `fdc27eb` (batch 5: flaky-test-policy + INDEX.md); this row itself lands in a follow-up commit whose hash is added when this entry is next amended.
- **Layer**: L0 (tooling/docs).
- **Severity**: medium — foundational, not a defect fix.
- **Was**: no `playbook/` directory. No `memory-bank/QA-LOG.md`, `OPEN-WORK.md`, `FLAKY-TESTS.md`, or `SETUP-REQUIRED.md`. No enforcement tests. `PROGRESS.md` cited hash `f67cb49` — verified resolves — but had no other discipline around dates or env-var coverage.
- **Now**: 15 skills at `playbook/skills/*.md`; `playbook/INDEX.md` derived from frontmatter by `playbook/scripts/build-index.mjs`; the four memory-bank files exist; `tests/log-hygiene.test.ts` and `tests/flaky-policy.test.ts` enforce the discipline. Red-first proof: the log-hygiene test failed 4/10 before the seed files existed (existence, hash-resolves, no-relative-dates, SETUP-REQUIRED coverage), then went green after seed.
- **Test**: `tests/log-hygiene.test.ts` (10 assertions across 5 describes), `tests/flaky-policy.test.ts` (5 assertions across 3 describes). Red 4/10 before seed; green 10/10 after.
- **Skill/agent used**: structural + `readdir` walker, per `layered-testing-strategy`. Each structural test carries a control against a vacuously-empty walk, per rule "a suite with 4 assertions and 0 controls proves nothing".
- **Run it**: `npx vitest run tests/log-hygiene.test.ts tests/flaky-policy.test.ts`.
- **Result**: full local suite result recorded when `tests/log-hygiene.test.ts` first runs against the CI environment; deferred until CI trigger is fixed (see O-02).
- **Still open in**: none. This entry closes install; individual defects (middleware throw, admin rate limiter, IndexNow gating) are their own follow-up entries under future A-XX IDs.
