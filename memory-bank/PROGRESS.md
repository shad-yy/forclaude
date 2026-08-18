# System Progress & Error Registry

This file maintains the active development context, records completed tasks, and details every major bug/error encountered along with its resolution.

---

## 1. Active Context

*   **Product**: Smart Live TV on `smartlivetv.co.uk` — sports streaming guide, live
    scores and news, with an integrated subscription funnel on the same domain.
*   **Repo**: `shad-yy/forclaude` · branch `Version-3` · in sync with origin at `f67cb49`.
*   **Objective**: keep the site healthy and improve it continuously — acquisition
    surface (scores, fixtures, guides, news) and conversion surface (channels, pricing,
    trial, checkout) both.

### Current state

Working tree clean and in sync with origin. Build succeeds. The site is deployed on
Vercel and serving traffic.

Both halves are functional end to end: the data pages render live fixtures and standings
from TheSportsDB, and the funnel routes (`/buy`, `/pricing`, `/free-trial`, `/subscribe`,
`/channels`, `/login`, `/setup/[device]`) are real pages on this domain with working
form handlers at `/api/orders` and `/api/subscribe`.

### Search performance — read the caveat

Search Console, three months to 2026-07-31: **67 clicks, 2.3K impressions, average
position 36, CTR 2.9%**.

**This is too small a sample to draw strategic conclusions from.** 67 clicks over three
months is under one a day, and position 36 means the site is effectively invisible for
almost everything it appears for. Percentage swings on this base (a reported +308% over
28 days) are movement between single-digit numbers, not a trend.

What it does support, weakly:

*   The pages earning clicks are the commercial and event ones — homepage, `/ufc`,
    `/watch/europa-league`, `/setup/firestick`.
*   Most top queries are `smart live tv` / `smart live` / `smart tv live` variants, which
    are more likely generic smart-TV searches the domain name happens to match than brand
    demand. The unambiguous brand query `smartlivetv` returned 1 click in three months.
*   Country mix beyond the UK (France, Morocco, Portugal, Romania at ~4% each) is **2
    clicks apiece**. That is noise. Do not build a geographic strategy on it.

**Re-check GSC once volume is meaningfully higher before making decisions from it.**
Until then, prioritise by technical health and by what is obviously broken — not by
these numbers.

---

## 2. Completed Milestones

### Core API & Cache Implementation
*   **Safer Rate Limiter**: Configured rate limits at **25 req/min** (buffer under the 30 req/min limit) with a token bucket delay of 2400ms.
*   **Circuit Breaker**: Added safety mechanism that blocks failing endpoints for 1 minute after 5 consecutive 429 errors.
*   **Aggressive TTL Caching**: Developed central `apiCache.ts` client caching. Extended static assets (leagues, teams, rosters) cache TTL to **30 days**; dynamic score events use 1-to-5 minute expiration rules.
*   **Pre-Caching & Hydration**: Created `scripts/hydrate-static-data.ts` to pre-load all static indexes on startup.
*   **Static Page Revalidation**: Integrated Next.js page revalidation limits (24 hours) for `/teams` and `/leagues` to avoid re-fetching on client load.

### UI/UX & SEO Enhancements
*   **Direct API Image Logic**: Removed local/remote placeholder image URLs that were causing 404s. Configured CSS letter-avatars as clean visual fallbacks.
*   **Dynamic Matches Widgets**: Implemented live match feeds, sports tab filters, and real-time updates (60s re-fetch) on `/` and `/scores`.
*   **Hydration Crash Recovery**: Guarded Framer Motion animations with client-mounting checks to eliminate production Vercel hydration mismatches.
*   **GSC & Indexing Recovery**: Re-mapped counting components, sitemaps, and Indexing APIs to capture sports traffic and correct search indexing errors.

### Security Hardening & Secret Protection
*   **Vulnerability Remediation**: Removed hardcoded fallback RapidAPI MMA keys from `lib/api/mma-rapidapi.ts` and `lib/config/env.ts` to prevent leaks.
*   **Environment Validation**: Confirmed that all secret keys (Redis, News API, Firecrawl API, JWT) are retrieved dynamically via server environment variables, protected by `.gitignore`.

---

## 3. Trouble Registry & Historical Error Logs

Here is the repository of issues encountered, including root causes and their permanent fixes:

### ⚠️ Bug 1: "self is not defined" during `npm run build`
*   **Symptoms**: Next.js server bundling fails at "Collecting page data" with `ReferenceError: self is not defined`.
*   **Root Cause**: Certain code dependencies or Webpack runtime blocks query the browser-only global variable `self` while running in a Node server environment.
*   **Permanent Fix**: Setup a Node environment polyfill `polyfill-self.cjs` and configure the build command in `package.json` to load it before building:
    ```json
    "build": "node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build"
    ```

### ⚠️ Bug 2: 404 errors when requesting `livescore.php`
*   **Symptoms**: Live match fetch requests fail with 404 status codes.
*   **Root Cause**: The SportsDB v1 API does not contain a `livescore.php` endpoint (it was removed or only exists in v2).
*   **Permanent Fix**: Query `eventsday.php` filtered by date and sport, i.e., `eventsday.php?d={today}&s={Sport}`.

### ⚠️ Bug 3: Empty teams list returned for league ID queries
*   **Symptoms**: Querying teams inside leagues fails to fetch results.
*   **Root Cause**: TheSportsDB endpoint `search_all_teams.php?l={leagueName}` requires the string-based name of the league (e.g. `English_Premier_League`), not its numeric ID.
*   **Permanent Fix**: Chain queries in `unified-sports-api.ts`: first look up the league by ID using `lookupleague.php` to obtain its `strLeague` name, then query the teams using the name.

