# Smart Live TV - Complete Technical Architecture Documentation

**Version**: 2.0  
**Last Updated**: 2025-01-XX  
**Status**: Production-Ready  
**Purpose**: Complete handoff documentation for autonomous development continuation

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Content & Feature Modules](#2-content--feature-modules)
3. [Backend Architecture](#3-backend-architecture)
4. [API Integration Strategy](#4-api-integration-strategy)
5. [User System & Subscriptions](#5-user-system--subscriptions)
6. [Performance & Scalability](#6-performance--scalability)
7. [Legal & Platform Safety Constraints](#7-legal--platform-safety-constraints)
8. [Development Philosophy](#8-development-philosophy)

---

## 1. Platform Overview

### 1.1 What is Smart Live TV?

Smart Live TV is a **sports information aggregation platform** that consolidates live scores, sports news, event schedules, player/team profiles, and UFC coverage into a single, unified web experience. Unlike traditional sports streaming sites that focus solely on live video, Smart Live TV prioritizes **comprehensive data aggregation** and **real-time information delivery** across multiple sports disciplines.

### 1.2 Core Problem Solved

**The Problem**: Sports fans are fragmented across multiple platforms:

- Live scores on one site
- News on another
- Player stats on a third
- Event schedules scattered across team websites
- UFC information isolated from mainstream sports

**The Solution**: Smart Live TV aggregates all sports information into one platform, providing:

- Unified search across teams, players, events, and news
- Real-time score updates (where available)
- Curated sports news from multiple sources
- Comprehensive event schedules and historical data
- Detailed player and team profiles
- Specialized UFC coverage

### 1.3 Target Users

1. **Casual Sports Fans**: Want quick access to scores, news, and upcoming matches
2. **Fantasy Sports Players**: Need player stats, team rosters, and injury updates
3. **Sports Betting Enthusiasts**: Require comprehensive event data and historical results
4. **UFC Fans**: Seek fighter profiles, rankings, and event schedules
5. **Sports Journalists/Bloggers**: Need aggregated data for content creation

### 1.4 Value Proposition

**Compared to Classic Sports Streaming Sites**:

| Feature               | Classic Sites          | Smart Live TV                     |
| --------------------- | ---------------------- | --------------------------------- |
| **Focus**             | Live video streaming   | Data aggregation & information    |
| **Content Type**      | Video-first            | Data-first (scores, stats, news)  |
| **Coverage**          | Single sport or league | Multi-sport, multi-league         |
| **Real-time Updates** | Video stream only      | Scores, news, schedules           |
| **Search**            | Limited                | Unified cross-sport search        |
| **UFC Integration**   | Separate platforms     | Integrated with mainstream sports |
| **News Aggregation**  | External links         | Curated feed within platform      |

**Key Differentiators**:

- **Backend-first architecture**: Robust API layer, not just a frontend wrapper
- **Multi-source aggregation**: TheSportsDB, NewsData.io, UFC scraping
- **Unified data model**: Normalized interfaces across all sports
- **Rate-limit aware**: Built to respect API constraints and scale gracefully
- **Admin observability**: Full monitoring of all external API health

### 1.5 Why Combine Live Scores, News, Events, Players, and UFC?

**Unified User Experience**:

- Users don't want to switch between 5 different apps
- Cross-sport search: "Find all news about Cristiano Ronaldo" includes football news, transfer rumors, and related events
- Event discovery: "Show me all sports events this weekend" spans football, UFC, basketball, etc.

**Data Relationships**:

- News articles link to players → players link to teams → teams link to events
- UFC fighters can be searched alongside football players
- Event schedules show both football matches and UFC cards
- Unified search indexes all content types

**Monetization Logic**:

- **Free Tier**: Everything in the website is free
- **Premium Tier**: when people want to buy iptv they can be redirected to my store, this website is for bringing traffic.

**Current Implementation**: Subscription system is **basic** (email collection only). Full monetization tiers are **architecturally ready** but not yet implemented.

---

## 2. Content & Feature Modules

### 2.1 Live Scores Module

**Purpose**: Display near-real-time match scores across multiple sports.

**Sports Covered**:

- **Primary**: Soccer/Football (via TheSportsDB)
- **Secondary**: All sports available in TheSportsDB v1 (Basketball, Baseball, Ice Hockey, American Football, Motorsport, etc.)
- **Note**: TheSportsDB does NOT provide true live scores. The platform uses `eventsday.php` with today's date to show "today's matches" with their current status.

**Update Frequency**:

- **Cache TTL**: 60 seconds for `eventsday.php` (today's events)
- **Refresh Strategy**: Client-side polling every 60 seconds for active matches
- **Server-side**: Next.js revalidation every 60 seconds

**Real-time vs Near-real-time**:

- **Not True Real-time**: TheSportsDB free tier does not offer WebSocket or push updates
- **Near-real-time**: 60-second cache TTL means scores are at most 60 seconds old
- **Status Detection**: Uses `strStatus` field to determine if match is "Live", "FT" (Full Time), "NS" (Not Started), etc.

**API Usage Logic**:

```typescript
// Primary endpoint
eventsday.php?d=YYYY-MM-DD&s=Soccer

// Fallback for specific leagues
eventsnextleague.php?id={leagueId}
eventspastleague.php?id={leagueId}
```

**Caching Strategy**:

- **In-memory cache**: 60-second TTL per endpoint call
- **Client-side cache**: 5-minute localStorage cache for UI responsiveness
- **Rate limit protection**: 25 requests/minute maximum (below 30 req/min free tier limit)

**Status Mapping**:

- `"Live"` → Displayed with pulsing "LIVE" badge
- `"FT"` → Final score displayed
- `"NS"` → Upcoming match, show scheduled time
- `"HT"` → Half-time
- `"Postponed"` → Show postponed status

### 2.2 Sports News Module

**Purpose**: Aggregate and display sports news from multiple sources.

**Sources and APIs**:

- **Primary**: NewsData.io (`https://newsdata.io/api/1`)
- **Fallback**: Ask user when API key is missing or API fails
- **Category Filter**: Automatically filters to `category=sports`

**Categorization Logic**:

- **By Sport**: Football, Basketball, UFC, etc. (from article keywords)
- **By Source**: ESPN, BBC Sport, Fox Sports, etc.
- **By Freshness**: Most recent articles first
- **By Relevance**: Keyword matching against user search queries

**Deduplication Rules**:

- **URL-based**: Same article URL = duplicate (removed)
- **Title Similarity**: Levenshtein distance < 0.3 = potential duplicate (flagged, not removed)
- **Time Window**: Articles published within 5 minutes with similar titles = duplicate

**Freshness Ranking**:

1. **Published Time**: Most recent first
2. **Source Authority**: ESPN, BBC Sport ranked higher than unknown sources
3. **Engagement Signals**: (Future) Click-through rate, time-on-article

**Handling API Failures**:

- **Graceful Degradation**: Falls back to mock news data
- **User Notification**: "News temporarily unavailable" message
- **Retry Logic**: Exponential backoff (200ms, 600ms, 1800ms)
- **Circuit Breaker**: After 5 consecutive failures, blocks for 60 seconds

**News Display Logic**:

- **Homepage**: Top 5 trending sports articles
- **News Page**: Paginated list (10 per page)
- **Search**: Full-text search across titles and descriptions
- **Images**: Uses `urlToImage` field, fallback to placeholder

### 2.3 Events & Matches Module

**Purpose**: Display upcoming, live, and past sports events with detailed information.

**Event Lifecycle**:

```
Upcoming → Live → Finished → Archived
```

**State Transitions**:

- **Upcoming**: `strStatus = "NS"` (Not Started), `dateEvent` in future
- **Live**: `strStatus = "Live"` or `"HT"` (Half-time)
- **Finished**: `strStatus = "FT"` (Full Time) or contains "Result"
- **Archived**: `dateEvent` > 30 days ago, moved to historical view

**Timezone Handling**:

- **Storage**: All dates stored in UTC
- **Display**: Converted to user's local timezone (browser `Intl.DateTimeFormat`)
- **API Format**: TheSportsDB uses `YYYY-MM-DD` for dates, `HH:mm:ss` for times
- **Event Time**: `strTimeLocal` field preferred, falls back to `strTime`

**Linking Events to Teams/Players**:

- **Event → Teams**: `idHomeTeam`, `idAwayTeam` fields
- **Event → League**: `idLeague` field
- **Event → Players**: Via `lookuplineup.php?id={eventId}` → `idPlayer` fields
- **Cross-linking**: Event detail pages show:
  - Team profiles (clickable)
  - Player lineups (clickable)
  - League standings (contextual)

**Event Detail Pages**:

- **Overview**: Basic match info, scores, status
- **Stats**: `lookupeventstats.php` → possession, shots, corners, etc.
- **Lineups**: `lookuplineup.php` → starting XI, substitutes
- **Timeline**: `lookuptimeline.php` → goals, cards, substitutions
- **TV Coverage**: `lookuptv.php` → broadcast channels
- **Highlights**: `eventshighlights.php` → video links (if available)

### 2.4 Players & Teams Module

**Purpose**: Comprehensive profiles for players and teams with stats, rosters, and schedules.

**Data Relationships**:

```
League → Teams → Players
Team → Events (past/upcoming)
Player → Team (current/former)
Player → Events (via lineups)
```

**Profile Aggregation**:

- **Team Profile**: Combines `lookupteam.php` + `lookup_all_players.php` + `eventsnext.php` + `eventslast.php`
- **Player Profile**: Combines `lookupplayer.php` + `playerresults.php` + `lookuphonours.php` + `lookupformerteams.php`

**Stats Sourcing**:

- **Team Stats**: `lookuptable.php` → league position, points, goals for/against
- **Player Stats**: `playerresults.php` → match history, goals, assists
- **Historical**: `eventspastleague.php` → past seasons' results

**Cross-linking**:

- **Team Page** → Links to:
  - League page
  - Player profiles (roster)
  - Upcoming/past events
  - Stadium information
- **Player Page** → Links to:
  - Current team
  - Former teams
  - Match history (events)
  - Honours/awards

**Image Handling**:

- **Team Logos**: `strTeamBadge`, `strTeamLogo`, `strTeamFanart1`
- **Player Photos**: `strPlayerThumb`, `strCutout`, `strThumb`
- **Fallback**: `/placeholder-logo.svg` for missing images
- **Optimization**: Next.js Image component with lazy loading

### 2.5 UFC / Combat Sports Module

**Purpose**: Specialized coverage for UFC events, fighters, and rankings.

**Why Separated**:

- **Different Data Source**: UFC data comes from web scraping (`ufc.com`), not TheSportsDB
- **Different Data Model**: Fighters vs players, fights vs matches, weight classes vs positions
- **Different Update Frequency**: UFC events are less frequent but more detailed
- **User Base**: UFC fans have different information needs (rankings, fight history, weight classes)

**Data Model Differences**:

```typescript
// Football Player
interface UnifiedPlayer {
  id: string;
  name: string;
  position: string; // "Forward", "Midfielder"
  team: string;
  nationality: string;
}

// UFC Fighter
interface UFCFighter {
  id: string;
  name: string;
  weightClass: string; // "Lightweight", "Welterweight"
  record: string; // "27-1-0"
  ranking: string; // "#1", "#2"
  stats: {
    wins: number;
    losses: number;
    koTko: number;
    submissions: number;
  };
}
```

**Event Structure**:

- **Main Event**: Title fight or high-profile matchup
- **Co-Main Event**: Second most important fight
- **Main Card**: 5-6 fights
- **Prelims**: 4-6 fights before main card
- **Early Prelims**: 2-4 fights before prelims

**Fighter Profiles**:

- **Basic Info**: Name, nickname, record, weight class, ranking
- **Physical Stats**: Height, weight, reach, leg reach, stance
- **Fight History**: Past opponents, results, methods (KO, submission, decision)
- **Bio**: Career summary, notable achievements

**Data Source**:

- **Scraping**: `lib/api/ufc-scraper.ts` uses Cheerio to parse HTML from `ufc.com`
- **Caching**: 5-minute TTL to avoid excessive requests
- **Fallback**: Mock data if scraping fails

**Integration Points**:

- **Search**: UFC fighters appear in unified search results
- **Homepage**: Upcoming UFC events shown alongside football matches
- **Events Page**: UFC events listed with other sports events

---

## 3. Backend Architecture

### 3.1 Backend-First Architecture Assumptions

**Core Principle**: The backend is the **source of truth**, not the frontend.

**Why Backend-First**:

1. **API Abstraction**: Frontend doesn't know about TheSportsDB, NewsData.io, or UFC scraping
2. **Rate Limit Management**: Centralized in backend, not scattered across client components
3. **Caching Strategy**: Server-side caching reduces API calls and improves performance
4. **Error Handling**: Backend handles API failures gracefully, frontend receives clean data
5. **Security**: API keys never exposed to client (except where required by third-party APIs)

**Architecture Layers**:

```
Frontend (Next.js Pages/Components)
    ↓
API Route Handlers (app/api/*)
    ↓
Unified API Layer (lib/api/unified-sports-api.ts)
    ↓
Low-Level Clients (lib/api/the-sports-db.ts, news.ts, ufc.ts)
    ↓
External APIs (TheSportsDB, NewsData.io, ufc.com)
```

### 3.2 API Gateway Logic

**Current Implementation**: Next.js App Router API routes (`app/api/*/route.ts`)

**Gateway Functions**:

1. **Request Validation**: Validate query parameters, request body
2. **Authentication**: Check JWT tokens for admin routes
3. **Rate Limiting**: Per-IP rate limiting for public endpoints
4. **Error Handling**: Catch errors, return consistent error format
5. **Response Formatting**: Normalize responses across all endpoints

**Example Gateway Pattern**:

```typescript
// app/api/search/teams/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const results = await unifiedSportsAPI.searchTeams(query);
    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Future Enhancement**: Consider API Gateway service (Kong, AWS API Gateway) for:

- Advanced rate limiting
- Request/response transformation
- API versioning
- Analytics and monitoring

### 3.3 Service Separation

**Current Services**:

1. **Sports Service** (`lib/api/unified-sports-api.ts`)

   - Handles all TheSportsDB interactions
   - Normalizes data to unified format
   - Manages sports-specific caching

2. **News Service** (`lib/api/news.ts`)

   - NewsData.io integration
   - Mock data fallback
   - News-specific transformations

3. **UFC Service** (`lib/api/ufc.ts` + `ufc-scraper.ts`)

   - UFC.com scraping
   - Fighter/event data management
   - UFC-specific caching

4. **Admin Service** (`lib/admin/error-logger.ts`, `lib/api/api-monitor.ts`)
   - Error logging
   - API health monitoring
   - System metrics

**Service Communication**:

- **Synchronous**: Services called directly (no message queue)
- **Error Isolation**: One service failure doesn't crash others
- **Independent Scaling**: (Future) Each service can scale independently

### 3.4 Database Choices

**Current State**: **No persistent database**. All data is:

- **Cached in-memory** (server-side)
- **Fetched on-demand** from external APIs
- **Stored in JSON files** (`data/sportsdb/*.json`) for reference data

**Why No Database (Current)**:

- **Simplicity**: No database setup/maintenance
- **Cost**: No database hosting costs
- **API-First**: All data comes from external APIs anyway
- **Stateless**: Easy to scale horizontally

**When to Add Database**:

- **User Accounts**: User profiles, preferences, subscriptions
- **Cached Data**: Store API responses for longer periods
- **Analytics**: Track page views, search queries, popular content
- **Admin Data**: Error logs, API metrics, system configuration

**Recommended Database (Future)**:

- **PostgreSQL**: For structured data (users, subscriptions, analytics)
- **Redis**: For caching and session storage
- **MongoDB**: (Alternative) For flexible schema if needed

**Data Normalization vs Denormalization**:

- **Current**: Denormalized (each API response stored as-is)
- **Future (with DB)**:
  - **Normalized**: Users, teams, players, events in separate tables
  - **Denormalized**: Cache tables for fast reads (standings, recent events)

### 3.5 Background Jobs / Cron Tasks

**Current Implementation**: **None**. All data fetching is on-demand.

**Recommended Background Jobs** (Future):

1. **Cache Refresh Job** (Every 15 minutes)

   - Refresh `eventsday.php` for today's matches
   - Update standings for active leagues
   - Refresh news feed

2. **Data Hydration Job** (Daily, 3 AM UTC)

   - Pre-fetch upcoming events for next 7 days
   - Update team rosters
   - Refresh league tables

3. **Health Check Job** (Every 5 minutes)

   - Ping all external APIs
   - Log response times
   - Alert on failures

4. **Cleanup Job** (Daily)
   - Clear expired cache entries
   - Archive old error logs
   - Rotate log files

**Implementation Options**:

- **Vercel Cron**: If deployed on Vercel
- **GitHub Actions**: Scheduled workflows
- **Node-cron**: In-process scheduler (not recommended for serverless)
- **External Service**: EasyCron, Cron-job.org

**Example Cron Job** (Future):

```typescript
// app/api/cron/refresh-cache/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await refreshTodayEvents();
  await refreshStandings();
  await refreshNews();

  return NextResponse.json({ success: true });
}
```

### 3.6 Error Handling and Fallback Mechanisms

**Error Handling Strategy**:

1. **API Errors**:

   - **429 (Rate Limit)**: Retry with exponential backoff, circuit breaker
   - **404 (Not Found)**: Return empty array, log warning
   - **500 (Server Error)**: Retry up to 3 times, then return cached data or empty state
   - **Network Error**: Return cached data if available, otherwise empty state

2. **Data Validation Errors**:

   - **Shape Mismatch**: Log to `logs/sportsdb-unexpected-*.log`, return empty array
   - **Missing Fields**: Use defaults (empty string, null, placeholder image)
   - **Type Errors**: TypeScript catches at compile time, runtime uses type guards

3. **User-Facing Errors**:
   - **Graceful Degradation**: Show "Data temporarily unavailable" message
   - **Fallback Content**: Show cached data or mock data
   - **Retry UI**: "Refresh" button for users to retry

**Fallback Mechanisms**:

1. **Cached Data**: Always return cached data if API fails
2. **Mock Data**: News and UFC have mock data fallbacks
3. **Empty States**: Show "No data available" instead of crashing
4. **Circuit Breaker**: Stop calling failing APIs for 60 seconds

**Error Logging**:

- **File-based**: `logs/*.log` for unexpected responses
- **In-memory**: Error logger tracks API calls, warnings, errors
- **Admin Dashboard**: `/dev/dashboard` shows error summary

---

## 4. API Integration Strategy

### 4.1 External APIs Used

**1. TheSportsDB v1** (`https://www.thesportsdb.com/api/v1/json/123/`)

- **Purpose**: Primary sports data (scores, teams, players, events, standings)
- **Free Tier**: 30 requests/minute
- **Documentation**: `Sportsdb API documentation.json`
- **Client**: `lib/api/the-sports-db.ts`

**2. NewsData.io** (`https://newsdata.io/api/1`)

- **Purpose**: Sports news aggregation
- **Free Tier**: 200 requests/day
- **API Key**: `pub_1679a8bd150445d2a732b303780bd3ce`
- **Client**: `lib/api/news.ts`

**3. UFC.com** (Web Scraping)

- **Purpose**: UFC events, fighters, rankings
- **Method**: HTML scraping with Cheerio
- **Base URL**: `https://www.ufc.com`
- **Client**: `lib/api/ufc-scraper.ts`

### 4.2 Authentication and Key Management

**API Key Storage**:

- **Environment Variables**: All keys in `.env.local` (never committed)
- **Server-Side Only**: Keys never exposed to client (except `NEXT_PUBLIC_*` where required)
- **Fallback Values**: Default to free tier keys if not set

**Key Rotation**:

- **Manual**: Update `.env.local` and redeploy
- **Future**: Use secret management service (AWS Secrets Manager, Vercel Environment Variables)

**Authentication Methods**:

- **TheSportsDB**: API key in URL path (`/api/v1/json/{KEY}/`)
- **NewsData.io**: API key in query parameter (`?apikey={KEY}`)
- **UFC**: No authentication (public scraping)

### 4.3 Rate Limiting Strategy

**TheSportsDB**:

- **Limit**: 25 requests/minute (below 30 req/min free tier)
- **Implementation**: 2400ms delay between requests (`RATE_LIMIT_MS`)
- **Queue**: Request queue ensures sequential execution
- **Circuit Breaker**: Blocks endpoint for 60s after 5 consecutive 429s

**NewsData.io**:

- **Limit**: ~8 requests/hour (200/day ÷ 24 hours)
- **Implementation**: No explicit rate limiting (relies on caching)
- **Recommendation**: Add rate limiting if usage increases

**UFC Scraping**:

- **Limit**: 5-minute cache TTL (12 requests/hour per endpoint)
- **Implementation**: In-memory cache with timestamp

**Global Rate Limiting** (Future):

- **Per-IP**: Limit API route calls per IP address
- **Per-User**: Limit authenticated user API calls
- **Per-Endpoint**: Different limits for different endpoints

### 4.4 Retry Logic

**Exponential Backoff**:

```typescript
const retryDelays = [200, 600, 1800]; // milliseconds
for (let i = 0; i < retries; i++) {
  try {
    return await fetch(url);
  } catch (error) {
    if (i < retries - 1) {
      await sleep(retryDelays[i]);
    } else {
      throw error;
    }
  }
}
```

**Retry Conditions**:

- **429 (Rate Limit)**: Retry with backoff
- **500/502/503/504 (Server Errors)**: Retry with backoff
- **408 (Timeout)**: Retry with backoff
- **404 (Not Found)**: Don't retry (permanent failure)
- **401/403 (Auth Errors)**: Don't retry (invalid credentials)

**Max Retries**: 3 attempts per request

### 4.5 Graceful Degradation

**If TheSportsDB Fails**:

- Return cached data (if available)
- Show "Data temporarily unavailable" message
- Display empty state with retry button

**If NewsData.io Fails**:

- Return mock news data
- Show "News temporarily unavailable" banner
- Continue showing sports data

**If UFC Scraping Fails**:

- Return cached UFC data (if available)
- Show "UFC data temporarily unavailable" message
- Continue showing other sports

**Partial Failures**:

- If one league fails, show other leagues
- If one team fails, show other teams
- Never crash entire page due to one API failure

### 4.6 Provider Swapping Strategy

**Abstraction Layer**: `lib/api/unified-sports-api.ts`

**How to Swap Providers**:

1. **Create New Client**: `lib/api/new-sports-api.ts`
2. **Implement Same Interface**: Same methods as `unifiedSportsAPI`
3. **Update Import**: Change `unified-sports-api.ts` to use new client
4. **No Frontend Changes**: Frontend doesn't know about swap

**Example**:

```typescript
// Before: TheSportsDB
import { theSportsDB } from "./the-sports-db";
const teams = await theSportsDB.searchTeams(query);

// After: New Provider
import { newSportsAPI } from "./new-sports-api";
const teams = await newSportsAPI.searchTeams(query);

// Frontend code unchanged:
const teams = await unifiedSportsAPI.searchTeams(query);
```

**Data Transformation**:

- **Normalize Responses**: Convert provider-specific format to `UnifiedTeam`, `UnifiedPlayer`, etc.
- **Field Mapping**: Map provider fields to unified fields
- **Default Values**: Handle missing fields gracefully

---

## 5. User System & Subscriptions

### 5.2 Authentication Approach

**Current**: **JWT-based admin authentication only**

**Implementation**:

- **Library**: `jose` (JWT signing/verification)
- **Storage**: HTTP-only cookies (`admin-session`)
- **Expiration**: 8 hours
- **Secret**: `JWT_SECRET` environment variable

**Future User Authentication**:

- **Option 1**: NextAuth.js (recommended)

  - Supports email/password, OAuth, magic links
  - Built-in session management
  - Database adapter for user storage

- **Option 2**: Custom JWT
  - Similar to admin auth
  - More control, more maintenance

**Session Management**:

- **Server-Side**: JWT in HTTP-only cookies
- **Client-Side**: React context for auth state
- **Refresh**: Automatic token refresh before expiration

### 5.5 Device Compatibility Expectations

**Current**: **Web-only** (responsive design)

**Supported Devices**:

- **Desktop**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Tablet**: iPad, Android tablets (responsive layout)
- **Mobile**: iPhone, Android phones (responsive layout)

**Future Platforms**:

- **Mobile Apps**: React Native app (iOS/Android)
- **Smart TVs**: TV-optimized web interface
- **API Access**: REST API for third-party integrations

**Responsive Design**:

- **Breakpoints**: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- **Touch-Friendly**: Large buttons, swipe gestures
- **Performance**: Lazy loading, code splitting for mobile

### 5.6 Payment Abstraction

**Current**: **No payment processing**

**Future Implementation**:

**Payment Provider Abstraction**:

```typescript
// lib/payments/payment-provider.ts
interface PaymentProvider {
  createSubscription(userId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  handleWebhook(event: WebhookEvent): Promise<void>;
}

// lib/payments/stripe-provider.ts
class StripeProvider implements PaymentProvider {
  // Stripe implementation
}

// lib/payments/paypal-provider.ts
class PayPalProvider implements PaymentProvider {
  // PayPal implementation
}
```

**Benefits**:

- **Easy Swapping**: Change provider without changing business logic
- **Multi-Provider**: Support multiple payment methods
- **Testing**: Mock provider for development

**Recommended**: **Stripe** (most developer-friendly, good documentation)

---

## 6. Performance & Scalability

### 6.1 Caching Layers

**Layer 1: In-Memory Cache (Server-Side)**

- **Location**: `lib/api/the-sports-db.ts`, `lib/cache/apiCache.ts`
- **TTL**: Varies by endpoint (60s to 24h)
- **Scope**: Per Next.js server instance
- **Limitation**: Lost on server restart

**Layer 2: Next.js Fetch Cache**

- **Location**: Next.js built-in caching
- **TTL**: Configured per route (`revalidate` option)
- **Scope**: Shared across all server instances
- **Benefit**: Survives server restarts

**Layer 3: Client-Side Cache**

- **Location**: `lib/cache.ts` (localStorage)
- **TTL**: 5 minutes default
- **Scope**: Per browser
- **Benefit**: Instant UI updates, offline support

**Layer 4: CDN Cache** (Future)

- **Location**: Vercel Edge Network / Cloudflare
- **TTL**: Static assets (images, CSS, JS)
- **Scope**: Global
- **Benefit**: Fast global delivery

**Cache Invalidation**:

- **Time-Based**: TTL expiration
- **Manual**: Admin can clear cache via dashboard
- **Event-Based**: (Future) Invalidate on data updates

### 6.2 CDN Assumptions

**Current**: **Vercel Edge Network** (if deployed on Vercel)

**CDN Strategy**:

- **Static Assets**: Images, CSS, JS files cached at edge
- **API Responses**: (Future) Cache API responses at edge with short TTL
- **Image Optimization**: Next.js Image component with automatic optimization

**Future Enhancements**:

- **Edge Functions**: Run API logic at edge (faster response times)
- **Regional Caching**: Cache data per region (reduce latency)
- **Cache Purging**: API to purge CDN cache on data updates

### 6.3 Read-Heavy Optimization

**Current Optimizations**:

- **Server Components**: Most pages are server-rendered (faster initial load)
- **Static Generation**: (Future) Pre-render league/team pages at build time
- **Incremental Static Regeneration**: (Future) Revalidate pages in background

**Database Optimization** (Future):

- **Read Replicas**: Separate read/write databases
- **Query Optimization**: Indexes on frequently queried fields
- **Connection Pooling**: Reuse database connections

**API Optimization**:

- **Batch Requests**: Combine multiple API calls into one
- **Parallel Requests**: Fetch multiple endpoints concurrently
- **Request Deduplication**: Don't fetch same data twice

### 6.4 Handling Traffic Spikes

**Current**: **No specific spike handling** (relies on Vercel auto-scaling)

**Spike Scenarios**:

- **Major Match**: Thousands of users checking scores simultaneously
- **Breaking News**: News page traffic spike
- **Viral Content**: Social media sharing causes traffic surge

**Mitigation Strategies**:

1. **Caching**:

   - Aggressive caching during spikes (longer TTLs)
   - Serve cached data even if slightly stale

2. **Rate Limiting**:

   - Per-IP rate limiting to prevent abuse
   - Queue requests during high load

3. **Load Balancing**:

   - Multiple server instances (Vercel handles automatically)
   - Distribute load across regions

4. **Graceful Degradation**:

   - Show cached data if API fails
   - Disable non-essential features during spikes

5. **Monitoring**:
   - Alert on high traffic
   - Auto-scale based on metrics

**Future**: Consider **Redis** for shared cache across instances

### 6.5 Logging and Monitoring Expectations

**Current Logging**:

- **File-Based**: `logs/*.log` for unexpected API responses
- **Console**: `console.log`, `console.warn`, `console.error`
- **In-Memory**: Error logger tracks API calls, warnings, errors

**Recommended Monitoring** (Future):

1. **Application Monitoring**:

   - **Vercel Analytics**: Built-in if deployed on Vercel
   - **Sentry**: Error tracking and performance monitoring
   - **LogRocket**: Session replay and error tracking

2. **API Monitoring**:

   - **Uptime Monitoring**: Ping APIs every 5 minutes
   - **Response Time Tracking**: Track API latency
   - **Error Rate Tracking**: Alert on high error rates

3. **Performance Monitoring**:

   - **Web Vitals**: Core Web Vitals (LCP, FID, CLS)
   - **API Response Times**: Track slow endpoints
   - **Cache Hit Rates**: Monitor cache effectiveness

4. **Business Metrics**:
   - **Page Views**: Track popular pages
   - **Search Queries**: Most searched terms
   - **User Engagement**: Time on site, bounce rate

**Log Retention**:

- **Error Logs**: 30 days
- **API Logs**: 7 days
- **Analytics**: Indefinite (aggregated data)

---

## 7. Legal & Platform Safety Constraints

### 7.1 Content Aggregation vs Embedding

**Aggregated Content** (What We Store):

- **Scores**: Match results, standings (public data)
- **News Headlines**: Titles, descriptions, links (fair use)
- **Player/Team Data**: Names, stats, photos (public information)
- **Event Schedules**: Dates, times, venues (public information)

**Embedded Content** (What We Link To):

- **News Articles**: Link to original source (don't store full content)
- **Images**: Link to original source (with attribution if required)
- **Videos**: Link to original source (don't host videos)

**What We Never Store**:

- **Full News Articles**: Only headlines, descriptions, links
- **Copyrighted Videos**: No video hosting
- **Proprietary Data**: Don't store data that requires licensing

### 7.2 Risk-Minimization Rules

**1. Attribution**:

- **News Sources**: Always attribute to original source
- **Images**: Use images from TheSportsDB (they handle licensing)
- **Data**: Acknowledge data sources in footer/credits

**2. Rate Limiting**:

- **Respect API Limits**: Stay well below free tier limits
- **User Rate Limiting**: Prevent abuse from single users

**3. Error Handling**:

- **Graceful Failures**: Never crash on API errors
- **User Communication**: Clear error messages, no technical details

**4. Data Privacy**:

- **No Personal Data**: Don't collect unnecessary user data
- **Email Subscriptions**: Opt-in only, easy unsubscribe
- **Cookies**: Minimal cookies (only for auth, no tracking)

**5. Content Moderation** (Future):

- **User-Generated Content**: (If added) Moderate comments, reviews
- **Report System**: Allow users to report inappropriate content

### 7.3 Compliance-Minded Architecture

**GDPR Compliance** (Future):

- **Data Minimization**: Collect only necessary data
- **Right to Deletion**: Allow users to delete their data
- **Data Portability**: Export user data on request
- **Consent Management**: Clear consent for data collection

**DMCA Compliance**:

- **Takedown Process**: Clear process for copyright complaints
- **Content Removal**: Quick removal of infringing content
- **Repeat Offender Policy**: Block repeat copyright violators

**API Terms of Service**:

- **TheSportsDB**: Free tier allows commercial use (verify current TOS)
- **NewsData.io**: Check TOS for aggregation rights
- **UFC Scraping**: Public data, but respect robots.txt

**Legal Recommendations**:

- **Terms of Service**: Clear TOS for users
- **Privacy Policy**: Transparent privacy policy
- **Attribution**: Credit all data sources
- **Legal Review**: Have lawyer review before monetization

---

## 8. Development Philosophy

### 8.1 Why Backend Robustness Over UI

**Core Principle**: **Data reliability = Visual polish**

**Reasons**:

1. **User Trust**: Users trust accurate data and pretty UI
2. **API Stability**: Robust backend handles API failures gracefully
3. **Scalability**: Backend architecture scales better than frontend tweaks
4. **Maintainability**: Clean backend code is easier to maintain long-term

**Trade-offs**:

- **UI**: Functional and cutting-edge
- **Backend**: Over-engineered for reliability
- **Performance**: Optimized for API efficiency, not visual effects

**Future Balance**:

- **Phase 1** (Current): Backend-first, magical creative UI
- **Phase 2** (Future): Enhance UI while maintaining backend robustness
- **Phase 3** (Future): Polish both frontend and backend

### 8.2 Why Modularity and API Abstraction are Non-Negotiable

**Modularity Benefits**:

- **Easy Testing**: Test each module independently
- **Easy Maintenance**: Fix bugs in one module without affecting others
- **Easy Extension**: Add new features without rewriting existing code
- **Team Collaboration**: Multiple developers can work on different modules

**API Abstraction Benefits**:

- **Provider Swapping**: Change data providers without frontend changes
- **Mocking**: Use mock data for development/testing
- **Versioning**: Support multiple API versions simultaneously
- **Error Isolation**: One API failure doesn't crash entire app

**Non-Negotiable Rules**:

1. **Never Call External APIs Directly from Frontend**: Always go through backend
2. **Always Use Unified API Layer**: Don't bypass `unifiedSportsAPI`
3. **Always Handle Errors Gracefully**: Never crash on API failures
4. **Always Cache Aggressively**: Reduce API calls as much as possible

### 8.3 Long-Term Evolution Vision

**Phase 1: Web Platform** (Current)

- ✅ Multi-sport data aggregation
- ✅ News integration
- ✅ Basic admin dashboard

**Phase 2: Mobile Apps** (Future)

- React Native iOS/Android apps
- Push notifications for live scores
- Offline mode with cached data
- Native performance optimizations

**Phase 3: Smart TV Apps** (Future)

- TV-optimized interface
- Voice search
- Large-screen layouts
- Remote control navigation

**Phase 4: API Platform** (Future)

- Public API for third-party developers
- API key management
- Usage analytics
- Webhook support for real-time updates

**Phase 5: AI Features** (Future)

- Personalized content recommendations
- Match predictions
- News summarization
- Chatbot for sports queries

**Technical Debt Management**:

- **Regular Refactoring**: Refactor code every 6 months
- **Dependency Updates**: Keep dependencies up-to-date
- **Performance Audits**: Quarterly performance reviews
- **Security Audits**: Annual security reviews

---

## Appendix A: Key Files Reference

### Core API Files

- `lib/api/the-sports-db.ts` - TheSportsDB client
- `lib/api/unified-sports-api.ts` - Unified API layer
- `lib/api/news.ts` - NewsData.io client
- `lib/api/ufc.ts` - UFC mock data
- `lib/api/ufc-scraper.ts` - UFC web scraper

### Configuration

- `lib/config.ts` - API configuration, league IDs
- `lib/env.ts` - Environment variable handling
- `lib/cache.ts` - Caching utilities

### Types

- `lib/types.ts` - Shared TypeScript types
- `lib/types/sportsdb.ts` - TheSportsDB-specific types

### Admin

- `lib/admin/error-logger.ts` - Error logging
- `lib/api/api-monitor.ts` - API health monitoring

### Scripts

- `scripts/fetch-sportsdb-data.ts` - Data fetching script
- `scripts/validate-sportsdb-endpoints.ts` - Endpoint validation
- `scripts/cache-refresh.ts` - Cache refresh utility

---

## Appendix B: Environment Variables

```bash
# Required
JWT_SECRET=your-secret-key

# Optional (with defaults)
THESPORTSDB_API_KEY=123
NEWS_API_KEY=your-news-api-key
NEXT_PUBLIC_NEWS_API_KEY=your-news-api-key  # If needed client-side

# Optional Overrides
NEXT_PUBLIC_THESPORTSDB_API_BASE_URL=https://...
NEXT_PUBLIC_NEWSDATA_API_BASE_URL=https://...
NEXT_PUBLIC_UFC_API_BASE_URL=https://...
```

---

**Document Status**: Complete  
**Next Review**: Quarterly  
**Maintainer**: Development Team
