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

---

## 4. Next Steps

The repository split is complete (2026-08-11) and this tree is in sync with
`origin/Version-3`. Outstanding work on the store itself:

1.  **Decide whether to commit `CLAUDE.md`.** It was added locally to stop a future
    session mistaking this for the clean project. Currently untracked.
2.  **Security: plan the Next.js 14 to 16 upgrade.** The advisory list is serious —
    SSRF, cache poisoning, request smuggling, unauthenticated disclosure of internal
    Server Function endpoints. It is a breaking two-major-version jump and needs its own
    regression pass, but it should not be deferred indefinitely.
3.  **Fix the UFC widget.** `/api/espn/mma/ufc/scoreboard` returns 503 on every homepage
    load. It fails silently, so users see an empty section rather than an error.
4.  **Re-enable type checking in the build.** `typescript.ignoreBuildErrors` and
    `eslint.ignoreDuringBuilds` are both on, so a type error ships to production without
    complaint. Type checking first — it is cheaper to green than linting.
5.  **Gate the IndexNow ping.** `npm run build` submits URLs to IndexNow on every run,
    including local and CI builds. Gate it behind an env flag set only in production.

### Guardrails

*   Do not remove commercial content — see section 1.
*   `origin` is `shad-yy/forclaude`. Do not add other remotes to this repo.
*   Update this memory bank after any task that changes architecture, adds an
    integration, or fixes a non-obvious bug.
