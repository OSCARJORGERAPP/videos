'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al registrar')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-semibold text-white tracking-tight">
            Video<span className="text-indigo-400">Vault</span>
          </Link>
          <p className="text-white/40 text-sm mt-2">Crea tu cuenta gratuita</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 rounded-2xl border border-white/8 bg-white/3"
        >
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60"
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              Contraseña <span className="text-white/20">(mín. 8 caracteres)</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors mt-2"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
