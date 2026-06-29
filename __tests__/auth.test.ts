import { signToken, verifyToken, buildSetCookie, buildClearCookie } from '@/lib/auth'

process.env.JWT_SECRET = 'test-secret-key-for-jest-minimum-32chars'

describe('auth lib', () => {
  const payload = { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' }

  test('signToken genera un string no vacío', () => {
    const token = signToken(payload)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)
  })

  test('verifyToken devuelve el payload correcto', () => {
    const token = signToken(payload)
    const result = verifyToken(token)
    expect(result?.userId).toBe(payload.userId)
    expect(result?.email).toBe(payload.email)
  })

  test('verifyToken devuelve null con token inválido', () => {
    expect(verifyToken('invalid.token.here')).toBeNull()
  })

  test('verifyToken devuelve null con token manipulado', () => {
    const token = signToken(payload)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(verifyToken(tampered)).toBeNull()
  })

  test('buildSetCookie incluye HttpOnly', () => {
    const cookie = buildSetCookie('mytoken')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('mytoken')
  })

  test('buildClearCookie pone Max-Age=0', () => {
    const cookie = buildClearCookie()
    expect(cookie).toContain('Max-Age=0')
  })
})
