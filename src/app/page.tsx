import Link from 'next/link'

const FEATURES = [
  {
    icon: '↑',
    title: 'Subida directa',
    desc: 'Tus vídeos van directo a almacenamiento seguro sin pasar por nuestros servidores.',
  },
  {
    icon: '⌖',
    title: 'Metadatos ricos',
    desc: 'Tags, descripciones y pares clave-valor personalizados por cada vídeo.',
  },
  {
    icon: '◎',
    title: 'Búsqueda instantánea',
    desc: 'Encuentra cualquier vídeo por nombre, descripción o tags en milisegundos.',
  },
  {
    icon: '▶',
    title: 'Reproductor integrado',
    desc: 'HTML5 nativo. Sin plugins, sin esperas, sin marcas de agua.',
  },
  {
    icon: '⊘',
    title: 'Completamente privado',
    desc: 'Cada usuario solo ve sus propios vídeos. Sin mezclas, sin sorpresas.',
  },
  {
    icon: '◈',
    title: 'Dashboard en tiempo real',
    desc: 'Número de vídeos y espacio ocupado siempre a la vista.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080b12]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-white font-semibold tracking-tight">
            Video<span className="text-indigo-400">Vault</span>
          </span>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/auth/login"
              className="text-white/60 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 pt-14">
        <section className="relative max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"
          />

          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-300 text-xs mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Almacenamiento privado de vídeo
          </p>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Tus vídeos,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              solo tuyos.
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Sube, organiza y reproduce vídeos privados con metadatos ricos y búsqueda instantánea.
            Sin límites de terceros, sin mezcla de contenido.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Empezar gratis
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3.5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 rounded-xl text-sm transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors group"
              >
                <div className="text-indigo-400 text-xl mb-4 font-mono">{f.icon}</div>
                <h3 className="text-white font-medium text-sm mb-2">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        VideoVault — almacenamiento privado de vídeo
      </footer>
    </div>
  )
}
