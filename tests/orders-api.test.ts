/**
 * Progressive Integration Tests — Orders API & Admin Endpoints
 *
 * Covers:
 *   - Route input validation (Zod schema boundary tests)
 *   - Plan name acceptance & rejection
 *   - Fraud gating on POST /api/orders (honeypot, speed, disposable)
 *   - Non-trial orders bypassing trial fraud checks
 *   - Security on /api/admin/provision-test-trial (401 gate; secret bypass closed in A-03)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// A-06: We stub Upstash env below so /api/orders' isFraudInfraReady()
// preflight returns true and control reaches the fraud gate under test.
// We ALSO mock @upstash/redis so no real network call happens for
// stubbed test URLs — otherwise createCustomer / logBlockedRequest
// would attempt a real DNS lookup and hang.
vi.mock('@upstash/redis', () => {
  class FakeRedis {
    async get() { return null }
    async set() { return 'OK' }
    async del() { return 1 }
    async incr() { return 1 }
    async expire() { return 1 }
    async lpush() { return 1 }
    async ltrim() { return 'OK' }
    pipeline() {
      return { set: () => this, exec: async () => [] }
    }
  }
  return { Redis: FakeRedis }
})

describe('Orders API & Security Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // A-06: /api/orders now preflights on isFraudInfraReady() and returns 503
    // if UPSTASH_REDIS_REST_URL/TOKEN are unset. These tests target the
    // fraud check itself (honeypot, speed, disposable), which sits AFTER
    // that preflight, so we need Upstash env stubbed to non-empty. The
    // real Redis client fails on operations but the fraud check hits its
    // pre-Redis gates (honeypot/speed/disposable) first and returns 429
    // before any Redis call — which is exactly what these tests assert.
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test.upstash.example')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ── 1. Plan Name & Schema Validation ─────────────────────────────────────────

  describe('Zod Schema Validation for Plans', () => {
    it('accepts official duration and marketing plans', async () => {
      const { POST } = await import('@/app/api/orders/route')

      const samplePlans = ['1 Month', 'Popular', 'Standard']
      for (const plan of samplePlans) {
        const req = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Valid Customer',
            email: 'valid.customer@gmail.com',
            whatsapp: '+447911123456',
            plan,
            device: 'Firestick',
          }),
        })

        const res = await POST(req)
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.success).toBe(true)
      }
    })

    it('rejects unrecognised or attacker-invented plans with 400 Bad Request', async () => {
      const { POST } = await import('@/app/api/orders/route')
      const invalidPlans = ['Lifetime', '2 Years', 'Unlimited', 'Admin', 'Free Trial', 'trial', '']

      for (const plan of invalidPlans) {
        const req = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Attacker User',
            email: 'attacker@gmail.com',
            plan,
          }),
        })

        const res = await POST(req)
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.success).toBe(false)
        expect(json.error).toBe('Invalid input')
      }
    })

    it('rejects malformed or missing email addresses with 400', async () => {
      const { POST } = await import('@/app/api/orders/route')
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'not-an-email',
          plan: '1 Month',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })

  // ── 2. Fraud Interception on Trial Orders ───────────────────────────────────

  describe('Fraud Protection on Trial Requests', () => {
    it('blocks trial requests with honeypot field filled (returns 429)', async () => {
      const { POST } = await import('@/app/api/orders/route')
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Bot Runner',
          email: 'bot@gmail.com',
          whatsapp: '+447911123456',
          plan: 'Free Trial Request',
          hp_website: 'http://spam-site.ru',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(429)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Spam detected.')
    })

    it('blocks trial requests completed faster than 1.5 seconds (returns 429)', async () => {
      const { POST } = await import('@/app/api/orders/route')
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Fast Bot',
          email: 'fastbot@gmail.com',
          whatsapp: '+447911123456',
          plan: 'Free Trial Request',
          form_loaded_at: Date.now() - 300, // 300ms elapsed
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(429)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('Submission too fast')
    })

    it('blocks disposable email on trial requests (returns 429)', async () => {
      const { POST } = await import('@/app/api/orders/route')
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Disposable User',
          email: 'disposable@mailinator.com',
          whatsapp: '+447911123456',
          plan: 'Free Trial Request',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(429)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('disposable email')
    })
  })

  // ── 3. Security on Admin Diagnostic Endpoint ─────────────────────────────────

  describe('Security on /api/admin/provision-test-trial', () => {
    it('blocks public unauthenticated access with 401 Unauthorized', async () => {
      const { GET } = await import('@/app/api/admin/provision-test-trial/route')
      const req = new NextRequest('http://localhost:3000/api/admin/provision-test-trial', {
        method: 'GET',
      })

      const res = await GET(req)
      expect(res.status).toBe(401)
      const json = await res.json()
      expect(json.error).toContain('Unauthorized')
    })

    it('rejects invalid secret parameter with 401 (bypass closed in A-03)', async () => {
      const { GET } = await import('@/app/api/admin/provision-test-trial/route')
      const req = new NextRequest('http://localhost:3000/api/admin/provision-test-trial?secret=wrongsecret', {
        method: 'GET',
      })

      const res = await GET(req)
      expect(res.status).toBe(401)
    })
  })
})
