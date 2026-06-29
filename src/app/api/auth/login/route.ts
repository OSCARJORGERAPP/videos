import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDb } from '@/lib/mongodb'
import { signToken, buildSetCookie } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json<ApiResponse>({ error: 'email y password son requeridos' }, { status: 400 })
  }

  const { email, password } = body as { email: string; password: string }

  const db = await connectDb()
  const user = await db.collection('users').findOne({ email: email.toLowerCase() })
  if (!user) {
    return NextResponse.json<ApiResponse>({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password as string)
  if (!valid) {
    return NextResponse.json<ApiResponse>({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const token = signToken({ userId: user._id.toString(), email: user.email as string })

  const res = NextResponse.json<ApiResponse>({
    data: { email: user.email, name: user.name },
  })
  res.headers.set('Set-Cookie', buildSetCookie(token))
  return res
}
