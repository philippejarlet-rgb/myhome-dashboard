'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList } from 'lucide-react'

type Todo = {
  text: string
  checked: boolean
}

export default function TodoWidget() {

  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])

  // LOAD

  useEffect(() => {
    fetch('/api/data/todos')
      .then((r) => r.json())
      .then((data) => setTodos(data))
      .catch(() => {})
  }, [])

  return (

    <div onClick={() => router.push('/todo')} className="widget-hover glass-card rounded-3xl p-4 shadow-2xl h-full flex flex-col overflow-hidden cursor-pointer">

      <h2 className="text-base mb-2 shrink-0">
        Todo
      </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>

        <ul className="space-y-3 text-sm">

          {todos.length === 0 && (

            <li className="text-zinc-500">
              Aucune tâche 😄
            </li>

          )}

          {todos.map((todo) => (

            <li
              key={todo.text}
              className={`flex items-center gap-3
              ${
                todo.checked
                  ? 'opacity-40 line-through'
                  : ''
              }`}
            >

             <ClipboardList size={14} className="text-zinc-400 shrink-0" />

              <span>
                {todo.text}
              </span>

            </li>

          ))}

        </ul>

      </div>

    </div>

  )
}