'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Square, Volume1, Volume2 } from 'lucide-react'

type Radio = {
  name: string
  stream: string
  logo: string
  favorite: boolean
}

export default function RadioWidget() {

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const [activeRadio, setActiveRadio] = useState('')
  const [volume, setVolume] = useState(80)
  const [radios, setRadios] = useState<Radio[]>([])

  useEffect(() => {
    fetch('/api/data/radios')
      .then((r) => r.json())
      .then((data: Radio[]) => {
        const favorites = data.filter((r) => r.favorite).slice(0, 4)
        setRadios(favorites)
      })
      .catch(() => {})
    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [])

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

  const stopRadio = () => {

    if (audioRef.current) {

      audioRef.current.pause()

      hlsRef.current?.destroy()
      hlsRef.current = null

      setActiveRadio('')

      localStorage.setItem('radioPlaying', 'false')
    }
  }

  return (

    <div className="widget-hover glass-card rounded-3xl p-4 shadow-2xl">

      <div className="grid grid-cols-5 gap-3">

        {radios.map((radio) => (

          <button
            key={radio.name}
            onClick={() => playRadio(radio)}
            className={`transition-all rounded-2xl p-3 flex flex-col items-center justify-center gap-2
            ${
              activeRadio === radio.name
                ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/30 shadow-2xl'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >

            <img
              src={radio.logo}
              className="h-12 object-contain rounded-xl"
            />

            <span>
              {radio.name}
            </span>

          </button>

        ))}

        <button
          onClick={stopRadio}
          className={`transition-all rounded-2xl p-3 flex flex-col items-center justify-center gap-2
          ${
            activeRadio === ''
              ? 'bg-red-500/50 border border-red-400 shadow-red-500/30 shadow-2xl'
              : 'bg-red-500/70 hover:bg-red-400'
          }`}
        >

          <Square size={28} />
          <span>Stop</span>

        </button>

      </div>

      {/* Volume slider — Option C */}
      <div className="flex items-center gap-3 mt-6 opacity-60 active:opacity-100 transition-opacity">
        <Volume1 size={18} />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value)
            setVolume(v)
            if (audioRef.current) audioRef.current.volume = v / 100
          }}
          className="flex-1 h-[6px] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg"
          style={{
            background: `linear-gradient(to right, rgba(6,182,212,0.8) ${volume}%, rgba(255,255,255,0.15) ${volume}%)`
          }}
        />
        <Volume2 size={18} />
      </div>

      <audio ref={audioRef} />

    </div>
  )
}