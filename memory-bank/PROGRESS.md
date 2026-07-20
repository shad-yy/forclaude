# System Progress & Error Registry

This file maintains the active development context, records completed tasks, and details every major bug/error encountered along with its resolution.

---

## 1. Active Context

*   **Current Objective**: Verify codebase for security vulnerabilities, environment variable leaks, and confirm files safe to push to GitHub.
*   **Status**: Security audit completed; hardcoded RapidAPI MMA fallback keys successfully removed from codebase. Safe git-push criteria defined.

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

---

## 4. Next Steps

1.  **Repository Push**: Safely stage and push tracked and untracked files while ensuring `.env` files remain ignored.
2.  **Verify Setup**: Confirm that all future agent interactions start by checking these memory bank files.
