import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

// Stored as "scrypt$<salt hex>$<hash hex>". scripts/hash-admin-password.mjs
// writes the same format so the first admin can be seeded from the SQL editor.
const KEY_LENGTH = 64

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => (err ? reject(err) : resolve(key)))
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false
  const expected = Buffer.from(keyHex, 'hex')
  const actual = await derive(password, Buffer.from(saltHex, 'hex'))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

// Verified against when the username doesn't exist, so a login attempt takes
// the same time either way.
export const DUMMY_HASH = `scrypt$${'00'.repeat(16)}$${'00'.repeat(KEY_LENGTH)}`

export const MIN_PASSWORD_LENGTH = 10
export const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/
