# Core Architectural Decisions & Code Patterns

This file documents the system design guidelines, coding standards, non-negotiable constraints, and API patterns that must be adhered to during development.

---

## 1. Core Architectural Decisions

### Unified API Layer Pattern
To maintain abstraction and make the client code resilient to third-party schema modifications, all queries are funneled through a single unified layer:
```
Frontend Client Component
  └── API Route Proxy (/api/scores, etc.)
        └── UnifiedSportsAPI (lib/api/unified-sports-api.ts)
              └── Low-Level Clients (e.g., theSportsDB)
                    └── External API Endpoints
```
*   **Rule**: Never import low-level clients (`theSportsDB` / `newsAPI` / `ufcScraper`) directly into React components.
*   **Rule**: All raw third-party responses must be transformed into clean, app-level types (e.g., `UnifiedTeam`, `UnifiedFixture`, `UnifiedPlayer`) defined in `lib/types.ts`.

### Server-Side Execution Only
*   **Constraint**: All calls to external APIs containing credentials, or requiring heavy fetching (like TheSportsDB or NewsData), must execute on the server-side.
*   **Implementation**: Done inside Next.js API route handlers (`app/api/*/route.ts`) or React Server Components. Client-side fetching must only query our own proxy routes.

### Centralized TTL Caching System
*   **Implementation**: `lib/cache/apiCache.ts` provides a centralized memory cache.
*   **Configuration**:
    *   **30 Days (Static)**: Leagues, Sports, Countries, Team Info, Player Info, Standings.
    *   **1 Hour (Scheduled Events)**: Upcoming and past league schedules.
    *   **5 Minutes (Near Live)**: Live match summaries.
    *   **1 Minute (Real-time Day)**: Today's live events.

---

## 2. Coding Standards & Non-Negotiables

### Error Handling & Fault Tolerance

**Hybrid rule adopted 2026-09-15 (see `memory-bank/QA-LOG.md` A-13; skill: `playbook/skills/api-fault-vs-absence.md`).** The older "always return `[]` on error" rule was found to conflict with `api-fault-vs-absence`: it turns a provider outage into an empty-state page, which Google reads as "this entity has nothing" and, for pages that then trip `notFound()`, deindexes the URL for weeks. The hybrid rule replaces it:

*   **New resolvers** (added or migrated after 2026-09-15) rethrow `UpstreamFaultError` (`lib/api/errors.ts`) on 5xx / network / timeout / malformed body. A 429 is a fault too (own class if added later). A 404 from upstream is an *absence*, not a fault — return `null` / `[]` for that one case.
*   **Callers of new resolvers** turn a fault into an owned/cached fallback or a truthful "we could not check just now" render — **never** into `notFound()` or an empty page. See `playbook/skills/api-fault-vs-absence.md` §Rules.
*   **The 12 existing routes** listed under S-03 in the plan file (`leagues/route.ts:14-20`, `scores/recent/route.ts:17-23`, etc.) are **grandfathered under this decision date**. They will be migrated one commit per route under Phase B-04 (`api-fault-vs-absence` route migration). Each migration includes a red-first contract test.
*   **New routes have a red-first test that fails if they return `{data:[]}` on fault** — the pattern is illustrated in the S-03 → B-04 migration commits.
*   **User Feedback**: When services fail or rate limits are reached, display a friendly placeholder: `"Data temporarily unavailable"` rather than raw technical stacks.
*   **Rate Limiting Guard**: TheSportsDB API calls are strictly paced at a maximum rate of 25 requests per minute using token bucket queues to protect the API key from 429 locks.

**Do NOT** copy the older "`catch { return [] }` in provider clients" pattern into new code. The exemption is per-route and scoped only to those grandfathered under S-03.

### Type Safety
*   **TypeScript Standard**: The codebase operates in strict TypeScript mode. Run `npx tsc --noEmit` to verify code correctness before any commit.
*   **No Loose Types**: The use of `@ts-ignore` is forbidden. Do not use the `any` type; map objects to precise schemas in `lib/types.ts`.

### UI/UX Rules & Asset Rendering
*   **Image Fallbacks**: When TheSportsDB or external APIs do not supply an image URL, do not try to load remote fallback placeholder files. Instead, render a clean CSS-styled avatar showing the initial letters of the team or player name.
*   **Image Component**: All images must use the Next.js `Image` wrapper, preferably through the `<OptimizedImage />` component, to enforce lazy loading.

---

## 3. TheSportsDB API Endpoint Mapping Gotchas

### 1. League Lookup by Name for Teams
*   **Gotcha**: The endpoint `search_all_teams.php?l={leagueName}` requires the text-based league **name** (e.g. `English_Premier_League`), not its numeric ID.
*   **Pattern**:
    ```typescript
    // First lookup the league using the ID to resolve the name
    const league = await theSportsDB.lookupLeague(leagueId);
    if (league?.strLeague) {
      // Then query teams by the resolved name
      const teams = await theSportsDB.searchAllTeams({ league: league.strLeague });
    }
    ```

### 2. Format Requirements
*   **Season Format**: Must always be `YYYY-YYYY` (e.g. `2024-2025`). Dynamic calculation of seasons should prevent stale hardcoded strings.
*   **Date Format**: Must always be ISO format `YYYY-MM-DD`.
*   **No Livescore.php**: The endpoint `livescore.php` does not exist in v1. Live scores are fetched via `eventsday.php?d={today}&s={Sport}`.
