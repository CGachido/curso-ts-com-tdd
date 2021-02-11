import { HashComparer } from '@/data/protocols/cryptography/hash-comparer'
import { Hasher } from '@/data/protocols/cryptography/hasher'
import bcrypt from 'bcrypt'

export class BCryptAdapter implements Hasher, HashComparer {
  constructor (private readonly salt: number) {
    this.salt = salt
  }

  async hash (plaintext: string): Promise<string> {
    const digest = await bcrypt.hash(plaintext, this.salt)
    return digest
  }

  async compare (plaintext: string, digest: string): Promise<boolean> {
    const isValid = await bcrypt.compare(plaintext, digest)
    return isValid
  }
}
