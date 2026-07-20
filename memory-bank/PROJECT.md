# Project Identity & Scope: Smart Live TV

Smart Live TV is a premium sports streaming guide, scores aggregator, and news platform designed to capture high-intent traffic for sports events and drive subscription conversions. It serves as a unified hub for real-time scores, news, leagues, teams, and countdown guides.

---

## 1. Product Context & Objectives

*   **Primary Purpose**: Capture peak search engine traffic during major sports seasons (specifically Premier League, La Liga, Serie A, Europa League, and World Cup 2026) and convert users into premium IPTV subscribers.
*   **Core Value Proposition**: "Everything in One Place" - combining high-fidelity scheduling, team and league analytics, live scores, curated sports news, and direct broadcast comparison guides in a responsive, modern interface.
*   **Key Audiences**:
    *   IPTV/Streaming Subscribers looking for reliable schedule & channel data.
    *   Sports enthusiasts checking live scores and standings.
    *   Search engines looking for structured, high-authority sports landing pages.

---

## 2. Technical Stack

| Layer | Technology | Usage & Configuration |
|---|---|---|
| **Core Framework** | Next.js 14 (App Router) | Handles SSR/ISR, API routing, and hybrid rendering. |
| **Styling** | Vanilla CSS / TailwindCSS | Modern dark-themed glassmorphism UI, custom animations. |
| **Language** | TypeScript | Strict compilation, unified typings across components. |
| **State & Cache** | Redis / SWR / In-Memory | Aggressive caching layers for API quotas and local state. |
| **Validation** | TypeScript / Custom Schema | API response validation using `expectedKey` structures. |
| **Testing** | Playwright & Vitest | End-to-end user flows and unit testing for core API layers. |
| **Hosting** | Vercel | Production deployments with preview builds. |

---

## 3. Third-Party Integrations

### TheSportsDB (v1)
*   **Purpose**: Main provider for sports leagues, teams, rosters, standings, fixtures, and events.
*   **Access Pattern**: Fetches go through `lib/api/the-sports-db.ts` utilizing API key `123`.
*   **Rate Limits**: Free tier allows 30 requests/minute. The app is throttled at **25 requests/minute** for safety.
*   **Caching**: extended to 30 days for static data (leagues, teams, profiles) and 5 minutes/1 minute for dynamic data (matches/live matches).

### NewsData.io
*   **Purpose**: Fetches real-time sports news articles.
*   **Access Pattern**: Unified proxy server-side calling `newsAPI`.
*   **Quota**: 200 requests/day. Strict fallback to mock news data on failure/exhaustion.

### UFC.com (Scraper)
*   **Purpose**: Live scraping of UFC events, fighter stats, and fight cards.
*   **Access Pattern**: HTML parsing via server-side scraper with a strict 5-minute cache.

---

## 4. Repository Structure

```
smart-live-tv/
├── app/                      # Next.js App Router (pages and API routes)
│   ├── api/                  # Server-side API endpoints (proxies)
│   ├── leagues/              # League listings & modal details
│   ├── teams/                # Team profile views
│   ├── scores/               # Live matches and daily scores
│   └── page.tsx              # Homepage
├── components/               # UI components
│   ├── homepage/             # Scores widgets, live matches, news sliders
│   └── ui/                   # Shared UI primitives (OptimizedImage, modals)
├── data/                     # Local static data JSONs
│   └── sportsdb/             # Pre-fetched teams, leagues, and sports cache
├── lib/                      # Central utilities & core classes
│   ├── api/                  # Unified APIs & low-level external API clients
│   ├── cache/                # apiCache.ts (In-memory TTL cache provider)
│   ├── env.ts                # Environment variable mappings & checks
│   └── types.ts              # Global TypeScript interfaces (UnifiedFixture, etc.)
├── scripts/                  # Automated tool scripts (Hydration, Verification)
└── memory-bank/              # Persistent memory for AI agents (This folder)
```
