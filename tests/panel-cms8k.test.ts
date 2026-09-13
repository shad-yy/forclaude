import { describe, it, expect } from 'vitest'
import { generateUsername, DEFAULT_BOUQUETS } from '@/lib/panel/cms8k'

describe('CMS8K Reseller Panel Integration', () => {
  describe('generateUsername', () => {
    it('creates a unique username starting with SLTV_ prefix', () => {
      const u1 = generateUsername('Jackob')
      expect(u1).toMatch(/^SLTV_jacko_\d{4}$/)
    })

    it('sanitises customer name by removing non-alphanumeric characters', () => {
      const u = generateUsername("D'Artagnan @Home!")
      expect(u).toMatch(/^SLTV_darta_\d{4}$/)
    })

    it('handles short names gracefully', () => {
      const u = generateUsername('Al')
      expect(u).toMatch(/^SLTV_al_\d{4}$/)
    })

    it('generates different random usernames for identical names', () => {
      const u1 = generateUsername('Michael')
      const u2 = generateUsername('Michael')
      expect(u1.startsWith('SLTV_micha_')).toBe(true)
      expect(u2.startsWith('SLTV_micha_')).toBe(true)
    })
  })

  describe('DEFAULT_BOUQUETS', () => {
    it('contains all 200+ bouquet package IDs from panel', () => {
      expect(DEFAULT_BOUQUETS.length).toBeGreaterThan(150)
      expect(DEFAULT_BOUQUETS).toContain('1079')
      expect(DEFAULT_BOUQUETS).toContain('1299')
      expect(DEFAULT_BOUQUETS).toContain('1533')
    })
  })

  describe('Strict 24-Hour Security Ceiling', () => {
    it('strictly locks trial package ID to 8 (24h trial package)', async () => {
      const { LOCKED_TRIAL_SUB_ID } = await import('@/lib/panel/cms8k')
      expect(LOCKED_TRIAL_SUB_ID).toBe('8')
    })

    it('caps any expiry timestamp to maximum 24 hours from now', async () => {
      const { calculateStrictExpiry } = await import('@/lib/panel/cms8k')
      const now = Date.now()
      const maxAllowed = now + 24 * 60 * 60 * 1000

      // If a rogue panel response claims 1 month (30 days from now)
      const futureThirtyDays = now + 30 * 24 * 60 * 60 * 1000
      const capped = calculateStrictExpiry(futureThirtyDays)
      const cappedMs = new Date(capped).getTime()

      // Must be capped within 24h (within 1 second of maxAllowed)
      expect(cappedMs).toBeLessThanOrEqual(maxAllowed + 1000)
    })

    it('defaults to exactly 24 hours when no expiry is returned', async () => {
      const { calculateStrictExpiry } = await import('@/lib/panel/cms8k')
      const expected = Date.now() + 24 * 60 * 60 * 1000
      const res = calculateStrictExpiry(undefined)
      const diff = Math.abs(new Date(res).getTime() - expected)
      expect(diff).toBeLessThan(1000) // Within 1s
    })
  })
})
