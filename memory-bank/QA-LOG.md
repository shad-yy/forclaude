# QA-LOG — Smart Live TV

Per-fix history, newest first. Enforced by `tests/log-hygiene.test.ts`.

Fields (from `playbook/skills/documentation-discipline.md`):
ID · Title · Date · Commit · Layer · Severity · Was · Now · Test · Skill · Run · Result.

Layer key: L1 UI · L2 client · L3 API route · L4 orchestration · L5 provider · L6 cache · L7 monitoring · L0 tooling/CI/docs.

---

## Standing corrections

Corrections carried at the top per `documentation-discipline` rule 5. When an earlier document misquoted a fact, the correction lives here with the date it was found and where it appeared.

- **2026-09-15 — "Full local suite green" was insufficient evidence during A-02..A-11.** I ran `npx vitest run` locally (which uses `package-lock.json`), but CI uses `pnpm install --frozen-lockfile` (which uses `pnpm-lock.yaml`). The two lockfiles resolve different versions, and vitest 4.1.4 pinned in `pnpm-lock.yaml` was incompatible with the co-pinned `vite@5.4.21`. Every A-02..A-11 commit therefore passed locally but was red on CI once A-09 enabled the trigger. Corrected in A-12 (downgrade to vitest 3.x for vite-5 compatibility). Going forward: always run `pnpm install --frozen-lockfile && pnpm vitest --run` before pushing.

- **2026-09-15 — `vitest.config.ts:10` embedded a 512-bit hex fallback for `JWT_SECRET` in a checked-in file.** The value was 128 hex characters, i.e., a real signing-appropriate secret, not a random-looking placeholder. **Replaced in A-11** (this session) with an obviously-fake test-only value plus a "NEVER commit a real JWT_SECRET" guard-comment; enforcement test at `tests/no-credential-shaped-hex-in-repo.test.ts` refuses any regression. The **historical value remains in git history** (cannot be un-committed): if it was ever the production `JWT_SECRET`, it must be rotated in Vercel. Not verified this session which production value was in use when the fallback was added — the maintainer must check Vercel dashboard history to make the rotation decision. O-01 in OPEN-WORK remains open on that action item.
- **2026-09-15 — `.github/workflows/ci.yml` fires only on push/PR to `main`, but the active branch is `Version-3`.** So CI has not been running on any change to the production branch. This is a systemic gap, not a one-off. Registered in `OPEN-WORK.md` (O-02). Local `tsc --noEmit` and `vitest run` are the only gates until the trigger is corrected.
- **2026-09-15 — `memory-bank/PATTERNS.md` §Error Handling instructs code to return `[]` on API error.** This is the exact anti-pattern `api-fault-vs-absence` exists to prevent. The two rules are mutually exclusive; PATTERNS.md is older but encoded in existing code. Registered in `OPEN-WORK.md` (O-03) as a design decision the maintainer must make.

---

## Entries

### B-02 — News scraper stops shipping to the browser (S-01 last real violation)

- **Date**: 2026-09-16
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L1 UI + L3 API route (new proxies).
- **Severity**: medium (bundle bloat + partial-abstraction leak; not an active exploit but a PATTERNS.md non-negotiable).
- **Was**: `app/news/NewsClientPage.tsx:12` (`"use client"`) directly imported `@/lib/api/news`, so the news scraper module and its transitive deps shipped into the browser bundle. Per O-12 scoping, this was the ONLY real S-01 violation left in the codebase — the other 6 originally cited were either Server Components (allowed) or client components using `unifiedSportsAPI` (the higher-level abstraction PATTERNS.md points clients to).
- **Now**: two server-side proxy routes — `app/api/news/search` (Zod-validated `q` + `pageSize`) and `app/api/news/trending` (no params) — each calling `newsAPI.*` server-side. `NewsClientPage.tsx` rewritten to `fetch("/api/news/search?...")` / `fetch("/api/news/trending")`, `newsAPI` import dropped. Type-only imports from `@/lib/api/types` are kept (erased at build time). Both new routes follow the hybrid api-fault-vs-absence rule: 503 + no-store on upstream fault, not 200 with `[]`.
- **Test**: `tests/no-lowlevel-api-in-client-components.test.ts` — 2 assertions: (1) file listing is non-empty (guards against a vacuous pass), (2) no `"use client"` file under `app/` or `components/` imports a low-level provider client. Red 1/2 before fix (NewsClientPage flagged); green 2/2 after. Test's regex exempts `import type …` since type imports contribute nothing to the runtime bundle.
- **Skill/agent used**: `layered-testing-strategy` (structural test against files; `never-count-with-grep`-style non-empty guard so a zero-match pass is caught), `api-fault-vs-absence` (both new proxies return 503 on fault, not empty 200).
- **Run it**: `pnpm vitest --run tests/no-lowlevel-api-in-client-components.test.ts`.
- **Result**: closes O-12 and the last S-01 case. Full suite 209/209 across 32 files; tsc clean.

