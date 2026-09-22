# OPEN-WORK — Smart Live TV

Live items with an explicit "why it isn't done yet". Not a to-do list — a claim about the state of the world. Per `documentation-discipline` rule: an item without an updated "Why" is stale.

Fields: **Since** (YYYY-MM-DD) · **Layer** · **Owner** · **Why it isn't done** · **What would close it**.

---

## O-16 — CLOSED 2026-09-22 by aligning ci.yml to Node 24

Was: CI ran tests/typecheck on Node 20 (`.github/workflows/ci.yml`) while the live Vercel project runs Node 24.x in production (confirmed via `mcp__Vercel__get_project`) — a Node-24-only behaviour difference could pass CI and only surface live. Closed by bumping `ci.yml`'s `node-version` from `20` to `24` to match production (the safer default — test what you actually ship). `dependency-audit.yml` and `auto-index.yml` still pin Node 20 but were left alone: neither runs the app's test/typecheck suite (one runs `pnpm audit`, the other pings IndexNow), so they aren't the behaviour-drift risk O-16 was about. Verified via a real CI run on the pushed commit (this session's sandbox runs Node 22, so local verification wasn't authoritative for a Node-version change — the real GitHub Actions run, which provisions the exact declared version, is).

## O-01 — `vitest.config.ts:10` embeds a 512-bit `JWT_SECRET` fallback in a checked-in file

- **Since**: 2026-09-15
- **Layer**: L0 (tooling / secrets hygiene)
- **Owner**: unassigned — maintainer decision required
- **Why it isn't done**: cannot determine from the code alone whether this hex value was ever the production `JWT_SECRET`. If it was, it is leaked in git history and the production secret must be rotated. If it was never production, it is a test-only random value and only needs a comment saying so plus a rotation on the fallback itself.
- **What would close it**: (a) confirm from Vercel dashboard history whether this value was ever the production `JWT_SECRET`; (b) if yes, rotate `JWT_SECRET` in Vercel and replace the fallback with a comment "test-only, never used in prod"; (c) if no, replace the fallback with an obviously-fake value and add the comment.

## O-02 — CI trigger scoped to `main`, active branch is `Version-3`

- **Since**: 2026-09-15
- **Layer**: L0 (CI)
- **Owner**: unassigned
- **Why it isn't done**: not touched in this session. Adding `Version-3` to the trigger is a one-line change but wants its own commit and its own verification against a real push, not bundled with the doc-discipline install.
- **What would close it**: edit `.github/workflows/ci.yml` `on.push.branches` and `on.pull_request.branches` to include `Version-3` (and current working branch policy). Push once, confirm CI runs, confirm result is honest (not spurious).

## O-03 — `memory-bank/PATTERNS.md` conflicts with `api-fault-vs-absence`

- **Since**: 2026-09-15
- **Layer**: L2 (client resolvers) + L0 (doc rule)
- **Owner**: unassigned — architectural decision
- **Why it isn't done**: the resolver layer currently obeys PATTERNS.md's older rule ("catch, return `[]` on fault"). Switching to the skill's stricter posture means rewriting every resolver, changing every page's error boundary, and adopting the `UpstreamFaultError` class. That is a project of its own with its own regression pass — not a scope-appropriate change for a maintenance session.
- **What would close it**: pick a direction: (a) adopt `api-fault-vs-absence` verbatim and rewrite `lib/api/*` resolvers to rethrow `UpstreamFaultError`; (b) register the local exemption in PATTERNS.md with a rationale specific to this project; (c) hybrid — apply the skill to newly-added providers only and grandfather existing ones. Each has a different cost.

## O-04 — `middleware.ts:23-25` throws on missing `JWT_SECRET` in production

- **Since**: 2026-09-15
- **Layer**: L4 (middleware)
- **Owner**: unassigned — queued as A-02
- **Why it isn't done**: separate task in this session's queue. Being fixed red-first in the next turn.
- **What would close it**: `A-02` entry with the fix commit and a test that middleware never throws under a stripped environment.

## O-05 — CLOSED 2026-09-16 by B-06

Was: three per-file `new Map<string, …>` limiters — `middleware.ts:6`, `app/api/auth/admin/route.ts:7`, `app/api/subscribe/route.ts:14` — each per-serverless-instance so their declared ceilings scaled with `<number of lambdas>` (S-06). B-06 consolidated all three onto `lib/security/rate-limit.ts::checkRateLimit()`, a shared Redis-backed fixed-window limiter using `@upstash/redis` (fetch-based; safe in edge middleware). Falls back to a per-process Map with a one-shot warning when `UPSTASH_REDIS_REST_URL/TOKEN` are unset — matches previous behaviour for dev/keyless CI, but production must set both. Enforcement: `tests/rate-limit-helper.test.ts` refuses any `new Map<string,` in the three touched files (structural regression tripwire).

## O-06 — `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`

