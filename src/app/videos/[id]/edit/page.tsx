'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { VideoMetaKV } from '@/types'

interface KV {
  key: string
  value: string
}

export default function EditVideoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [kvPairs, setKvPairs] = useState<KV[]>([])

  useEffect(() => {
    fetch(`/api/videos/${id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return
        setName(data.name ?? '')
        setDescription(data.description ?? '')
        setTagsInput((data.tags as string[]).join(', '))
        setKvPairs((data.metadata as VideoMetaKV[]) ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function addKv() {
    setKvPairs((p) => [...p, { key: '', value: '' }])
  }

  function updateKv(i: number, field: 'key' | 'value', val: string) {
    setKvPairs((p) => p.map((kv, idx) => (idx === i ? { ...kv, [field]: val } : kv)))
  }

  function removeKv(i: number) {
    setKvPairs((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const metadata = kvPairs.filter((kv) => kv.key.trim())

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, tags, metadata }),
      })
      if (!res.ok) throw new Error('Error guardando')
      router.push(`/videos/${id}`)
    } catch {
      setError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este vídeo? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      router.push('/videos')
    } catch {
      setError('Error al eliminar')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/30 text-sm">
        Cargando…
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/videos/${id}`} className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Volver al vídeo
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-6">Editar metadatos</h1>

        <form onSubmit={handleSave} className="space-y-5 p-6 rounded-2xl border border-white/8 bg-white/3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Tags (separados por coma)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Metadatos clave-valor</label>
            <div className="space-y-2">
              {kvPairs.map((kv, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={kv.key}
                    onChange={(e) => updateKv(i, 'key', e.target.value)}
                    placeholder="Clave"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60"
                  />
                  <input
                    type="text"
                    value={kv.value}
                    onChange={(e) => updateKv(i, 'value', e.target.value)}
                    placeholder="Valor"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => removeKv(i)}
                    className="px-3 text-white/30 hover:text-red-400 transition-colors text-sm"
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

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 text-sm rounded-xl transition-colors"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
