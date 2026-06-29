import { NextResponse } from 'next/server'
import { buildClearCookie } from '@/lib/auth'

export async function DELETE() {
  const res = NextResponse.json({ data: { ok: true } })
  res.headers.set('Set-Cookie', buildClearCookie())
  return res
}
