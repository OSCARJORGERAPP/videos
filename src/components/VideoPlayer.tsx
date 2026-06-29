'use client'

interface VideoPlayerProps {
  url: string
  name: string
  contentType: string
}

export default function VideoPlayer({ url, name, contentType }: VideoPlayerProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-black border border-white/10">
      <video
        controls
        className="w-full max-h-[70vh]"
        src={url}
        aria-label={name}
      >
        <source src={url} type={contentType} />
        Tu navegador no soporta el reproductor de vídeo.
      </video>
    </div>
  )
}
