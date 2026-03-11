/**
 * Unified caching utility for client and server-side caching
 * Security: RISK-012 - Implement caching to reduce redundant requests
 */

interface CacheEntry<T> {
  data: T
  expiry: number
}

// Unified global cache
const globalForCache = global as unknown as { __appCache: Map<string, { data: any; expires: number }> }

// At the top of lib/cache.ts ensure the cache Map is declared at module level
export const cache = globalForCache.__appCache || new Map<string, { data: any; expires: number }>()

if (process.env.NODE_ENV !== "production") {
  globalForCache.__appCache = cache
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000
  })
}

export const CACHE_TTL = {
  PLAYERS: 3600, // 1 hour
  TEAMS: 3600,   // 1 hour
  LEAGUES: 3600, // 1 hour
  SCORES: 60,    // 1 min
  NEWS: 900,     // 15 min
}

