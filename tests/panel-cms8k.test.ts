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
})
