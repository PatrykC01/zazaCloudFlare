import { pbkdf2 } from '@noble/hashes/pbkdf2'
import { sha256 } from '@noble/hashes/sha256'
import { toHex, hexToBytes } from '@noble/hashes/utils'

export async function hashPassword(password: string, saltHex?: string) {
  const encoder = new TextEncoder()
  const salt = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16))

  const hashBytes = pbkdf2(
    sha256,
    encoder.encode(password),
    salt,
    { c: 100_000, dkLen: 32 }
  )
  return {
    salt: toHex(salt),
    hash: toHex(hashBytes),
  }
}

export function verifyPassword(
  password: string,
  saltHex: string,
  expectedHashHex: string
) {
  const encoder = new TextEncoder()
  const salt = hexToBytes(saltHex)
  const hashBytes = pbkdf2(
    sha256,
    encoder.encode(password),
    salt,
    { c: 100_000, dkLen: 32 }
  )
  return toHex(hashBytes) === expectedHashHex
}
