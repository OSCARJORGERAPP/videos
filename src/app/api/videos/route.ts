import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { connectDb } from '@/lib/mongodb'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { ensureBucket } from '@/lib/rustfs'
import type { ApiResponse, VideoMetaKV } from '@/types'

function getUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const payload = getUser(req)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  const db = await connectDb()
  const userId = new ObjectId(payload.userId)

  const filter: Record<string, unknown> = { userId }
  if (q) {
    filter.$text = { $search: q }
  }

  const videos = await db
    .collection('videos')
    .find(filter, { projection: { key: 0 } })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json<ApiResponse>({ data: videos })
}

export async function POST(req: NextRequest) {
  const payload = getUser(req)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.name || !body?.key || !body?.size || !body?.contentType) {
    return NextResponse.json<ApiResponse>(
      { error: 'name, key, size y contentType son requeridos' },
      { status: 400 }
    )
  }

  await ensureBucket()

  const db = await connectDb()
  const now = new Date()
  const result = await db.collection('videos').insertOne({
    userId: new ObjectId(payload.userId),
    name: body.name as string,
    description: (body.description as string) ?? '',
    tags: (body.tags as string[]) ?? [],
    metadata: (body.metadata as VideoMetaKV[]) ?? [],
    size: body.size as number,
    key: body.key as string,
    contentType: body.contentType as string,
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json<ApiResponse>({ data: { id: result.insertedId } }, { status: 201 })
}
