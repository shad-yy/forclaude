# OPEN-WORK — Smart Live TV

Live items with an explicit "why it isn't done yet". Not a to-do list — a claim about the state of the world. Per `documentation-discipline` rule: an item without an updated "Why" is stale.

Fields: **Since** (YYYY-MM-DD) · **Layer** · **Owner** · **Why it isn't done** · **What would close it**.

---

## O-23 — URGENT: rotate the RapidAPI key and reset two panel lines (committed to a public repo)

- **Since**: key since at least 2026-07-02 (`309e8bc`); HAR since 2026-09-13 (`1999666`). Found 2026-09-24.
- **Layer**: L0 secrets.
- **Owner**: site owner — needs the RapidAPI dashboard, the cms-8k panel and Vercel.
- **Why it isn't done**: Claude has no access to those dashboards. R-07 removed both from the tree, but git history keeps them and the repo is public (`visibility: public` per the GitHub API), so removal alone protects nothing already copied. History rewriting would not help (forks, caches) and needs a force-push.
- **What would close it**: (1) regenerate the RapidAPI MMA key (the one starting `e0d3`), put the new one in Vercel as `RAPIDAPI_MMA_KEY`, redeploy; (2) in the cms-8k panel, reset the passwords of (or delete) the two lines created 2026-09-04 and 2026-09-13 that appeared in `cms-8k.com.har`; (3) optionally add both historical fingerprints to `.gitleaksignore` once rotated, so a full-history scan (O-25) passes.

## O-24 — 554 debug log files are tracked despite `.gitignore`

- **Since**: `309e8bc` (2026-07-02); noted 2026-09-24
- **Layer**: L0 repo hygiene.
- **Owner**: unassigned
- **Why it isn't done**: not a security issue — checked 2026-09-24: every TheSportsDB URL in them uses the public test key `123`, no `api_key`/auth headers; the 510 Gitleaks hits are inline JavaScript in saved HTML error pages. `.gitignore` already lists `/logs/`, so they were committed before that rule or force-added. Removing 554 files is the owner's call.
- **What would close it**: `git rm -r --cached logs` (keeps local copies), commit.

## O-25 — Gitleaks CI only scans each push's new commits

- **Since**: C-04 (2026-09-15); noted 2026-09-24
- **Layer**: L0 CI.
- **Owner**: unassigned
- **Why it isn't done**: this is why the RapidAPI key and the HAR (committed before C-04) were never flagged. A full-history scan would fail today on those two until they are rotated and allowlisted (O-23).
- **What would close it**: after O-23, add a weekly `schedule:` trigger (or a `gitleaks detect --no-git` step) that scans the whole repo, with the rotated secrets' fingerprints in `.gitleaksignore`.

## O-21 — Production runs `Version-3` without the work branch's fixes

- **Since**: 2026-09-20 20:25 UTC (found 2026-09-24 via `mcp__Vercel__list_deployments`)
- **Layer**: L0 release process.
- **Owner**: site owner (decision), then Claude (merge + verification).
- **Why it isn't done**: merging into the production branch is the owner's call. Facts: builds from `claude/exciting-planck-6a4nbr` were deployed to production on 2026-09-17 (`7d553a4`) and 2026-09-19 (`73b364c`). The next push to `Version-3` (`16b8d6a`, content update) deployed over them. `git rev-list --count 73b364c --not 16b8d6a` = 52: production lost A-01..A-15, B-01..B-07, C-01..C-05, X-04, X-06, X-09 and X-11 (hCaptcha verification, test-panel bypass closure, AVIF mitigation, PII log redaction, provision race fix, fault-vs-absence routes). Work since then (X-01/02/05/08/13, O-06 build gates, R-01..R-05) was never in production: at `cc6af34` the branch has 77 commits `Version-3` lacks. Vercel reported no runtime errors in the 7 days to 2026-09-24.
- **What would close it**: owner approves; merge the branch into `Version-3` (PR, CI green); then confirm with `list_deployments` (`target: production`) that the live SHA contains the branch head (`git merge-base --is-ancestor <head> <live-sha>`). PROGRESS.md Trouble Registry Bug 9.

