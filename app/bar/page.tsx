import BarWidget from '@/components/bar-widget'
import Link from 'next/link'

export default function BarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8">

      <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-8">
        <Link
          href="/"
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </Link>
        <div>
          <h1 className="text-3xl md:text-6xl font-thin">Bar & Cocktails</h1>
          <p className="text-zinc-400 mt-1 md:mt-2 text-sm md:text-xl">Suggestions, recherche et cocktails IA</p>
        </div>
      </div>

      <BarWidget />

      <div className="md:hidden text-center text-xs text-zinc-500 py-4 pb-20 mt-8">
        © {new Date().getFullYear()} MyHome
      </div>

    </main>
  )
}
