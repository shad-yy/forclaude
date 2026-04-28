import { cacheGet, cacheSet } from '@/lib/cache/redis'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'
const ESPN_CACHE_TTL = 1800 // 30 minutes

async function espnFetch<T>(
  url: string,
  cacheKey: string,
  ttl = ESPN_CACHE_TTL
): Promise<T | null> {
  // Try Redis cache first
  const cached = await cacheGet<T>(cacheKey)
  if (cached !== null) return cached

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: ttl }
    })
    clearTimeout(timeout)
    
    if (!res.ok) throw new Error(`ESPN API ${res.status}`)
    const data = await res.json()
    
    // Cache in Redis
    await cacheSet(cacheKey, data, ttl)
    return data as T
  } catch (err) {
    console.warn(`[ESPN] Failed to fetch ${cacheKey}:`, err)
    return null
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UFC FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ESPNEvent {
  id: string
  name: string
  shortName?: string
  date: string
  status: {
    type: {
      name: string
      description: string
      completed: boolean
    }
  }
  competitions?: Array<{
    id: string
    competitors: Array<{
      id: string
      displayName: string
      score?: string
    }>
    venue?: {
      fullName: string
      address?: { city: string; country?: string }
    }
    notes?: Array<{ headline: string }>
  }>
  links?: Array<{ href: string; text: string }>
}

export interface ESPNScoreboard {
  events: ESPNEvent[]
  season?: { year: number; type: number }
}

export async function getUFCEvents(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/mma/ufc/scoreboard`,
    'espn:ufc:scoreboard'
  )
  return data?.events || []
}

export async function getUFCNews(): Promise<Array<{
  headline: string
  description: string
  published: string
  links: { web: { href: string } }
  images?: Array<{ url: string; name: string }>
}>> {
  const data = await espnFetch<{ articles: any[] }>(
    `${ESPN_BASE}/mma/ufc/news?limit=10`,
    'espn:ufc:news'
  )
  return data?.articles || []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// F1 FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getF1Schedule(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/racing/f1/scoreboard`,
    'espn:f1:scoreboard'
  )
  return data?.events || []
}

export async function getF1News(): Promise<any[]> {
  const data = await espnFetch<{ articles: any[] }>(
    `${ESPN_BASE}/racing/f1/news?limit=10`,
    'espn:f1:news'
  )
  return data?.articles || []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NFL FUNCTIONS (for future use)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getNFLScoreboard(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/football/nfl/scoreboard`,
    'espn:nfl:scoreboard'
  )
  return data?.events || []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NBA FUNCTIONS (for future use)  
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getNBAScoreboard(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/basketball/nba/scoreboard`,
    'espn:nba:scoreboard'
  )
  return data?.events || []
}
