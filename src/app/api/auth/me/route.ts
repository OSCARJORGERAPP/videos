import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/mongodb'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import type { ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json<ApiResponse>({ error: 'Token inválido' }, { status: 401 })
  }

  const db = await connectDb()
  const user = await db
    .collection('users')
    .findOne({ _id: new ObjectId(payload.userId) }, { projection: { password: 0 } })

  if (!user) {
    return NextResponse.json<ApiResponse>({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  return NextResponse.json<ApiResponse>({ data: user })
}
