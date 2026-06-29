import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import Link from 'next/link'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value!
  const payload = verifyToken(token)!

  const db = await connectDb()
  const [agg] = await db
    .collection('videos')
    .aggregate([
      { $match: { userId: new ObjectId(payload.userId) } },
      { $group: { _id: null, count: { $sum: 1 }, totalBytes: { $sum: '$size' } } },
    ])
    .toArray()

  const count: number = agg?.count ?? 0
  const totalBytes: number = agg?.totalBytes ?? 0

  const recent = await db
    .collection('videos')
    .find({ userId: new ObjectId(payload.userId) }, { projection: { key: 0 } })
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="p-6 rounded-2xl border border-white/8 bg-white/3">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Vídeos subidos</p>
          <p className="text-5xl font-bold text-white">{count}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/8 bg-white/3">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Espacio ocupado</p>
          <p className="text-5xl font-bold text-white">{formatBytes(totalBytes)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-10">
        <Link
          href="/videos/upload"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Subir vídeo
        </Link>
        <Link
          href="/videos"
          className="px-5 py-2.5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-sm rounded-xl transition-colors"
        >
          Ver todos
        </Link>
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">
            Últimos añadidos
          </h2>
          <div className="space-y-2">
            {recent.map((v) => (
              <Link
                key={v._id.toString()}
                href={`/videos/${v._id.toString()}`}
                className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors group"
              >
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  {v.name as string}
                </span>
                <span className="text-xs text-white/30">
                  {new Date(v.createdAt as Date).toLocaleDateString('es-ES')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {count === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-4">▶</p>
          <p className="text-sm">Aún no tienes vídeos.</p>
          <Link href="/videos/upload" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
            Sube tu primer vídeo →
          </Link>
        </div>
      )}
    </div>
  )
}
