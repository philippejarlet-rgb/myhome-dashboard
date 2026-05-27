'use client'

import { useEffect, useState } from 'react'
import CoursesWidget from '@/components/CoursesWidget'
import Screensaver from '@/components/Screensaver'
import ClockWidget from '@/components/ClockWidget'
import WeatherWidget from '@/components/WeatherWidget'
import RadioWidget from '@/components/RadioWidget'
import NewsTicker from '@/components/NewsTicker'
import TodoWidget from '@/components/TodoWidget'
import BottomBar from '@/components/BottomBar'

export default function Home() {

  const [screensaver, setScreensaver] = useState(false)

  const hour = new Date().getHours()

  const backgroundClass =
    hour >= 7 && hour < 18
      ? 'from-slate-900 via-blue-900 to-zinc-900'
      : 'from-black via-zinc-900 to-zinc-800'

  useEffect(() => {

    let timeout: NodeJS.Timeout

    const resetTimer = () => {

      clearTimeout(timeout)

      setScreensaver(false)

      timeout = setTimeout(() => {

        const radioPlaying =
          localStorage.getItem('radioPlaying')

        if (radioPlaying !== 'true') {

          setScreensaver(true)
        }

      }, 600000)

    }

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('click', resetTimer)

    resetTimer()

    return () => {

      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('click', resetTimer)

    }

  }, [])

  return (

    <main
      className={`min-h-screen overflow-hidden bg-gradient-to-br ${backgroundClass} text-white p-3`}
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute bottom-[-250px] left-[-100px] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>

      </div>

      {/* GRID */}

      <div className="relative grid grid-cols-12 gap-4">

        {/* TOP ROW FIXED HEIGHT */}

        <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">

          <div className="col-span-3 h-full">
            <ClockWidget />
          </div>

          <div className="col-span-5 h-full">
            <WeatherWidget />
          </div>

          <div className="col-span-4 h-[300px] flex flex-col gap-4">

            <div className="h-[160px]">
              <TodoWidget />
            </div>

            <div className="flex-1 min-h-0">
              <CoursesWidget />
            </div>

          </div>

        </div>

        {/* RADIO */}

        <div className="col-span-12">
          <RadioWidget />
        </div>

      </div>

      <BottomBar />

      <NewsTicker />

      {screensaver && (
        <Screensaver onWake={() => setScreensaver(false)} />
      )}

    </main>
  )
}