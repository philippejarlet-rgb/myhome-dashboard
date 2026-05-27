'use client'

export default function AtlasPage() {

  const openAtlas = () => {

    window.open(
      'https://atlasculinaire.com/',
      '_blank'
    )

    window.location.href = '/'
  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <button
        onClick={openAtlas}
        className="glass-card rounded-3xl px-10 py-6 text-2xl hover:scale-105 transition-all"
      >
        🍳 Ouvrir Atlas Culinaire
      </button>

    </main>

  )
}