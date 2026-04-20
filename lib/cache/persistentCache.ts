/**
 * persistentCache.ts
 *
 * A simple JSON-file-backed cache for server-side API data.
 * Survives server restarts in development and acts as a hot cache
 * so external API quota is preserved.
 *
 * Cache files are stored under .cache/ at the project root.
 * Add  .cache/  to .gitignore.
 */
import fs from "fs"
import path from "path"

const CACHE_DIR = path.join(process.cwd(), ".cache")

/** Ensure the cache directory exists. */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function cacheFilePath(key: string): string {
  // Replace characters that aren't safe in filenames
  const safe = key.replace(/[^a-z0-9_\-]/gi, "_")
  return path.join(CACHE_DIR, `${safe}.json`)
}

interface CacheEntry<T> {
  data: T
  expires: number // unix ms
}

/**
 * Read a value from the persistent cache.
 * Returns `null` if the entry doesn't exist or has expired.
 */
export function cacheRead<T>(key: string): T | null {
  try {
    const file = cacheFilePath(key)
    if (!fs.existsSync(file)) return null

    const raw = fs.readFileSync(file, "utf-8")
    const entry: CacheEntry<T> = JSON.parse(raw)

    if (Date.now() > entry.expires) {
      // Stale — clean up lazily
      fs.unlink(file, () => {})
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

/**
 * Write a value to the persistent cache with a TTL in seconds.
 */
export function cacheWrite<T>(key: string, data: T, ttlSeconds: number): void {
  try {
    ensureCacheDir()
    const entry: CacheEntry<T> = {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    }
    fs.writeFileSync(cacheFilePath(key), JSON.stringify(entry), "utf-8")
  } catch (err) {
    console.warn("[persistentCache] Failed to write cache:", err)
  }
}

/**
 * Convenience wrapper — reads from cache first, then calls `fetcher`
 * and writes the result back. Useful for wrapping API calls.
 *
 * @param key      Unique cache key (e.g. "standings:39:2024")
 * @param ttl      Cache lifetime in seconds
 * @param fetcher  Async function that returns the data to cache
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cacheRead<T>(key)
  if (cached !== null) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[persistentCache] HIT  ${key}`)
    }
    return cached
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[persistentCache] MISS ${key}`)
  }

  const data = await fetcher()
  cacheWrite(key, data, ttl)
  return data
}
