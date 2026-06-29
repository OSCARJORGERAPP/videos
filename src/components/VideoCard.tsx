import Link from 'next/link'

interface VideoCardProps {
  id: string
  name: string
  description: string
  tags: string[]
  size: number
  createdAt: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function VideoCard({ id, name, description, tags, size, createdAt }: VideoCardProps) {
  return (
    <Link
      href={`/videos/${id}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-indigo-500/40 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {name}
        </h3>
        <span className="shrink-0 text-xs text-white/30 font-mono">{formatBytes(size)}</span>
      </div>

      {description && (
        <p className="text-white/50 text-xs line-clamp-2 mb-3">{description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-xs">
              +{tags.length - 4}
            </span>
          )}
        </div>
      )}

      <p className="text-white/30 text-xs">
        {new Date(createdAt).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </Link>
  )
}
