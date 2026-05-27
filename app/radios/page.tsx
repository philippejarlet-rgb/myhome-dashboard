'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Radio = {
  name: string
  stream: string
  logo: string
  favorite: boolean
}

export default function RadiosPage() {

  const router = useRouter()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [activeRadio, setActiveRadio] = useState('')

  const [radios, setRadios] = useState<Radio[]>([])

  const [newName, setNewName] = useState('')
  const [newStream, setNewStream] = useState('')
  const [newLogo, setNewLogo] = useState('')

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
            } catch {
              // migration failed
            }
            return
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
  }, [])

  // PLAY

  const playRadio = (radio: Radio) => {

    if (audioRef.current) {

      audioRef.current.src = radio.stream

      audioRef.current.play()

      setActiveRadio(radio.name)

      localStorage.setItem('radioPlaying', 'true')
    }
  }

  // STOP

  const stopRadio = () => {

    if (audioRef.current) {

      audioRef.current.pause()

      setActiveRadio('')

      localStorage.setItem('radioPlaying', 'false')
    }
  }

  // ADD RADIO

  const addRadio = () => {

    if (!newName || !newStream) return

    const updatedRadios = [

      ...radios,

      {
        name: newName,
        stream: newStream,
        logo: newLogo || '/logos/maxxima.png',
        favorite: false,
      },
    ]

    setRadios(updatedRadios)

    fetch('/api/data/radios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRadios),
    }).catch(() => {})

    setNewName('')
    setNewStream('')
    setNewLogo('')
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

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
            Radios
          </h1>

          <p className="text-zinc-400 mt-2 text-xl">
            Gestion des radios MYHOME
          </p>

        </div>

      </div>

      {/* RADIOS */}

      <div className="grid grid-cols-4 gap-4 mb-8">

        {radios.map((radio) => (

          <div
            key={radio.name}
            onClick={() => playRadio(radio)}
            className={`transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-3
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

    {radio.favorite ? '★ Favori' : '☆ Favori'}

  </button>

</div>

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
               className="text-red-400 text-sm hover:text-red-300 mt-2"
                >

                 Supprimer

              </button>

          </div>

        ))}

        <button
          onClick={stopRadio}
          className="bg-red-500/70 hover:bg-red-400 transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-3"
        >

          <span className="text-4xl">
            ⏹
          </span>

          <span>
            Stop
          </span>

        </button>

      </div>

      {/* ADD */}

      <div className="glass-card rounded-3xl p-6">

        <h2 className="text-2xl mb-6">
          Ajouter une radio
        </h2>

        <div className="grid grid-cols-3 gap-4">

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

          <input
            value={newLogo}
            onChange={(e) => setNewLogo(e.target.value)}
            placeholder="/logos/..."
            className="bg-black/20 rounded-xl px-4 py-3 outline-none"
          />

        </div>

        <button
          onClick={addRadio}
          className="mt-4 bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-6 py-3"
        >

          Ajouter

        </button>

      </div>

      <audio ref={audioRef} />

    </main>
  )
}