- **Since**: 2026-09-15 (documented as an open item in `PROGRESS.md` §4.2 previously; formalised here)
- **Layer**: L0 (build config)
- **Owner**: unassigned
- **Why it isn't done**: turning either back on may fail the build against pre-existing errors. Needs a `tsc --noEmit` pass first to see what would surface. Not this session's scope.
- **What would close it**: run `npx tsc --noEmit`, capture the count, decide whether to fix and re-enable, or file each surfaced error as its own row.

## O-07 — CLOSED 2026-09-15 (was: IndexNow ping every build)

**Closed as invalid.** My original recording was wrong on both counts: (a) `scripts/ping-indexnow.js:2-5` already gates on `VERCEL_ENV === 'production'`, so local and CI builds skip it; (b) the constant `f63234d7ee824249a5b3260c6d2c49e2` at line 12 is the **public IndexNow ownership key** — its whole purpose is to be published at `/<key>.txt` on the site's own domain, and knowing it grants nothing. Both the testing-infra audit agent and the security-surface audit agent independently confirmed. Standing correction recorded at top of `QA-LOG.md`.

## O-09 — Follow-up log hygiene in `lib/panel/cms8k.ts`

- **Since**: 2026-09-15 (spun out of A-02)
- **Layer**: L5 (provider)
- **Owner**: unassigned
- **Why it isn't done**: A-02 fixed the three raw-response leaks (lines ~240, ~271, ~310) but left two `console.error` calls that log error objects wholesale: `[CMS8K SESSION] Error creating line via session:` (~329) and `[CMS8K] Get credentials error:` (~426). Error messages from `fetch` failures may include the request URL with query params — those params carry the panel session cookie in some paths. Not yet audited whether any real error object surfaces a cookie in practice.
- **What would close it**: run the two failure paths against a mock that throws with a URL-carrying error, verify no cookie appears; if it does, redact via `redactObject` before logging.

## O-12 — CLOSED 2026-09-16 by B-02

Was: `app/news/NewsClientPage.tsx:12` (a `"use client"` file) directly imported `@/lib/api/news`, so the news scraper module and its transitive deps shipped into the browser bundle — the last real S-01 violation. B-02 added two server-side proxy routes (`app/api/news/search`, `app/api/news/trending`), rewrote the two `newsAPI.*` call sites to `fetch()` those endpoints, and dropped the `newsAPI` import; the file still keeps its type-only imports (erased at build time). Enforcement: `tests/no-lowlevel-api-in-client-components.test.ts` refuses any future `"use client"` file that imports `@/lib/api/{news|the-sports-db|mma-rapidapi|ufc-scraper|espn|football-data}` — type-only imports (`import type …`) are exempted since they contribute nothing to the bundle.

## O-08 — CLOSED 2026-09-15 by A-10 + A-13

Playwright `testDir` was in fact orphaning `e2e/*.spec.ts` (confirmed by CI + `pnpm exec playwright test --list`). Closed by A-10 (config rewrite) + A-13 (`.test.ts` → `.spec.ts` rename + convention settle). The 3 spec files (`e2e/smartlivetv.spec.ts`, `e2e/smoke.spec.ts`, `tests/mobile-responsiveness.spec.ts`) now list as 120 tests across 3 device projects. Whether they PASS is a separate concern (see O-10).

## O-09 — Follow-up log hygiene in `lib/panel/cms8k.ts`

- **Since**: 2026-09-15 (spun out of A-02)
- **Layer**: L5 (provider)
- **Owner**: unassigned
- **Why it isn't done**: A-02 fixed the three raw-response leaks (lines ~240, ~271, ~310) but left two `console.error` calls that log error objects wholesale: `[CMS8K SESSION] Error creating line via session:` (~329) and `[CMS8K] Get credentials error:` (~426). Error messages from `fetch` failures may include the request URL with query params — those params carry the panel session cookie in some paths. Not yet audited whether any real error object surfaces a cookie in practice.
- **What would close it**: run the two failure paths against a mock that throws with a URL-carrying error, verify no cookie appears; if it does, redact via `redactObject` before logging.

## O-13 — CLOSED 2026-09-22 by X-01/X-02 deletion

Was: `lib/api/api-client.ts` (265 lines) and `lib/cache/apiCache.ts` (175 lines) had zero importers, confirmed twice — once on 2026-09-16 (grep at that date), re-verified 2026-09-22 before deleting. The 2026-09-16 attempt to `git rm` was blocked by the auto-mode classifier as an "irreversible local destruction"; on 2026-09-22 the same command was permitted (the file-count/size at issue was the same). Deleted along with the also-dead `scripts/verify-routes.js` (X-13, zero references in `package.json` or `.github/`). Full suite 275/275, tsc clean after removal — nothing referenced any of the three files.

## O-15 — CLOSED 2026-09-22 by pnpm-only enforcement

