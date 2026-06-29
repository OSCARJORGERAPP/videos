'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar({ userName }: { userName?: string }) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-white font-semibold tracking-tight text-lg">
          Video<span className="text-indigo-400">Vault</span>
        </Link>

        <div className="flex items-center gap-6 text-sm text-white/70">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/videos" className="hover:text-white transition-colors">
            Mis vídeos
          </Link>
          <Link href="/videos/upload" className="hover:text-white transition-colors">
            Subir
          </Link>
          {userName && (
            <span className="text-white/40 border-l border-white/10 pl-6">{userName}</span>
          )}
          <button
            onClick={logout}
            className="text-white/50 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
