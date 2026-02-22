# Smart Live TV - Agent Onboarding Brief

**Purpose**: Quick-start guide for autonomous coding agents (Replit, Autocoder, etc.) to continue development without loss of intent.

**Time to Read**: 5 minutes  
**Last Updated**: 2025-01-XX

---

## What is Smart Live TV?

A **sports information aggregation platform** that combines live scores, sports news, events, players, and UFC coverage into one unified web experience. Built with **Next.js 14**, **TypeScript**, and a **backend-first architecture**.

**Key Principle**: The backend is the source of truth. Frontend is a presentation layer.

---

## Critical Architecture Rules

### 1. Never Call External APIs from Frontend

- ✅ **DO**: Call `unifiedSportsAPI.searchTeams(query)` from API route
- ❌ **DON'T**: Call `theSportsDB.searchTeams()` directly from React component

### 2. Always Use Unified API Layer

- ✅ **DO**: Import from `lib/api/unified-sports-api.ts`
- ❌ **DON'T**: Import directly from `lib/api/the-sports-db.ts` in pages/components

### 3. Always Handle Errors Gracefully

- ✅ **DO**: Return empty array `[]` on API failure, show "Data temporarily unavailable"
- ❌ **DON'T**: Throw errors that crash the page

### 4. Always Cache Aggressively

- ✅ **DO**: Use existing cache TTLs (60s for events, 24h for leagues)
- ❌ **DON'T**: Make API calls on every page load

---

## Data Flow

```
User Request
    ↓
Next.js Page/Component
    ↓
API Route (app/api/*/route.ts)
    ↓
Unified API Layer (lib/api/unified-sports-api.ts)
    ↓
Low-Level Client (lib/api/the-sports-db.ts, news.ts, ufc.ts)
    ↓
External API (TheSportsDB, NewsData.io, ufc.com)
```

**Key Point**: Each layer only knows about the layer directly above/below it.

---

## External APIs

### TheSportsDB (Primary Sports Data)

- **Base URL**: `https://www.thesportsdb.com/api/v1/json/123/`
- **Rate Limit**: 25 requests/minute (below 30 req/min free tier)
- **Client**: `lib/api/the-sports-db.ts`
- **Unified Layer**: `lib/api/unified-sports-api.ts`
- **Cache TTL**: 60s (events) to 24h (leagues)

### NewsData.io (Sports News)

- **Base URL**: `https://newsdata.io/api/1`
- **API Key**: `NEWS_API_KEY` env variable
- **Client**: `lib/api/news.ts`
- **Fallback**: Mock data if API fails

### UFC.com (UFC Data)

- **Method**: Web scraping (Cheerio)
- **Base URL**: `https://www.ufc.com`
- **Client**: `lib/api/ufc-scraper.ts`
- **Cache TTL**: 5 minutes

---

## Key Data Models

### Unified Types (What Frontend Uses)

```typescript
UnifiedTeam { id, name, logo, country, league }
UnifiedPlayer { id, name, position, team, photo }
UnifiedFixture { id, homeTeam, awayTeam, homeScore, awayScore, status, date }
UnifiedLeague { id, name, country, logo, sport }
```

### TheSportsDB Types (Internal)

```typescript
SportsDbTeam { idTeam, strTeam, strTeamBadge, ... }
SportsDbEvent { idEvent, strEvent, dateEvent, intHomeScore, ... }
```

**Key Point**: Always transform TheSportsDB types to Unified types before returning to frontend.

---

## Caching Strategy

| Data Type               | TTL        | Location                   |
| ----------------------- | ---------- | -------------------------- |
| Leagues, Teams, Players | 24 hours   | In-memory cache            |
| Standings               | 24 hours   | In-memory cache            |
| Events (season)         | 15 minutes | In-memory cache            |
| Events (today)          | 60 seconds | In-memory cache            |
| Search results          | 10 minutes | In-memory cache            |
| News                    | 5 minutes  | Client-side (localStorage) |
| UFC data                | 5 minutes  | In-memory cache            |

**Cache Keys**: Format as `api:{endpoint}:{params}`

---

## Error Handling Pattern

```typescript
try {
  const data = await unifiedSportsAPI.getTeams(leagueId);
  return NextResponse.json({ data });
} catch (error) {
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: "Data temporarily unavailable. Please try again later." },
      { status: 429 }
    );
  }
  // Return cached data or empty array
  const cached = getCached(key);
  return NextResponse.json({ data: cached || [] });
}
```

**Never crash the page. Always return something.**

---

## File Structure Rules

### Where to Add Code

- **New API Endpoint**: `app/api/{name}/route.ts`
- **New Page**: `app/{name}/page.tsx`
- **New Component**: `components/{category}/{name}.tsx`
- **New API Client**: `lib/api/{name}.ts`
- **New Type**: `lib/types.ts` or `lib/types/{name}.ts`

### Never Modify Directly

- ❌ `lib/api/the-sports-db.ts` - Low-level client (only extend, don't change core logic)
- ❌ `lib/api/unified-sports-api.ts` - Unified layer (add methods, don't change existing)
- ❌ `data/sportsdb/*.json` - Reference data (regenerate with scripts, don't edit manually)

---

## Testing Before Deployment

1. **Type Check**: `npx tsc --noEmit`
2. **Lint**: `npm run lint`
3. **Build**: `npm run build`
4. **Test Pages**: Manually test affected pages
5. **Check Logs**: Review `logs/*.log` for errors

---

## Common Pitfalls

### ❌ Don't Do This

```typescript
// Calling external API from component
const response = await fetch("https://www.thesportsdb.com/api/...");
```

### ✅ Do This Instead

```typescript
// Call API route
const response = await fetch("/api/search/teams?q=arsenal");
// Or use unified API in server component
const teams = await unifiedSportsAPI.searchTeams("arsenal");
```

---

## Quick Reference

- **Main API Client**: `lib/api/unified-sports-api.ts`
- **Config**: `lib/config.ts` (league IDs, API URLs)
- **Types**: `lib/types.ts`
- **Cache Utils**: `lib/cache.ts`
- **Env Vars**: `lib/env.ts`

---

## When in Doubt

1. **Check existing code**: Look for similar patterns in the codebase
2. **Use unified API**: Always go through `unifiedSportsAPI`
3. **Handle errors**: Never let errors crash the page
4. **Cache everything**: Reduce API calls as much as possible
5. **Read the docs**: See `TECHNICAL_ARCHITECTURE.md` for detailed explanations

---

**Remember**: Backend robustness = UI polish. Data reliability = Visual effects.

**Next Steps**: Read `TECHNICAL_ARCHITECTURE.md` for complete details.
