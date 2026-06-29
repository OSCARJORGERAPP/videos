import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { connectDb } from '@/lib/mongodb'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { getPresignedGetUrl, deleteObject } from '@/lib/rustfs'
import type { ApiResponse, VideoMetaKV } from '@/types'

function getUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = getUser(req)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return NextResponse.json<ApiResponse>({ error: 'ID inválido' }, { status: 400 })
  }

  const db = await connectDb()
  const video = await db.collection('videos').findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(payload.userId),
  })

  if (!video) return NextResponse.json<ApiResponse>({ error: 'Vídeo no encontrado' }, { status: 404 })

  const url = await getPresignedGetUrl(video.key as string)
  return NextResponse.json<ApiResponse>({ data: { ...video, url } })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = getUser(req)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return NextResponse.json<ApiResponse>({ error: 'ID inválido' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json<ApiResponse>({ error: 'Body requerido' }, { status: 400 })

  const allowed: Record<string, unknown> = {}
  if (body.name !== undefined) allowed.name = body.name as string
  if (body.description !== undefined) allowed.description = body.description as string
  if (body.tags !== undefined) allowed.tags = body.tags as string[]
  if (body.metadata !== undefined) allowed.metadata = body.metadata as VideoMetaKV[]
  allowed.updatedAt = new Date()

  const db = await connectDb()
  const result = await db.collection('videos').updateOne(
    { _id: new ObjectId(id), userId: new ObjectId(payload.userId) },
    { $set: allowed }
  )

  if (result.matchedCount === 0) {
    return NextResponse.json<ApiResponse>({ error: 'Vídeo no encontrado' }, { status: 404 })
  }

  return NextResponse.json<ApiResponse>({ data: { updated: true } })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = getUser(req)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return NextResponse.json<ApiResponse>({ error: 'ID inválido' }, { status: 400 })
  }

  const db = await connectDb()
  const video = await db.collection('videos').findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(payload.userId),
  })

  if (!video) return NextResponse.json<ApiResponse>({ error: 'Vídeo no encontrado' }, { status: 404 })

  await deleteObject(video.key as string)
  await db.collection('videos').deleteOne({ _id: new ObjectId(id) })

  return NextResponse.json<ApiResponse>({ data: { deleted: true } })
}
