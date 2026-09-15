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

### A-07 — Close race in `provisionTrialAndNotify` (fingerprint before dispatch, lock TTL 30s→300s)

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 1 close.
- **Layer**: L4 orchestration (orders route) + L4 fraud (detect lock).
- **Severity**: high (duplicate-trial admission under lock expiry — a bot could receive multiple free 24h lines for the same canonical email/phone).
- **Was**: (a) `lib/fraud/detect.ts:229` acquired the `fraud:lock:<canonical>` with `ex: 30`. (b) `provisionTrialAndNotify` in `app/api/orders/route.ts` does a cms-8k call + up to three Resend emails; total wall time plausibly > 30 s under panel latency. (c) `recordFraudFingerprints` fired only AFTER successful provision at line 446. Sequence: a duplicate request arriving after lock TTL expired but before fingerprint was written would pass every dedup gate. Security-surface audit E-05.
- **Now**: two-layer fix per the plan (defence-in-depth):
  1. **Extend the lock TTL** from 30 s to 300 s (5 min) in `lib/fraud/detect.ts` — plenty of headroom for any realistic panel latency.
  2. **Move `recordFraudFingerprints` upstream** — from inside `provisionTrialAndNotify` (post-success) to `orders/route.ts` immediately after customer creation, before the panel call. Fingerprint is committed the moment we decide to serve this customer, so dedup is sound even if the lock does expire.
- **Trade-off** (accepted): if the panel call fails, the fingerprint stays written for the TTL (90 days). The customer can no longer re-submit with the same canonical email/phone until an admin clears the fingerprint. Judged acceptable — a failed provision is rare and easier to recover manually than a slew of duplicates.
- **Test**: `tests/provision-race.test.ts` — 2 cases: (a) call-order assertion via `vi.mock` of both `recordFraudFingerprints` and `createTrialAccount` pushing to a shared `callOrder[]` array; asserts the fingerprint's index in that array precedes the panel call's. (b) structural assertion that the lock's `ex:` argument is `>= 300` (reads `lib/fraud/detect.ts` source and greps the constant). Red 2/2 before fix; green 2/2 after.
- **Test setup note**: hit a second iteration when the initial red-test setup left `RESEND_API_KEY` empty — `provisionTrialAndNotify` gates on `resendKey` truthy so `createTrialAccount` never ran, leaving the call-order incomplete. Stubbed `RESEND_API_KEY` to a placeholder and `vi.stubGlobal("fetch", ...)` so the emails don't hit the network. Per `layered-testing-strategy` "if a test could pass on any implementation, it has no discrimination".
- **Skill/agent used**: `layered-testing-strategy` (module mocks for internal call ordering; structural read for the TTL constant).
- **Run it**: `npx vitest run tests/provision-race.test.ts`.
- **Result**: full suite: 148/148 (16 files), tsc clean.
- **Still open in**: `S-06` (three per-instance rate-limit Maps) still open; `X-11` (150-line inline email HTML in orders/route.ts) still open — both scheduled for later batches per plan.

### A-06 — Fail-loud on missing fraud infra for trial provisioning

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 1 close.
- **Layer**: L3 API route + L4 fraud.
- **Severity**: high (silent bypass of every dedup+IP fraud gate when Upstash env unset — the exact class of failure the health-status skill exists to prevent).
- **Was**: `lib/fraud/detect.ts:221-223` returned `{allowed:true}` when Upstash env vars were unset — dedup, IP cooldown, IP rate-limit all silently no-op. A trial request could then provision unlimited times from any IP. Security-surface audit E-04.
- **Now**: two layered changes so the library stays useful while the caller enforces policy:
  1. **Library** (`lib/fraud/detect.ts`): exported `isFraudInfraReady()` — a boolean that answers "can dedup actually run?" (both UPSTASH env vars set). Existing `checkFraud`'s `!redis → allowed:true` contract preserved so paid-order code paths that don't require dedup aren't broken.
  2. **Caller** (`app/api/orders/route.ts`): trial branch now preflights on `isFraudInfraReady()` and returns HTTP 503 with an honest "service unavailable" message when Redis is unreachable. Non-trial orders unaffected.
