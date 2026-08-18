import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheSet } from '@/lib/cache/redis'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'

// Allowlist of permitted ESPN paths
const ALLOWED_PATHS = [
  'mma/ufc/scoreboard',
  'mma/ufc/news',
  'racing/f1/scoreboard',
  'racing/f1/news',
  'football/nfl/scoreboard',
  'basketball/nba/scoreboard',
]

/** Below this age the cached copy is served as-is. */
const TTL_FRESH = 1800 // 30 minutes
/** How long the copy is retained so it can be served stale if upstream fails. */
const TTL_STALE = 86_400 // 24 hours
/** Upstream must answer within this, or we stop waiting. */
const UPSTREAM_TIMEOUT_MS = 8000

/**
 * One cache entry, timestamped.
 *
 * Deliberately a single key rather than separate "fresh" and "stale" keys. With two
 * keys the stale copy is only written on a fresh-cache miss — and since the fresh
 * cache almost always hits, the stale copy stays empty precisely when it is needed.
 * Storing the fetch time lets one entry serve both roles.
 */
interface CacheEntry {
  data: unknown
  fetchedAt: number
}

function isEntry(value: unknown): value is CacheEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    typeof (value as CacheEntry).fetchedAt === 'number'
  )
}

async function fetchEspn(path: string): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const res = await fetch(`${ESPN_BASE}/${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`ESPN responded ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sport: string[] } }
) {
  const path = params.sport.join('/')

  // Security: only allow whitelisted paths
  if (!ALLOWED_PATHS.includes(path)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  const cacheKey = `espn:v2:${path}`
  const cachedRaw = await cacheGet(cacheKey)
  const entry = isEntry(cachedRaw) ? cachedRaw : null
  const ageSeconds = entry ? (Date.now() - entry.fetchedAt) / 1000 : Infinity

  if (entry && ageSeconds < TTL_FRESH) {
    return NextResponse.json(entry.data, { headers: { 'X-Cache': 'HIT' } })
  }

  // One retry. ESPN returns transient 5xx and occasional timeouts; a single blip
  // should not take the widget down when a second attempt usually succeeds.
  let lastError: unknown = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const data = await fetchEspn(path)
      await cacheSet(cacheKey, { data, fetchedAt: Date.now() }, TTL_STALE)
      return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } })
    } catch (err) {
      lastError = err
      if (attempt === 1) await new Promise((r) => setTimeout(r, 300))
    }
  }

  // Log the real cause. The previous version discarded it, which made a transient
  // upstream blip indistinguishable from a broken URL or a local fault — and led to
  // this being misdiagnosed as a permanent ESPN outage.
  const reason =
    lastError instanceof Error ? `${lastError.name}: ${lastError.message}` : String(lastError)
  console.error(`[ESPN proxy] ${path} failed after 2 attempts — ${reason}`)

  // Serve stale rather than nothing. A scoreboard a few hours old is still useful;
  // an empty widget is not.
  if (entry) {
    return NextResponse.json(entry.data, {
      headers: {
        'X-Cache': 'STALE',
        'X-Cache-Age': String(Math.round(ageSeconds)),
        'Cache-Control': 'no-store',
      },
    })
  }

  return NextResponse.json(
    { error: 'ESPN data unavailable', path, reason },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  )
}
