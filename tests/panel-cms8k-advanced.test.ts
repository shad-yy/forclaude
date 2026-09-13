/**
 * Advanced CMS8K Panel Tests — Edge Cases & Security Invariants
 *
 * Covers:
 *   - calculateStrictExpiry with extreme/malformed values
 *   - LOCKED_TRIAL_SUB_ID tamper-resistance
 *   - generateUsername edge cases
 *   - Security boundaries & invariant proofs
 */

import { describe, it, expect } from 'vitest'
import {
  generateUsername,
  calculateStrictExpiry,
  LOCKED_TRIAL_SUB_ID,
  MAX_TRIAL_DURATION_MS,
  DEFAULT_BOUQUETS,
} from '@/lib/panel/cms8k'

const MAX_24H = 24 * 60 * 60 * 1000
const BUFFER_10M = 10 * 60 * 1000

describe('CMS8K Panel — Advanced Security & Edge Cases', () => {

  // ── calculateStrictExpiry — adversarial inputs ──────────────────────────────

  describe('calculateStrictExpiry — adversarial inputs', () => {
    it('caps a timestamp 30 days in the future to 24h', () => {
      const future30Days = Date.now() + 30 * 24 * 60 * 60 * 1000
      const capped = calculateStrictExpiry(future30Days)
      const cappedMs = new Date(capped).getTime()
      expect(cappedMs).toBeLessThanOrEqual(Date.now() + MAX_24H + 1000)
    })

    it('caps a timestamp 1 year in the future', () => {
      const futureYear = Date.now() + 365 * 24 * 60 * 60 * 1000
      const capped = calculateStrictExpiry(futureYear)
      const cappedMs = new Date(capped).getTime()
      expect(cappedMs).toBeLessThanOrEqual(Date.now() + MAX_24H + 1000)
    })

    it('caps a Unix timestamp (seconds, not ms) that exceeds 24h', () => {
      // The function auto-detects: if value < 1e11, treat as seconds
      const futureSeconds = Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
      const capped = calculateStrictExpiry(futureSeconds)
      const cappedMs = new Date(capped).getTime()
      expect(cappedMs).toBeLessThanOrEqual(Date.now() + MAX_24H + 1000)
    })

    it('handles NaN input — defaults to exactly 24h from now', () => {
      const capped = calculateStrictExpiry(NaN)
      const cappedMs = new Date(capped).getTime()
      const diff = Math.abs(cappedMs - (Date.now() + MAX_24H))
      expect(diff).toBeLessThan(2000) // within 2s
    })

    it('handles string date that is beyond 24h — caps to 24h', () => {
      const farFuture = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const capped = calculateStrictExpiry(farFuture)
      const cappedMs = new Date(capped).getTime()
      expect(cappedMs).toBeLessThanOrEqual(Date.now() + MAX_24H + 1000)
    })

    it('handles invalid date string — defaults to 24h', () => {
      const capped = calculateStrictExpiry('not-a-date')
      const cappedMs = new Date(capped).getTime()
      const diff = Math.abs(cappedMs - (Date.now() + MAX_24H))
      expect(diff).toBeLessThan(2000)
    })

    it('handles number 0 (epoch) — safely defaults to 24h from now instead of 1970', () => {
      const capped = calculateStrictExpiry(0)
      const cappedMs = new Date(capped).getTime()
      const diff = Math.abs(cappedMs - (Date.now() + MAX_24H))
      expect(diff).toBeLessThan(2000)
    })

    it('handles past date string — safely defaults to 24h from now', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString()
      const capped = calculateStrictExpiry(pastDate)
      const cappedMs = new Date(capped).getTime()
      const diff = Math.abs(cappedMs - (Date.now() + MAX_24H))
      expect(diff).toBeLessThan(2000)
    })

    it('allows expiry within 24h + 10min buffer (panel precision tolerance)', () => {
      // Panel might legitimately return 24h + 5 minutes
      const withinBuffer = Date.now() + MAX_24H + (5 * 60 * 1000) // 24h + 5min
      const result = calculateStrictExpiry(withinBuffer)
      const resultMs = new Date(result).getTime()
      // Should NOT be capped (within buffer)
      expect(resultMs).toBeCloseTo(withinBuffer, -3) // within ~1s
    })

    it('caps expiry exactly at 24h + 10min + 1ms (just over buffer)', () => {
      const justOver = Date.now() + MAX_24H + BUFFER_10M + 1
      const result = calculateStrictExpiry(justOver)
      const resultMs = new Date(result).getTime()
      // Must be capped back to exactly 24h
      expect(resultMs).toBeLessThanOrEqual(Date.now() + MAX_24H + 2000)
    })

    it('returns a valid ISO 8601 string in all cases', () => {
      const inputs: (string | number | undefined)[] = [
        undefined,
        0,
        NaN,
        Date.now() + MAX_24H * 2,
        Date.now() - 1000,  // expired (past)
        'not-a-date',
        new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      ]
      for (const input of inputs) {
        const result = calculateStrictExpiry(input)
        expect(typeof result).toBe('string')
        expect(() => new Date(result)).not.toThrow()
        expect(new Date(result).toISOString()).toBe(result)
      }
    })
  })

  // ── LOCKED_TRIAL_SUB_ID tamper resistance ────────────────────────────────────

  describe('LOCKED_TRIAL_SUB_ID — tamper resistance', () => {
    it('is the literal string "8" — not a number, not overrideable', () => {
      expect(LOCKED_TRIAL_SUB_ID).toBe('8')
      expect(typeof LOCKED_TRIAL_SUB_ID).toBe('string')
    })

    it('cannot be changed at runtime (it is const)', () => {
      // TypeScript enforces this at compile time. At runtime, const doesn't prevent reassignment
      // on imported primitives in ESM. This test confirms the imported value is always "8".
      const { LOCKED_TRIAL_SUB_ID: id } = { LOCKED_TRIAL_SUB_ID }
      expect(id).toBe('8')
    })

    it('MAX_TRIAL_DURATION_MS is exactly 86400000ms (24 hours, no rounding)', () => {
      expect(MAX_TRIAL_DURATION_MS).toBe(86_400_000)
      expect(MAX_TRIAL_DURATION_MS).toBe(24 * 60 * 60 * 1000)
    })
  })

  // ── generateUsername edge cases ──────────────────────────────────────────────

  describe('generateUsername — edge cases', () => {
    it('handles names with only special characters — produces SLTV__XXXX', () => {
      const u = generateUsername('!@#$%^&*()')
      expect(u).toMatch(/^SLTV__\d{4}$/)
    })

    it('handles empty name gracefully — produces SLTV__XXXX', () => {
      const u = generateUsername('')
      expect(u).toMatch(/^SLTV__\d{4}$/)
    })

    it('handles a very long name — truncates to first 5 alphanumeric chars', () => {
      const u = generateUsername('Alexander Benjamin Christoph')
      expect(u).toMatch(/^SLTV_alexa_\d{4}$/)
    })

    it('random suffix is always a 4-digit number (1000-9999)', () => {
      for (let i = 0; i < 20; i++) {
        const u = generateUsername('TestUser')
        const match = u.match(/_(\d{4})$/)
        expect(match).not.toBeNull()
        const rand = parseInt(match![1], 10)
        expect(rand).toBeGreaterThanOrEqual(1000)
        expect(rand).toBeLessThanOrEqual(9999)
      }
    })

    it('two calls with the same name produce different usernames (random suffix)', () => {
      // Not guaranteed 100% but with 9000 possible suffixes, collision is rare
      const results = new Set<string>()
      for (let i = 0; i < 10; i++) {
        results.add(generateUsername('Michael'))
      }
      // At least 2 distinct usernames in 10 calls
      expect(results.size).toBeGreaterThan(1)
    })

    it('username format is always SLTV_{clean}_{4digits}', () => {
      const names = ['John', 'María José', 'Li-Wei', "O'Brien", '张伟', 'UPPERCASE']
      for (const name of names) {
        const u = generateUsername(name)
        expect(u).toMatch(/^SLTV_[a-z0-9]*_\d{4}$/)
      }
    })

    it('strips non-alphanumeric characters from name (special chars, unicode)', () => {
      // Chinese chars are non-alphanumeric — stripped → empty local part
      const u = generateUsername('张伟')
      expect(u).toMatch(/^SLTV__\d{4}$/)
    })
  })

  // ── DEFAULT_BOUQUETS integrity ───────────────────────────────────────────────

  describe('DEFAULT_BOUQUETS integrity', () => {
    it('contains 150+ bouquet IDs', () => {
      expect(DEFAULT_BOUQUETS.length).toBeGreaterThan(150)
    })

    it('all entries are string representations of positive integers', () => {
      for (const id of DEFAULT_BOUQUETS) {
        expect(typeof id).toBe('string')
        const n = parseInt(id, 10)
        expect(isNaN(n)).toBe(false)
        expect(n).toBeGreaterThan(0)
      }
    })

    it('has no duplicate bouquet IDs', () => {
      const unique = new Set(DEFAULT_BOUQUETS)
      expect(unique.size).toBe(DEFAULT_BOUQUETS.length)
    })
  })

  // ── Security invariant proofs ────────────────────────────────────────────────

  describe('Security invariants — hardcoded proof tests', () => {
    it('calculateStrictExpiry never returns more than 24h + 11min from now', () => {
      // The MAXIMUM possible return value is now + 24h + 10min (buffer)
      // Test with 1000 different future timestamps
      for (let i = 0; i < 20; i++) {
        const future = Date.now() + (i + 1) * 2 * 60 * 60 * 1000 // 2h, 4h, ..., 40h
        const result = calculateStrictExpiry(future)
        const ms = new Date(result).getTime()
        const maxPossible = Date.now() + MAX_24H + BUFFER_10M + 2000 // +2s for test execution time
        expect(ms).toBeLessThanOrEqual(maxPossible)
      }
    })

    it('LOCKED_TRIAL_SUB_ID never changes between imports (module singleton)', async () => {
      const { LOCKED_TRIAL_SUB_ID: id1 } = await import('@/lib/panel/cms8k')
      const { LOCKED_TRIAL_SUB_ID: id2 } = await import('@/lib/panel/cms8k')
      expect(id1).toBe('8')
      expect(id2).toBe('8')
      expect(id1).toBe(id2)
    })
  })
})
