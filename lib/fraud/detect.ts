/**
 * Fraud Detection & Anti-Spam for Trial Requests
 *
 * Checks performed before allowing a trial to be provisioned:
 *
 * 1. HONEYPOT FIELD — Catches automated web scrapers and spam bots
 * 2. SUBMISSION SPEED — Rejects scripts that submit the form in under 1.5 seconds
 * 3. DISPOSABLE EMAIL BLOCKLIST — Blocks temp/burner emails (10minutemail, mailinator, etc.)
 * 4. GMAIL DOT TRICK NORMALIZATION — Normalises j.a.c.k.o.b.f.e.r@gmail.com == jackobfer@gmail.com
 * 5. DUPLICATE EMAIL CHECK — Prevents multiple trial requests with same email/canonical email
 * 6. FAKE / SPAM PHONE DETECTION — Rejects repeating digits (000000000, 111111111), <7 digits
 * 7. DUPLICATE WHATSAPP CHECK — Prevents same phone with different emails
 * 8. NAME + DEVICE FINGERPRINT — Blocks name & device combos churning trials
 * 9. IP BURST COOLDOWN — 1 request per 3 minutes per IP (stops spam clicking/looping)
 * 10. IP RATE LIMIT — Max 2 trial requests per IP per 48 hours
 * 11. SUSPICIOUS PATTERNS — Numeric names, gibberish, abnormal handle lengths
 */

import { Redis } from '@upstash/redis'
import { shouldBypassIpChecks } from '@/lib/security/client-ip'

/**
 * A-06: answers "can fraud dedup + IP-limit checks actually run?".
 * Trial provisioning callers should preflight with this and return 503
 * if false — otherwise every dedup gate silently no-ops and duplicate
 * trials go through. Library-level checkFraud remains best-effort by
 * design (paid orders don't require dedup infra).
 */
export function isFraudInfraReady(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

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
  | 'honeypot'
  | 'bot_speed'
  | 'disposable_email'
  | 'duplicate_email'
  | 'duplicate_email_dot_trick'
  | 'fake_phone'
  | 'duplicate_whatsapp'
  | 'duplicate_name_device'
  | 'ip_cooldown'
  | 'ip_rate_limit'
  | 'suspicious_pattern'

export interface FraudCheckInput {
  email: string
  name: string
  whatsapp: string
  device: string
  country: string
  ip: string
  honeypot?: string
  formLoadedAt?: number
}

// ─── Known Disposable Email Domains ──────────────────────────────────────────

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'grr.la',
  'mailinator.com',
  'yopmail.com',
  'yopmail.fr',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'throwawaymail.com',
  'dispostable.com',
  'fakemailgenerator.com',
  'trashmail.com',
  'getairmail.com',
  'mohmal.com',
  'crazymailing.com',
  'nada.ltd',
  'inboxkitten.com',
  'generator.email',
  'burnermail.io',
  'minuteinbox.com',
  'mytemp.email',
  'emailondeck.com',
  'tempail.com',
  'fakemail.net',
  'dropmail.me',
  'maildrop.cc',
  'fakeinbox.com',
  'trashmail.net',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
])

// ─── Email Normalisation ──────────────────────────────────────────────────────

/**
 * Normalise a Gmail address to its canonical form.
 * - Strips all dots from the local part (Gmail ignores them)
 * - Strips the +alias suffix
 * - Normalises googlemail.com → gmail.com
 *
 * For non-Gmail providers, strips aliases and lowercases.
 */
export function canonicalEmail(raw: string): string {
  const lower = raw.toLowerCase().trim()
  const [local, domain] = lower.split('@')
  if (!domain) return lower

  const normDomain = domain === 'googlemail.com' ? 'gmail.com' : domain
  const isGmail = normDomain === 'gmail.com'

  if (isGmail) {
    const localClean = local.split('+')[0].replace(/\./g, '')
    return `${localClean}@${normDomain}`
  }

  const localClean = local.split('+')[0]
  return `${localClean}@${normDomain}`
}

export function isDisposableDomain(domain: string): boolean {
  if (!domain) return false
  const lower = domain.toLowerCase().trim()
  if (DISPOSABLE_EMAIL_DOMAINS.has(lower)) return true
  for (const blocked of DISPOSABLE_EMAIL_DOMAINS) {
    if (lower.endsWith('.' + blocked)) return true
  }
  return false
}

// ─── Name & WhatsApp Helpers ──────────────────────────────────────────────────

export function canonicalName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function canonicalWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  // Normalize UK mobile domestic format (07xxx -> 447xxx) so 07429313810 == +447429313810
  if (digits.startsWith('07') && digits.length === 11) {
    return '44' + digits.slice(1)
  }
  return digits
}

