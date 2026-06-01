'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Check } from 'lucide-react'

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

  const [loaded, setLoaded] = useState(false)

  // LOAD

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data/courses')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()

        if (data.items.length === 0 && data.history.length === 0) {
          const savedItems = localStorage.getItem('myhome-courses')
          const savedHistory = localStorage.getItem('myhome-courses-history')
          if (savedItems || savedHistory) {
            try {
              const parsed = {
                items: savedItems ? JSON.parse(savedItems) : [],
                history: savedHistory ? JSON.parse(savedHistory) : [],
              }
              const migrateResponse = await fetch('/api/data/courses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
              })
              if (!migrateResponse.ok) throw new Error('Migration PUT failed')
              setItems(parsed.items)
              setHistory(parsed.history)
              localStorage.removeItem('myhome-courses')
              localStorage.removeItem('myhome-courses-history')
            } catch {
              // migration failed, continue with empty list
            }
            setLoaded(true)
            return
          }
        }

        setItems(data.items)
        setHistory(data.history)
        setLoaded(true)
      } catch {
        setLoaded(true)
      }
    }
    loadData()
  }, [])

  // SAVE

  useEffect(() => {
    if (!loaded) return
    fetch('/api/data/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, history }),
    }).catch(() => {})
  }, [items, history, loaded])

  // ADD

  const addItem = () => {

    if (!newItem.trim()) return

    setItems([

      ...items,

      {
        text: newItem,
        checked: false,
      },

    ])

    // HISTORY

    if (!history.includes(newItem)) {

      const updatedHistory = [

        ...history,
        newItem,
      ]

      setHistory(updatedHistory)
    }

    setNewItem('')

    setSuggestions([])
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


// SHARE

const shareCourses = async () => {

  const text = items
    .map((item) =>
      `${item.checked ? '✅' : '⬜'} ${item.text}`
    )
    .join('\n')

  if (navigator.share) {

    await navigator.share({

      title: 'MYHOME Courses',
      text,

    })

  } else {

    alert('Partage non supporté 😄')
  }
}

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}

    <div className="flex items-center gap-6 mb-10">

  <button
    onClick={() => router.push('/')}
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

  <button
    onClick={shareCourses}
    className="ml-auto glass-card rounded-2xl px-5 py-3 hover:scale-105 transition-all"
  >
    <Share2 size={18} className="inline mr-2" />Partager
  </button>

</div>

      {/* ADD */}

      <div className="glass-card rounded-3xl p-6 mb-6">

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
                item.toLowerCase().includes(
                  value.toLowerCase()
                )
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

      {/* SUGGESTIONS */}

      {suggestions.length > 0 && (

        <div className="glass-card rounded-3xl p-4 mb-8 flex flex-wrap gap-3">

          {suggestions.map((suggestion) => (

            <button
              key={suggestion}
              onClick={() => {
                setNewItem(suggestion)
                setSuggestions([])
              }}
              className="bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-4 py-2"
            >

              {suggestion}

            </button>

          ))}

        </div>

      )}

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

                {item.checked && <Check size={14} />}

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