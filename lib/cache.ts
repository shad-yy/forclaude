/**
 * Unified caching utility for client and server-side caching
 * Security: RISK-012 - Implement caching to reduce redundant requests
 */

interface CacheEntry<T> {
  data: T
  expiry: number
}

// In-memory cache for server-side (Next.js API routes)
const serverCache = new Map<string, CacheEntry<any>>()

// Client-side cache using localStorage
const CLIENT_CACHE_PREFIX = "api_cache_"
const CLIENT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes default

/**
 * Get cached data from server-side in-memory cache
 */
export function getServerCache<T>(key: string): T | null {
  const entry = serverCache.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiry) {
    serverCache.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Set data in server-side in-memory cache
 */
export function setServerCache<T>(key: string, data: T, ttlMs: number = 60000): void {
  serverCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  })

  // Cleanup expired entries periodically
  if (serverCache.size > 1000) {
    const now = Date.now()
    for (const [k, v] of serverCache.entries()) {
      if (now > v.expiry) {
        serverCache.delete(k)
      }
    }
  }
}

/**
 * Get cached data from client-side localStorage
 */
export function getClientCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null

  try {
    const cached = localStorage.getItem(`${CLIENT_CACHE_PREFIX}${key}`)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)

    if (Date.now() > entry.expiry) {
      localStorage.removeItem(`${CLIENT_CACHE_PREFIX}${key}`)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

/**
 * Set data in client-side localStorage cache
 */
export function setClientCache<T>(key: string, data: T, ttlMs: number = CLIENT_CACHE_TTL): void {
  if (typeof window === "undefined") return

  try {
    const entry: CacheEntry<T> = {
      data,
      expiry: Date.now() + ttlMs,
    }
    localStorage.setItem(`${CLIENT_CACHE_PREFIX}${key}`, JSON.stringify(entry))

    // Cleanup old entries (keep last 100)
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CLIENT_CACHE_PREFIX))
    if (keys.length > 100) {
      // Remove oldest entries
      const entries = keys.map((k) => {
        try {
          const entry = JSON.parse(localStorage.getItem(k) || "{}")
          return { key: k, expiry: entry.expiry || 0 }
        } catch {
          return { key: k, expiry: 0 }
        }
      })
      entries.sort((a, b) => a.expiry - b.expiry)
      entries.slice(0, keys.length - 100).forEach((e) => localStorage.removeItem(e.key))
    }
  } catch {
    // localStorage quota exceeded or disabled
  }
}

/**
 * Clear cache entry (both client and server)
 */
export function clearCache(key: string): void {
  serverCache.delete(key)
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${CLIENT_CACHE_PREFIX}${key}`)
  }
}

/**
 * Generate cache key from URL
 */
export function getCacheKey(url: string): string {
  // Use btoa for browser compatibility, or Buffer for Node.js
  if (typeof window !== "undefined") {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, "")
  } else {
    return Buffer.from(url).toString("base64").replace(/[^a-zA-Z0-9]/g, "")
  }
}

