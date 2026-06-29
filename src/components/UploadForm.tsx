'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface KV {
  key: string
  value: string
}

export default function UploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [kvPairs, setKvPairs] = useState<KV[]>([{ key: '', value: '' }])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  function addKv() {
    setKvPairs((p) => [...p, { key: '', value: '' }])
  }

  function updateKv(i: number, field: 'key' | 'value', val: string) {
    setKvPairs((p) => p.map((kv, idx) => (idx === i ? { ...kv, [field]: val } : kv)))
  }

  function removeKv(i: number) {
    setKvPairs((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setError('')
    setProgress(0)

    try {
      // 1. Subir el fichero a través del API de Next.js (evita CORS con RustFS)
      setStatus('uploading')
      const fd = new FormData()
      fd.append('file', file)

      const { key, size, contentType } = await new Promise<{
        key: string
        size: number
        contentType: string
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status < 300) {
            const { data } = JSON.parse(xhr.responseText)
            resolve(data)
          } else {
            reject(new Error(`Upload HTTP ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error('Error de red al subir'))
        xhr.send(fd)
      })

      // 2. Registrar metadatos en MongoDB
      setStatus('saving')
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const metadata = kvPairs.filter((kv) => kv.key.trim())

      const saveRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || file.name,
          description,
          tags,
          metadata,
          size,
          key,
          contentType,
        }),
      })
      if (!saveRes.ok) throw new Error('Error guardando metadatos')

      setStatus('done')
      setTimeout(() => router.push('/videos'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fichero */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Vídeo *</label>
        <input
          type="file"
          accept="video/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-sm file:cursor-pointer hover:file:bg-indigo-500"
        />
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={file?.name ?? 'Nombre del vídeo'}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60 resize-none"
          placeholder="Descripción opcional…"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Tags (separados por coma)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="tutorial, react, typescript"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

      {/* Pares clave-valor */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Metadatos adicionales (clave-valor)</label>
        <div className="space-y-2">
          {kvPairs.map((kv, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={kv.key}
                onChange={(e) => updateKv(i, 'key', e.target.value)}
                placeholder="Clave"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
              />
              <input
                type="text"
                value={kv.value}
                onChange={(e) => updateKv(i, 'value', e.target.value)}
                placeholder="Valor"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
              />
              <button
                type="button"
                onClick={() => removeKv(i)}
                className="px-3 py-2 text-white/30 hover:text-red-400 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addKv}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          + Añadir par
        </button>
      </div>

      {/* Progress */}
      {status === 'uploading' && (
        <div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-1">{progress}% subido</p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {status === 'done' && <p className="text-sm text-green-400">¡Vídeo guardado! Redirigiendo…</p>}
      {status === 'saving' && <p className="text-sm text-white/50">Guardando metadatos…</p>}

      <button
        type="submit"
        disabled={!file || status === 'uploading' || status === 'saving' || status === 'done'}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
      >
        {status === 'uploading' ? 'Subiendo…' : status === 'saving' ? 'Guardando…' : 'Subir vídeo'}
      </button>
    </form>
  )
}
