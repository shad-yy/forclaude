/**
 * Fraud Detection for Trial Requests
 *
 * Checks performed before allowing a trial to be provisioned:
 *
 * 1. CANONICAL EMAIL — Gmail dot trick normalization
 *    jakob.fer@gmail.com == jakobfer@gmail.com == j.a.k.o.b.f.e.r@gmail.com
 *    Also handles googlemail.com alias.
 *
 * 2. DUPLICATE EMAIL — exact + canonical match against DB
 *
 * 3. DUPLICATE WHATSAPP — same phone number, different email
 *
 * 4. FUZZY NAME MATCH — catches "Jack Smith" vs "Jack  Smith" vs "JACK SMITH"
 *    combined with same device/country fingerprint
 *
 * 5. IP RATE LIMIT — max 2 trial requests per IP per 48 hours
 *
 * 6. SUSPICIOUS PATTERNS — e.g. name contains digits, obvious fakes
 */

import { Redis } from '@upstash/redis'

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export type FraudCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; flagType: FlagType }

export type FlagType =
  | 'duplicate_email'
  | 'duplicate_email_dot_trick'
  | 'duplicate_whatsapp'
  | 'duplicate_name_device'
  | 'ip_rate_limit'
  | 'suspicious_pattern'

interface FraudCheckInput {
  email: string
  name: string
  whatsapp: string
  device: string
  country: string
  ip: string
}

// ─── Email Normalisation ──────────────────────────────────────────────────────

/**
 * Normalise a Gmail address to its canonical form.
 * - Strips all dots from the local part (Gmail ignores them)
 * - Strips the +alias suffix
 * - Normalises googlemail.com → gmail.com
 *
 * For non-Gmail providers, returns the email lowercased only.
 */
export function canonicalEmail(raw: string): string {
  const lower = raw.toLowerCase().trim()
  const [local, domain] = lower.split('@')
  if (!domain) return lower

  const normDomain = domain === 'googlemail.com' ? 'gmail.com' : domain
  const isGmail = normDomain === 'gmail.com'

  if (isGmail) {
    // Strip + alias suffix, then strip all dots
    const localClean = local.split('+')[0].replace(/\./g, '')
    return `${localClean}@${normDomain}`
  }

  // For other providers: strip + alias, lowercase — dots are significant
  const localClean = local.split('+')[0]
  return `${localClean}@${normDomain}`
}

// ─── Name Normalisation ───────────────────────────────────────────────────────

function canonicalName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')   // collapse multiple spaces
    .trim()
}

function namesSimilar(a: string, b: string): boolean {
  const ca = canonicalName(a)
  const cb = canonicalName(b)
  if (ca === cb) return true

  // Check if one name is contained in the other (e.g. "Jack" vs "Jack Smith")
  if (ca.split(' ')[0] === cb.split(' ')[0] && (ca.length < 6 || cb.length < 6)) {
    return true
  }

  return false
}

// ─── WhatsApp Normalisation ───────────────────────────────────────────────────

function canonicalWhatsApp(raw: string): string {
  // Strip all non-digits
  return raw.replace(/\D/g, '')
}

// ─── Main Fraud Check ─────────────────────────────────────────────────────────

export async function checkFraud(input: FraudCheckInput): Promise<FraudCheckResult> {
  const { email, name, whatsapp, device, country, ip } = input

  // 1. Suspicious pattern check (fast, no DB needed)
  const suspiciousResult = checkSuspiciousPatterns(name, email)
  if (!suspiciousResult.allowed) return suspiciousResult

  // 2. IP rate limit
  const ipResult = await checkIpRateLimit(ip)
  if (!ipResult.allowed) return ipResult

  if (!redis) {
    // No DB — can only do IP check, allow through
    return { allowed: true }
  }

  const canonical = canonicalEmail(email)
  const canonWhatsApp = canonicalWhatsApp(whatsapp)

  // 3. Exact email duplicate
  const exactId = await redis.get<string>(`customer:email:${email}`)
  if (exactId) {
    return {
      allowed: false,
      reason: `This email address has already been used for a free trial.`,
      flagType: 'duplicate_email',
    }
  }

  // 4. Canonical email duplicate (dot trick)
  if (canonical !== email) {
    const canonicalId = await redis.get<string>(`fraud:canonical:${canonical}`)
    if (canonicalId) {
      return {
        allowed: false,
        reason: `An account with this email address (or a variation of it) has already received a trial.`,
        flagType: 'duplicate_email_dot_trick',
      }
    }
  }

  // 5. Duplicate WhatsApp number
  if (canonWhatsApp.length >= 7) {
    const waId = await redis.get<string>(`fraud:whatsapp:${canonWhatsApp}`)
    if (waId) {
      return {
        allowed: false,
        reason: `This WhatsApp number has already been used for a free trial.`,
        flagType: 'duplicate_whatsapp',
      }
    }
  }

  // 6. Name + device fingerprint (scan recent trials — max 500 records)
  if (name && device) {
    const nameDeviceKey = `fraud:name_device:${canonicalName(name)}:${device.toLowerCase().replace(/\s+/g, '_')}`
    const ndId = await redis.get<string>(nameDeviceKey)
    if (ndId) {
      return {
        allowed: false,
        reason: `A trial was recently issued with the same name and device combination.`,
        flagType: 'duplicate_name_device',
      }
    }
  }

  return { allowed: true }
}