- **Test**: `tests/fraud-redis-required.test.ts` — 2 cases: Upstash unset → 503 (E-04 path); Upstash set → not 503 (control that the 503 is our new branch, not something else). Red 1/2 before fix; green 2/2 after.
- **Iteration note**: first attempt tried to change the library contract directly (return `{allowed:false, flagType:'redis_unavailable'}` from `checkFraud` when `!redis`). Broke 8 existing tests in `fraud-detection-advanced.test.ts` that depend on `!redis → allowed:true` for their setup. Reverted to the split above — library stays library, policy lives in caller. Per `reasonable` rule: minimal blast radius. Second iteration also required stubbing `@upstash/redis` in `tests/orders-api.test.ts` because the fraud test cases (honeypot/speed/disposable) now need `isFraudInfraReady()` to return true to reach the fraud gate under test, and real Upstash calls to a stubbed URL hang on DNS lookup.
- **Skill/agent used**: `layered-testing-strategy` (module-level `vi.mock('@upstash/redis')` to eliminate network I/O; `NextRequest` directly against POST handler).
- **Run it**: `npx vitest run tests/fraud-redis-required.test.ts`.
- **Result**: full suite: 146/146 (15 files), tsc clean.
- **Still open in**: cron path (`app/api/cron/trial-followups/route.ts`) — not touched. If cron also creates customer records without Redis it would similarly silently no-op; deferred to a coverage pass.