Was: `package-lock.json` and `pnpm-lock.yaml` both committed, drifting apart on every `pnpm add`/`pnpm remove`. Before deleting anything, verified with the Vercel MCP tools (`get_project` on `prj_6l3Vinw91zW08AIkwqhRV5vMeI8h`) that the live project has no `installCommand` override — Vercel auto-detects pnpm from `pnpm-lock.yaml`, so it never used `package-lock.json` for the actual production build. `.github/workflows/ci.yml` and `dependency-audit.yml` both hard-code `pnpm install --frozen-lockfile`. Closed by: deleting `package-lock.json`; adding `scripts/ensure-pnpm.js` as a `preinstall` guard (reads `npm_config_user_agent`, aborts with a clear message under `npm`/`yarn`) so the drift cannot silently recur locally; documenting the policy in `SETUP-REQUIRED.md`. Verified live with a real `pnpm install --frozen-lockfile` (guard passed, 2.3s). No `packageManager` field was added — CI pins pnpm major version 9 (`pnpm/action-setup@v4` with `version: 9`) while this session's pnpm is 10.33.0; pinning an exact patch I hadn't verified existed would have been a guess, so left unset rather than fabricate a value.

## O-14 — CLOSED 2026-09-17 by search-bar caller fix

Was: `components/layout/search-bar.tsx:115` did `Array.isArray(newsJson)` on `/api/search/news`'s response, which is `{status, articles, totalResults}` — an object, not an array. `Array.isArray(...)` was always false; the news branch of the site-wide search rendered nothing. Fixed by reading `newsJson?.articles` explicitly (option (a) from the original entry, chosen because changing the route shape would ripple through other callers). Regression tripwire at `tests/search-bar-news-contract.test.ts` refuses the plain `Array.isArray(newsJson)` shape re-appearing and pins the route's response shape.

## O-11 — Two critical Next.js RCEs live on production (< 15.5.24) — one MITIGATED

**Update 2026-09-15:** GHSA-2xp9-vwfh-vxw4 (AVIF RCE) attack path closed by A-15 (`next.config.mjs` `images.formats` no longer includes `image/avif`). This is a **mitigation, not a fix** — the underlying `next` version is still vulnerable and would be re-exposed the moment AVIF is reintroduced. Regression tripwire at `tests/next-image-avif-disabled.test.ts`. The other CVE (GHSA-p293-qw3h-jr36, Windows-host RCE) still stands; production is Vercel/Linux so attack surface there is dev machines only. The proper fix (patch bump to `next@15.5.24+`) remains scheduled below.


- **Since**: 2026-09-15 (surfaced by C-01 install audit)
- **Layer**: L0 dependency
- **Owner**: unassigned — maintainer needs to schedule the Next patch bump
- **Advisories** (both `next` @ current 14.2.35):
  1. **GHSA-p293-qw3h-jr36** — Unauthenticated Remote Code Execution on windows-hosted servers. `>=13.4.0 <15.5.24`. Production hosted on Vercel (Linux) — attack surface is dev machines only.
  2. **GHSA-2xp9-vwfh-vxw4** — Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used. `>=10.0.0 <15.5.24`. This project uses Next Image; AVIF is negotiated by modern browsers. **Live-exploitable on the deployed site.**
- **Why it isn't done**: `PROGRESS.md` §4.1 already flags "Next.js 14 → 16 upgrade" as its own project because it's a breaking two-major-version jump. But the RCE fixes landed in the 15.x line — a patch bump to `15.5.24` (or `15.5.10+`) plugs both without the full 14→16 migration.
- **What would close it**: (a) `pnpm add next@15.5.24 --save-exact`, (b) run `pnpm tsc --noEmit` and address any type-drift, (c) run `pnpm vitest --run` and address any regressions, (d) test in a preview deploy, (e) merge to `Version-3`. Full 14→16 upgrade stays as its own separate future project.

## O-10 — Playwright e2e suite removed from PR gate; needs a dedicated scheduled workflow

- **Since**: 2026-09-15 (A-14)
- **Layer**: L0 (test infra)
- **Owner**: unassigned
- **Why it isn't done**: A-14 removed the Playwright steps from `.github/workflows/ci.yml` because the existing spec suite is a *production monitor*, not a PR gate — it asserts real robots.txt content, real `.co.uk` canonicals, real blog posts, real schema markup, "no 'James Harper' author" and similar production-content properties. Against a fresh `pnpm dev` those assertions produce 40+ failures per run for reasons unrelated to any PR. Reinstating in CI would either need (a) rewriting the specs to work against a fresh dev server (large project), or (b) pointing Playwright at a real preview deploy (needs Vercel preview URL wiring), or (c) a nightly scheduled workflow that hits production with a read-only check (simplest, adds one workflow file).
- **What would close it**: option (c) — new `.github/workflows/e2e-production-monitor.yml` on cron (e.g. `0 3 * * *`), sets `PLAYWRIGHT_BASE_URL=https://smartlivetv.co.uk`, runs `pnpm exec playwright test`, opens an issue on failure. Small workflow, no code changes to the specs themselves.
