# OPEN-WORK — Smart Live TV

Live items with an explicit "why it isn't done yet". Not a to-do list — a claim about the state of the world. Per `documentation-discipline` rule: an item without an updated "Why" is stale.

Fields: **Since** (YYYY-MM-DD) · **Layer** · **Owner** · **Why it isn't done** · **What would close it**.

---

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

## O-05 — `middleware.ts:6` uses in-memory `Map` for admin rate limiting on serverless

- **Since**: 2026-09-15
- **Layer**: L4 (middleware)
- **Owner**: unassigned
- **Why it isn't done**: fixing requires wiring Upstash Redis into middleware (edge runtime), which needs verifying `@upstash/redis` behaviour under Next 14's edge runtime and re-testing every admin path. Not same-day. Queued as its own A-XX after A-02 lands.
- **What would close it**: Redis-backed rate limiter shared across serverless instances, per `two-layer-rate-limiting` implementation.

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

## O-08 — CLOSED 2026-09-15 by A-10 + A-13

Playwright `testDir` was in fact orphaning `e2e/*.spec.ts` (confirmed by CI + `pnpm exec playwright test --list`). Closed by A-10 (config rewrite) + A-13 (`.test.ts` → `.spec.ts` rename + convention settle). The 3 spec files (`e2e/smartlivetv.spec.ts`, `e2e/smoke.spec.ts`, `tests/mobile-responsiveness.spec.ts`) now list as 120 tests across 3 device projects. Whether they PASS is a separate concern (see O-10).

## O-09 — Follow-up log hygiene in `lib/panel/cms8k.ts`

- **Since**: 2026-09-15 (spun out of A-02)
- **Layer**: L5 (provider)
- **Owner**: unassigned
- **Why it isn't done**: A-02 fixed the three raw-response leaks (lines ~240, ~271, ~310) but left two `console.error` calls that log error objects wholesale: `[CMS8K SESSION] Error creating line via session:` (~329) and `[CMS8K] Get credentials error:` (~426). Error messages from `fetch` failures may include the request URL with query params — those params carry the panel session cookie in some paths. Not yet audited whether any real error object surfaces a cookie in practice.
- **What would close it**: run the two failure paths against a mock that throws with a URL-carrying error, verify no cookie appears; if it does, redact via `redactObject` before logging.

## O-10 — Playwright e2e suite removed from PR gate; needs a dedicated scheduled workflow

- **Since**: 2026-09-15 (A-14)
- **Layer**: L0 (test infra)
- **Owner**: unassigned
- **Why it isn't done**: A-14 removed the Playwright steps from `.github/workflows/ci.yml` because the existing spec suite is a *production monitor*, not a PR gate — it asserts real robots.txt content, real `.co.uk` canonicals, real blog posts, real schema markup, "no 'James Harper' author" and similar production-content properties. Against a fresh `pnpm dev` those assertions produce 40+ failures per run for reasons unrelated to any PR. Reinstating in CI would either need (a) rewriting the specs to work against a fresh dev server (large project), or (b) pointing Playwright at a real preview deploy (needs Vercel preview URL wiring), or (c) a nightly scheduled workflow that hits production with a read-only check (simplest, adds one workflow file).
- **What would close it**: option (c) — new `.github/workflows/e2e-production-monitor.yml` on cron (e.g. `0 3 * * *`), sets `PLAYWRIGHT_BASE_URL=https://smartlivetv.co.uk`, runs `pnpm exec playwright test`, opens an issue on failure. Small workflow, no code changes to the specs themselves.
