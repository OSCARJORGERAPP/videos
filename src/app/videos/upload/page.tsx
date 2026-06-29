import Link from 'next/link'
import UploadForm from '@/components/UploadForm'

export default function UploadPage() {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/videos" className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Mis vídeos
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/60">Subir vídeo</span>
      </div>

      <h2 className="text-2xl font-semibold text-white mb-6">Subir vídeo</h2>

      <div className="max-w-2xl p-6 rounded-2xl border border-white/8 bg-white/3">
        <UploadForm />
      </div>
    </>
  )
}
