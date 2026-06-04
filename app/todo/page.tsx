'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Check, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Todo = {
  id: string
  text: string
  checked: boolean
}

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo
  onToggle: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: todo.checked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : todo.checked ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-3xl p-4 md:p-6 flex items-center justify-between
        ${todo.checked ? 'scale-[0.98]' : ''}`}
    >
      <button
        {...(todo.checked ? {} : { ...attributes, ...listeners })}
        type="button"
        className={`mr-3 md:mr-4 text-zinc-500 cursor-grab active:cursor-grabbing touch-none ${todo.checked ? 'invisible' : ''}`}
        aria-label="Réordonner"
        aria-hidden={todo.checked}
      >
        <GripVertical size={20} />
      </button>

      <button
        onClick={onToggle}
        className="flex items-center gap-3 md:gap-6 flex-1 text-left"
      >
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
            ${todo.checked ? 'bg-green-500 border-green-400' : 'border-white/30'}`}
        >
          {todo.checked && <Check size={14} />}
        </div>

        <span
          className={`text-lg md:text-2xl
            ${todo.checked ? 'line-through text-zinc-500' : ''}`}
        >
          {todo.text}
        </span>
      </button>

      <button
        onClick={onDelete}
        className="text-red-400 text-lg"
      >
        Supprimer
      </button>
    </div>
  )
}

export default function TodoPage() {

  const router = useRouter()

  const [todos, setTodos] = useState<Todo[]>([])

  const [newTodo, setNewTodo] = useState('')

  const [loaded, setLoaded] = useState(false)

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

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
              const withIds = parsed.map((t: Todo) => ({ ...t, id: t.id || crypto.randomUUID() }))
              const migrateResponse = await fetch('/api/data/todos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(withIds),
              })
              if (!migrateResponse.ok) throw new Error('Migration PUT failed')
              setTodos(withIds)
              localStorage.removeItem('myhome-todos')
            } catch {
              // migration failed, continue with empty list
            }
            setLoaded(true)
            return
          }
        }

        setTodos(data.map((t: Todo) => ({ ...t, id: t.id || crypto.randomUUID() })))
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

  // REORDER

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setTodos(prev => {
      const oldIndex = prev.findIndex(t => t.id === String(active.id))
      const newIndex = prev.findIndex(t => t.id === String(over.id))
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  // ADD

  const addTodo = () => {

    if (!newTodo.trim()) return

    setTodos([

      ...todos,

      {
        id: crypto.randomUUID(),
        text: newTodo,
        checked: false,
      },

    ])

    setNewTodo('')
  }

  // TOGGLE

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t))
  }

  // DELETE

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
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

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8">

      {/* HEADER */}

      <div className="flex items-start md:items-center justify-between mb-6 md:mb-10">

        <div className="flex items-center gap-3 md:gap-6">

          <button
            onClick={() => {
              router.push('/')
    
            }}
            className="glass-card rounded-2xl px-4 py-2 hover:scale-105 transition-all"
          >
            ← Retour
          </button>

          <div>

            <h1 className="text-3xl md:text-6xl font-thin">
              Todo
            </h1>

            <p className="text-zinc-400 mt-1 md:mt-2 text-sm md:text-xl">
              Vos Post-it
            </p>

          </div>

        </div>

        <button
          onClick={shareTodos}
          className="glass-card rounded-2xl px-5 py-3 hover:scale-105 transition-all"
        >
          <Share2 size={18} className="inline mr-2" />Partager
        </button>

      </div>

      {/* ADD */}

      <div className="glass-card rounded-3xl p-4 md:p-6 mb-6 md:mb-8">

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
            className="flex-1 bg-black/20 rounded-2xl px-4 md:px-6 py-4 outline-none text-base md:text-xl"
          />

          <button
            onClick={addTodo}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-2xl px-4 md:px-8 py-4 text-base md:text-xl"
          >

            Ajouter

          </button>

        </div>

      </div>

      {/* LIST */}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={todos.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {todos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onDelete={() => deleteTodo(todo.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="md:hidden text-center text-xs text-zinc-500 py-4 pb-20 mt-8">
        © {new Date().getFullYear()} MyHome
      </div>

    </main>
  )
}