## O-20 — Six routes still answer an upstream fault with 200 + `[]`

- **Since**: 2026-09-24 (missed by the 2026-09-15 S-03 audit, which listed 12)
- **Layer**: L3 API routes.
- **Owner**: unassigned
- **Why it isn't done**: found during the 2026-09-24 review; each needs the B-04 treatment (resolver throws `UpstreamFaultError`, route returns 503 + `no-store`, red-first test) plus a check that every client caller handles `!res.ok`. Routes: `teams/[id]/players`, `teams/[id]/events`, `leagues/[id]/standings`, `search/teams`, `search/players`, `search/leagues`. The search bar already checks `res.ok` for the three search routes.
- **What would close it**: migrate one route per commit as in B-04.1–12; update PATTERNS.md §Error Handling to drop the list.

## O-19 — News page filter controls have no effect

- **Since**: at least 8b561b8^ (pre-B-02); confirmed 2026-09-24
- **Layer**: L1 UI + L3 `/api/news/search`.
- **Owner**: unassigned
- **Why it isn't done**: feature work, not a fix. `app/news/NewsClientPage.tsx` shows category / source / sort controls and pagination, but `/api/news/search` only takes `q` + `pageSize`, and the old `newsAPI.searchNews` also used only those two (checked at 8b561b8^). Changing page re-fetches the same payload.
- **What would close it**: either pass the filters through to NewsData.io (check which params the free plan accepts) or remove the controls so the page does not promise filtering it cannot do.

## O-18 — 90 explicit `any` lines remain in app code

- **Since**: pre-existing (107 on `Version-3` `16b8d6a`); ratchet added 2026-09-24 (R-02) at 91, lowered to 90 by R-07
- **Layer**: L2–L5, mostly `lib/`.
- **Owner**: unassigned
- **Why it isn't done**: CLAUDE.md bans `any`, but most of these are in provider parsers where the right type needs the provider's real response shape (the C-03 Zod schemas cover TheSportsDB, NewsData and football-data only). Typing them by guesswork would swap `any` for a false type.
- **What would close it**: type them file by file, using the Zod schemas where they exist; lower `CEILING` in `tests/no-new-any.test.ts` each time. Done when the ceiling is 0.

## O-22 — News fallback articles claim to be published "now"

