# Smart Live TV — smartlivetv.co.uk

**Repo:** `shad-yy/forclaude` · **Branch:** `Version-3` · **Host:** Vercel
**This is the live production site.**

---

## What this project is

A sports streaming guide and subscription service. It combines live scores, fixtures,
league tables, team and player data, sports news and broadcast guides with a
subscription funnel: channel directory, pricing tiers, device setup guides, free trial,
and checkout.

The editorial and data side exists to earn search traffic during major sports seasons.
The commercial side converts that traffic. **Both halves are the product** — the sports
data is not decoration and the funnel is not an afterthought. Changes to either should
respect the other.

## Self-contained by design

`smartlivetv.co.uk` serves its own traffic end to end. It does not redirect users to
another domain, and it does not depend on one.

*   Every commercial route is a **real page on this domain**: `/buy`, `/pricing`,
    `/free-trial`, `/subscribe`, `/channels`, `/login`, `/setup/[device]`.
*   Only two redirects exist, both internal: `/home` → `/` and
    `/football` → `/watch/premier-league`.
*   **Do not add redirects or CTAs pointing to any other domain.** Traffic that arrives
    here should convert here.

---

## Working agreements

Read at the start of every session:

*   `memory-bank/PROGRESS.md` — active context, completed work, and the Trouble Registry
    of past bugs with their permanent fixes. **Check the Trouble Registry before
    debugging anything** — several recurring failures are already solved there.
*   `memory-bank/PROJECT.md` — product, stack, integrations, repo structure.
*   `memory-bank/PATTERNS.md` — API layer, caching TTLs, coding non-negotiables.
*   `.cursorrules` — short form of the above.

Update the memory bank after any task that changes architecture, adds an integration, or
fixes a non-obvious bug.

## Non-negotiables

*   **Unified API layer.** Never import low-level clients (`theSportsDB`, `newsAPI`,
    `ufcScraper`) into React components. Go through `lib/api/unified-sports-api.ts`.
*   **Server-side only** for anything holding credentials or needing rate limiting.
*   **25 req/min** ceiling on TheSportsDB (free tier is 30). `RATE_LIMIT_MS = 2400`.
*   **Every external fetch goes through the cache** in `lib/cache.ts` (`swrGet`:
    in-memory + Upstash Redis, stale-while-revalidate). Leagues, teams and players
    cache for 24 hours (`CACHE_TTL` in `lib/cache.ts`, `TTL` in `lib/api/the-sports-db.ts`).
*   **Fault vs absence** (hybrid rule, `PATTERNS.md`). An upstream outage is a fault: API
    routes return 503 with `Cache-Control: no-store`, never 200 with `[]`. Only a real
    "nothing exists" returns empty. Components must never go blank — show
    "Data temporarily unavailable".
*   **Framer Motion needs a mount guard** — wrap animations in a `mounted` state or they
    cause production-only hydration crashes. See Trouble Registry.
*   **No `@ts-ignore`, no `any`.** `npx tsc --noEmit` must pass with 0 errors.

## Build and test

```bash
npm run dev
npx tsc --noEmit
npx vitest run
```

⚠️ `npm run build` ends by submitting URLs to the **IndexNow API** — a real,
outward-facing action. For a local build, skip it:

```bash
node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
```

⚠️ Stop the dev server before building. Sharing `.next` produces a spurious
`Cannot find module './NNNN.js'` failure at "Collecting page data".

## Known open issues

See `memory-bank/PROGRESS.md` §4 for the current queue. Summary:

*   `next`, `postcss`, `sharp`, `undici` carry high-severity advisories. Resolving them
    needs a breaking Next.js 14 → 16 upgrade — its own task with its own regression pass.
*   `/api/espn/mma/ufc/scoreboard` returns 503; the UFC widget degrades silently.
*   `next.config.mjs`'s `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` are
    both `false` — a real `next build` now fails on any TypeScript or ESLint **error**
    (not a warning). Verified 2026-09-22 with a full local build (`Linting and checking
    validity of types` step ran, printed the 46 remaining ESLint warnings, and proceeded
    to static generation; exit 0). See `memory-bank/QA-LOG.md` O-06 for the 46 remaining
    warnings (41 `@next/next/no-img-element`, 4 `react-hooks/exhaustive-deps`, 1
    `@next/next/no-before-interactive-script-outside-document`) — none block the build.
