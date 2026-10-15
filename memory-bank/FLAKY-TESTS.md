# FLAKY-TESTS — Smart Live TV

The quarantine table for `test.skip` / `test.fixme` entries. Enforced by `tests/flaky-policy.test.ts`.

Rules (from `playbook/skills/flaky-test-policy.md`):
- Every `test.skip` in `tests/` or `e2e/` must have a matching row here.
- Every row here must have a matching `test.skip`.
- No row older than 30 days.
- `test.only` is banned outright (checked separately).

Fields: **Test** (path plus test name) · **Since** (YYYY-MM-DD) · **Why it flakes** (specific — not "sometimes fails") · **Owner**.

---

## Current entries

_No entries as of 2026-09-15._

Verified by walking `tests/` and `e2e/` with `\b(it|test)\.(skip|fixme)\(` — see `tests/flaky-policy.test.ts`.
