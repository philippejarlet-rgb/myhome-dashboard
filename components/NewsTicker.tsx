'use client'

import { useEffect, useState } from 'react'

type NewsItem = { time: string; title: string }

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data: NewsItem[]) => setNews(data))
      .catch(() => {})
  }, [])

  if (news.length === 0) return null

  const items = [...news, ...news]

  return (
    <div className="fixed bottom-24 left-0 w-full z-50 flex items-stretch shadow-2xl overflow-hidden"
         style={{ background: 'linear-gradient(to right, #7f1d1d, #b91c1c)' }}>

      {/* Label fixe */}
      <div className="shrink-0 flex items-center px-4 border-r border-white/30"
           style={{ background: '#7f1d1d' }}>
        <span className="text-white font-bold text-xs tracking-widest uppercase whitespace-nowrap">
          Dernière minute
        </span>
      </div>

      {/* Défilement */}
      <div className="flex-1 overflow-hidden py-2">
        <div className="flex gap-12 animate-news-scroll whitespace-nowrap" style={{ width: 'max-content' }}>
          {items.map((item, i) => (
            <span key={i} className="text-white text-sm inline-flex items-center gap-2 shrink-0">
              {item.time && (
                <span className="text-red-200 font-semibold text-xs">{item.time}</span>
              )}
              <span>{item.title}</span>
              <span className="text-red-300 mx-2">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}