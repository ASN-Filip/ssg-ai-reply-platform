import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12 // recommended for GCM
const TAG_LENGTH = 16 // bytes

function getKey(): Buffer {
  const secret = process.env.LOCALE_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET
  if (!secret) throw new Error('Encryption key not configured (set LOCALE_ENCRYPTION_KEY or NEXTAUTH_SECRET)')
  // derive 32-byte key
  return crypto.createHash('sha256').update(secret).digest()
}

export function encrypt(plain: string | null | undefined): string | null {
  if (plain === null || plain === undefined) return null
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // store as hex parts: iv:tag:ciphertext
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(payload: string | null | undefined): string | null {
  if (!payload) return null
  try {
    const key = getKey()
  const parts = String(payload).split(':')
  if (parts.length !== 3) return null

  const [ivHex, tagHex, cipherHex] = parts
  if (!ivHex || !tagHex) return null

  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(cipherHex, 'hex')

    if (iv.length !== IV_LENGTH) return null
    if (tag.length !== TAG_LENGTH) return null

    const decipher = crypto.createDecipheriv(ALGO, key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn('[crypto] Failed to decrypt payload', error)
    }
    return null
  }
}

const cryptoUtils = { encrypt, decrypt }

export default cryptoUtils