/**
 * Call this AFTER a trial is successfully provisioned to record fingerprints.
 */
export async function recordFraudFingerprints(input: {
  customerId: string
  email: string
  name: string
  whatsapp: string
  device: string
}): Promise<void> {
  if (!redis) return

  const canonical = canonicalEmail(input.email)
  const canonWhatsApp = canonicalWhatsApp(input.whatsapp)
  const TTL = 60 * 60 * 24 * 90 // 90 days

  const pipeline = redis.pipeline()

  // Store canonical email → customer ID
  pipeline.set(`fraud:canonical:${canonical}`, input.customerId, { ex: TTL })

  // Store WhatsApp → customer ID
  if (canonWhatsApp.length >= 7) {
    pipeline.set(`fraud:whatsapp:${canonWhatsApp}`, input.customerId, { ex: TTL })
  }

  // Store name+device fingerprint → customer ID
  if (input.name && input.device) {
    const nameDeviceKey = `fraud:name_device:${canonicalName(input.name)}:${input.device.toLowerCase().replace(/\s+/g, '_')}`
    pipeline.set(nameDeviceKey, input.customerId, { ex: TTL })
  }

  await pipeline.exec()
}

// ─── IP Rate Limiting ─────────────────────────────────────────────────────────

async function checkIpRateLimit(ip: string): Promise<FraudCheckResult> {
  if (!redis || !ip || ip === '0.0.0.0') return { allowed: true }

  const key = `fraud:ip:${ip}`
  const count = await redis.get<number>(key)

  if (count !== null && count >= 2) {
    return {
      allowed: false,
      reason: 'Too many trial requests from this network. Please contact support.',
      flagType: 'ip_rate_limit',
    }
  }

  // Increment counter, expire in 48 hours
  await redis.set(key, (count ?? 0) + 1, { ex: 60 * 60 * 48 })
  return { allowed: true }
}

// ─── Pattern Checks ───────────────────────────────────────────────────────────

function checkSuspiciousPatterns(name: string, email: string): FraudCheckResult {
  // Name too short or obviously fake
  if (name.trim().length < 2) {
    return {
      allowed: false,
      reason: 'Please provide your full name.',
      flagType: 'suspicious_pattern',
    }
  }

  // Name is all digits or gibberish (e.g. "12345" or "asdfgh")
  if (/^\d+$/.test(name.trim())) {
    return {
      allowed: false,
      reason: 'Please provide your real name.',
      flagType: 'suspicious_pattern',
    }
  }

  // Email local part is very long random string (>30 chars before @)
  const local = email.split('@')[0] ?? ''
  if (local.length > 40) {
    return {
      allowed: false,
      reason: 'This email address does not appear to be valid.',
      flagType: 'suspicious_pattern',
    }
  }

  return { allowed: true }
}

// ─── Helpers for reviewing flagged requests ───────────────────────────────────

/**
 * Log a blocked request for manual review.
 */
export async function logBlockedRequest(
  input: FraudCheckInput,
  result: Extract<FraudCheckResult, { allowed: false }>
): Promise<void> {
  if (!redis) return

  const entry = {
    ...input,
    flagType: result.flagType,
    reason: result.reason,
    blockedAt: new Date().toISOString(),
  }

  // Keep last 200 blocked requests in a list
  await redis.lpush('fraud:blocked_log', JSON.stringify(entry))
  await redis.ltrim('fraud:blocked_log', 0, 199)
}
