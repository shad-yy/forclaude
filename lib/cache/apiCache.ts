/**
 * Centralized API Cache Utility
 * Provides TTL-based caching for TheSportsDB API responses
 * Prevents rate-limit violations and optimizes site speed
 */

interface CacheEntry<T> {
  data: T
  expiry: number
  timestamp: number
}

const MAX_ENTRIES = 500

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly DEFAULT_TTL = 3600 // 1 hour in seconds

  constructor() {
    // Periodically clear expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.clearExpired(), 5 * 60 * 1000)
    }
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cache entry with TTL. Evicts oldest if at capacity.
   */
  set<T>(key: string, data: T, ttlSeconds: number = this.DEFAULT_TTL): void {
    // Evict expired entries first if at capacity
    if (this.cache.size >= MAX_ENTRIES) {
      this.clearExpired()
    }

    // If still at capacity after clearing expired, evict oldest
    if (this.cache.size >= MAX_ENTRIES) {
      let oldestKey: string | null = null
      let oldestTime = Infinity
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp
          oldestKey = k
        }
      }
      if (oldestKey) this.cache.delete(oldestKey)
    }

    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, {
      data,
      expiry,
      timestamp: Date.now(),
    })
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    this.clearExpired()
    return {
      size: this.cache.size,
      maxSize: MAX_ENTRIES,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Get cache snapshot (for debugging)
   */
  getSnapshot() {
    const snapshot: Record<string, { expiry: number; timestamp: number; data: unknown }> = {}
    for (const [key, value] of this.cache.entries()) {
      snapshot[key] = {
        expiry: value.expiry,
        timestamp: value.timestamp,
        data: value.data,
      }
    }
    return snapshot
  }
}

// Singleton instance
export const apiCache = new APICache()

// Cache TTL constants based on TheSportsDB documentation recommendations
export const CACHE_TTL = {
  // Long TTL (24h): Static data that rarely changes
  LEAGUES: 86400, // 24 hours
  SPORTS: 86400, // 24 hours
  COUNTRIES: 86400, // 24 hours
  TEAM_INFO: 86400, // 24 hours
  PLAYER_INFO: 86400, // 24 hours
  STANDINGS: 86400, // 24 hours
  ROSTERS: 86400, // 24 hours

  // Medium TTL (1h): Data that updates periodically
  EVENTS_DAY: 3600, // 1 hour
  EVENTS_SEASON: 3600, // 1 hour
  EVENTS_NEXT: 3600, // 1 hour
  EVENTS_LAST: 3600, // 1 hour

  // Short TTL (1min): Live/daily data
  EVENTS_DAY_LIVE: 60, // 1 minute
  SEARCH: 600, // 10 minutes
} as const

/**
 * Helper function to create cache key from endpoint and params
 */
export function createCacheKey(endpoint: string, params?: Record<string, string | number>): string {
  const paramStr = params
    ? Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : ''
  return `api:${endpoint}${paramStr ? `?${paramStr}` : ''}`
}

