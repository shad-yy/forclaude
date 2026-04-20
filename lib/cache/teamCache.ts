/**
 * lib/cache/teamCache.ts
 *
 * Simple JSON file-based cache for team badge URLs.
 * Stored in .cache/teams.json at project root.
 * TTL: 24 hours per entry.
 * Falls back gracefully (no crash) when the filesystem is unavailable.
 */

import * as fs from 'fs'
import * as path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'teams.json')
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CacheEntry {
  url: string
  expires: number
}

type CacheStore = Record<string, CacheEntry>

function isServer(): boolean {
  return typeof window === 'undefined'
}

function readStore(): CacheStore {
  if (!isServer()) return {}
  try {
    if (!fs.existsSync(CACHE_FILE)) return {}
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    return JSON.parse(raw) as CacheStore
  } catch {
    return {}
  }
}

function writeStore(store: CacheStore): void {
  if (!isServer()) return
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2), 'utf-8')
  } catch {
    // Silently fail (e.g. read-only deploy environments)
  }
}

/** Returns the cached badge URL for a team, or null if missing / expired. */
export function getTeamBadge(teamId: string): string | null {
  if (!isServer()) return null
  const store = readStore()
  const entry = store[teamId]
  if (!entry || Date.now() > entry.expires) return null
  return entry.url
}

/** Persists a badge URL for a team with a 24-hour TTL. */
export function setTeamBadge(teamId: string, url: string): void {
  if (!isServer()) return
  const store = readStore()
  store[teamId] = { url, expires: Date.now() + TTL_MS }
  writeStore(store)
}

/** Clears all cached team badges (useful for testing / admin reset). */
export function clearTeamCache(): void {
  if (!isServer()) return
  writeStore({})
}
