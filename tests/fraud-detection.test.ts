import { describe, it, expect } from 'vitest'
import {
  canonicalEmail,
  canonicalName,
  canonicalWhatsApp,
  isFakePhone,
  checkSuspiciousPatterns,
  checkFraud,
  DISPOSABLE_EMAIL_DOMAINS,
} from '@/lib/fraud/detect'

describe('Fraud & Anti-Spam Detection', () => {
  describe('canonicalEmail (Gmail dot trick & alias normalisation)', () => {
    it('normalises Gmail addresses with dots to dot-free canonical form', () => {
      expect(canonicalEmail('jackob.fer@gmail.com')).toBe('jackobfer@gmail.com')
      expect(canonicalEmail('jack.ob.fer@gmail.com')).toBe('jackobfer@gmail.com')
      expect(canonicalEmail('j.a.c.k.o.b.f.e.r@gmail.com')).toBe('jackobfer@gmail.com')
      expect(canonicalEmail('JACKOB.FER@GMAIL.COM')).toBe('jackobfer@gmail.com')
    })

    it('strips + aliases from Gmail addresses', () => {
      expect(canonicalEmail('jackobfer+trial1@gmail.com')).toBe('jackobfer@gmail.com')
      expect(canonicalEmail('jack.ob.fer+freeiptv@gmail.com')).toBe('jackobfer@gmail.com')
    })

    it('normalises googlemail.com to gmail.com', () => {
      expect(canonicalEmail('jackob.fer@googlemail.com')).toBe('jackobfer@gmail.com')
    })

    it('preserves dots for non-Gmail providers while stripping aliases and lowercasing', () => {
      expect(canonicalEmail('john.doe@outlook.com')).toBe('john.doe@outlook.com')
      expect(canonicalEmail('JOHN.DOE+tag@YAHOO.COM')).toBe('john.doe@yahoo.com')
    })
  })

  describe('Disposable email detection', () => {
    it('contains known burner/temporary email domains', () => {
      expect(DISPOSABLE_EMAIL_DOMAINS.has('mailinator.com')).toBe(true)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('guerrillamail.com')).toBe(true)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('tempmail.com')).toBe(true)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('yopmail.com')).toBe(true)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('10minutemail.com')).toBe(true)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('sharklasers.com')).toBe(true)
    })

    it('does not flag legitimate email providers', () => {
      expect(DISPOSABLE_EMAIL_DOMAINS.has('gmail.com')).toBe(false)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('outlook.com')).toBe(false)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('hotmail.com')).toBe(false)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('yahoo.com')).toBe(false)
      expect(DISPOSABLE_EMAIL_DOMAINS.has('icloud.com')).toBe(false)
    })

    it('rejects trial requests using disposable email domains', async () => {
      const result = await checkFraud({
        email: 'attacker@mailinator.com',
        name: 'John Doe',
        whatsapp: '+447911123456',
        device: 'Firestick',
        country: 'UK',
        ip: '192.168.1.1',
      })

      expect(result.allowed).toBe(false)
      if (!result.allowed) {
        expect(result.flagType).toBe('disposable_email')
      }
    })
  })

  describe('Phone number validation & anti-spam', () => {
    it('normalises phone numbers by stripping non-digits and converting UK 07x to 447x', () => {
      expect(canonicalWhatsApp('+44 7429 313810')).toBe('447429313810')
      expect(canonicalWhatsApp('(074) 29-313-810')).toBe('447429313810')
      expect(canonicalWhatsApp('07429 313810')).toBe('447429313810')
    })

    it('detects fake or repeating phone numbers', () => {
      expect(isFakePhone('0000000000')).toBe(true)
      expect(isFakePhone('1111111111')).toBe(true)
      expect(isFakePhone('9999999999')).toBe(true)
      expect(isFakePhone('123456789')).toBe(true)
      expect(isFakePhone('123')).toBe(true) // Too short
    })

    it('accepts valid mobile phone numbers', () => {
      expect(isFakePhone('447429313810')).toBe(false)
      expect(isFakePhone('14155552671')).toBe(false)
      expect(isFakePhone('33612345678')).toBe(false)
    })
  })

  describe('Honeypot & Bot speed detection', () => {
    it('rejects requests where honeypot field is filled by bots', async () => {
      const result = await checkFraud({
        email: 'legit@gmail.com',
        name: 'Jane Smith',
        whatsapp: '+447911123456',
        device: 'Firestick',
        country: 'UK',
        ip: '192.168.1.2',
        honeypot: 'http://spam-site.ru',
      })

      expect(result.allowed).toBe(false)
      if (!result.allowed) {
        expect(result.flagType).toBe('honeypot')
      }
    })

    it('rejects submissions completed unnaturally fast (<1.5s)', async () => {
      const result = await checkFraud({
        email: 'legit@gmail.com',
        name: 'Jane Smith',
        whatsapp: '+447911123456',
        device: 'Firestick',
        country: 'UK',
        ip: '192.168.1.3',
        formLoadedAt: Date.now() - 500, // 500ms elapsed
      })

      expect(result.allowed).toBe(false)
      if (!result.allowed) {
        expect(result.flagType).toBe('bot_speed')
      }
    })
  })

  describe('Suspicious pattern detection', () => {
    it('rejects names containing digits', () => {
      const result = checkSuspiciousPatterns('John123', 'john@gmail.com')
      expect(result.allowed).toBe(false)
      if (!result.allowed) {
        expect(result.flagType).toBe('suspicious_pattern')
      }
    })

    it('rejects names with repeating characters', () => {
      const result = checkSuspiciousPatterns('aaaaaaa', 'a@gmail.com')
      expect(result.allowed).toBe(false)
    })

    it('rejects names that are too short', () => {
      const result = checkSuspiciousPatterns('J', 'john@gmail.com')
      expect(result.allowed).toBe(false)
    })

    it('accepts legitimate names', () => {
      const result = checkSuspiciousPatterns('David Miller', 'david.miller@gmail.com')
      expect(result.allowed).toBe(true)
    })
  })
})
