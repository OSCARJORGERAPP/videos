import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDb } from '@/lib/mongodb'
import { signToken, buildSetCookie } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json<ApiResponse>({ error: 'email, password y name son requeridos' }, { status: 400 })
  }

  const { email, password, name } = body as { email: string; password: string; name: string }

  if (password.length < 8) {
    return NextResponse.json<ApiResponse>({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
  }

  const db = await connectDb()
  const users = db.collection('users')

  const existing = await users.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json<ApiResponse>({ error: 'El email ya está registrado' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const result = await users.insertOne({
    email: email.toLowerCase(),
    name,
    password: hashed,
    createdAt: new Date(),
  })

  const token = signToken({ userId: result.insertedId.toString(), email: email.toLowerCase() })

  const res = NextResponse.json<ApiResponse>({ data: { email: email.toLowerCase(), name } }, { status: 201 })
  res.headers.set('Set-Cookie', buildSetCookie(token))
  return res
}
