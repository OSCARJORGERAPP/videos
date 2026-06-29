import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const ENDPOINT = process.env.RUSTFS_ENDPOINT!
const BUCKET = process.env.RUSTFS_BUCKET!

export const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY!,
    secretAccessKey: process.env.RUSTFS_SECRET_KEY!,
  },
  forcePathStyle: true,
})

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))
  }
}

export async function getPresignedPutUrl(key: string, contentType: string): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
  return getSignedUrl(s3, cmd, { expiresIn: 3600 })
}

export async function getPresignedGetUrl(key: string): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3, cmd, { expiresIn: 3600 })
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
