'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Check } from 'lucide-react'

type Item = {
  text: string
  checked: boolean
  store?: string
}

export default function CoursesPage() {

  const router = useRouter()

  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [favorites, setFavorites] = useState<Record<string, string>>({})
  const [newStore, setNewStore] = useState('')
  const [isNewStoreInput, setIsNewStoreInput] = useState(false)
  const [editingStoreIndex, setEditingStoreIndex] = useState<number | null>(null)
  const [editingNewStoreValue, setEditingNewStoreValue] = useState('')

  // LOAD

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data/courses')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()

        if ((data.items || []).length === 0 && (data.history || []).length === 0) {
          const savedItems = localStorage.getItem('myhome-courses')
          const savedHistory = localStorage.getItem('myhome-courses-history')
          if (savedItems || savedHistory) {
            try {
              const parsed = {
                items: savedItems ? JSON.parse(savedItems) : [],
                history: savedHistory ? JSON.parse(savedHistory) : [],
                favorites: {},
              }
              const migrateResponse = await fetch('/api/data/courses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
              })
              if (!migrateResponse.ok) throw new Error('Migration PUT failed')
              setItems(parsed.items)
              setHistory(parsed.history)
              setFavorites({})
              localStorage.removeItem('myhome-courses')
              localStorage.removeItem('myhome-courses-history')
            } catch {
              // migration failed, continue with empty list
            }
            setLoaded(true)
            return
          }
        }

        setItems(data.items || [])
        setHistory(data.history || [])
        setFavorites(data.favorites || {})
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
      body: JSON.stringify({ items, history, favorites }),
    }).catch(() => {})
  }, [items, history, favorites, loaded])

  // ADD

  const addItem = () => {
    if (!newItem.trim()) return
    const storeValue = newStore.trim() || undefined

    setItems(prev => [...prev, { text: newItem, checked: false, store: storeValue }])

    if (!history.includes(newItem)) {
      setHistory(prev => [...prev, newItem])
    }

    if (storeValue) {
      setFavorites(prev => ({ ...prev, [newItem]: storeValue }))
    }

    setNewItem('')
    setNewStore('')
    setIsNewStoreInput(false)
    setSuggestions([])
  }

  // TOGGLE

  const toggleItem = (index: number) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, checked: !it.checked } : it))
  }

  // DELETE

  const deleteItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // UPDATE STORE

  const updateItemStore = (index: number, store: string) => {
    const text = items[index].text
    setItems(prev => prev.map((it, i) => i === index ? { ...it, store: store || undefined } : it))
    if (store) {
      setFavorites(prev => ({ ...prev, [text]: store }))
    }
    setEditingStoreIndex(null)
    setEditingNewStoreValue('')
  }

  // SHARE

  const shareCourses = async () => {
    const noStore = items.filter(it => !it.store)
    const stores = Array.from(new Set(items.filter(it => it.store).map(it => it.store!))).sort()

    const lines: string[] = []

    stores.forEach(store => {
      lines.push(store.toUpperCase())
      items.filter(it => it.store === store).forEach(it => {
        lines.push(`${it.checked ? '✅' : '⬜'} ${it.text}`)
      })
      lines.push('')
    })

    if (noStore.length > 0) {
      lines.push('Sans magasin')
      noStore.forEach(it => {
        lines.push(`${it.checked ? '✅' : '⬜'} ${it.text}`)
      })
    }

    const text = lines.join('\n').trim()

    if (navigator.share) {
      await navigator.share({ title: 'MYHOME Courses', text })
    } else {
      alert('Partage non supporté 😄')
    }
  }

  // HELPERS

  const knownStores = Array.from(new Set(Object.values(favorites))).sort()
  const noStoreItems = items.map((it, i) => ({ item: it, index: i })).filter(({ item }) => !item.store)
  const storesInItems = Array.from(new Set(items.filter(it => it.store).map(it => it.store!))).sort()
  const itemsByStore = (store: string) =>
    items.map((it, i) => ({ item: it, index: i })).filter(({ item }) => item.store === store)

  const renderStoreBadge = (item: Item, index: number) => {
    if (editingStoreIndex === index) {
      if (editingNewStoreValue === '__input__') {
        return (
          <form
            className="flex items-center gap-2 mt-1"
            onSubmit={(e) => {
              e.preventDefault()
              const val = (new FormData(e.currentTarget).get('store') as string) || ''
              updateItemStore(index, val)
            }}
          >
            <input
              autoFocus
              name="store"
              placeholder="Nouveau magasin..."
              className="bg-black/30 rounded-xl px-3 py-1 text-sm outline-none w-36"
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setEditingStoreIndex(null); setEditingNewStoreValue('') }
              }}
            />
            <button type="submit" className="text-cyan-400 text-sm">✓</button>
            <button
              type="button"
              onClick={() => { setEditingStoreIndex(null); setEditingNewStoreValue('') }}
              className="text-zinc-500 text-sm"
            >✕</button>
          </form>
        )
      }

      return (
        <div className="flex items-center gap-2 mt-1">
          <select
            autoFocus
            className="bg-black/30 rounded-xl px-2 py-1 text-sm outline-none"
            defaultValue={item.store || ''}
            onChange={(e) => {
              if (e.target.value === '__new__') {
                setEditingNewStoreValue('__input__')
              } else {
                updateItemStore(index, e.target.value)
              }
            }}
          >
            <option value="" className="text-black">— Sans magasin</option>
            {knownStores.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
            <option value="__new__" className="text-black">＋ Nouveau magasin...</option>
          </select>
          <button
            onClick={() => { setEditingStoreIndex(null); setEditingNewStoreValue('') }}
            className="text-zinc-500 text-sm"
          >✕</button>
        </div>
      )
    }

    return (
      <button
        onClick={() => { setEditingStoreIndex(index); setEditingNewStoreValue('') }}
        className={`text-xs rounded-xl px-2 py-0.5 mt-1 transition-all
          ${item.store
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            : 'bg-white/5 text-zinc-500 border border-white/10'
          }`}
      >
        {item.store || '—'}
      </button>
    )
  }

  const renderItem = (item: Item, index: number) => (
    <div
      key={index}
      className={`glass-card rounded-3xl p-4 md:p-6 flex items-center justify-between transition-all
        ${item.checked ? 'opacity-40 scale-[0.98]' : ''}`}
    >
      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={() => toggleItem(index)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0
            ${item.checked ? 'bg-green-500 border-green-400' : 'border-white/30'}`}
        >
          {item.checked && <Check size={14} />}
        </button>

        <div className="flex flex-col">
          <span className={`text-lg md:text-2xl ${item.checked ? 'line-through text-zinc-500' : ''}`}>
            {item.text}
          </span>
          {renderStoreBadge(item, index)}
        </div>
      </div>

      <button
        onClick={() => deleteItem(index)}
        className="text-red-400 text-lg ml-4 shrink-0"
      >
        Supprimer
      </button>
    </div>
  )

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8">

      {/* HEADER */}

      <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-10">

        <button
          onClick={() => router.push('/')}
          className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
        >
          ← Retour
        </button>

        <div>
          <h1 className="text-3xl md:text-6xl font-thin">Courses</h1>
          <p className="text-zinc-400 mt-1 md:mt-2 text-sm md:text-xl">Liste intelligente MYHOME</p>
        </div>

        <button
          onClick={shareCourses}
          className="ml-auto glass-card rounded-2xl px-5 py-3 hover:scale-105 transition-all"
        >
          <Share2 size={18} className="inline mr-2" />Partager
        </button>

      </div>

      {/* ADD */}

      <div className="glass-card rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col gap-3">

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

                if (favorites[value]) {
                  setNewStore(favorites[value])
                  setIsNewStoreInput(false)
                }

                const filtered = history.filter((item) =>
                  item.toLowerCase().includes(value.toLowerCase())
                )
                setSuggestions(filtered.slice(0, 5))
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
              placeholder="Ajouter un article..."
              className="flex-1 bg-black/20 rounded-2xl px-4 md:px-6 py-4 outline-none text-base md:text-xl"
            />
            <button
              onClick={addItem}
              className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-4 md:px-8 py-4 text-base md:text-xl"
            >
              Ajouter
            </button>
          </div>

          {isNewStoreInput ? (
            <input
              autoFocus
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addItem()
                if (e.key === 'Escape') { setIsNewStoreInput(false); setNewStore('') }
              }}
              placeholder="Nom du magasin..."
              className="bg-black/20 rounded-2xl px-4 py-3 outline-none text-base"
            />
          ) : (
            <select
              value={newStore}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setIsNewStoreInput(true)
                  setNewStore('')
                } else {
                  setNewStore(e.target.value)
                }
              }}
              className="bg-black/20 rounded-2xl px-4 py-3 outline-none text-base text-zinc-300"
            >
              <option value="" className="text-black">Magasin (optionnel)</option>
              {knownStores.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
              <option value="__new__" className="text-black">＋ Nouveau magasin...</option>
            </select>
          )}

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
                if (favorites[suggestion]) {
                  setNewStore(favorites[suggestion])
                  setIsNewStoreInput(false)
                }
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

      <div className="flex flex-col gap-6">

        {noStoreItems.length > 0 && (
          <div>
            <p className="text-zinc-500 text-sm tracking-widest mb-3">— SANS MAGASIN —</p>
            <div className="flex flex-col gap-4">
              {noStoreItems.map(({ item, index }) => renderItem(item, index))}
            </div>
          </div>
        )}

        {storesInItems.map(store => (
          <div key={store}>
            <p className="text-zinc-400 text-sm tracking-widest uppercase mb-3">── {store} ──</p>
            <div className="flex flex-col gap-4">
              {itemsByStore(store).map(({ item, index }) => renderItem(item, index))}
            </div>
          </div>
        ))}

      </div>

    </main>
  )
}
