import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { getPresignedPutUrl, ensureBucket } from '@/lib/rustfs'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json<ApiResponse>({ error: 'No autenticado' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json<ApiResponse>({ error: 'Token inválido' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.fileName || !body?.contentType) {
    return NextResponse.json<ApiResponse>(
      { error: 'fileName y contentType son requeridos' },
      { status: 400 }
    )
  }

  const ext = (body.fileName as string).split('.').pop() ?? 'bin'
  const key = `${payload.userId}/${randomUUID()}.${ext}`

  await ensureBucket()
  const url = await getPresignedPutUrl(key, body.contentType as string)

  return NextResponse.json<ApiResponse>({ data: { url, key } })
}
