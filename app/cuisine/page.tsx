import CuisineSearch from './CuisineSearch'
import Link from 'next/link'

export default function CuisinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      <div className="flex items-center gap-6 mb-8">
        <Link
          href="/"
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </Link>
        <div>
          <h1 className="text-6xl font-thin">Atlas Culinaire</h1>
          <p className="text-zinc-400 mt-2 text-xl">À table le monde</p>
        </div>
      </div>

      <CuisineSearch />

    </main>
  )
}
