'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const photoUrl = (filename: string) => `/api/photos/${encodeURIComponent(filename)}`

export default function PhotosPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = async () => {
    const res = await fetch('/api/photos')
    const data: string[] = await res.json()
    setPhotos(data)
  }

  useEffect(() => { loadPhotos() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const form = new FormData()
      form.append('file', file)
      await fetch('/api/photos', { method: 'POST', body: form })
    }
    await loadPhotos()
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Supprimer "${filename}" ?`)) return
    await fetch(`/api/photos/${encodeURIComponent(filename)}`, { method: 'DELETE' })
    setPhotos((prev) => prev.filter((f) => f !== filename))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => router.push('/')}
            className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
          >
            ← Retour
          </button>
          <div>
            <h1 className="text-3xl md:text-6xl font-thin">Vos Photos</h1>
            <p className="text-zinc-400 mt-1 md:mt-2 text-sm md:text-xl">Galerie immersive</p>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="glass-card rounded-2xl px-6 py-3 hover:scale-105 transition-all disabled:opacity-50 w-full md:w-auto"
          >
            {uploading ? 'Envoi en cours...' : '+ Ajouter des photos'}
          </button>
        </div>
      </div>

      {/* GRID */}
      {photos.length === 0 ? (
        <p className="text-zinc-500 text-center mt-20 text-xl">Aucune photo</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 overflow-y-auto max-h-[65vh] md:max-h-[75vh] pr-2">
          {photos.map((filename) => (
            <div key={filename} className="group relative overflow-hidden rounded-3xl h-36 md:h-56">
              <button
                onClick={() => setSelectedImage(photoUrl(filename))}
                className="w-full h-full"
              >
                <img
                  src={photoUrl(filename)}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
              </button>
              <button
                onClick={() => handleDelete(filename)}
                className="absolute top-2 right-2 bg-black/60 active:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-xl"
        >
          <img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%] rounded-3xl shadow-2xl"
          />
        </div>
      )}

      <div className="md:hidden text-center text-xs text-zinc-500 py-4 pb-20 mt-8">
        © {new Date().getFullYear()} MyHome
      </div>

    </main>
  )
}
