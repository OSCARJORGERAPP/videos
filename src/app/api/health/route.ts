import { NextResponse } from 'next/server'
import { connectDb } from '@/lib/mongodb'
import { s3 } from '@/lib/rustfs'
import { HeadBucketCommand } from '@aws-sdk/client-s3'

export async function GET() {
  const start = Date.now()
  let mongo = 'ok'
  let rustfs = 'ok'

  try {
    await connectDb()
  } catch {
    mongo = 'error'
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: process.env.RUSTFS_BUCKET! }))
  } catch {
    rustfs = 'error'
  }

  return NextResponse.json({
    data: {
      status: mongo === 'ok' && rustfs === 'ok' ? 'ok' : 'degraded',
      mongo,
      rustfs,
      uptime: process.uptime(),
      responseTimeMs: Date.now() - start,
    },
  })
}
