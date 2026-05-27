'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

type Todo = {
  text: string
  checked: boolean
}

export default function TodoPage() {

  const router = useRouter()

  const [todos, setTodos] = useState<Todo[]>([])

  const [newTodo, setNewTodo] = useState('')

  const [loaded, setLoaded] = useState(false)

  // LOAD

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data/todos')
        if (!response.ok) throw new Error('API error')
        const data = await response.json()

        if (data.length === 0) {
          const saved = localStorage.getItem('myhome-todos')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              await fetch('/api/data/todos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
              })
              setTodos(parsed)
              localStorage.removeItem('myhome-todos')
            } catch {
              // migration failed, continue with empty list
            }
            setLoaded(true)
            return
          }
        }

        setTodos(data)
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
    fetch('/api/data/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todos),
    }).catch(() => {})
  }, [todos, loaded])

 

  // ADD

  const addTodo = () => {

    if (!newTodo.trim()) return

    setTodos([

      ...todos,

      {
        text: newTodo,
        checked: false,
      },

    ])

    setNewTodo('')
  }

  // TOGGLE

  const toggleTodo = (index: number) => {

    const updated = [...todos]

    updated[index].checked =
      !updated[index].checked

    setTodos(updated)
  }

  // DELETE

  const deleteTodo = (index: number) => {

    const updated = todos.filter(
      (_, i) => i !== index
    )

    setTodos(updated)
  }

  // SHARE

  const shareTodos = async () => {

    const text = todos
      .map((todo) =>
        `${todo.checked ? '✅' : '⬜'} ${todo.text}`
      )
      .join('\n')

    if (navigator.share) {

      await navigator.share({

        title: 'MYHOME Todo',
        text,

      })

    } else {

      alert('Partage non supporté 😄')
    }
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div className="flex items-center gap-6">

          <button
            onClick={() => {
              router.push('/')
    
            }}
            className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
          >
            ← Retour
          </button>

          <div>

            <h1 className="text-6xl font-thin">
              Todo
            </h1>

            <p className="text-zinc-400 mt-2 text-xl">
              Organisation MYHOME
            </p>

          </div>

        </div>

        <button
          onClick={shareTodos}
          className="glass-card rounded-2xl px-5 py-3 hover:scale-105 transition-all"
        >
          📤 Partager
        </button>

      </div>

      {/* ADD */}

      <div className="glass-card rounded-3xl p-6 mb-8">

        <div className="flex gap-4">

          <input
            value={newTodo}
            onChange={(e) =>
              setNewTodo(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTodo()
              }
            }}
            placeholder="Ajouter une tâche..."
            className="flex-1 bg-black/20 rounded-2xl px-6 py-4 outline-none text-xl"
          />

          <button
            onClick={addTodo}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-8 py-4 text-xl"
          >

            Ajouter

          </button>

        </div>

      </div>

      {/* LIST */}

      <div className="flex flex-col gap-4">

        {todos.map((todo, index) => (

          <div
            key={index}
            className={`glass-card rounded-3xl p-6 flex items-center justify-between transition-all
            ${
              todo.checked
                ? 'opacity-40 scale-[0.98]'
                : ''
            }`}
          >

            <button
              onClick={() => toggleTodo(index)}
              className="flex items-center gap-6 flex-1 text-left"
            >

              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${
                  todo.checked
                    ? 'bg-green-500 border-green-400'
                    : 'border-white/30'
                }`}
              >

                {todo.checked && '✓'}

              </div>

              <span
                className={`text-2xl
                ${
                  todo.checked
                    ? 'line-through text-zinc-500'
                    : ''
                }`}
              >

                {todo.text}

              </span>

            </button>

            <button
              onClick={() => deleteTodo(index)}
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