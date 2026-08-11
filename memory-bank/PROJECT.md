# Project Identity & Scope: Smart Live TV

**Domain:** `smartlivetv.co.uk` · **Repo:** `shad-yy/forclaude` · **Branch:** `Version-3`
**Hosting:** Vercel · **This is the live production site.**

Smart Live TV is a sports streaming guide, live scores aggregator and news platform with
an integrated subscription service. It is a single self-contained property: it earns its
own search traffic and converts it on the same domain.

---

## 1. Product context & objectives

*   **Primary purpose**: capture search traffic during major sports seasons — Premier
    League, Champions League, Europa League, La Liga, Serie A, UFC, Formula 1, World Cup
    2026 — and convert it into subscriptions.
*   **Core value proposition**: "Everything in one place." Fixtures, kick-off times, live
    scores, league tables, team and player data, sports news and broadcast guides,
    alongside the subscription that provides access.
*   **Key audiences**:
    *   Subscribers and prospects looking for reliable schedule and channel data.
    *   Sports fans checking live scores, standings and fixtures.
    *   Search engines indexing structured sports landing pages.

### Self-contained by design

Traffic that lands here converts here. Every commercial route is a real page on this
domain — `/buy`, `/pricing`, `/free-trial`, `/subscribe`, `/channels`, `/login`,
`/setup/[device]`. The only redirects are internal (`/home` → `/`,
`/football` → `/watch/premier-league`).

**Do not introduce redirects or CTAs that send users to another domain.**

### The two halves reinforce each other

The sports data earns the traffic; the funnel converts it. Neither works alone:

*   Editorial and data pages (`/scores`, `/leagues`, `/watch/*`, `/news`, `/blog`,
    `/ufc`) are the acquisition surface.
*   Commercial pages are the conversion surface.
*   Match, league and event pages sit between the two and carry both.

When changing one, check the effect on the other.

---

## 2. Technical stack

| Layer | Technology | Configuration |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/ISR, API routes, static generation |
| Styling | TailwindCSS | Dark glassmorphism, Framer Motion |
| Language | TypeScript | Strict — `npx tsc --noEmit` must pass clean |
| Cache | In-memory TTL + Upstash Redis | See `PATTERNS.md` |
| Auth | `jose` JWT + bcryptjs | Admin session cookie, 8h expiry |
| Testing | Vitest + Playwright | Unit + E2E |
| Hosting | Vercel | Production deploys from `Version-3` |

## 3. Third-party integrations

### TheSportsDB (v1)
*   Leagues, teams, rosters, standings, fixtures, events.
*   Via `lib/api/the-sports-db.ts`, key `123`.
*   Free tier is 30 req/min; **throttled to 25** with a 2400 ms token-bucket delay.
*   Circuit breaker blocks a failing endpoint for 1 minute after 5 consecutive 429s.
*   Cache: 30 days static, 1 hour scheduled events, 5 min near-live, 1 min today's events.

### NewsData.io
*   Sports news articles. 200 requests/day.
*   Strict fallback to mock data on failure or quota exhaustion.

### UFC.com (scraper)
*   Events, fighter stats, fight cards. Server-side HTML parsing, 5-minute cache.

### ESPN
*   F1 and MMA scoreboards via `/api/espn/*`.
*   ⚠️ The MMA endpoint currently returns **503** on every homepage load — upstream
    failure. The UFC widget degrades silently. See `PROGRESS.md` §4.

---

## 4. Repository structure

```
smart-live-tv/
├── app/
│   ├── api/                  # Server-side proxies and endpoints
│   │   ├── orders/           # Order intake
│   │   ├── subscribe/        # Subscription requests
│   │   ├── auth/admin/       # Admin authentication
│   │   └── espn/ ufc/ scores/ leagues/ teams/ news/ …
│   ├── buy/ pricing/ free-trial/ subscribe/   # Conversion funnel
│   ├── channels/             # Channel directory
│   ├── setup/[device]/       # Device setup guides
│   ├── login/                # Account access
│   ├── scores/ leagues/ teams/ players/ events/ match/[id]/
│   ├── watch/                # Broadcast and matchday guides
│   ├── news/ blog/ ufc/
│   └── page.tsx              # Homepage
├── components/
│   ├── channels/             # Channel library + channel database
│   ├── buy/ pricing/ trial/ setup/   # Funnel components
│   ├── homepage/             # Score widgets, sliders, countdowns
│   ├── layout/               # Header, footer
│   └── ui/                   # Shared primitives (OptimizedImage, modals)
├── content/blog/             # ⚠️ SOURCE OF TRUTH for blog content
├── data/                     # Static JSON caches
├── lib/
│   ├── api/                  # unified-sports-api.ts + low-level clients
│   ├── cache/apiCache.ts     # Central TTL cache
│   ├── blog/posts.ts         # ⚠️ GENERATED — never edit directly
│   └── types.ts              # UnifiedFixture, UnifiedTeam, UnifiedPlayer …
├── scripts/                  # generate-posts.js, ping-indexnow.js, hydration
└── memory-bank/              # Persistent context for AI agents
```

### Generated files — never edit directly

`lib/blog/posts.ts` and `public/llms-full.txt` are produced by
`scripts/generate-posts.js` from `content/blog/*.mdx`. Both `npm run dev` and
`npm run build` regenerate them, so any direct edit is silently overwritten on the next
run. **Edit `content/blog/*.mdx`.**
