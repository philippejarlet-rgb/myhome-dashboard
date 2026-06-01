'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { RefreshCw, Home, ShoppingCart, ListTodo, Radio, ClipboardList, ShoppingBasket } from 'lucide-react'

type Tab = 'home' | 'courses' | 'todo' | 'radios'

type Todo = { text: string; checked: boolean }
type CoursesData = { items: { text: string; checked: boolean }[]; history: string[] }
type Radio = { name: string; stream: string; logo: string; favorite: boolean }

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  // Todo state
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  // Courses state
  const [courses, setCourses] = useState<{ text: string; checked: boolean }[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [newCourse, setNewCourse] = useState('')

  // Radio state
  const [radios, setRadios] = useState<Radio[]>([])
  const [activeRadio, setActiveRadio] = useState<Radio | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Load todos
  useEffect(() => {
    fetch('/api/data/todos')
      .then(r => r.json())
      .then((data: Todo[]) => setTodos(data))
      .catch(() => {})
  }, [])

  // Load courses
  useEffect(() => {
    fetch('/api/data/courses')
      .then(r => r.json())
      .then((data: CoursesData) => {
        setCourses(data.items ?? [])
        setHistory(data.history ?? [])
      })
      .catch(() => {})
  }, [])

  // Load radios (favoris uniquement)
  useEffect(() => {
    fetch('/api/data/radios')
      .then(r => r.json())
      .then((data: Radio[]) => setRadios(data.filter(r => r.favorite)))
      .catch(() => {})
    return () => { hlsRef.current?.destroy() }
  }, [])

  // Media Session API — contrôles sur écran de verrouillage
  useEffect(() => {
    if (!activeRadio) return
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeRadio.name,
      artist: 'En direct',
      artwork: activeRadio.logo ? [{ src: activeRadio.logo, sizes: '96x96', type: 'image/png' }] : [],
    })
    navigator.mediaSession.setActionHandler('pause', stopRadio)
    navigator.mediaSession.setActionHandler('stop', stopRadio)
  }, [activeRadio])

  const playStream = (audio: HTMLAudioElement, url: string) => {
    hlsRef.current?.destroy()
    hlsRef.current = null
    if (url.endsWith('.m3u8')) {
      if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = url
      } else if (Hls.isSupported()) {
        const hls = new Hls()
        hlsRef.current = hls
        hls.loadSource(url)
        hls.attachMedia(audio)
      }
    } else {
      audio.src = url
    }
  }

  const playRadio = (radio: Radio) => {
    if (!audioRef.current) return
    playStream(audioRef.current, radio.stream)
    audioRef.current.play()
    setActiveRadio(radio)
  }

  const stopRadio = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    hlsRef.current?.destroy()
    hlsRef.current = null
    setActiveRadio(null)
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none'
  }

  // ── Todo helpers ──
  const saveTodos = (updated: Todo[]) => {
    setTodos(updated)
    fetch('/api/data/todos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {})
  }
  const addTodo = () => { const t = newTodo.trim(); if (!t) return; saveTodos([...todos, { text: t, checked: false }]); setNewTodo('') }
  const toggleTodo = (i: number) => saveTodos(todos.map((t, idx) => idx === i ? { ...t, checked: !t.checked } : t))
  const deleteTodo = (i: number) => saveTodos(todos.filter((_, idx) => idx !== i))

  // ── Courses helpers ──
  const saveCourses = (items: { text: string; checked: boolean }[], hist: string[]) => {
    setCourses(items); setHistory(hist)
    fetch('/api/data/courses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, history: hist }) }).catch(() => {})
  }
  const addCourse = () => { const t = newCourse.trim(); if (!t) return; const h = history.includes(t) ? history : [t, ...history].slice(0, 20); saveCourses([...courses, { text: t, checked: false }], h); setNewCourse('') }
  const toggleCourse = (i: number) => saveCourses(courses.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c), history)
  const deleteCourse = (i: number) => saveCourses(courses.filter((_, idx) => idx !== i), history)

  const tabs = [
    { id: 'home' as Tab, icon: <Home size={22} />, label: 'MyHome' },
    { id: 'courses' as Tab, icon: <ShoppingCart size={22} />, label: 'Courses' },
    { id: 'todo' as Tab, icon: <ListTodo size={22} />, label: 'Todo' },
    { id: 'radios' as Tab, icon: <Radio size={22} />, label: 'Radios' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white flex flex-col">

      {/* TOP NAV */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          onClick={() => window.location.reload()}
          className="flex flex-col items-center gap-1 py-4 px-3 text-sm text-zinc-400 active:text-white transition-all"
        >
          <RefreshCw size={22} />
          <span>Refresh</span>
        </button>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-4 text-sm font-medium transition-all ${
              activeTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: activeRadio ? '80px' : '16px' }}>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 py-4">
              <img src="/android-chrome-192x192.png" alt="MyHome" className="w-20 h-20" />
              <h1 className="text-2xl font-thin tracking-widest">MYHOME</h1>
              <p className="text-xs text-zinc-500 italic text-center">Parce qu'une maison, c'est plus que quatre murs.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Todo</h2>
              {todos.filter(t => !t.checked).length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune tâche 🎉</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {todos.filter(t => !t.checked).map((todo, i) => (
                    <li key={todo.text + i} className="flex items-center gap-2 text-sm">
                      <ClipboardList size={14} className="text-zinc-400 shrink-0" /><span>{todo.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Courses</h2>
              {courses.filter(c => !c.checked).length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune course 😊</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {courses.filter(c => !c.checked).map((item, i) => (
                    <li key={item.text + i} className="flex items-center gap-2 text-sm">
                      <ShoppingBasket size={14} className="text-zinc-400 shrink-0" /><span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input value={newCourse} onChange={e => setNewCourse(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCourse()} placeholder="Ajouter un article..." className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-zinc-500" list="course-history" />
              <datalist id="course-history">{history.map(h => <option key={h} value={h} />)}</datalist>
              <button onClick={addCourse} className="bg-cyan-500 rounded-2xl px-5 py-3 text-xl font-bold">+</button>
            </div>
            {courses.length === 0 && <p className="text-zinc-500 text-center mt-8">Aucun article 😊</p>}
            {courses.map((item, i) => (
              <div key={item.text + i} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                <button onClick={() => toggleCourse(i)} className="text-2xl shrink-0">{item.checked ? '✅' : '⬜'}</button>
                <span className={`flex-1 text-lg ${item.checked ? 'line-through text-zinc-500' : ''}`}>{item.text}</span>
                <button onClick={() => deleteCourse(i)} className="text-zinc-500 active:text-red-400 text-xl shrink-0">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* TODO TAB */}
        {activeTab === 'todo' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="Ajouter une tâche..." className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-zinc-500" />
              <button onClick={addTodo} className="bg-cyan-500 rounded-2xl px-5 py-3 text-xl font-bold">+</button>
            </div>
            {todos.length === 0 && <p className="text-zinc-500 text-center mt-8">Aucune tâche 🎉</p>}
            {todos.map((todo, i) => (
              <div key={todo.text + i} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                <button onClick={() => toggleTodo(i)} className="text-2xl shrink-0">{todo.checked ? '✅' : '⬜'}</button>
                <span className={`flex-1 text-lg ${todo.checked ? 'line-through text-zinc-500' : ''}`}>{todo.text}</span>
                <button onClick={() => deleteTodo(i)} className="text-zinc-500 active:text-red-400 text-xl shrink-0">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* RADIOS TAB */}
        {activeTab === 'radios' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {radios.map(radio => (
                <button
                  key={radio.name}
                  onClick={() => activeRadio?.name === radio.name ? stopRadio() : playRadio(radio)}
                  className={`transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 ${
                    activeRadio?.name === radio.name
                      ? 'bg-cyan-500/30 border border-cyan-400 shadow-cyan-500/30 shadow-2xl'
                      : 'bg-white/10 active:bg-white/20'
                  }`}
                >
                  <img src={radio.logo} alt={radio.name} className="h-12 w-full object-contain rounded-xl" />
                  <span className="text-sm font-medium">{radio.name}</span>
                  <span className="text-xs text-zinc-400">
                    {activeRadio?.name === radio.name ? '⏹ Stop' : '▶ Play'}
                  </span>
                </button>
              ))}
            </div>

            {/* Bouton Stop global */}
            {activeRadio && (
              <button
                onClick={stopRadio}
                className="mt-2 bg-red-500/70 active:bg-red-400 rounded-2xl p-4 flex items-center justify-center gap-3 text-lg font-semibold"
              >
                <span className="text-2xl">⏹</span> Stop
              </button>
            )}
          </div>
        )}

      </div>

      {/* MINI PLAYER — persistant sur tous les onglets */}
      {activeRadio && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
          <img src={activeRadio.logo} alt={activeRadio.name} className="h-10 w-10 object-contain rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{activeRadio.name}</div>
            <div className="text-xs text-cyan-400 flex items-center gap-1">
              <span className="animate-pulse">●</span> En direct
            </div>
          </div>
          <button onClick={stopRadio} className="bg-red-500/70 active:bg-red-400 rounded-xl px-4 py-2 text-sm font-bold shrink-0">
            ⏹ Stop
          </button>
        </div>
      )}

      <audio ref={audioRef} />

    </div>
  )
}
