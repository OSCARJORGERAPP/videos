/**
 * Seed: crea usuario demo + 3 vídeos de ejemplo en MongoDB.
 * Requiere servicios corriendo (MongoDB + RustFS).
 *
 * Uso:
 *   npx tsx scripts/seed.ts          # siembra si no existe
 *   npx tsx scripts/seed.ts --reset  # limpia y re-siembra
 */

import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { join } from 'path'

// Cargar .env manualmente (no depende de Next.js)
const envLines = readFileSync(join(process.cwd(), '.env'), 'utf-8').split('\n')
for (const line of envLines) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const MONGO_URI = process.env.MONGODB_URI!
const DB_NAME = process.env.MONGODB_DB!
const BUCKET = process.env.RUSTFS_BUCKET!
const RESET = process.argv.includes('--reset')

const s3 = new S3Client({
  endpoint: process.env.RUSTFS_ENDPOINT!,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY!,
    secretAccessKey: process.env.RUSTFS_SECRET_KEY!,
  },
  forcePathStyle: true,
})

const DEMO_EMAIL = 'demo@videovault.local'
const DEMO_PASSWORD = 'demo1234'
const DEMO_NAME = 'Usuario Demo'

const SAMPLE_VIDEOS = [
  {
    name: 'Introducción a VideoVault',
    description: 'Vídeo de bienvenida que explica las funcionalidades principales.',
    tags: ['demo', 'introducción', 'tutorial'],
    metadata: [{ key: 'duración', value: '2:30' }, { key: 'resolución', value: '1080p' }],
  },
  {
    name: 'Cómo subir vídeos',
    description: 'Guía paso a paso para subir tus primeros vídeos a la plataforma.',
    tags: ['tutorial', 'subida', 'guía'],
    metadata: [{ key: 'duración', value: '1:45' }, { key: 'nivel', value: 'principiante' }],
  },
  {
    name: 'Búsqueda y organización',
    description: 'Aprende a usar tags y metadatos para encontrar tus vídeos rápidamente.',
    tags: ['búsqueda', 'organización', 'tags'],
    metadata: [{ key: 'duración', value: '3:10' }, { key: 'nivel', value: 'intermedio' }],
  },
]

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))
    console.log(`✓ Bucket '${BUCKET}' creado`)
  }
}

async function uploadPlaceholder(key: string): Promise<number> {
  // Vídeo placeholder de 1 byte (en un seed real, aquí irían ficheros reales)
  const body = Buffer.from('PLACEHOLDER_VIDEO_CONTENT')
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: 'video/mp4',
  }))
  return body.length
}

async function main() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  const db = client.db(DB_NAME)

  if (RESET) {
    await db.collection('users').deleteMany({ email: DEMO_EMAIL })
    await db.collection('videos').deleteMany({ 'metadata.0.key': { $exists: true } })
    console.log('✓ Datos anteriores eliminados')
  }

  // Crear índices
  await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true })
  await db.collection('videos').createIndex({ userId: 1 }, { background: true })
  await db.collection('videos').createIndex(
    { name: 'text', description: 'text', tags: 'text' },
    { background: true }
  )

  // Usuario demo
  const existing = await db.collection('users').findOne({ email: DEMO_EMAIL })
  let userId: ObjectId

  if (existing) {
    userId = existing._id as ObjectId
    console.log(`→ Usuario demo ya existe (${DEMO_EMAIL})`)
  } else {
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 12)
    const result = await db.collection('users').insertOne({
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      password: hashed,
      createdAt: new Date(),
    })
    userId = result.insertedId
    console.log(`✓ Usuario demo creado: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  }

  // Vídeos de ejemplo
  await ensureBucket()

  for (const v of SAMPLE_VIDEOS) {
    const key = `${userId.toString()}/${Date.now()}-seed.mp4`
    const size = await uploadPlaceholder(key)
    await db.collection('videos').insertOne({
      userId,
      ...v,
      size,
      key,
      contentType: 'video/mp4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log(`✓ Vídeo seed: "${v.name}"`)
  }

  await client.close()
  console.log('\n✅ Seed completado.')
  console.log(`   Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
}

main().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
