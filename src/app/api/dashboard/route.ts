import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { connectDb } from '@/lib/mongodb'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'Token inválido' }, { status: 401 })

  const db = await connectDb()
  const userId = new ObjectId(payload.userId)

  const [agg] = await db
    .collection('videos')
    .aggregate([
      { $match: { userId } },
      { $group: { _id: null, count: { $sum: 1 }, totalBytes: { $sum: '$size' } } },
    ])
    .toArray()

  return NextResponse.json<ApiResponse>({
    data: {
      count: agg?.count ?? 0,
      totalBytes: agg?.totalBytes ?? 0,
    },
  })
}
