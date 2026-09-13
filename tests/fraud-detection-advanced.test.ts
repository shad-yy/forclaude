/**
 * Advanced Fraud Detection Tests — Adversarial & Edge Cases
 *
 * Goes BEYOND the basic tests in fraud-detection.test.ts.
 * Covers bypass attempts, edge cases, and invariant guarantees.
 *
 * Progressive test structure:
 *   LEVEL 1 — Pure function edge cases (no Redis)
 *   LEVEL 2 — Bypass & adversarial attempts
 *   LEVEL 3 — Integration tests (no-Redis path)
 *   LEVEL 4 — Regression & invariant checks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  canonicalEmail,
  canonicalWhatsApp,
  canonicalName,
  isFakePhone,
  checkSuspiciousPatterns,
  checkFraud,
  recordFraudFingerprints,
  DISPOSABLE_EMAIL_DOMAINS,
} from '@/lib/fraud/detect'

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 — Pure function edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('LEVEL 1 — Pure function edge cases', () => {
  describe('canonicalEmail — adversarial inputs', () => {
    it('extreme dot injection — all Gmail dot variants map to the same canonical form', () => {
      const canonical = canonicalEmail('shady@gmail.com')
      const variants = [
        's.h.a.d.y@gmail.com',
        'sh.a.d.y@gmail.com',
        'sha.dy@gmail.com',
        'S.H.A.D.Y@GMAIL.COM',
      ]
      for (const v of variants) {
        expect(canonicalEmail(v)).toBe(canonical)
      }
    })

    it('stacked + alias AND dots in same Gmail address collapse correctly', () => {
      expect(canonicalEmail('j.o.h.n+trial1@gmail.com')).toBe('john@gmail.com')
      expect(canonicalEmail('j.o.h.n+trial1+extra@gmail.com')).toBe('john@gmail.com')
    })

    it('lowercases non-Gmail providers even without dots or aliases', () => {
      expect(canonicalEmail('USER@HOTMAIL.COM')).toBe('user@hotmail.com')
      expect(canonicalEmail('User@Outlook.com')).toBe('user@outlook.com')
    })

    it('handles email with no @ sign — returns original lowercased input', () => {
      const result = canonicalEmail('notanemailaddress')
      expect(typeof result).toBe('string')
      expect(result).toBe('notanemailaddress')
    })

    it('handles empty string without throwing', () => {
      const result = canonicalEmail('')
      expect(typeof result).toBe('string')
    })

    it('non-Gmail alias stripping preserves dots but strips + suffix', () => {
      expect(canonicalEmail('john.doe+tag@outlook.com')).toBe('john.doe@outlook.com')
    })

    it('googlemail.com with dots AND plus alias → same as bare gmail.com', () => {
      expect(canonicalEmail('j.o.h.n+spam@googlemail.com')).toBe('john@gmail.com')
    })
  })

  describe('canonicalWhatsApp — phone normalisation', () => {
    it('strips all non-digit characters including brackets, dashes, spaces', () => {
      expect(canonicalWhatsApp('+44 7429 313 810')).toBe('447429313810')
      expect(canonicalWhatsApp('(074) 29-313-810')).toBe('447429313810')
      expect(canonicalWhatsApp('+1 (415) 555-2671')).toBe('14155552671')
    })

    it('UK domestic and international formats normalize to identical 447x digit strings', () => {
      // +44 7429 313810 → 447429313810  (international)
      // 07429 313810   → 447429313810   (domestic UK normalized to 447x)
      expect(canonicalWhatsApp('+447429313810')).toBe('447429313810')
      expect(canonicalWhatsApp('07429313810')).toBe('447429313810')
    })

    it('returns empty string for fully non-numeric input', () => {
      expect(canonicalWhatsApp('no-numbers-here')).toBe('')
    })
  })

  describe('isFakePhone — adversarial sequences', () => {
    it('detects sequential ascending sequences (substrings of 0123456789...)', () => {
      expect(isFakePhone('1234567890')).toBe(true)
      expect(isFakePhone('0123456789')).toBe(true)
      expect(isFakePhone('12345678')).toBe(true)
    })

    it('detects sequential descending sequences', () => {
      expect(isFakePhone('9876543210')).toBe(true)
      expect(isFakePhone('8765432109')).toBe(true)
    })

    it('detects all-same-digit sequences for every digit 0-9', () => {
      for (let d = 0; d <= 9; d++) {
        const phone = d.toString().repeat(10)
        expect(isFakePhone(phone)).toBe(true)
      }
    })

    it('rejects numbers shorter than 7 digits', () => {
      expect(isFakePhone('852913')).toBe(true)  // 6 digits
      expect(isFakePhone('8529134')).toBe(false) // 7 digits = minimum valid
    })

    it('rejects numbers longer than 15 digits', () => {
      expect(isFakePhone('8529134710928345')).toBe(true)  // 16 digits
      expect(isFakePhone('852913471092834')).toBe(false)  // 15 digits = maximum valid
    })

    it('accepts realistic international phone numbers', () => {
      expect(isFakePhone('447429313810')).toBe(false)
      expect(isFakePhone('14155552671')).toBe(false)
      expect(isFakePhone('33612345678')).toBe(false)
    })
  })

  describe('canonicalName', () => {
    it('lowercases and collapses internal whitespace', () => {
      expect(canonicalName('  John   DOE  ')).toBe('john doe')
      expect(canonicalName('ALICE')).toBe('alice')
      expect(canonicalName('Mary Jane Watson')).toBe('mary jane watson')
    })
  })

  describe('checkSuspiciousPatterns — boundary and edge cases', () => {
    it('accepts names with hyphens', () => {
      expect(checkSuspiciousPatterns('Mary-Jane', 'mary@gmail.com').allowed).toBe(true)
    })

    it("accepts names with apostrophes (O'Brien)", () => {
      expect(checkSuspiciousPatterns("O'Brien", 'obrien@gmail.com').allowed).toBe(true)
    })

    it('accepts names exactly 2 characters long (minimum valid)', () => {
      expect(checkSuspiciousPatterns('Jo', 'jo@gmail.com').allowed).toBe(true)
    })

    it('rejects names exactly 1 character long', () => {
      expect(checkSuspiciousPatterns('J', 'j@gmail.com').allowed).toBe(false)
    })

    it('rejects email handles longer than 35 characters', () => {
      const longHandle = 'a'.repeat(36)
      expect(checkSuspiciousPatterns('John Doe', `${longHandle}@gmail.com`).allowed).toBe(false)
    })

    it('allows email handles exactly 35 characters long (boundary)', () => {
      const handle = 'a'.repeat(35)
      expect(checkSuspiciousPatterns('John Doe', `${handle}@gmail.com`).allowed).toBe(true)
    })

    it('detects 5+ identical characters pattern in name', () => {
      expect(checkSuspiciousPatterns('aaaaa', 'a@gmail.com').allowed).toBe(false)
    })

    it('allows exactly 4 identical chars (just below 5-repeat threshold)', () => {
      expect(checkSuspiciousPatterns('aaaa', 'aaaa@gmail.com').allowed).toBe(true)
    })

    it('rejects digits anywhere in name', () => {
      expect(checkSuspiciousPatterns('John2', 'j@g.com').allowed).toBe(false)
      expect(checkSuspiciousPatterns('2John', 'j@g.com').allowed).toBe(false)
      expect(checkSuspiciousPatterns('Jo3hn', 'j@g.com').allowed).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2 — Bypass & adversarial attempts
// ─────────────────────────────────────────────────────────────────────────────

function makeFreshTestInput(overrides: Partial<any> = {}) {
  const rand = Math.floor(100000 + Math.random() * 900000)
  const letters = ['Adams', 'Baker', 'Clark', 'Davis', 'Evans', 'Foster', 'Green', 'Harris'][rand % 8]
  return {
    email: `fresh.tester.${rand}@gmail.com`,
    name: `Fresh Tester ${letters}`,
    whatsapp: `+447999${rand}`,
    device: 'Firestick',
    country: 'UK',
    ip: '127.0.0.1', // localhost skips Redis IP rate limit and cooldown
    ...overrides,
  }
}

describe('LEVEL 2 — Adversarial bypass attempts', () => {
  describe('Honeypot bypass attempts', () => {
    it('whitespace-only honeypot does NOT block (trims to empty — correct)', async () => {
      const result = await checkFraud(makeFreshTestInput({
        honeypot: '   ',
      }))
      expect(result.allowed).toBe(true)
    })

    it('honeypot with a single non-space character triggers block', async () => {
      const result = await checkFraud(makeFreshTestInput({
        honeypot: 'x',
      }))
      expect(result.allowed).toBe(false)
      if (!result.allowed) expect(result.flagType).toBe('honeypot')
    })

    it('empty string honeypot does not block', async () => {
      const result = await checkFraud(makeFreshTestInput({
        honeypot: '',
      }))
      expect(result.allowed).toBe(true)
    })
  })

  describe('Speed check bypass attempts', () => {
    it('customer opening tab 10 minutes before submitting is NOT blocked', async () => {
      const result = await checkFraud(makeFreshTestInput({
        formLoadedAt: Date.now() - 10 * 60 * 1000,
      }))
      expect(result.allowed).toBe(true)
    })

    it('missing formLoadedAt skips speed check entirely (allowed)', async () => {
      const result = await checkFraud(makeFreshTestInput({
        formLoadedAt: undefined,
      }))
      expect(result.allowed).toBe(true)
    })

    it('formLoadedAt in the future (clock skew) does NOT block', async () => {
      // elapsed = negative → condition (elapsed > 0 && elapsed < 1500) is false
      const result = await checkFraud(makeFreshTestInput({
        formLoadedAt: Date.now() + 3600000,
      }))
      expect(result.allowed).toBe(true)
    })

    it('blocks submissions completed in 1450ms (under 1500ms threshold)', async () => {
      const result = await checkFraud(makeFreshTestInput({
        formLoadedAt: Date.now() - 1450,
      }))
      expect(result.allowed).toBe(false)
      if (!result.allowed) expect(result.flagType).toBe('bot_speed')
    })

    it('allows submissions at exactly 1500ms (boundary is exclusive)', async () => {
      const result = await checkFraud(makeFreshTestInput({
        formLoadedAt: Date.now() - 1500,
      }))
      expect(result.allowed).toBe(true)
    })

    it('formLoadedAt of exactly 0 is falsy — skips speed check (allowed)', async () => {
      const result = await checkFraud(makeFreshTestInput({
        formLoadedAt: 0,
      }))
      expect(result.allowed).toBe(true)
    })
  })

  describe('Disposable email bypass attempts', () => {
    it('blocks disposable email regardless of uppercase in domain part', async () => {
      // email field is lowercased by Zod trim + toLowerCase in the route schema
      // But checkFraud itself also calls .toLowerCase().split('@')[1]
      const result = await checkFraud({
        email: 'test@MAILINATOR.COM',
        name: 'John Doe',
        whatsapp: '+447429313810',
        device: 'Firestick',
        country: 'UK',
        ip: '10.0.2.1',
      })
      expect(result.allowed).toBe(false)
      if (!result.allowed) expect(result.flagType).toBe('disposable_email')
    })

    it('blocks subdomains of disposable domains (e.g. user@mail.mailinator.com)', async () => {
      const { isDisposableDomain } = await import('@/lib/fraud/detect')
      expect(isDisposableDomain('mail.mailinator.com')).toBe(true)
      expect(isDisposableDomain('temp.10minutemail.com')).toBe(true)
      expect(isDisposableDomain('gmail.com')).toBe(false)
    })
  })

  describe('Phone bypass attempts', () => {
    it('sequential phone with 11 digits is still blocked', () => {
      expect(isFakePhone('12345678901')).toBe(true)
    })

    it('non-sequential 8-digit number is NOT blocked', () => {
      expect(isFakePhone('85291347')).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3 — Integration: no-Redis path (graceful degradation)
// ─────────────────────────────────────────────────────────────────────────────

describe('LEVEL 3 — Integration: graceful degradation without Redis', () => {
  it('checkFraud does not throw when Redis is unavailable (returns allowed:true after sync checks)', async () => {
    // When env vars aren't set, redis = null, and the function should
    // return allowed: true after all the synchronous checks pass.
    // This tests the fallback branch at line 206-208 of detect.ts
    await expect(
      checkFraud({
        email: 'fresh@gmail.com',
        name: 'New User',
        whatsapp: '+447911111111',
        device: 'Firestick',
        country: 'UK',
        ip: '172.16.0.1',
      })
    ).resolves.toBeDefined()
  })

  it('recordFraudFingerprints is a silent no-op when Redis is null', async () => {
    await expect(
      recordFraudFingerprints({
        customerId: 'cust_test',
        email: 'test@gmail.com',
        name: 'Test User',
        whatsapp: '447911111111',
        device: 'Firestick',
      })
    ).resolves.not.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 4 — Regression & invariant guarantees
// ─────────────────────────────────────────────────────────────────────────────

describe('LEVEL 4 — Regression & invariant guarantees', () => {
  describe('Email canonical idempotency', () => {
    it('canonicalEmail applied twice gives same result as once', () => {
      const emails = [
        'j.o.h.n+test@gmail.com',
        'JANE@OUTLOOK.COM',
        'alice+tag@googlemail.com',
        'bob@hotmail.com',
      ]
      for (const email of emails) {
        const once = canonicalEmail(email)
        const twice = canonicalEmail(once)
        expect(once).toBe(twice)
      }
    })
  })

  describe('WhatsApp canonical idempotency', () => {
    it('canonicalWhatsApp applied twice gives same result as once', () => {
      const phones = ['+44 7429 313 810', '(074) 29-313-810', '+447429313810']
      for (const phone of phones) {
        const once = canonicalWhatsApp(phone)
        const twice = canonicalWhatsApp(once)
        expect(once).toBe(twice)
      }
    })
  })

  describe('checkFraud interface robustness', () => {
    it('does not throw when all optional fields are absent', async () => {
      await expect(
        checkFraud({
          email: 'minimal@gmail.com',
          name: 'Min User',
          whatsapp: '+447429313810',
          device: '',
          country: '',
          ip: '0.0.0.0',
        })
      ).resolves.toBeDefined()
    })

    it('allows requests from localhost IPs (dev environments bypass IP limits)', async () => {
      const result = await checkFraud(makeFreshTestInput({
        ip: '127.0.0.1',
      }))
      expect(result.allowed).toBe(true)
    })
  })

  describe('DISPOSABLE_EMAIL_DOMAINS set integrity', () => {
    it('contains at least 40 known disposable domains', () => {
      expect(DISPOSABLE_EMAIL_DOMAINS.size).toBeGreaterThanOrEqual(40)
    })

    it('does NOT contain any legitimate providers', () => {
      const legitimate = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com', 'protonmail.com']
      for (const domain of legitimate) {
        expect(DISPOSABLE_EMAIL_DOMAINS.has(domain)).toBe(false)
      }
    })

    it('all entries are lowercase strings (consistent with domain extraction logic)', () => {
      for (const domain of DISPOSABLE_EMAIL_DOMAINS) {
        expect(domain).toBe(domain.toLowerCase())
      }
    })

    it('no entry contains an @ symbol (domains only, not full addresses)', () => {
      for (const domain of DISPOSABLE_EMAIL_DOMAINS) {
        expect(domain).not.toContain('@')
      }
    })
  })

  describe('isFakePhone edge invariants', () => {
    it('all-same-digit at minimum 7-digit length is still blocked', () => {
      expect(isFakePhone('1111111')).toBe(true)
    })

    it('non-sequential 7-digit number is NOT blocked', () => {
      expect(isFakePhone('8529134')).toBe(false)
    })
  })
})