### B-06 — One Redis-backed rate limiter for all three IP gates (S-06 fix)

- **Date**: 2026-09-16
- **Commit**: `1bb6d7c`.
- **Layer**: L4 middleware + L3 API route.
- **Severity**: high (silent security ceiling — production ceilings scaled with lambda count; `5 per 15 min` became `5 × <instances>`).
- **Was**: three per-file `new Map<string, ...>` limiters — `middleware.ts:6`, `app/api/auth/admin/route.ts:7`, `app/api/subscribe/route.ts:14`. Each per-serverless-instance. Under fan-out (Vercel typically warms multiple lambdas for burst traffic) an attacker gets `advertised limit × <instances>` free attempts. This is the S-06 anti-pattern verbatim.
- **Now**: one shared limiter at `lib/security/rate-limit.ts` exposing `checkRateLimit({ key, limit, windowSeconds })`. Fixed-window semantics via Upstash `INCR` + `EXPIRE` on first hit — matches what the previous three limiters were doing, just made cross-instance. Uses `@upstash/redis` (fetch-based) so it runs in edge middleware. Falls back to a per-process Map with one warning `[RateLimit] UPSTASH_REDIS_REST_URL/TOKEN unset — falling back to per-instance in-memory limits.` when env vars are missing (dev / keyless CI) — same behaviour as before, no worse. Redis errors also fall through to the fallback (never turn rate limiting into a 500).
- **Test**: `tests/rate-limit-helper.test.ts` — 6 assertions across 3 describes: (1) Redis path allows up-to-limit then blocks, (2) buckets isolated by key, (3) fallback still enforces within one process, (4-6) structural refusal of any `new Map<string,` in the three migrated files (regression tripwire so the anti-pattern can't grow back). Red 6/6 before fix, green 6/6 after. Full suite 207/207 across 31 files; `tsc --noEmit` clean.
- **Skill/agent used**: `two-layer-rate-limiting` (shared L1 in Redis), `runtime-env-and-middleware-safety` (never throw from middleware — the fallback keeps middleware alive when Upstash is unset).
- **Run it**: `pnpm vitest --run tests/rate-limit-helper.test.ts`.
- **Result**: closes S-06 and O-05. Production must have `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set (already in `SETUP-REQUIRED.md`); otherwise rate limits stay per-instance and the deploy logs the one-shot warning.

### C-05 — Key-less reproduction script

- **Date**: 2026-09-16
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L0 dev tooling.
- **Severity**: medium (workflow-enabler; the earlier CI failures in A-12/A-13/A-14 would have been caught with this locally in seconds rather than after push).
- **Was**: no standard way to reproduce a CI-only failure without altering the working tree. `reproduce-before-fix` §Anti-patterns explicitly warns against renaming `.env.local` (`.env.local.bak` may already exist and get overwritten).
- **Now**: `scripts/repro-keyless.sh [<sha>]` creates a detached git worktree at `/tmp/repro-<sha>`, refuses to run if `.env`/`.env.local` are present (fail-safe), runs `pnpm install --frozen-lockfile --ignore-scripts && pnpm tsc --noEmit && pnpm vitest --run` in that clean environment, preserves the worktree on failure for inspection, auto-cleans on success. Documented in `SETUP-REQUIRED.md`.
- **Test**: n/a for the script itself — invocation is manual. The script exit code is the signal. Verified locally that a `.env` file present triggers the fail-safe (exit 2).
- **Skill/agent used**: `reproduce-before-fix`, `ci-runs-without-secrets`.
- **Run it**: `scripts/repro-keyless.sh HEAD`.
- **Result**: full suite unchanged at 201/201; script installed.

### B-04.8..12 — Migrate final 5 grandfathered S-03 routes (B-04 COMPLETE)

- **Date**: 2026-09-16
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L3 API route.
- **Severity**: high (SEO deindexing risk on fault-as-empty).
- **Was**: 5 remaining routes — `search`, `events/[id]/lineups`, `spotlight`, `fixtures/today`, `news` — still swallowed faults into empty payloads at status 200. `spotlight` had the additional deeper anti-pattern (`Promise.allSettled(...).map(r => fulfilled ? value : [])` — the exact `api-fault-vs-absence` example — silently masking total upstream outage into empty results).
- **Now**: all five migrated. Standard 3-line catch rewrite for search / lineups / fixtures / news. **spotlight** got an additional inline fault detection: `anySuccess = results.some(r => r.status === 'fulfilled' && r.value.ok)`; when false (total outage), throws → caught by outer 503 branch. Partial degradation (1-2 fetches fail) still degrades gracefully with the successful data.
- **Test**: `tests/routes-fault-vs-absence/batch-8-to-12.test.ts` — 7 cases across 5 describes. Red 5/7 before fix (including a false-positive on spotlight caught by iteration — the initial fix relied on outer catch but Promise.allSettled masked all rejections; fixed by adding the `anySuccess` gate). Green 7/7 after.
- **Skill/agent used**: `api-fault-vs-absence` §D-01b (fault-as-lie), §Anti-patterns rule 3 (allSettled masking), `layered-testing-strategy` (module mocks with per-route describes).
- **Run it**: `pnpm vitest --run tests/routes-fault-vs-absence/`.
- **Result**: full suite: 201/201 (30 files), tsc clean. **B-04 fully closed — all 12 grandfathered S-03 routes migrated to hybrid rule.**

### B-04.1 — Migrate `/api/leagues` to fault-vs-absence (route 1 of 12)

- **Date**: 2026-09-16
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L3 API route.
- **Severity**: high (SEO — Google reads 200-with-empty as "gone" and downweights the URL).
- **Was**: `app/api/leagues/route.ts:14-20` — the catch block returned `{data:[], error:"Data temporarily unavailable"}` with status 200. Grandfathered S-03 anti-pattern per B-01 decision.
- **Now**: catch returns HTTP 503 with `Cache-Control: no-store` and an honest "we could not check just now" error field. The try-path unchanged: resolver returning `[]` legitimately (no throw) still returns 200 with empty data. This preserves the fault/absence distinction the skill demands.
- **Test**: `tests/routes-fault-vs-absence/leagues.test.ts` — 3 cases: thrown fault → 503 with no-store; resolver returns `[]` → 200 with empty; happy path → 200 with data (control). Red 1/3 before fix (thrown fault previously produced 200); green 3/3 after.
- **Skill/agent used**: `api-fault-vs-absence` §Rule 4 (page-level fallback); `layered-testing-strategy` (module mock on unifiedSportsAPI, red-first with control).
- **Run it**: `pnpm vitest --run tests/routes-fault-vs-absence/leagues.test.ts`.
- **Result**: full suite: 179/179 (26 files), tsc clean.
- **Follow-up**: 11 grandfathered S-03 routes remain. Same pattern applies. Each becomes its own commit.

### B-07 — Key `/api/subscribe` rate limit on IP, not email (S-07)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L3 API route.
- **Severity**: medium (rate-limit bypass — one caller could vary the email to fire arbitrarily many subscribe requests per minute from one IP; each hit a Resend email send).
- **Was**: `app/api/subscribe/route.ts:38` did `rateLimitMap.get(validEmail)`. Anyone submitting `a@x.com`, `b@x.com`, `c@x.com`… from one IP inside the 60s window paid nothing per request; each request hit the outbound Resend fetch. Structural anti-pattern S-07.
- **Now**: `rateKey = getClientIp(request.headers) ?? '0.0.0.0'` (helper from A-05). IP is unforgeable via header spoof (A-05 also handles the `X-Forwarded-For: 0.0.0.0` case). Cooldown fires per IP per 60 s regardless of email. The map is still in-memory per-serverless-instance — that's S-06, migrating to Redis is a separate task (B-06).
- **Test**: `tests/subscribe-rate-limit.test.ts` — 2 cases: primary (same IP + different email → second 429), control (different IP + different email → both 200). Red 1/2 before fix, green 2/2 after.
- **Skill/agent used**: `two-layer-rate-limiting` inbound-per-IP rule; `layered-testing-strategy` for the primary + discrimination-control pattern.
- **Run it**: `pnpm vitest --run tests/subscribe-rate-limit.test.ts`.
- **Result**: full suite: 175/175 (25 files), tsc clean.
- **Still open**: `S-06` (three in-memory `Map` rate limiters remain per-instance). This fix closes S-07 fully but not S-06 — the illusory-ceiling problem is unchanged, `subscribe` just no longer has a trivial per-email bypass.

### B-05 — Normalise circuit-breaker key so per-endpoint failures accumulate (S-04)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L5 provider (TheSportsDB).
- **Severity**: medium (breaker never tripped in practice — same class as an alarm you disabled).
- **Was**: `lib/api/the-sports-db.ts:74-96` stored breaker state under the raw `endpoint` string. Every exported call template like `lookupleague.php?id=${leagueId}` produced a different key per league id (4328, 4335, 4344, …). Five consecutive 429s across different ids never accumulated under one key, so the `CIRCUIT_BREAKER_THRESHOLD = 5` was structurally unreachable in the common case. Structural anti-pattern S-04.
- **Now**: exported `normalizeEndpointKey(endpoint)` — strips query string from a relative endpoint; returns `URL.pathname` for a full URL. All three breaker functions (`checkCircuitBreaker`, `recordCircuitBreakerFailure`, `resetCircuitBreaker`) call it before touching the map. Five failures against `lookupleague.php` with varying `?id=` now collapse to one key and trip the breaker as intended.
- **Test**: `tests/circuit-breaker-key.test.ts` — 5 cases: relative endpoint strips query; full URL returns pathname; no-params endpoint intact; empty/edge inputs stable; three different-id calls key IDENTICALLY (the S-04 attack path). Red 5/5 before fix (module didn't export the helper); green 5/5 after.
- **Skill/agent used**: `layered-testing-strategy` (unit test on the extracted helper, not a runtime simulation).
- **Run it**: `pnpm vitest --run tests/circuit-breaker-key.test.ts`.
- **Result**: full suite: 173/173 (24 files), tsc clean.
- **Follow-up**: none for S-04. Broader X-08 (spin-wait in `enqueueRateLimit`) untouched.

### B-03 — Remove hardcoded `/json/123/` TheSportsDB public key from route source (S-02)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L3 API route.
- **Severity**: medium (silent key trap — `THESPORTSDB_API_KEY` was ignored by these routes even when correctly set in Vercel).
- **Was**: `app/api/fixtures/today/route.ts` (3 hits) and `app/api/spotlight/route.ts` (3 hits) baked `https://www.thesportsdb.com/api/v1/json/123/…` directly into fetch URLs. `123` is TheSportsDB's public test key — routes would silently ignore a properly-configured `THESPORTSDB_API_KEY` env var. Named anti-pattern `S-02` (structural anti-pattern from the plan) and the `ci-runs-without-secrets` "|| \"123\" trap institutionalised".
- **Now**: both routes import `ENV` from `lib/config/env.ts` and define a `SPORTSDB_BASE()` helper that reads through `ENV.THESPORTSDB_KEY` (which centralises the fallback + emits a startup warning when the env var is unset). Six URL literals replaced.
- **Test**: `tests/no-hardcoded-sportsdb-key-in-routes.test.ts` — 2 cases: file-scanner control + no-`/json/123/`-in-executable-code assertion. Red 1/2 before fix (6 executable-code hits); green 2/2 after. Comment-strip pattern lifted from `layered-testing-strategy` so QA prose that mentions the literal doesn't self-trip.
- **Skill/agent used**: `ci-runs-without-secrets` (the trap named in rule 5); `layered-testing-strategy` (structural scan with executableOnly comment strip).
- **Run it**: `pnpm vitest --run tests/no-hardcoded-sportsdb-key-in-routes.test.ts`.
- **Result**: full suite: 168/168 (23 files), tsc clean.
- **Still open in**: `app/api/scores/today/route.ts:8` reads `process.env.THESPORTSDB_API_KEY || "123"` inline — same trap in a subtler form. Migrating it to `ENV.THESPORTSDB_KEY` is a small follow-up commit; deferred so this commit stays scoped to the URL-literal removal.

### A-15 — Mitigate GHSA-2xp9-vwfh-vxw4 by removing AVIF from Image Optimizer

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L0 config (Next.js Image Optimizer).
- **Severity**: critical (surfaced by C-01 first-run) — mitigation, not a full fix.
- **Was**: `next.config.mjs:88` declared `formats: ['image/webp', 'image/avif']`. Next.js @ 14.2.35 is vulnerable to `GHSA-2xp9-vwfh-vxw4` — the Image Optimizer allowed unauthenticated RCE when serving AVIF responses. Fix landed in `next@15.5.24`; a full major upgrade (O-11) is a separate project because of Next 15's breaking changes (async `params`, React 19 requirement, etc.).
- **Now**: `image/avif` removed from `images.formats`. Attack path requires an AVIF response from the Image Optimizer; with AVIF disabled, the endpoint negotiates only WebP (or the original format). The underlying `next` binary is still vulnerable but has no live entry point.
- **Trade-off** (accepted): modern browsers no longer get the ~20% size savings of AVIF over WebP. LCP may regress marginally on image-heavy pages. Acceptable while we wait to land the Next 15 upgrade.
- **Test**: `tests/next-image-avif-disabled.test.ts` — 2 cases: config file has an `images.formats` list; the list does NOT include `image/avif`. Red 1/2 before fix (AVIF was in the list); green 2/2 after. Regression tripwire — reintroducing AVIF fails the test with a message pointing back to the CVE.
- **Skill/agent used**: `runtime-env-and-middleware-safety` (config-not-code fix), `documentation-discipline` (structural tripwire prevents regression).
- **Run it**: `pnpm vitest --run tests/next-image-avif-disabled.test.ts`.
- **Result**: full suite: 166/166 (22 files), tsc clean.
- **Still open**: O-11 stays open — the other CVE (`GHSA-p293-qw3h-jr36` Windows-host RCE) is unmitigable in config, and the AVIF mitigation should be REVERTED once `next` is patched. The regression test's own docstring names the CVE so a future maintainer knows why AVIF is disabled and when they can re-enable it.

### C-01 — Install scheduled dependency-audit workflow (finds 2 critical Next.js RCEs live)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L0 CI + L0 dep audit.
- **Severity**: **critical** — surfaced 2 unpatched Next.js RCEs live on production.
- **Was**: no scheduled dependency audit. `pnpm audit --prod` was run manually if at all; advisories that appeared between pushes could sit unreported for weeks. Coverage gap I-05 partly, and the same class of failure `daily-dependency-audit`'s 2026-09-08 incident describes verbatim.
- **Now**: `.github/workflows/dependency-audit.yml` on cron `23 6 * * *` (off-hour + off-minute per the skill), `workflow_dispatch` also. Uses `pnpm install --frozen-lockfile --ignore-scripts` (the audit never runs dep code). Fails only on critical prod-tree; high/moderate/low reported in the run summary for context. `scripts/audit-gate.mjs` implements the gate + prints the offending advisories inline so a maintainer opening a failing run sees the details without clicking through.
- **First-run finding (blocking-severity)**: two `next@14.2.35` RCEs:
  1. **GHSA-p293-qw3h-jr36** — Unauthenticated RCE on Windows-hosted servers. Attack surface: dev machines only (prod is Vercel/Linux).
  2. **GHSA-2xp9-vwfh-vxw4** — Unauthenticated RCE in Image Optimization API when AVIF files are used. Live-exploitable on the deployed site.
  Both fixed in `next@15.5.24`. Registered as OPEN-WORK O-11 with concrete "what would close it" steps.
- **Test**: verified `scripts/audit-gate.mjs` locally against `pnpm audit --prod --json` — exits 1 with a clear itemised markdown report of the 2 criticals + severity table. Exit 0 case: mocked audit.json with `metadata.vulnerabilities.critical: 0` also verified.
- **Skill/agent used**: `daily-dependency-audit` verbatim (cron shape, --ignore-scripts, unreadable JSON = failure, fail on critical only, full tree for context).
- **Result**: the audit gate is now live; its **first scheduled run tomorrow 06:23 UTC will fail** (correctly — the 2 criticals still ship on the deployed site until Next is patched). `workflow_dispatch` also available to trigger on-demand.

### C-04 — Install dependabot + CodeQL + gitleaks + CODEOWNERS + PR template

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L0 GitHub-side automation.
- **Severity**: medium (no active exploit; closes coverage gap I-05 — the entire GitHub-side automation surface was empty).
- **Was**: `.github/` had only `workflows/ci.yml` and `workflows/auto-index.yml`. No dependabot, no CodeQL SAST, no gitleaks secret scan, no CODEOWNERS routing, no PR template. Every PR landed without automated review sign-off routing or a body scaffold. Every dep bump had to be manual.
- **Now**:
  - `.github/dependabot.yml` — weekly npm + github-actions bumps; minor/patch grouped so a maintainer gets one PR per week rather than dozens.
  - `.github/workflows/codeql.yml` — CodeQL security-extended queries for JS/TS on push, PR, and weekly cron (37 04 * * 1) — off-hour + off-minute per `daily-dependency-audit` best-practice.
  - `.github/workflows/gitleaks.yml` — secret scan on push/PR + weekly cron. Complements the narrower in-repo hex enforcer at `tests/no-credential-shaped-hex-in-repo.test.ts` (A-11); gitleaks scans the whole repo + full git history.
  - `.github/CODEOWNERS` — routes every path to `@shad-yy` (the sole maintainer as of 2026-09-15). Explicit lines for the highest-blast-radius paths (`middleware.ts`, `lib/fraud/`, `lib/panel/`, `lib/security/`, `app/api/orders/`, etc.).
  - `.github/pull_request_template.md` — sections for summary, category, skill invoked (playbook), red-first proof, regression checklist, QA-LOG entry, follow-ups.
- **Test**: none — these are pure GitHub-side automation additions. The Codeql / gitleaks workflows will produce their own signal on the next push (CodeQL takes ~5 min); their **first run** result recorded here in a follow-up amendment.
- **Skill/agent used**: `daily-dependency-audit` for cron discipline; `documentation-discipline` for the PR template's red-first + QA-LOG sections.
- **Result**: `1ccf1b8` (A-14) is the first fully green CI on this branch. This commit tests only that the new workflows parse (they either run or GitHub complains about YAML in the Actions tab).
- **Standing hazard**: CodeQL security-extended may flag pre-existing issues on first run. Treat those as findings to triage, not blockers on this commit.

### A-14 — Remove Playwright e2e from PR gate (production-monitor split)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L0 CI.
- **Severity**: high (blocked every PR on failing e2e assertions unrelated to any given change).
- **Was**: `.github/workflows/ci.yml` ran the Playwright suite against `pnpm dev` on `http://localhost:3000` after A-10 correctly unhardcoded `baseURL`. The specs, however, were written as **production monitors** — they assert real production content: `robots.txt` disallow list, `.co.uk` canonicals, "no 'James Harper' author anywhere on site", real blog posts, real schema markup, footer link 200s, buy-form field validation matching production copy. Against a fresh dev server they produced **40 failed / 80 passed** on run 8 (B-01) and identically on run 7 (A-13). Not a regression from B-01 or A-13 — a latent mismatch that A-09 (CI trigger fix) first surfaced.
- **Now**: Playwright steps removed from `ci.yml`. The remaining PR gate is `pnpm install --frozen-lockfile` + `pnpm tsc --noEmit` + `pnpm vitest --run`. Un-blocking the PR gate while preserving all real signal — vitest currently covers 164 tests across 21 files including the structural + policy suites installed this session.
- **Test**: n/a — this is a workflow-file removal, verified by CI itself going green on the next push. Local vitest+tsc: 164/164 green, tsc clean.
- **Follow-up**: `OPEN-WORK.md` O-10 tracks reinstating Playwright as a dedicated scheduled workflow (`.github/workflows/e2e-production-monitor.yml`, cron nightly, `PLAYWRIGHT_BASE_URL=https://smartlivetv.co.uk`). Small workflow, no spec-code changes.
- **Skill/agent used**: `layered-testing-strategy` — unit tests are the PR gate; e2e against a real target is a monitoring concern, separate seam. `reproduce-before-fix` — fetched the CI job logs to identify the 40 specific failing assertions rather than guessing the cause.

### A-13 — Playwright picked up vitest files (extension convention + rename)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in follow-up.
- **Layer**: L0 test infrastructure.
- **Severity**: high (Playwright step of CI red on every commit after A-11 because Playwright tried to require `import { ... } from "vitest"` from files it should never have touched).
- **Was**: A-10 set `playwright.config.ts` `testMatch: ['tests/**/*.spec.ts', 'tests/**/*.test.ts', 'e2e/**/*.spec.ts']` with an enumerated `testIgnore` list of the 19 vitest test files then existing. A-11 (`tests/no-credential-shaped-hex-in-repo.test.ts`) and this-session's B-01 (`tests/upstream-fault-error.test.ts`) added new `*.test.ts` files that weren't added to the ignore list. Playwright therefore tried to load them, encountered `import { describe, it, expect } from "vitest"` in a CJS context, and threw `Error: Vitest cannot be imported in a CommonJS module using require()`.
- **Now**: settled the convention — **vitest owns `*.test.ts`, Playwright owns `*.spec.ts`**. `playwright.config.ts` `testMatch` reduces to `['tests/**/*.spec.ts', 'e2e/**/*.spec.ts']`; the enumerated `testIgnore` is gone entirely. `tests/mobile-responsiveness.test.ts` was actually a Playwright spec — renamed to `tests/mobile-responsiveness.spec.ts` (via `git mv`; history preserved). `vitest.config.ts` `exclude` dropped the now-unneeded mobile entry.
- **Test**: `tests/playwright-config.test.ts` (A-10) still green — the tests it asserts (`testMatch` covers both dirs, `baseURL` env-driven) pass under the new simpler config. Verified `pnpm exec playwright test --list` prints 120 tests across 3 spec files (`e2e/smartlivetv.spec.ts`, `e2e/smoke.spec.ts`, `tests/mobile-responsiveness.spec.ts`).
- **Verification**: `pnpm vitest --run` → 160/160; `pnpm tsc --noEmit` → 0 errors; `pnpm exec playwright test --list` → 120 tests, exit 0.
- **Skill/agent used**: `reproduce-before-fix` (fetched the CI failure logs via GitHub API to identify the file-and-line that broke); `layered-testing-strategy` (structural test A-10 covered the new shape).
- **Lesson recorded**: enumerated ignore lists rot the moment new files land. Convention beats configuration when convention is cheap to enforce (a filename suffix).

### A-12 — Fix vitest/vite version mismatch in `pnpm-lock.yaml` (CI-only failure exposed by A-09)

- **Date**: 2026-09-15
- **Commit**: this commit — hash added in a follow-up amendment.
- **Layer**: L0 tooling.
- **Severity**: high (CI red-out on every push after A-09; entire safety net inert until fixed).
- **Was**: `pnpm-lock.yaml` pinned `vitest@4.1.4` alongside `vite@5.4.21`. Vitest 4.x requires Vite 6+ (which exports `./module-runner`); Vite 5.x does not. Result: `pnpm vitest --run` failed instantly with `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './module-runner' is not defined by "exports" in ../vite@5.4.21/package.json`. Runs 3/4/5 (A-09/A-10/A-11) all conclusion=failure on the same step. Not caused by my code changes; a pre-existing broken lockfile the previous CI setup never surfaced because it didn't run on `Version-3` or `claude/**`.
- **Now**: `package.json` `devDependencies.vitest` and `@vitest/coverage-v8` moved from `^4.1.3` to `^3.2.4`. `pnpm install` regenerated `pnpm-lock.yaml` — resolved versions are 3.2.7 for both, compatible with vite 5.4.21 which stays put. No test API surface changed between the two versions (vitest 3.x → 4.x mostly renames internals; tests use `describe/it/expect/vi` unchanged).
- **Test**: reproduced the CI failure locally (`rm -rf node_modules && pnpm install --frozen-lockfile && pnpm vitest --run`) with the old versions → same stack trace. Same command after the downgrade: 160/160 green across 20 files, `pnpm tsc --noEmit`: 0 errors.
- **Skill/agent used**: `reproduce-before-fix` (CI-only failure reproduced with `pnpm install --frozen-lockfile`, not with the `npm install` I had been using).
- **Run it**: `rm -rf node_modules && pnpm install --frozen-lockfile && pnpm vitest --run && pnpm tsc --noEmit`.
- **Result**: local CI-mode 160/160 green. Awaiting CI run on this commit's push for the on-the-runner confirmation.
- **Standing correction added**: my earlier claim "full local suite green" was based on `npm install`; CI's `pnpm install --frozen-lockfile` reads a different lock. Every commit A-02..A-11 was actually red on CI though I said green. Correction now at the top of this file.

### A-11 — Rotate vitest.config.ts JWT_SECRET fallback + install hex-leak tripwire (I-06, O-01 code half)

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 2 close.
- **Layer**: L0 test infrastructure + tripwire.
- **Severity**: high (a 128-char hex string committed as a fallback JWT signing secret; behaviour indistinguishable from a leaked production secret).
- **Was**: `vitest.config.ts:10` and `tests/admin-metrics.test.ts:4` both contained the same 128-char hex value used as `process.env.JWT_SECRET || <hex>`. Whether or not that value was ever the production secret cannot be determined from the code alone — but the shape of the value is signing-appropriate for HS256 and both files kept it as a working fallback. Standing correction O-01, gap I-06.
- **Now**: both occurrences replaced with `"test-only-jwt-secret-do-not-use-in-prod"` plus an inline guard-comment naming the enforcer. New `tests/no-credential-shaped-hex-in-repo.test.ts` walks `vitest.config.ts` and everything under `tests/` and refuses any line carrying a pure-hex run of ≥ 60 chars. Historical value stays in git history — cannot be un-committed — so O-01 stays open on the "confirm + rotate in Vercel if needed" action.
- **Test**: `tests/no-credential-shaped-hex-in-repo.test.ts` — 2 cases: file-scanner control + no-hex-secret assertion. Red 1/2 before fix; green 2/2 after.
- **Skill/agent used**: `layered-testing-strategy` (structural walker with vacuous-walk control); `documentation-discipline` (standing correction updated in place).
- **Run it**: `npx vitest run tests/no-credential-shaped-hex-in-repo.test.ts`.
- **Result**: full suite: 160/160 (20 files), tsc clean.
- **Still open in**: O-01 remains — the production Vercel `JWT_SECRET` may need rotation depending on whether the removed hex was ever used there.

### A-10 — Fix Playwright orphaning + env-drive baseURL (I-02)

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 2 close.
- **Layer**: L0 test infrastructure.
- **Severity**: high (silent test coverage loss + accidental production traffic on every playwright run).
- **Was**: `playwright.config.ts` used `testDir: './tests'`; every file under `e2e/*.spec.ts` was orphaned — no Playwright run picked them up. `e2e/smartlivetv.spec.ts:4` hardcoded `const BASE = 'https://smartlivetv.co.uk'` so any hypothetical run would hit live production. `tests/mobile-responsiveness.test.ts` and `e2e/mobile-responsiveness.spec.ts` were near-duplicates (single-line diff in selector strictness). Coverage gap I-02.
- **Now**: `playwright.config.ts` rewritten with `testDir: '.', testMatch: ['tests/**/*.spec.ts', 'tests/**/*.test.ts', 'e2e/**/*.spec.ts']` and an explicit `testIgnore` list for vitest specs (all 19 vitest test files). `baseURL` reads `process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'` — no accidental production hits. `e2e/smartlivetv.spec.ts:4` `BASE` constant sourced from the same env var. `e2e/mobile-responsiveness.spec.ts` deleted (the `tests/` variant with the more permissive `Go to ` selector is kept as canonical).
- **Test**: `tests/playwright-config.test.ts` — 3 cases: scanner control (≥ 2 tracked spec files), config picks up both dirs, `baseURL` reads from `process.env.PLAYWRIGHT_BASE_URL`. Red 2/3 before fix; green 3/3 after.
- **Test infra note**: first attempt used `git ls-files 'tests/**/*.spec.ts'` — git's own glob does not expand `**` to arbitrary depth. Fixed by using `:(glob)` pathspec magic prefix.
- **Skill/agent used**: `never-count-with-grep` (git-tracked file list, not a hand-counted claim); `layered-testing-strategy` (structural, with a vacuous-walk control).
- **Run it**: `npx vitest run tests/playwright-config.test.ts`.
- **Result**: full suite: 158/158 (19 files), tsc clean.
- **Follow-up (not this commit)**: Playwright test-run itself against the new config still needs to be validated; the Playwright browser download for the local sandbox is pre-provisioned per environment doc, but this run hasn't been executed. Next commit that touches e2e must run `pnpm exec playwright test --list` to prove the config accepts both dirs.

### A-09 — Extend CI trigger to Version-3 + claude/** (I-01)

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 2 close.
- **Layer**: L0 CI.
- **Severity**: high (systemic — pushes to the production branch and to my dev branch fired no CI at all; every commit landed unverified).
- **Was**: `.github/workflows/ci.yml` `on.push.branches` and `on.pull_request.branches` were `["main"]` only. The active production branch is `Version-3`; my working branch is `claude/exciting-planck-6a4nbr`. Every push to either fired zero CI. Coverage gap I-01.
- **Now**: `on.push.branches: ["main", "Version-3", "claude/**"]`, `on.pull_request.branches: ["main", "Version-3"]`. Wildcard `claude/**` picks up short-lived dev branches automatically; production branch `Version-3` gates every deploy path.
- **Test**: `tests/ci-trigger-covers-active-branches.test.ts` — 4 structural cases: file exists, push includes `Version-3`, pull_request includes `Version-3`, push includes `claude/**`. Red 3/4 before fix; green 4/4 after.
- **Skill/agent used**: `never-count-with-grep` (structural yaml assertion, not a hand-counted claim).
- **Run it**: `npx vitest run tests/ci-trigger-covers-active-branches.test.ts`.
- **Result**: full suite: 155/155 (18 files), tsc clean. **First real CI signal expected on this commit's push** — reported honestly on land, per plan.
- **Still open in**: none for I-01. `daily-dependency-audit` workflow is separate — under Phase C-01.

### A-08 — Remove `middleware.ts` top-of-function throw on missing JWT_SECRET (S-05, T-ENV-20 recurrence)

- **Date**: 2026-09-15
- **Commit**: hash added at Batch 2 close.
- **Layer**: L4 middleware.
- **Severity**: high (a dashboard delete of `JWT_SECRET` in production would 500 every `/admin/*` and `/api/admin/*` route with no per-route fallback — exactly what T-ENV-20 caused for ~18 h on the prior project).
- **Was**: `middleware.ts:23-25` opened with `throw new Error('JWT_SECRET must be set in production')` when the env var was unset. A middleware throw returns `MIDDLEWARE_INVOCATION_FAILED` (500) for every route the matcher covers, with no fallback. Security-surface + skill audit finding S-05, direct match to `playbook/skills/runtime-env-and-middleware-safety.md` incident T-ENV-20.
- **Now**: throw removed. The subsequent per-request `if (!ENV.JWT_SECRET) return NextResponse.redirect(...)` inside the `/admin` branch already handles missing secret safely (redirect to home instead of 500). `/api/admin/*` routes each perform their own `jwtVerify` (hardened in A-03), so middleware's role is limited to rate-limiting there.
- **Test**: `tests/middleware-never-throws.test.ts` — 3 cases: (a) `/admin/api-management` with JWT_SECRET="" NODE_ENV=production must not throw; (b) same for `/api/admin/metrics`; (c) `/admin/*` returns a response with status < 500. Red 3/3 before fix; green 3/3 after.
- **Skill/agent used**: `runtime-env-and-middleware-safety` rule 1 verbatim; `layered-testing-strategy` for the env-stubbed middleware call.
- **Run it**: `npx vitest run tests/middleware-never-throws.test.ts`.
- **Result**: full suite: 151/151 (17 files), tsc clean.
- **Enforcement note**: on the first regression run my QA-LOG entry contained a relative-date word (`"later"`); the log-hygiene test I installed in A-01 caught it and refused the commit. Reworded to `Batch 2 / Phase B`. This is the discipline working as designed.
- **Still open in**: `S-06` per-instance rate-limit `Map` at `middleware.ts:6` is unchanged — deferred to a Redis migration under Phase B.

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
- **Still open in**: `S-06` (three per-instance rate-limit Maps) still open; `X-11` (150-line inline email HTML in orders/route.ts) still open — both scheduled under Batch 2 / Phase B per plan.

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
