'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PhotosPage() {

  const router = useRouter()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const photos = [

    '/photos/photo1.jpg',
    '/photos/photo2.jpg',
    '/photos/photo3.jpg',
    '/photos/photo4.jpg',
    '/photos/photo5.jpg',
    '/photos/photo6.jpg',
    '/photos/photo7.jpg',
    '/photos/photo8.jpg',
    '/photos/photo9.jpg',
    '/photos/photo10.jpg',
    '/photos/photo11.jpg',
    '/photos/photo12.jpg',
    '/photos/photo13.jpg',

  ]

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}

      <div className="flex items-center gap-6 mb-10">

        <button
          onClick={() => {
            router.push('/')
            
          }}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>

        <div>

          <h1 className="text-6xl font-thin">
            Photos
          </h1>

          <p className="text-zinc-400 mt-2 text-xl">
            Galerie immersive MYHOME
          </p>

        </div>

      </div>

      {/* GRID */}

<div className="flex flex-col gap-8 overflow-y-auto max-h-[75vh] pr-2">

  {photos.map((photo, index) => (

    <button
      key={index}
      onClick={() => setSelectedImage(photo)}
      className="group relative overflow-hidden rounded-3xl h-[520px] flex-shrink-0"
    >

      <img
        src={photo}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>

    </button>

  ))}

</div>

      {/* FULLSCREEN */}

      {selectedImage && (

        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-xl"
        >

          <img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%] rounded-3xl shadow-2xl animate-dashboard"
          />

        </div>

      )}

    </main>
  )
}