'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBasket } from 'lucide-react'

type Item = {
  text: string
  checked: boolean
}

export default function CoursesWidget() {

  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetch('/api/data/courses')
      .then((r) => r.json())
      .then((data) => {
        const remaining = data.items.filter((item: Item) => !item.checked)
        setItems(remaining)
      })
      .catch(() => {})
  }, [])

  return (

    <div onClick={() => router.push('/courses')} className="widget-hover glass-card rounded-3xl p-4 shadow-2xl h-full flex flex-col overflow-hidden cursor-pointer">

      <h2 className="text-base mb-2 shrink-0">
        Courses
      </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>

        <ul className="space-y-3 text-sm">

          {items.length === 0 && (

            <li className="text-zinc-500">
              Aucune course 😄
            </li>

          )}

          {items.map((item) => (

            <li
              key={item.text}
              className="flex items-center gap-3"
            >

              <ShoppingBasket size={14} className="text-zinc-400 shrink-0" />

              <span>
                {item.text}
              </span>

            </li>

          ))}

        </ul>

      </div>

    </div>

  )
}