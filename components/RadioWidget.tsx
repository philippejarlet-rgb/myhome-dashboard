'use client'

import { useEffect, useRef, useState } from 'react'

type Radio = {
  name: string
  stream: string
  logo: string
  favorite: boolean
}

export default function RadioWidget() {

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [activeRadio, setActiveRadio] = useState('')

  const [radios, setRadios] = useState<Radio[]>([])

  useEffect(() => {
    fetch('/api/data/radios')
      .then((r) => r.json())
      .then((data: Radio[]) => {
        const favorites = data.filter((r) => r.favorite).slice(0, 4)
        setRadios(favorites)
      })
      .catch(() => {})
  }, [])

  const playRadio = (radio: Radio) => {

    if (audioRef.current) {

      audioRef.current.src = radio.stream

      audioRef.current.play()

      setActiveRadio(radio.name)

      localStorage.setItem('radioPlaying', 'true')
    }
  }

  const stopRadio = () => {

    if (audioRef.current) {

      audioRef.current.pause()

      setActiveRadio('')

      localStorage.setItem('radioPlaying', 'false')
    }
  }

  return (

    <div className="widget-hover glass-card rounded-3xl p-6 shadow-2xl">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-light">
          Multimédia
        </h2>

        <div className="text-zinc-400">
          MYHOME HUB
        </div>

      </div>

      <div className="grid grid-cols-5 gap-4">

        {radios.map((radio) => (

          <button
            key={radio.name}
            onClick={() => playRadio(radio)}
            className={`transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-3
            ${
              activeRadio === radio.name
                ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/30 shadow-2xl'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >

            <img
              src={radio.logo}
              className="h-20 object-contain rounded-xl"
            />

            <span>
              {radio.name}
            </span>

          </button>

        ))}

        <button
          onClick={stopRadio}
          className={`transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-3
          ${
            activeRadio === ''
              ? 'bg-red-500/50 border border-red-400 shadow-red-500/30 shadow-2xl'
              : 'bg-red-500/70 hover:bg-red-400'
          }`}
        >

          <span className="text-4xl">
            ⏹
          </span>

          <span>
            Stop
          </span>

        </button>

      </div>

      <audio ref={audioRef} />

    </div>
  )
}