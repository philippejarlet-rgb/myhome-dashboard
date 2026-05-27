'use client'

import { useEffect, useState } from 'react'

type Todo = {
  text: string
  checked: boolean
}

export default function TodoWidget() {

  const [todos, setTodos] = useState<Todo[]>([])

  // LOAD

  useEffect(() => {

    const saved =
      localStorage.getItem('myhome-todos')

    if (saved) {

      setTodos(JSON.parse(saved))
    }

  }, [])

  return (

    <div className="widget-hover glass-card rounded-3xl p-8 shadow-2xl h-[200px] flex flex-col overflow-hidden">

     <h2 className="text-xl mb-4 shrink-0">
       Todo
     </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">

        <ul className="space-y-3 text-sm">

          {todos.length === 0 && (

            <li className="text-zinc-500">
              Aucune tâche 😄
            </li>

          )}

          {todos.map((todo, index) => (

            <li
              key={index}
              className={`flex items-center gap-3
              ${
                todo.checked
                  ? 'opacity-40 line-through'
                  : ''
              }`}
            >

             <span className="text-sm">
              📝
            </span>

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