import crypto from 'crypto'
import { ENCRYPTION_KEY } from '../util/environment'

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV = '5183666c72eec9e4'

export function encrypt (data: string): string {
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, IV)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
};

export function decrypt (data: string): string {
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, IV)
  const decrypted = decipher.update(data, 'hex', 'utf8')
  return decrypted + decipher.final('utf8')
};