export function isFakePhone(digits: string): boolean {
  if (digits.length < 7 || digits.length > 15) return true
  // Check all identical digits (e.g. 0000000000, 1111111111)
  if (/^(\d)\1+$/.test(digits)) return true
  // Check sequential digits (123456789, 987654321)
  if ('01234567890123456789'.includes(digits)) return true
  if ('98765432109876543210'.includes(digits)) return true
  return false
}

// ─── Main Fraud & Spam Check ──────────────────────────────────────────────────

export async function checkFraud(input: FraudCheckInput): Promise<FraudCheckResult> {
  const { email, name, whatsapp, device, ip, honeypot, formLoadedAt } = input

  // 1. Honeypot check — bots fill hidden fields automatically
  if (honeypot && honeypot.trim().length > 0) {
    return {
      allowed: false,
      reason: 'Spam detected.',
      flagType: 'honeypot',
    }
  }

  // 2. Submission speed check — humans take >1.5s to fill a form
  if (formLoadedAt && typeof formLoadedAt === 'number') {
    const elapsed = Date.now() - formLoadedAt
    if (elapsed > 0 && elapsed < 1500) {
      return {
        allowed: false,
        reason: 'Submission too fast. Please take your time to fill the form.',
        flagType: 'bot_speed',
      }
    }
  }

  // 3. Disposable email check (including subdomains)
  const domain = email.toLowerCase().split('@')[1]
  if (domain && isDisposableDomain(domain)) {
    return {
      allowed: false,
      reason: 'Temporary and disposable email addresses are not accepted for free trials.',
      flagType: 'disposable_email',
    }
  }

  // 4. Fake or spam phone check
  const canonWhatsApp = canonicalWhatsApp(whatsapp)
  if (isFakePhone(canonWhatsApp)) {
    return {
      allowed: false,
      reason: 'Please enter a valid WhatsApp phone number where we can deliver your credentials.',
      flagType: 'fake_phone',
    }
  }

  // 5. Suspicious pattern check
  const suspiciousResult = checkSuspiciousPatterns(name, email)
  if (!suspiciousResult.allowed) return suspiciousResult

  // 6. IP burst cooldown & rate limit
  const ipResult = await checkIpLimits(ip)
  if (!ipResult.allowed) return ipResult

  if (!redis) {
    // Library contract: dedup/IP-limit checks are best-effort when Redis
    // is unset. Callers that require dedup (trial provisioning) should
    // preflight with isFraudInfraReady() and reject the request themselves.
    // See A-06 in QA-LOG.md.
    return { allowed: true }
  }

  const canonical = canonicalEmail(email)

  // 6b. Concurrency lock — prevent parallel racing requests with the same canonical email.
  // A-07: TTL was 30s and provisionTrialAndNotify can exceed 30s under panel latency
  // (cms-8k call + two Resend emails). Extended to 300s (5 min) so the lock outlives
  // any realistic provision. Complementary fix: recordFraudFingerprints is now called
  // BEFORE the outbound provision in orders/route.ts, so even if the lock does expire
  // the dedup fingerprint blocks duplicates.
  const lockKey = `fraud:lock:${canonical}`
  const lockAcquired = await redis.set(lockKey, '1', { nx: true, ex: 300 })
  if (!lockAcquired) {
    return {
      allowed: false,
      reason: 'A trial request is already being processed for this account. Please wait.',
      flagType: 'duplicate_email',
    }
  }

  // Helper to release concurrency lock on early rejection
  const releaseLock = async () => {
    if (redis) {
      try { await redis.del(lockKey) } catch {}
    }
  }

  // 7. Exact email duplicate
  const exactId = await redis.get<string>(`customer:email:${email.toLowerCase().trim()}`)
  if (exactId) {
    await releaseLock()
    return {
      allowed: false,
      reason: 'This email address has already been used for a free trial.',
      flagType: 'duplicate_email',
    }
  }

  // 8. Canonical email duplicate (dot trick & alias)
  const canonicalId = await redis.get<string>(`fraud:canonical:${canonical}`)
  if (canonicalId) {
    await releaseLock()
    return {
      allowed: false,
      reason: 'An account with this email address (or a variation of it) has already received a trial.',
      flagType: 'duplicate_email_dot_trick',
    }
  }

  // 9. Duplicate WhatsApp number
  if (canonWhatsApp.length >= 7) {
    const waId = await redis.get<string>(`fraud:whatsapp:${canonWhatsApp}`)
    if (waId) {
      await releaseLock()
      return {
        allowed: false,
        reason: 'This WhatsApp number has already been used for a free trial.',
        flagType: 'duplicate_whatsapp',
      }
    }
  }

  // 10. Name + device combination fingerprint
  if (name && device) {
    const nameDeviceKey = `fraud:name_device:${canonicalName(name)}:${device.toLowerCase().replace(/\s+/g, '_')}`
    const ndId = await redis.get<string>(nameDeviceKey)
    if (ndId) {
      await releaseLock()
      return {
        allowed: false,
        reason: 'A trial was recently issued with the same name and device combination.',
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
  pipeline.set(`fraud:canonical:${canonical}`, input.customerId, { ex: TTL })

  if (canonWhatsApp.length >= 7) {
    pipeline.set(`fraud:whatsapp:${canonWhatsApp}`, input.customerId, { ex: TTL })
  }

  if (input.name && input.device) {
    const nameDeviceKey = `fraud:name_device:${canonicalName(input.name)}:${input.device.toLowerCase().replace(/\s+/g, '_')}`
    pipeline.set(nameDeviceKey, input.customerId, { ex: TTL })
  }

  await pipeline.exec()
}

// ─── IP Cooldown & Rate Limiting ──────────────────────────────────────────────

async function checkIpLimits(ip: string): Promise<FraudCheckResult> {
  // A-05: the loopback bypass used to be unconditional and was the E-02
  // attack path — an attacker sent X-Forwarded-For: 0.0.0.0 to disable
  // IP cooldown+rate-limit entirely. Now gated on NODE_ENV so production
  // never bypasses even if a real 0.0.0.0 arrives (extraction failure).
  if (!redis || !ip) return { allowed: true }
  if (shouldBypassIpChecks(ip)) return { allowed: true }

  // A. Cooldown: Max 1 trial request per 3 minutes (prevents spam clicking/scripts)
  const cooldownKey = `fraud:ip_cooldown:${ip}`
  const inCooldown = await redis.get<boolean>(cooldownKey)
  if (inCooldown) {
    return {
      allowed: false,
      reason: 'Please wait a few minutes before submitting another trial request.',
      flagType: 'ip_cooldown',
    }
  }

  // B. Rate limit: Max 2 trial requests per 48 hours
  const rateKey = `fraud:ip:${ip}`
  const count = await redis.get<number>(rateKey)
  if (count !== null && count >= 2) {
    return {
      allowed: false,
      reason: 'Maximum trial requests exceeded from this network. Please contact support via WhatsApp.',
      flagType: 'ip_rate_limit',
    }
  }

  // Set 3-minute burst cooldown and increment 48-hour counter
  const pipeline = redis.pipeline()
  pipeline.set(cooldownKey, true, { ex: 180 })
  pipeline.set(rateKey, (count ?? 0) + 1, { ex: 60 * 60 * 48 })
  await pipeline.exec()

  return { allowed: true }
}

// ─── Pattern Checks ───────────────────────────────────────────────────────────

export function checkSuspiciousPatterns(name: string, email: string): FraudCheckResult {
  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return {
      allowed: false,
      reason: 'Please provide your full name.',
      flagType: 'suspicious_pattern',
    }
  }

  // Name must contain at least one letter (prevents punctuation-only bot names like "...", "---", "$$$")
  if (!/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmedName)) {
    return {
      allowed: false,
      reason: 'Please provide your real name.',
      flagType: 'suspicious_pattern',
    }
  }

  // Name is digits only or contains digits
  if (/\d/.test(trimmedName)) {
    return {
      allowed: false,
      reason: 'Please provide a valid name without numbers.',
      flagType: 'suspicious_pattern',
    }
  }

  // Name has repeating characters (e.g. "aaaaaaa" or "xxxxxx")
  if (/^(.)\1{4,}$/i.test(trimmedName)) {
    return {
      allowed: false,
      reason: 'Please provide your real name.',
      flagType: 'suspicious_pattern',
    }
  }

  // Email handle before @ is abnormally long or suspicious
  const local = email.split('@')[0] ?? ''
  if (local.length > 35) {
    return {
      allowed: false,
      reason: 'This email address does not appear to be valid.',
      flagType: 'suspicious_pattern',
    }
  }

  return { allowed: true }
}

// ─── Security Log ─────────────────────────────────────────────────────────────

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

  try {
    await redis.lpush('fraud:blocked_log', JSON.stringify(entry))
    await redis.ltrim('fraud:blocked_log', 0, 199)
  } catch (err) {
    console.error('[FRAUD LOG] Failed to record blocked request:', err)
  }
}
