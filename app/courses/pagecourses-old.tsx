'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Item = {
  text: string
  checked: boolean
}

export default function CoursesPage() {

  const router = useRouter()

  const [items, setItems] = useState<Item[]>([])

  const [newItem, setNewItem] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const [suggestions, setSuggestions] = useState<string[]>([])

  // LOAD

  useEffect(() => {

    const saved = localStorage.getItem('myhome-courses')
    const savedHistory =
         localStorage.getItem('myhome-courses-history')

        if (savedHistory) {

        setHistory(JSON.parse(savedHistory))
    }
    if (saved) {

      setItems(JSON.parse(saved))
    }

  }, [])

  // SAVE

  useEffect(() => {

    localStorage.setItem(
      'myhome-courses',
      JSON.stringify(items)
    )

  }, [items])

  // ADD

  const addItem = () => {

    if (!newItem.trim()) return
    if (!history.includes(newItem)) {

  const updatedHistory = [

    ...history,
    newItem,
  ]

  setHistory(updatedHistory)

  localStorage.setItem(
    'myhome-courses-history',
    JSON.stringify(updatedHistory)
  )
}
    setItems([

      ...items,

      {
        text: newItem,
        checked: false,
      },

    ])

    setNewItem('')
  }

  // TOGGLE

  const toggleItem = (index: number) => {

    const updated = [...items]

    updated[index].checked =
      !updated[index].checked

    setItems(updated)
  }

  // DELETE

  const deleteItem = (index: number) => {

    const updated = items.filter(
      (_, i) => i !== index
    )

    setItems(updated)
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}

      <div className="flex items-center gap-6 mb-10">

        <button
          onClick={() => {
            router.push('/')
            router.refresh()
          }}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>

        <div>

          <h1 className="text-6xl font-thin">
            Courses
          </h1>

          <p className="text-zinc-400 mt-2 text-xl">
            Liste intelligente MYHOME
          </p>

        </div>

      </div>

      {/* ADD */}

      <div className="glass-card rounded-3xl p-6 mb-8">

        <div className="flex gap-4">

          <input
            value={newItem}
            onChange={(e) => {

  const value = e.target.value

  setNewItem(value)

  if (!value) {

    setSuggestions([])

    return
  }

  const filtered = history.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase())
  )

  setSuggestions(filtered.slice(0, 5))
}}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addItem()
              }
            }}
            placeholder="Ajouter un article..."
            className="flex-1 bg-black/20 rounded-2xl px-6 py-4 outline-none text-xl"
          />

          <button
            onClick={addItem}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-8 py-4 text-xl"
          >

            Ajouter

          </button>

        </div>

      </div>

      {/* LIST */}

      <div className="flex flex-col gap-4">

        {items.map((item, index) => (

          <div
            key={index}
            className={`glass-card rounded-3xl p-6 flex items-center justify-between transition-all
            ${
              item.checked
                ? 'opacity-40 scale-[0.98]'
                : ''
            }`}
          >

            <div className="flex items-center gap-6">

              <button
                onClick={() => toggleItem(index)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${
                  item.checked
                    ? 'bg-green-500 border-green-400'
                    : 'border-white/30'
                }`}
              >

                {item.checked && '✓'}

              </button>

              <span
                className={`text-2xl
                ${
                  item.checked
                    ? 'line-through text-zinc-500'
                    : ''
                }`}
              >

                {item.text}

              </span>

            </div>

            <button
              onClick={() => deleteItem(index)}
              className="text-red-400 hover:text-red-300 text-lg"
            >

              Supprimer

            </button>

          </div>

        ))}

      </div>

    </main>
  )
}