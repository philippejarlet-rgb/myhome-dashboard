'use client'

import { useEffect, useState } from 'react'

type Item = {
  text: string
  checked: boolean
}

export default function CoursesWidget() {

  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {

    const saved =
      localStorage.getItem('myhome-courses')

    if (saved) {

      const parsed = JSON.parse(saved)

      const remaining = parsed.filter(
        (item: Item) => !item.checked
      )

      setItems(remaining)

    }

  }, [])

  return (

    <div className="widget-hover glass-card rounded-3xl p-6 shadow-2xl h-[170px] flex flex-col overflow-hidden">

      <h2 className="text-xl mb-4 shrink-0">
        Courses
      </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2">

        <ul className="space-y-3 text-sm">

          {items.length === 0 && (

            <li className="text-zinc-500">
              Aucune course 😄
            </li>

          )}

          {items.map((item, index) => (

            <li
              key={index}
              className="flex items-center gap-3"
            >

              <span>🛒</span>

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