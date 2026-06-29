import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { s3, ensureBucket } from '@/lib/rustfs'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'Token inválido' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json<ApiResponse>({ error: 'Archivo requerido' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'bin'
  const key = `${payload.userId}/${randomUUID()}.${ext}`

  await ensureBucket()

  const buffer = Buffer.from(await file.arrayBuffer())
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.RUSTFS_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  )

  return NextResponse.json<ApiResponse>({ data: { key, size: file.size, contentType: file.type } })
}
