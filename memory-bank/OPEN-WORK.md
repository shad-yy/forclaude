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

## O-07 — `npm run build` ships an IndexNow ping to production every run

- **Since**: 2026-09-15 (from `PROGRESS.md` §4.3)
- **Layer**: L0 (build tooling)
- **Owner**: unassigned
- **Why it isn't done**: queued behind A-02 in this session's plan.
- **What would close it**: gate `scripts/ping-indexnow.js` on a `SEND_INDEXNOW=1` env flag; leave it unset in dev / CI, set only in the production deploy.

## O-08 — `e2e/*.spec.ts` may be orphaned by `playwright.config.ts` `testDir: './tests'`

- **Since**: 2026-09-15
- **Layer**: L0 (test infra)
- **Owner**: unassigned
- **Why it isn't done**: not verified this session whether Playwright picks up `e2e/` files despite the `testDir` restriction. `pnpm playwright test --list` would answer it in one command.
- **What would close it**: run the list command; if `e2e/*` do not appear, either move them into `tests/` or extend `testDir`.
