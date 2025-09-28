import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

import { encrypt, decrypt } from '../crypto'

// Capture original environment variables for restoration between tests
const ORIGINAL_ENV = { ...process.env }

beforeAll(() => {
  process.env = {
    ...ORIGINAL_ENV,
    LOCALE_ENCRYPTION_KEY: 'test-encryption-key-for-unit-tests-should-be-32-chars-minimum'
  }
})

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    LOCALE_ENCRYPTION_KEY: 'test-encryption-key-for-unit-tests-should-be-32-chars-minimum'
  }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

describe('Encryption/Decryption', () => {
  describe('encrypt function', () => {
    it('should encrypt a plain text string', () => {
      const plaintext = 'test-secret-api-key-123'
      const encrypted = encrypt(plaintext)
      
      expect(encrypted).toBeTruthy()
      expect(typeof encrypted).toBe('string')
      expect(encrypted).not.toBe(plaintext)
      
      // Should be in format "iv:tag:ciphertext"
      const parts = encrypted!.split(':')
      expect(parts).toHaveLength(3)
  expect(parts[0]).toMatch(/^[0-9a-f]{24}$/) // 12 bytes = 24 hex chars
  expect(parts[1]).toMatch(/^[0-9a-f]{32}$/) // 16 bytes = 32 hex chars
      expect(parts[2]).toMatch(/^[0-9a-f]+$/) // variable length hex
    })

    it('should return null for null input', () => {
      expect(encrypt(null)).toBeNull()
    })

    it('should encrypt empty string as ciphertext', () => {
      const encrypted = encrypt('')
      expect(encrypted).toBeTruthy()
      const decrypted = decrypt(encrypted!)
      expect(decrypted).toBe('')
    })

    it('should return different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'same-secret-key'
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)
      
      expect(encrypted1).toBeTruthy()
      expect(encrypted2).toBeTruthy()
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('decrypt function', () => {
    it('should decrypt an encrypted string back to original', () => {
      const plaintext = 'my-secret-bazaar-voice-key-12345'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted!)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should return null for null input', () => {
      expect(decrypt(null)).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(decrypt('')).toBeNull()
    })

    it('should return null for malformed ciphertext', () => {
      expect(decrypt('not-valid-format')).toBeNull()
      expect(decrypt('too:few')).toBeNull()
      expect(decrypt('too:many:parts:here')).toBeNull()
      expect(decrypt('invalid:hex:chars')).toBeNull()
    })

    it('should return null for tampered ciphertext', () => {
      const plaintext = 'original-secret'
      const encrypted = encrypt(plaintext)!
      
      // Tamper with the ciphertext by changing one character
      const parts = encrypted.split(':')
      const tamperedCiphertext = parts[0] + ':' + parts[1] + ':' + parts[2].slice(0, -1) + 'f'
      
      expect(decrypt(tamperedCiphertext)).toBeNull()
    })

    it('should return null for tampered authentication tag', () => {
      const plaintext = 'another-secret'
      const encrypted = encrypt(plaintext)!
      
      // Tamper with the authentication tag
      const parts = encrypted.split(':')
      const tamperedTag = parts[1].slice(0, -1) + 'a'
      const tamperedPayload = parts[0] + ':' + tamperedTag + ':' + parts[2]
      
      expect(decrypt(tamperedPayload)).toBeNull()
    })
  })

  describe('round-trip encryption/decryption', () => {
    const testCases = [
      'simple-key',
      'complex-key-with-special-chars!@#$%^&*()',
      'very-long-key-that-spans-multiple-words-and-contains-numbers-123456789',
      'unicode-test-🔑-key',
      'key with spaces and newlines\n\t',
      'caM5u6cuNXnAXNRXx1m4SO9avBxB8jvZJP9WFEjOGstYc', // Example BV API key format
      'cmUK12TOvQKWeK2k8dcWfLzWjF9JWfwBjHYHjWfbHDO7U', // Example BV Response API key format
    ]

    testCases.forEach((testCase, index) => {
      it(`should correctly encrypt and decrypt test case ${index + 1}: "${testCase.slice(0, 20)}..."`, () => {
        const encrypted = encrypt(testCase)
        expect(encrypted).toBeTruthy()
        
        const decrypted = decrypt(encrypted!)
        expect(decrypted).toBe(testCase)
      })
    })
  })

  describe('key derivation fallbacks', () => {
    it('should work with NEXTAUTH_SECRET fallback', () => {
      // Remove LOCALE_ENCRYPTION_KEY and set NEXTAUTH_SECRET
      delete process.env.LOCALE_ENCRYPTION_KEY
      process.env.NEXTAUTH_SECRET = 'nextauth-secret-for-encryption-key-derivation-test'
      
      const plaintext = 'test-with-nextauth-secret'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted!)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should work with SESSION_SECRET fallback', () => {
      // Remove both LOCALE_ENCRYPTION_KEY and NEXTAUTH_SECRET
      delete process.env.LOCALE_ENCRYPTION_KEY
      delete process.env.NEXTAUTH_SECRET
      process.env.SESSION_SECRET = 'session-secret-for-encryption-key-derivation-test'
      
      const plaintext = 'test-with-session-secret'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted!)
      
      expect(decrypted).toBe(plaintext)
    })
  })

  describe('security properties', () => {
    it('should produce different IV for each encryption', () => {
      const plaintext = 'same-input-text'
      const encrypted1 = encrypt(plaintext)!
      const encrypted2 = encrypt(plaintext)!
      
      const iv1 = encrypted1.split(':')[0]
      const iv2 = encrypted2.split(':')[0]
      
      expect(iv1).not.toBe(iv2)
    })

    it('should produce authentication tags that detect tampering', () => {
      const plaintext = 'authenticated-secret'
      const encrypted = encrypt(plaintext)!
      const parts = encrypted.split(':')
      
      // Original should decrypt correctly
      expect(decrypt(encrypted)).toBe(plaintext)
      
      // Modified ciphertext should fail authentication
      const modifiedCiphertext = parts[0] + ':' + parts[1] + ':' + '00' + parts[2].slice(2)
      expect(decrypt(modifiedCiphertext)).toBeNull()
      
      // Modified IV should fail authentication
      const modifiedIV = '00' + parts[0].slice(2) + ':' + parts[1] + ':' + parts[2]
      expect(decrypt(modifiedIV)).toBeNull()
    })

    it('should handle concurrent encrypt/decrypt operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        return Promise.resolve().then(() => {
          const plaintext = `concurrent-test-${i}`
          const encrypted = encrypt(plaintext)
          return decrypt(encrypted!)
        })
      })
      
      const results = await Promise.all(promises)
      
      results.forEach((result, i) => {
        expect(result).toBe(`concurrent-test-${i}`)
      })
    })
  })
})