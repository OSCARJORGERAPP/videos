import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getPresignedGetUrl } from '@/lib/rustfs'
import { notFound } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import Link from 'next/link'
import type { VideoMetaKV } from '@/types'

type Params = { params: Promise<{ id: string }> }

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default async function VideoDetailPage({ params }: Params) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value!
  const payload = verifyToken(token)!

  const { id } = await params
  if (!ObjectId.isValid(id)) notFound()

  const db = await connectDb()
  const video = await db.collection('videos').findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(payload.userId),
  })

  if (!video) notFound()

  const url = await getPresignedGetUrl(video.key as string)

  return (
    <>
      <div className="mb-4">
        <Link href="/videos" className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Mis vídeos
        </Link>
      </div>

      <VideoPlayer url={url} name={video.name as string} contentType={video.contentType as string} />

      <div className="mt-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">{video.name as string}</h1>
          <p className="text-white/30 text-xs mt-1">
            {formatBytes(video.size as number)} · {video.contentType as string} ·{' '}
            {new Date(video.createdAt as Date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {(video.description as string) && (
          <div>
            <h2 className="text-xs text-white/40 uppercase tracking-widest mb-2">Descripción</h2>
            <p className="text-white/70 text-sm leading-relaxed">{video.description as string}</p>
          </div>
        )}

        {(video.tags as string[]).length > 0 && (
          <div>
            <h2 className="text-xs text-white/40 uppercase tracking-widest mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {(video.tags as string[]).map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {(video.metadata as VideoMetaKV[]).length > 0 && (
          <div>
            <h2 className="text-xs text-white/40 uppercase tracking-widest mb-2">Metadatos</h2>
            <div className="divide-y divide-white/5 rounded-xl border border-white/8 overflow-hidden">
              {(video.metadata as VideoMetaKV[]).map((kv) => (
                <div key={kv.key} className="flex gap-4 px-4 py-3 bg-white/3">
                  <span className="text-white/40 text-xs w-32 shrink-0">{kv.key}</span>
                  <span className="text-white/80 text-xs">{kv.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href={`/videos/${id}/edit`}
            className="px-4 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm rounded-xl transition-colors"
          >
            Editar metadatos
          </Link>
        </div>
      </div>
    </>
  )
}
