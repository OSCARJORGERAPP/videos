'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) {
        params.set('q', q)
      } else {
        params.delete('q')
      }
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        name="q"
        type="search"
        defaultValue={searchParams.get('q') ?? ''}
        placeholder="Buscar por nombre, descripción o tags…"
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {isPending ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  )
}