- **Since**: pre-existing; noted 2026-09-24
- **Layer**: L5 `lib/api/news.ts`.
- **Owner**: unassigned
- **Why it isn't done**: low impact; noted during the review, not in its scope. The 4 `FALLBACK_ARTICLES` are the site's own promo pieces (allowed as an owned fallback), but each sets `pubDate: new Date().toISOString()` at module load, so during a NewsData outage they appear as fresh news.
- **What would close it**: give each a fixed, true `pubDate` (the linked page's real publish date) or omit the date in the UI for owned fallbacks.

## O-17 — 46 ESLint warnings surfaced by enabling the linter (O-06); none block the build

- **Since**: 2026-09-22 (surfaced by O-06's ESLint setup)
- **Layer**: L1 UI (images, hook dependencies).
- **Owner**: unassigned
- **Why it isn't done**: each needs per-call-site judgment, unlike O-06's 38 errors which were either mechanical or a single isolated bug. 41 `@next/next/no-img-element` findings (raw `<img>` instead of `next/image`) each need a decision on `width`/`height` vs `fill`, and a check that the image's host is already in `next.config.mjs`'s `images.remotePatterns` allowlist (an unlisted host would break at runtime under `next/image`, not just warn). 4 `react-hooks/exhaustive-deps` findings each need the effect's actual intended behaviour understood before deciding whether to add the "missing" dependency (the rule's own auto-fix suggestion can introduce infinite-refetch loops if applied blindly) or intentionally suppress with a comment explaining why. 1 `@next/next/no-before-interactive-script-outside-document` needs the specific script's placement checked against Next's `<Script>` component rules.
- **What would close it**: run `pnpm lint`, work through the 46 findings file by file — for `no-img-element`, migrate to `next/image` where the host is already allowlisted (or add the host + migrate where it's a legitimate new source); for `exhaustive-deps`, read each effect and either fix the dependency array correctly or add a one-line comment explaining an intentional omission; for the script-ordering one, move it into `next/script`'s `strategy` API. Re-run `pnpm lint` after each batch to confirm the count is dropping, not just moving.
## O-16 — CLOSED 2026-09-22 by aligning ci.yml to Node 24

Was: CI ran tests/typecheck on Node 20 (`.github/workflows/ci.yml`) while the live Vercel project runs Node 24.x in production (confirmed via `mcp__Vercel__get_project`) — a Node-24-only behaviour difference could pass CI and only surface live. Closed by bumping `ci.yml`'s `node-version` from `20` to `24` to match production (the safer default — test what you actually ship). `dependency-audit.yml` and `auto-index.yml` still pin Node 20 but were left alone: neither runs the app's test/typecheck suite (one runs `pnpm audit`, the other pings IndexNow), so they aren't the behaviour-drift risk O-16 was about. Verified via a real CI run on the pushed commit (this session's sandbox runs Node 22, so local verification wasn't authoritative for a Node-version change — the real GitHub Actions run, which provisions the exact declared version, is).

## O-01 — `vitest.config.ts:10` embeds a 512-bit `JWT_SECRET` fallback in a checked-in file

- **Since**: 2026-09-15
- **Layer**: L0 (tooling / secrets hygiene)
- **Owner**: unassigned — maintainer decision required
- **Why it isn't done**: cannot determine from the code alone whether this hex value was ever the production `JWT_SECRET`. If it was, it is leaked in git history and the production secret must be rotated. If it was never production, it is a test-only random value and only needs a comment saying so plus a rotation on the fallback itself.
- **What would close it**: (a) confirm from Vercel dashboard history whether this value was ever the production `JWT_SECRET`; (b) if yes, rotate `JWT_SECRET` in Vercel and replace the fallback with a comment "test-only, never used in prod"; (c) if no, replace the fallback with an obviously-fake value and add the comment.

## O-02 — CLOSED 2026-09-15 by A-09 (was stale until 2026-09-22)

Was: CI trigger scoped to `main` only, missing production branch `Version-3` and dev branches `claude/**`. Closed same-session by A-09: `.github/workflows/ci.yml` `on.push.branches` now reads `["main", "Version-3", "claude/**"]`. **Found stale on 2026-09-22**: this entry still read "not touched in this session" and "queued" language for over a week after the actual fix landed — a `documentation-discipline` violation (an item whose "Why" was never updated after the work closed it). Verified 2026-09-22 by reading `ci.yml` directly and `tests/ci-trigger-covers-active-branches.test.ts` (4/4 passing).

## O-03 — CLOSED 2026-09-15 by B-01 (was stale until 2026-09-22)

Was: `memory-bank/PATTERNS.md`'s older "always return `[]` on fault" rule conflicted with `api-fault-vs-absence`. Resolved same-session as a hybrid: new resolvers rethrow `UpstreamFaultError`; the 12 pre-existing S-03 routes were grandfathered and migrated individually under B-04 (all 12 done — see B-04 in QA-LOG). PATTERNS.md's "Hybrid rule adopted 2026-09-15" section documents this in full, citing `lib/api/errors.ts::UpstreamFaultError`. **Found stale on 2026-09-22**: this entry still framed the hybrid as an undecided architectural choice ("pick a direction... each has a different cost") a week after the decision was made and executed. Verified 2026-09-22 by reading `PATTERNS.md` directly and `tests/upstream-fault-error.test.ts` (4/4 passing).

## O-04 — CLOSED 2026-09-15 by A-08 (was stale until 2026-09-22)

Was: `middleware.ts` threw at top-of-function when `JWT_SECRET` was unset in production — a T-ENV-20 recurrence per `runtime-env-and-middleware-safety`, with no per-route fallback (every matched route would 500). Closed same-session by A-08: the throw was removed; each request now checks `if (!ENV.JWT_SECRET)` and redirects safely instead. **Found stale on 2026-09-22**: this entry still said "queued as A-02... being fixed red-first in the next turn" a week after A-08 (not A-02) actually shipped the fix — a wrong commit reference left uncorrected. Verified 2026-09-22 by reading `middleware.ts` directly and `tests/middleware-never-throws.test.ts` (3/3 passing).

## O-05 — CLOSED 2026-09-16 by B-06

Was: three per-file `new Map<string, …>` limiters — `middleware.ts:6`, `app/api/auth/admin/route.ts:7`, `app/api/subscribe/route.ts:14` — each per-serverless-instance so their declared ceilings scaled with `<number of lambdas>` (S-06). B-06 consolidated all three onto `lib/security/rate-limit.ts::checkRateLimit()`, a shared Redis-backed fixed-window limiter using `@upstash/redis` (fetch-based; safe in edge middleware). Falls back to a per-process Map with a one-shot warning when `UPSTASH_REDIS_REST_URL/TOKEN` are unset — matches previous behaviour for dev/keyless CI, but production must set both. Enforcement: `tests/rate-limit-helper.test.ts` refuses any `new Map<string,` in the three touched files (structural regression tripwire).

## O-06 — CLOSED 2026-09-22, both flags now `false` and verified by a real build

**TypeScript half**: already resolved before this session (flipped `false` in `bcd211e`, predates this Claude session). Confirmed by dozens of clean `tsc --noEmit` runs this session.

**ESLint half**: closed same-session. There was genuinely no ESLint config anywhere in the repo (`next lint` dropped into an interactive setup wizard) — not deferred debt, `ignoreDuringBuilds: true` was load-bearing. Closed by: (a) `pnpm add -D eslint@^8 eslint-config-next@14.2.35` (pinned to match the installed `next@14.2.35`); (b) `.eslintrc.json` with `"extends": "next/core-web-vitals"` — the canonical default `create-next-app` itself generates, not a personal ruleset choice, so no maintainer sign-off was needed on which config; (c) ran it — 84 findings across 44 files (38 errors, 46 warnings); (d) fixed all 38 errors: 37 were mechanical `react/no-unescaped-entities` (raw `'`/`"` in JSX text → `&apos;`/`&quot;`, verified character-for-character against ESLint's reported column before substitution, zero drift), and 1 was a genuine bug — `components/setup/RecommendedApps.tsx:224` called `useState` AFTER a conditional early return, violating React's Rules of Hooks (could desync hook order if `device` ever changes between a valid/invalid key without a remount); moved the hook above the early return; (e) flipped `eslint.ignoreDuringBuilds` to `false`; (f) verified with a REAL production build (`next build`, not just `next lint`) — "Linting and checking validity of types" ran, printed the 46 remaining warnings, and the build proceeded through full static generation (103 routes) to exit 0. `CLAUDE.md`'s "Known open issues" section, which cited both flags as still-`true`, corrected in the same pass.

**46 warnings remain, tracked as their own item, not blocking**: 41 `@next/next/no-img-element` (raw `<img>` instead of `next/image` — each needs per-call-site judgment on `width`/`height`/`fill` and whether the image's host is in `next.config.mjs`'s `remotePatterns` allowlist, so not mechanical), 4 `react-hooks/exhaustive-deps` (blindly adding the "missing" dependency risks introducing infinite-fetch loops — the rule's own suggestion isn't always correct, needs per-effect judgment), 1 `@next/next/no-before-interactive-script-outside-document`. None of these fail a build (`next build`'s ESLint gate only blocks on errors); they're a legitimate follow-up, not a false blocker.

## O-07 — CLOSED 2026-09-15 (was: IndexNow ping every build)

**Closed as invalid.** My original recording was wrong on both counts: (a) `scripts/ping-indexnow.js:2-5` already gates on `VERCEL_ENV === 'production'`, so local and CI builds skip it; (b) the constant `f63234d7ee824249a5b3260c6d2c49e2` at line 12 is the **public IndexNow ownership key** — its whole purpose is to be published at `/<key>.txt` on the site's own domain, and knowing it grants nothing. Both the testing-infra audit agent and the security-surface audit agent independently confirmed. Standing correction recorded at top of `QA-LOG.md`.

## O-09 — CLOSED 2026-09-22, audit complete: no leak found

Was: A-02 fixed the three raw-response leaks in `lib/panel/cms8k.ts` (lines ~240, ~271, ~310) but left two `console.error` calls open as unaudited — `[CMS8K SESSION] Error creating line via session:` (~320) and `[CMS8K] Get credentials error:` (~417) — on the theory that a thrown fetch error's message might embed the request URL, and the URL might carry the panel session cookie as a query param. **Audited and closed 2026-09-22**: neither call site ever puts the cookie in the URL — both requests carry it exclusively via the `Cookie` HTTP header — and empirically, a real network-level fetch failure (reproduced with `HttpResponse.error()`, which triggers `@mswjs/interceptors`' actual `TypeError: Failed to fetch` — the same class of error native `fetch`/undici throws on a real DNS/connection failure) never embeds the request URL, headers, or query string in its `message`/`stack`/`cause`. Verified directly with a standalone probe script (`node`, MSW, `fetch()` with a `Cookie` header, catch and print the resulting error) before writing the test, so the claim is observed, not assumed. **Bonus finding while auditing**: `createTrialAccount`'s Strategy-A catch (`[CMS8K API] Error during API key trial creation:`, ~line 264) DOES have a genuine secret in its URL (`api_key` as a query param) — checked with the same technique and also found to not leak, for the same reason (fetch failures don't embed URLs).
Test: `tests/cms8k-error-log-redaction.test.ts` — 4 assertions: session-cookie leak check on the line-creation failure path, on the credential-lookup failure path (both `api_table.php` and `get_line_info` sub-strategies), a scanner control proving the cookie really was sent on the request whose failure is then inspected (so the other assertions aren't vacuously passing), and the bonus api_key check.

## O-12 — CLOSED 2026-09-16 by B-02

Was: `app/news/NewsClientPage.tsx:12` (a `"use client"` file) directly imported `@/lib/api/news`, so the news scraper module and its transitive deps shipped into the browser bundle — the last real S-01 violation. B-02 added two server-side proxy routes (`app/api/news/search`, `app/api/news/trending`), rewrote the two `newsAPI.*` call sites to `fetch()` those endpoints, and dropped the `newsAPI` import; the file still keeps its type-only imports (erased at build time). Enforcement: `tests/no-lowlevel-api-in-client-components.test.ts` refuses any future `"use client"` file that imports `@/lib/api/{news|the-sports-db|mma-rapidapi|ufc-scraper|espn|football-data}` — type-only imports (`import type …`) are exempted since they contribute nothing to the bundle.

## O-08 — CLOSED 2026-09-15 by A-10 + A-13

Playwright `testDir` was in fact orphaning `e2e/*.spec.ts` (confirmed by CI + `pnpm exec playwright test --list`). Closed by A-10 (config rewrite) + A-13 (`.test.ts` → `.spec.ts` rename + convention settle). The 3 spec files (`e2e/smartlivetv.spec.ts`, `e2e/smoke.spec.ts`, `tests/mobile-responsiveness.spec.ts`) now list as 120 tests across 3 device projects. Whether they PASS is a separate concern (see O-10).

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
