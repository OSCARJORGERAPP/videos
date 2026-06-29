import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import VideoCard from '@/components/VideoCard'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

async function VideoList({ userId, q }: { userId: string; q?: string }) {
  const db = await connectDb()
  const filter: Record<string, unknown> = { userId: new ObjectId(userId) }
  if (q) filter.$text = { $search: q }

  const videos = await db
    .collection('videos')
    .find(filter, { projection: { key: 0 } })
    .sort({ createdAt: -1 })
    .toArray()

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-white/30">
        <p className="text-4xl mb-4">{q ? '⊘' : '▶'}</p>
        <p className="text-sm">
          {q ? `Sin resultados para "${q}"` : 'No tienes vídeos aún.'}
        </p>
        {!q && (
          <Link href="/videos/upload" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
            Sube tu primer vídeo →
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((v) => (
        <VideoCard
          key={v._id.toString()}
          id={v._id.toString()}
          name={v.name as string}
          description={v.description as string}
          tags={v.tags as string[]}
          size={v.size as number}
          createdAt={(v.createdAt as Date).toISOString()}
        />
      ))}
    </div>
  )
}

export default async function VideosPage({ searchParams }: PageProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value!
  const payload = verifyToken(token)!
  const { q } = await searchParams

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Mis vídeos</h1>
        <Link
          href="/videos/upload"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Subir vídeo
        </Link>
      </div>

      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <Suspense fallback={<p className="text-white/30 text-sm">Cargando…</p>}>
        <VideoList userId={payload.userId} q={q} />
      </Suspense>
    </>
  )
}
