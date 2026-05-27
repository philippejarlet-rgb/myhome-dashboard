'use client'

import { useEffect, useState } from 'react'

type Props = {
  onWake: () => void
}

export default function Screensaver({ onWake }: Props) {

  const images = [
    '/screensaver/1.jpg',
    '/screensaver/2.jpg',
    '/screensaver/3.jpg',
    '/screensaver/4.jpg',
    '/screensaver/5.jpg',
    '/screensaver/6.jpg',
    '/screensaver/7.jpg',
    '/screensaver/8.jpg',
    '/screensaver/9.jpg',
    '/screensaver/10.jpg',
    '/screensaver/11.jpg',
    '/screensaver/12.jpg',
    '/screensaver/13.jpg',
  ]

  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentImage((prev) =>
        (prev + 1) % images.length
      )

    }, 20000)

    return () => clearInterval(interval)

  }, [])

  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )

  // CLOCK
  useEffect(() => {
    const updateTime = () =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (

    <div
      onClick={onWake}
      className="fixed inset-0 overflow-hidden cursor-pointer z-[999]"
    >

      {/* Background image */}

      <img
        src={images[currentImage]}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 animate-slowzoom"
      />

      {/* Dark overlay */}

      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Content */}

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">

        <div className="text-center animate-fadein">

          <h1 className="text-[12rem] font-thin tracking-wider">
            {time}
          </h1>

          <p className="text-3xl text-zinc-200 mt-6">
            Louhans • 24° • Clair 🌙
          </p>

        </div>

      </div>

    </div>
  )
}