### ⚠️ Bug 4: Hydration mismatch crash in production
*   **Symptoms**: React page fails to load on Vercel with `"Failed to execute 'removeChild' on 'Node'"`.
*   **Root Cause**: Server SSR and Client Hydration states differ due to components rendering dynamic states or animations (Framer Motion `AnimatePresence`) immediately.
*   **Permanent Fix**: Wrap dynamic layout states with client-mount guards:
    ```typescript
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <LoadingPlaceholder />;
    ```

### ⚠️ Bug 5: Hardcoded RapidAPI Key Fallback
*   **Symptoms**: live RapidAPI credentials (`e0d3bf230a...`) were hardcoded in code files as fallback strings, posing a security leak risk.
*   **Root Cause**: Fallback values were left in code to run the MMA integration locally without configuring environment files.
*   **Permanent Fix**: Removed hardcoded strings in `lib/api/mma-rapidapi.ts` and `lib/config/env.ts` and defaulted them to `""`, relying entirely on environment variables.

### ⚠️ Bug 6: Hardcoded Admin Password Backdoor
*   **Symptoms**: Next.js admin session routes contained a hardcoded admin password hash and plaintext comment (`Shad_yboyee10`) as a fallback option.
*   **Root Cause**: Credentials were coded directly in `app/api/auth/admin/route.ts` to allow easy login on development environments without setting Upstash or environment flags.
*   **Permanent Fix**: Removed the fallback hash and comment entirely, forcing the route to authenticate exclusively against `process.env.ADMIN_PASSWORD_HASH` and return `500` if not set.

### ⚠️ Bug 7: `/api/espn/*` returned 503 with no way to diagnose it

*   **Symptoms**: `/api/espn/mma/ufc/scoreboard` intermittently returned 503; the UFC
    countdown on the homepage silently rendered nothing. Reported as "ESPN is down".
*   **Root cause**: not an upstream outage. The ESPN endpoint returns 200 consistently
    when tested directly. The proxy route had no timeout, no retry, no stale fallback,
    and — critically — `catch (err)` discarded the error without logging it. A single
    transient blip produced a 503, and the swallowed error made a temporary network
    failure indistinguishable from a broken URL or a local fault, which is why it was
    misdiagnosed as a permanent ESPN outage.
*   **Permanent fix** (`app/api/espn/[...sport]/route.ts`):
    *   8s `AbortController` timeout so a hung request cannot block the route.
    *   One retry with a 300 ms gap — transient 5xx usually succeeds on the second try.
    *   **Single timestamped cache entry** (`{ data, fetchedAt }`, 24h TTL). Served as
        `X-Cache: HIT` under 30 minutes old, and served as `X-Cache: STALE` with an
        `X-Cache-Age` header when upstream fails. A stale scoreboard beats an empty widget.
    *   `console.error` with the real reason, plus the reason in the 503 body.
    *   503 now only when upstream fails **and** nothing is cached.
*   **Design note**: an earlier attempt used separate `fresh` and `stale` keys. That
    silently does not work — the stale copy is only written on a fresh-cache miss, and
    since the fresh cache almost always hits, the stale copy stays empty exactly when it
    is needed. Verified by testing the failure path, not by inspection.

---

## 4. Next Steps

Ordered by impact. Items 1-2 are defects with security or production-safety consequences.

1.  **Plan the Next.js 14 → 16 upgrade.** `npm audit` reports high-severity advisories in
    `next`, `postcss`, `sharp` and `undici` — SSRF via rewrites, cache poisoning of RSC
    responses, request smuggling, unauthenticated disclosure of internal Server Function
    endpoints. It is a breaking two-major-version jump and needs its own branch and
    regression pass. Do not bundle it with other work, and do not defer it indefinitely.

2.  **Re-enable type checking in the build.** `next.config.mjs` sets
    `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, so a type
    error ships to production silently. Turn type checking back on first — it is cheaper
    to get green than linting. Until then, run `npx tsc --noEmit` manually before every
    deploy.

3.  **Gate the IndexNow ping.** `npm run build` ends with
    `node scripts/ping-indexnow.js`, which submits URLs to a real search-engine API on
    every run — including local builds and CI. Put it behind an env flag set only in the
    production deploy.

4.  **Audit the funnel end to end.** Confirm pricing on the marketing pages matches
    `/pricing` and `/buy`, that `/api/orders` and `/api/subscribe` validate input and
    return 4xx rather than 500 on a malformed body, and that every device guide under
    `/setup/[device]` renders.

5.  **Check seasonal data before each new season.** Hardcoded season strings silently
    freeze standings when a new campaign starts:
    `grep -rn "20[0-9][0-9]-20[0-9][0-9]" --include=*.tsx --include=*.ts app lib`

### Guardrails

*   **Self-contained.** No redirects or CTAs pointing off this domain. Traffic that
    arrives here converts here.
*   **`origin` is `shad-yy/forclaude`.** Do not add other remotes.
*   **Generated files**: `lib/blog/posts.ts` and `public/llms-full.txt` are rebuilt from
    `content/blog/*.mdx` on every dev and build run. Edit the MDX.
*   **Trouble Registry first.** Check section 3 before debugging — several recurring
    failures already have permanent fixes recorded there.
*   Update this memory bank after any task that changes architecture, adds an
    integration, or fixes a non-obvious bug.
