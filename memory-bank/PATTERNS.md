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
*   **Graceful Recovery**: API errors must never crash components or render blank white screens. All API methods must catch exceptions and return empty lists (`[]`) or cached fallback states, logging warnings in the console.
*   **User Feedback**: When services fail or rate limits are reached, display a friendly placeholder: `"Data temporarily unavailable"` rather than raw technical stacks.
*   **Rate Limiting Guard**: TheSportsDB API calls are strictly paced at a maximum rate of 25 requests per minute using token bucket queues to protect the API key from 429 locks.

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
