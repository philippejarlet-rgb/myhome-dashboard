'use client'

import { useEffect, useState } from 'react'

type Tab = 'home' | 'courses' | 'todo'

type Todo = { text: string; checked: boolean }

type CoursesData = { items: { text: string; checked: boolean }[]; history: string[] }

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  // TODO state
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  // Courses state
  const [courses, setCourses] = useState<{ text: string; checked: boolean }[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [newCourse, setNewCourse] = useState('')

  // Load todos
  useEffect(() => {
    fetch('/api/data/todos')
      .then((r) => r.json())
      .then((data: Todo[]) => setTodos(data))
      .catch(() => {})
  }, [])

  // Load courses
  useEffect(() => {
    fetch('/api/data/courses')
      .then((r) => r.json())
      .then((data: CoursesData) => {
        setCourses(data.items ?? [])
        setHistory(data.history ?? [])
      })
      .catch(() => {})
  }, [])

  const saveTodos = (updated: Todo[]) => {
    setTodos(updated)
    fetch('/api/data/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {})
  }

  const saveCourses = (updatedItems: { text: string; checked: boolean }[], updatedHistory: string[]) => {
    setCourses(updatedItems)
    setHistory(updatedHistory)
    fetch('/api/data/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems, history: updatedHistory }),
    }).catch(() => {})
  }

  const addTodo = () => {
    const text = newTodo.trim()
    if (!text) return
    saveTodos([...todos, { text, checked: false }])
    setNewTodo('')
  }

  const toggleTodo = (i: number) => {
    const updated = todos.map((t, idx) => idx === i ? { ...t, checked: !t.checked } : t)
    saveTodos(updated)
  }

  const deleteTodo = (i: number) => {
    saveTodos(todos.filter((_, idx) => idx !== i))
  }

  const addCourse = () => {
    const text = newCourse.trim()
    if (!text) return
    const updatedHistory = history.includes(text) ? history : [text, ...history].slice(0, 20)
    saveCourses([...courses, { text, checked: false }], updatedHistory)
    setNewCourse('')
  }

  const toggleCourse = (i: number) => {
    const updated = courses.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c)
    saveCourses(updated, history)
  }

  const deleteCourse = (i: number) => {
    saveCourses(courses.filter((_, idx) => idx !== i), history)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white flex flex-col">

      {/* TOP NAV */}
      <div className="flex border-b border-white/10 shrink-0">
        {([
          { id: 'home', icon: '🏠', label: 'MyHome' },
          { id: 'courses', icon: '🛒', label: 'Courses' },
          { id: 'todo', icon: '📝', label: 'Todo' },
        ] as { id: Tab; icon: string; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-4 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-zinc-400'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="text-5xl">🏠</div>
              <h1 className="text-2xl font-thin tracking-widest">MYHOME</h1>
            </div>

            {/* Todo read-only */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">📝 Todo</h2>
              {todos.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune tâche 🎉</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {todos.filter((t) => !t.checked).map((todo, i) => (
                    <li key={todo.text + i} className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">◻</span>
                      <span>{todo.text}</span>
                    </li>
                  ))}
                  {todos.filter((t) => t.checked).map((todo, i) => (
                    <li key={todo.text + i} className="flex items-center gap-2 text-sm opacity-40 line-through">
                      <span>✓</span>
                      <span>{todo.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Courses read-only */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">🛒 Courses</h2>
              {courses.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune course 😊</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {courses.filter((c) => !c.checked).map((item, i) => (
                    <li key={item.text + i} className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">◻</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                  {courses.filter((c) => c.checked).map((item, i) => (
                    <li key={item.text + i} className="flex items-center gap-2 text-sm opacity-40 line-through">
                      <span>✓</span>
                      <span>{item.text}</span>
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
              <input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCourse()}
                placeholder="Ajouter un article..."
                className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-zinc-500"
                list="course-history"
              />
              <datalist id="course-history">
                {history.map((h) => <option key={h} value={h} />)}
              </datalist>
              <button
                onClick={addCourse}
                className="bg-cyan-500 hover:bg-cyan-400 rounded-2xl px-5 py-3 text-xl font-bold transition-all"
              >
                +
              </button>
            </div>
            {courses.length === 0 && (
              <p className="text-zinc-500 text-center mt-8">Aucun article 😊</p>
            )}
            {courses.map((item, i) => (
              <div key={item.text + '-' + i} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                <button onClick={() => toggleCourse(i)} className="text-2xl shrink-0">
                  {item.checked ? '✅' : '⬜'}
                </button>
                <span className={`flex-1 text-lg ${item.checked ? 'line-through text-zinc-500' : ''}`}>
                  {item.text}
                </span>
                <button onClick={() => deleteCourse(i)} className="text-zinc-500 hover:text-red-400 text-xl shrink-0">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TODO TAB */}
        {activeTab === 'todo' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Ajouter une tâche..."
                className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-zinc-500"
              />
              <button
                onClick={addTodo}
                className="bg-cyan-500 hover:bg-cyan-400 rounded-2xl px-5 py-3 text-xl font-bold transition-all"
              >
                +
              </button>
            </div>
            {todos.length === 0 && (
              <p className="text-zinc-500 text-center mt-8">Aucune tâche 🎉</p>
            )}
            {todos.map((todo, i) => (
              <div key={todo.text + '-' + i} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                <button onClick={() => toggleTodo(i)} className="text-2xl shrink-0">
                  {todo.checked ? '✅' : '⬜'}
                </button>
                <span className={`flex-1 text-lg ${todo.checked ? 'line-through text-zinc-500' : ''}`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(i)} className="text-zinc-500 hover:text-red-400 text-xl shrink-0">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