### A-05 — Close X-Forwarded-For loopback bypass in fraud IP checks

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 1 close.
- **Layer**: L4 orchestration (orders route) + L4 fraud (detect).
- **Severity**: high (rate-limit bypass — attacker sending `X-Forwarded-For: 0.0.0.0` disabled all IP fraud gates).
- **Was**: `app/api/orders/route.ts:43-45` extracted the client IP by preferring raw `x-forwarded-for` over `x-real-ip`, then `lib/fraud/detect.ts:331` unconditionally returned `allowed:true` for `0.0.0.0` or `127.0.0.1`. Together this meant an attacker's `X-Forwarded-For: 0.0.0.0` disabled the IP cooldown (1 req / 3 min) and 48h rate-limit entirely. Security-surface audit E-02.
- **Now**: new `lib/security/client-ip.ts` with `getClientIp(headers)` — prefers `x-real-ip` (Vercel-set, unforgeable by client), falls through XFF's leftmost non-loopback entry, returns null on nothing usable. `orders/route.ts` uses it; `detect.ts` now calls `shouldBypassIpChecks(ip)` which only returns true in non-production. In production a `0.0.0.0` arriving at the gate means header extraction failed — treat as suspicious, run the full IP checks.
- **Test**: `tests/client-ip-spoof.test.ts` — 7 cases: XFF-only-loopback returns null; `x-real-ip` wins over XFF; XFF list falls through to first non-loopback; empty headers return null; `x-real-ip` carrying loopback is ignored; NODE_ENV=development bypasses loopback; NODE_ENV=production does NOT bypass loopback (E-02 attack path). Red 7/7 before fix (module didn't exist); green 7/7 after.
- **Skill/agent used**: `layered-testing-strategy` (pure helper unit tests + module reload for env-dependent branches).
- **Run it**: `npx vitest run tests/client-ip-spoof.test.ts`.
- **Result**: full suite: 144/144 (14 files), tsc clean.
- **Still open in**: `S-06` — three separate in-memory `Map` rate limiters (middleware, admin-auth login, subscribe) are all per-instance. Not this fix's scope.

### A-04 — Wire hCaptcha server-side verification on trial requests

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 1 close.
- **Layer**: L3 API route + L0 helper.
- **Severity**: high (bot-protection bypass — any script could submit trial requests).
- **Was**: `components/trial/TrialForm.tsx:82` posted `captchaToken` in the body; `orders/route.ts`'s Zod schema had no `captchaToken` field so Zod stripped it silently; grep for `hcaptcha.com/siteverify` and `HCAPTCHA_SECRET` returned zero hits across the entire tree. hCaptcha was purely a client-side widget with no server enforcement. Security-surface audit E-01.
- **Now**: new `lib/security/captcha.ts` exports `verifyCaptcha(token)` — returns `{ok:true}` when `HCAPTCHA_SECRET` unset (dev/CI), rejects with a reason otherwise. `orderSchema` now includes `captchaToken` so the field survives parsing. `orders/route.ts` calls `verifyCaptcha` immediately before the fraud gate on the trial branch; a failure returns 403 with a reason string (`missing_token`, `verification_failed`, `verification_error`). `SETUP-REQUIRED.md` documents `HCAPTCHA_SECRET` as required-in-production with the failure mode called out.
- **Test**: `tests/hcaptcha-server-verify.test.ts` — 3 cases: (a) missing token with `HCAPTCHA_SECRET` set → 403; (b) `siteverify` returns `success:false` → 403; (c) `HCAPTCHA_SECRET` unset (dev) → does not 403. All fetch calls stubbed; loud failure if the route tries an outbound call it shouldn't. Red 2/3 before fix; green 3/3 after.
- **Skill/agent used**: `layered-testing-strategy` (module-level `fetch` stub + `NextRequest` directly against POST handler).
- **Run it**: `npx vitest run tests/hcaptcha-server-verify.test.ts`.
- **Result**: full suite: 137/137 (13 files), tsc clean.
- **Still open in**: `/api/subscribe` does not currently ship a `captchaToken` from the client — enforcement there is deferred to when the newsletter form grows a captcha widget. Not in scope.

### A-03 — Close `/api/admin/test-panel` secret-bypass; rename to `provision-test-trial`

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 1 close.
- **Layer**: L3 API route.
- **Severity**: high (authentication bypass; anyone with `JWT_SECRET` or `CRON_SECRET` could hit an admin endpoint that provisions a real cms-8k trial).
- **Was**: `app/api/admin/test-panel/route.ts:17-19` accepted `?secret=` or `Authorization: Bearer` matching either `ENV.JWT_SECRET` or `process.env.CRON_SECRET`. Line 52 then called `createTrialAccount` and returned the live credentials. The two secrets are for signing JWTs and authorising Vercel Cron respectively — neither was designed as an auth-by-value credential for a provisioning endpoint. Security-surface audit E-03.
- **Now**: endpoint moved to `app/api/admin/provision-test-trial/route.ts`. Only accepts the `admin-session` cookie, verified via `jose.jwtVerify(token, JWT_SECRET)`. On success logs `[PROVISION-DIAG] admin=<sub> running trial creation for <name>` so a maintainer can trace who invoked it. Old path deleted; no callers in `app/` or `components/` (grep confirmed) so no UI wire-up broke.
- **Test**: `tests/admin-provision-auth.test.ts` — 4 cases: no auth, `?secret=<JWT_SECRET>`, `Authorization: Bearer <JWT_SECRET>`, `?secret=<CRON_SECRET>`. All must return 401. Red 4/4 before fix (route didn't exist at new path; then bypass would grant access at old path); green 4/4 after. Existing `tests/orders-api.test.ts` gate tests updated to new path — remain green.
- **Skill/agent used**: `layered-testing-strategy` (module import + `NextRequest` directly; `vi.mock` of the panel client so the auth test doesn't hit a real provision).
- **Run it**: `npx vitest run tests/admin-provision-auth.test.ts`.
- **Result**: full suite: 134/134 passing (12 files), up from 130/130 before (my 4 added). `tsc --noEmit`: 0 errors.
- **Still open in**: none for E-03. Broader admin-route JWT-check boilerplate (X-06 — same 20-line block in `metrics/`, `health/`, `health/report/`) is a separate cleanup, not in this scope.

### A-02 — Redact PII from cms8k panel-response logs

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 1 close (see `<Batch 1 hash consolidation>` entry).
- **Layer**: L5 provider.
- **Severity**: high (customer credentials leaking to console logs, therefore to Vercel Log Drains).
- **Was**: `lib/panel/cms8k.ts` logged raw panel response text at three call sites: line ~240 (`responseText.slice(0, 300)` — includes password), line ~271 (`responseText.slice(0, 200)` on failure), line ~310 (full `responseText`, no slice — most severe). Xtream-Codes panel responses are JSON containing a `password` field, so every trial creation dumped the trial line's password into the log stream. Security-surface audit agent flagged as E-06.
- **Now**: introduced `lib/log/redact.ts` with `summarizeResponse(text)` — parses JSON safely and returns `result=<v> keys=<sorted> hasPassword=<bool>`. All three call sites in `cms8k.ts` now log the summary. Debug diagnostics preserved (result, presence of password, all top-level keys); the values themselves stay out of logs.
- **Test**: `tests/pii-redaction.test.ts` — stubs `fetch` to return a panel response with a deliberate `HUNTER2ABC123` password, spies on `console.{log,warn,error}`, asserts no call contains that string. Control test asserts the fixture actually contains the secret (guards against a vacuous pass). Red 1/2 before fix; green 2/2 after.
- **Skill/agent used**: `layered-testing-strategy` (module-level `fetch` stub + console spy; positive assertion paired with control that would fail a trivially wrong implementation).
- **Run it**: `npx vitest run tests/pii-redaction.test.ts`.
- **Result**: full suite: 130/130 passing (11 files) after fix, up from 128/128 before (my 2 added). `tsc --noEmit`: 0 errors.
- **Still open in**: `lib/panel/cms8k.ts` still has `[CMS8K SESSION] Error creating line via session:` (line ~329) and `[CMS8K] Get credentials error:` (line ~426) logging error objects — the error messages themselves may include URLs with cookies. Not fixed this commit — narrow scope per `reasonable` rule. Registered in OPEN-WORK as follow-up.
- **Simplification note**: `cms8k.ts` header comment was over-verbose (listed env vars that now belong in `SETUP-REQUIRED.md`); shortened by ~10 lines and cross-referenced the setup doc. No behavioural change.

### A-01 — Install playbook skill pack + documentation-discipline enforcement

- **Date**: 2026-09-15
- **Commit**: `d7461ba` (batch 1: 5 skills), `d1a8796` (batches 2-4: 9 skills + integration prompt), `fdc27eb` (batch 5: flaky-test-policy + INDEX.md), `6444b4e` (enforcement tests + seed of the four memory-bank files), `<amendment>` (this row updated to name `6444b4e`).
- **Layer**: L0 (tooling/docs).
- **Severity**: medium — foundational, not a defect fix.
- **Was**: no `playbook/` directory. No `memory-bank/QA-LOG.md`, `OPEN-WORK.md`, `FLAKY-TESTS.md`, or `SETUP-REQUIRED.md`. No enforcement tests. `PROGRESS.md` cited hash `f67cb49` — verified resolves — but had no other discipline around dates or env-var coverage.
- **Now**: 15 skills at `playbook/skills/*.md`; `playbook/INDEX.md` derived from frontmatter by `playbook/scripts/build-index.mjs`; the four memory-bank files exist; `tests/log-hygiene.test.ts` and `tests/flaky-policy.test.ts` enforce the discipline. Red-first proof: the log-hygiene test failed 4/10 before the seed files existed (existence, hash-resolves, no-relative-dates, SETUP-REQUIRED coverage), then went green after seed.
- **Test**: `tests/log-hygiene.test.ts` (10 assertions across 5 describes), `tests/flaky-policy.test.ts` (5 assertions across 3 describes). Red 4/10 before seed; green 10/10 after.
- **Skill/agent used**: structural + `readdir` walker, per `layered-testing-strategy`. Each structural test carries a control against a vacuously-empty walk, per rule "a suite with 4 assertions and 0 controls proves nothing".
- **Run it**: `npx vitest run tests/log-hygiene.test.ts tests/flaky-policy.test.ts`.
- **Result**: full local suite result recorded when `tests/log-hygiene.test.ts` first runs against the CI environment; deferred until CI trigger is fixed (see O-02).
- **Still open in**: none. This entry closes install; individual defects (middleware throw, admin rate limiter, IndexNow gating) are their own follow-up entries under future A-XX IDs.
