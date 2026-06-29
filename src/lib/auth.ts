import jwt from 'jsonwebtoken'
import type { JwtPayload } from '@/types'

const COOKIE_NAME = 'token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
  } catch {
    return null
  }
}

export function cookieOptions(maxAge = COOKIE_MAX_AGE) {
  return [
    `${COOKIE_NAME}=`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function buildSetCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function buildClearCookie(): string {
  return [`${COOKIE_NAME}=`, 'Max-Age=0', 'Path=/', 'HttpOnly', 'SameSite=Strict']
    .filter(Boolean)
    .join('; ')
}

export { COOKIE_NAME }
