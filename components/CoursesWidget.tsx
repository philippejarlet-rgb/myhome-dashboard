'use client'

import { useEffect, useState } from 'react'

type Item = {
  text: string
  checked: boolean
}

export default function CoursesWidget() {

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

    <div className="widget-hover glass-card rounded-3xl p-4 shadow-2xl h-full flex flex-col overflow-hidden">

      <h2 className="text-base mb-2 shrink-0">
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