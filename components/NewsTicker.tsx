'use client'

import { useEffect, useState } from 'react'

export default function NewsTicker() {

  const [news, setNews] = useState<string[]>([])

  useEffect(() => {

    async function fetchNews() {

      const response = await fetch('/api/news')

      const data = await response.json()

      setNews(data)
    }

    fetchNews()

  }, [])

  return (
  <div className="fixed bottom-36 left-0 w-full z-50">

    <div className="bg-red-700 text-white py-3 overflow-hidden shadow-2xl">

      <div className="animate-marquee whitespace-nowrap text-xl px-4">

        {news.join('   🔴   ')}

      </div>

    </div>

  </div>
)
}