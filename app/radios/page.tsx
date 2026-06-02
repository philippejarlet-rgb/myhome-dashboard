'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Hls from 'hls.js'
import { Square, Star, Camera, Check } from 'lucide-react'

type Radio = {
  name: string
  stream: string
  logo: string
  favorite: boolean
}

export default function RadiosPage() {

  const router = useRouter()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const [activeRadio, setActiveRadio] = useState('')

  const [radios, setRadios] = useState<Radio[]>([])

  const [newName, setNewName] = useState('')
  const [newStream, setNewStream] = useState('')
  const [newLogo, setNewLogo] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // LOAD

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data/radios')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()

        if (data.length === 0) {
          const saved = localStorage.getItem('myhome-radios')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              const migrateResponse = await fetch('/api/data/radios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
              })
              if (!migrateResponse.ok) throw new Error('Migration PUT failed')
              setRadios(parsed)
              localStorage.removeItem('myhome-radios')
              return
            } catch {
              // migration failed, fall through to defaults
            }
          }

          const defaultRadios = [
            {
              name: 'Couleur 3',
              stream: 'https://stream.srg-ssr.ch/m/couleur3/mp3_128',
              logo: '/logos/couleur3.png',
              favorite: true,
            },
            {
              name: 'Reggae',
              stream: 'https://hd.lagrosseradio.info/lagrosseradio-reggae-192.mp3',
              logo: '/logos/radioreggae.png',
              favorite: true,
            },
            {
              name: 'MAXXIMA',
              stream: 'http://maxxima.mine.nu:8000/',
              logo: '/logos/maxxima.png',
              favorite: true,
            },
          ]
          try {
            const defaultResponse = await fetch('/api/data/radios', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(defaultRadios),
            })
            if (!defaultResponse.ok) throw new Error('Default PUT failed')
          } catch {
            // default save failed, still show defaults in UI
          }
          setRadios(defaultRadios)
          return
        }

        setRadios(data)
      } catch {
        // load failed, radios stay empty
      }
    }
    loadData()
    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [])

  // PLAY

  const playStream = (audio: HTMLAudioElement, url: string) => {
    hlsRef.current?.destroy()
    hlsRef.current = null
    if (url.endsWith('.m3u8')) {
      if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = url
      } else if (Hls.isSupported()) {
        const hls = new Hls()
        hlsRef.current = hls
        hls.loadSource(url)
        hls.attachMedia(audio)
      }
    } else {
      audio.src = url
    }
  }

  const playRadio = (radio: Radio) => {

    if (audioRef.current) {

      playStream(audioRef.current, radio.stream)

      audioRef.current.play()

      setActiveRadio(radio.name)

      localStorage.setItem('radioPlaying', 'true')
    }
  }

  // STOP

  const stopRadio = () => {

    if (audioRef.current) {

      audioRef.current.pause()

      hlsRef.current?.destroy()
      hlsRef.current = null

      setActiveRadio('')

      localStorage.setItem('radioPlaying', 'false')
    }
  }

  // UPLOAD LOGO
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/logos', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) setNewLogo(data.url)
    setUploadingLogo(false)
  }

  // ADD / EDIT RADIO

  const startEdit = (radio: Radio) => {
    setEditingName(radio.name)
    setNewName(radio.name)
    setNewStream(radio.stream)
    setNewLogo(radio.logo)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingName(null)
    setNewName('')
    setNewStream('')
    setNewLogo('')
  }

  const saveRadio = () => {

    if (!newName || !newStream) return

    let updatedRadios: Radio[]

    if (editingName !== null) {
      updatedRadios = radios.map((r) =>
        r.name === editingName
          ? { ...r, name: newName, stream: newStream, logo: newLogo || r.logo }
          : r
      )
    } else {
      updatedRadios = [
        ...radios,
        { name: newName, stream: newStream, logo: newLogo || '/logos/maxxima.png', favorite: false },
      ]
    }

    setRadios(updatedRadios)

    fetch('/api/data/radios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRadios),
    }).catch(() => {})

    setNewName('')
    setNewStream('')
    setNewLogo('')
    setEditingName(null)
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8">

      <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-10">

        <button
          onClick={() => {
            router.push('/')
            
          }}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>

        <div>

          <h1 className="text-3xl md:text-6xl font-thin">
            Radios
          </h1>

          <p className="text-zinc-400 mt-1 md:mt-2 text-sm md:text-xl">
            Gestion des radios MYHOME
          </p>

        </div>

      </div>

      {/* RADIOS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">

        {radios.map((radio) => (

          <div
            key={radio.name}
            onClick={() => playRadio(radio)}
            className={`transition-all rounded-2xl p-3 md:p-6 flex flex-col items-center justify-center gap-3
            ${
              activeRadio === radio.name
                ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/30 shadow-2xl'
                : 'glass-card hover:scale-105'
            }`}
          >

            <img
  src={radio.logo}
  className="h-20 object-contain"
/>

<div className="flex flex-col items-center gap-2">

  <span>
    {radio.name}
  </span>

  <button
    onClick={(e) => {

      e.stopPropagation()

      const updatedRadios = radios.map((r) => {

        if (r.name === radio.name) {

          return {
            ...r,
            favorite: !r.favorite,
          }
        }

        return r
      })

      setRadios(updatedRadios)

      fetch('/api/data/radios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRadios),
      }).catch(() => {})
    }}
    className="text-yellow-400 text-sm hover:text-yellow-300"
  >

    <Star size={14} className={radio.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'} />
    <span>{radio.favorite ? 'Favori' : 'Favori'}</span>

  </button>

</div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  startEdit(radio)
                }}
                className="text-cyan-400 text-sm hover:text-cyan-300"
              >
                Modifier
              </button>

              <button
                onClick={(e) => {

                 e.stopPropagation()

                 const updatedRadios = radios.filter(
                (r) => r.name !== radio.name
                 )

                   setRadios(updatedRadios)

                   fetch('/api/data/radios', {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(updatedRadios),
                   }).catch(() => {})
                }}
                 className="text-red-400 text-sm hover:text-red-300"
                  >
                  Supprimer
                </button>
            </div>

          </div>

        ))}

        <button
          onClick={stopRadio}
          className="bg-red-500/70 hover:bg-red-400 transition-all rounded-2xl p-3 md:p-6 flex flex-col items-center justify-center gap-3"
        >

          <Square size={36} />
          <span>Stop</span>

        </button>

      </div>

      {/* ADD / EDIT */}

      <div ref={formRef} className="glass-card rounded-3xl p-4 md:p-6">

        <h2 className="text-2xl mb-6">
          {editingName !== null ? `Modifier — ${editingName}` : 'Ajouter une radio'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom"
            className="bg-black/20 rounded-xl px-4 py-3 outline-none"
          />

          <input
            value={newStream}
            onChange={(e) => setNewStream(e.target.value)}
            placeholder="Flux URL"
            className="bg-black/20 rounded-xl px-4 py-3 outline-none"
          />

          <div className="flex items-center gap-3">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="bg-black/20 rounded-xl px-4 py-3 flex-1 text-left disabled:opacity-50"
            >
              {uploadingLogo ? 'Upload...' : newLogo ? <><Check size={14} className="inline mr-1" />Logo uploadé</> : <><Camera size={14} className="inline mr-1" />Choisir un logo</>}
            </button>
            {newLogo && (
              <img src={newLogo} className="h-10 w-10 object-contain rounded-lg" />
            )}
          </div>

        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={saveRadio}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-6 py-3"
          >
            {editingName !== null ? 'Enregistrer' : 'Ajouter'}
          </button>
          {editingName !== null && (
            <button
              onClick={cancelEdit}
              className="bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-6 py-3"
            >
              Annuler
            </button>
          )}
        </div>

      </div>

      <audio ref={audioRef} />

    </main>
  )
}