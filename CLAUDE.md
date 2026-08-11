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
*   **Every external fetch hits the TTL cache** in `lib/cache/apiCache.ts`.
    Static data (leagues, teams, players) caches for 30 days.
*   **Fault tolerance.** API errors must never blank a component. Catch, return `[]` or a
    cached fallback, and show "Data temporarily unavailable".
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
*   `next.config.mjs` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`,
    so failures reach production silently. Run `tsc` yourself before deploying.
