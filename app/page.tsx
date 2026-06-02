'use client'

import { useEffect, useState } from 'react'
import CoursesWidget from '@/components/CoursesWidget'
import Screensaver from '@/components/Screensaver'
import ClockWidget from '@/components/ClockWidget'
import WeatherWidget from '@/components/WeatherWidget'
import RadioWidget from '@/components/RadioWidget'
import NewsTicker from '@/components/NewsTicker'
import TodoWidget from '@/components/TodoWidget'
import RecetteDuMonde from '@/components/RecetteDuMonde'
import BottomBar from '@/components/BottomBar'
import MobileMenu from '@/components/MobileMenu'

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
        setScreensaver(true)
      }, 60000)

    }

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('pointerdown', resetTimer)
    window.addEventListener('keydown', resetTimer)

    resetTimer()

    return () => {

      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('pointerdown', resetTimer)
      window.removeEventListener('keydown', resetTimer)

    }

  }, [])

  return (

    <main
      className={`min-h-screen overflow-y-auto md:overflow-hidden bg-gradient-to-br ${backgroundClass} text-white p-3`}
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute bottom-[-250px] left-[-100px] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>

      </div>

      {/* GRID */}

      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">

        {/* Clock — mobile: 1er, desktop: col 1-3 row 1 */}
        <div className="order-1 md:order-none md:col-span-3 md:h-[160px]">
          <ClockWidget />
        </div>

        {/* Weather — mobile: 2e, desktop: col 4-8 rows 1-2 */}
        <div className="order-2 md:order-none md:col-span-5 md:row-span-2 md:h-[300px]">
          <WeatherWidget />
        </div>

        {/* Recette du Monde — mobile: 5e, desktop: col 9-12 row 1 */}
        <div className="order-5 md:order-none md:col-span-4 md:h-[160px]">
          <RecetteDuMonde />
        </div>

        {/* Todo — mobile: 3e, desktop: col 1-3 row 2 */}
        <div className="order-3 md:order-none md:col-span-3">
          <TodoWidget />
        </div>

        {/* Courses — mobile: 4e, desktop: col 9-12 row 2 */}
        <div className="order-4 md:order-none md:col-span-4">
          <CoursesWidget />
        </div>

        {/* Radio — mobile: 6e, desktop: col 1-12 row 3 */}
        <div className="order-6 md:order-none md:col-span-12">
          <RadioWidget />
        </div>

      </div>

      <BottomBar />

      <MobileMenu />

      <NewsTicker />

      {screensaver && (
        <Screensaver onWake={() => setScreensaver(false)} />
      )}

    </main>
  )
}