# Todo Drag-and-Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter le glisser-déposer pour réordonner les todos non cochés dans `app/todo/page.tsx`.

**Architecture:** Un seul fichier modifié (`app/todo/page.tsx`). On extrait un composant `SortableTodoItem` utilisant `useSortable` de dnd-kit, wrappé dans `DndContext` + `SortableContext`. Les todos cochés ont `disabled: true` — ils ne peuvent pas être draggés mais restent dans le calcul de positions. Le réordonnancement via `arrayMove` déclenche automatiquement la sauvegarde existante.

**Tech Stack:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `GripVertical` (lucide-react déjà installé), Tailwind CSS v4.

---

## Fichiers

| Action | Fichier |
|--------|---------|
| Modifier | `app/todo/page.tsx` |

---

## Task 1 — Installer les packages dnd-kit

**Files:**
- Modify: `package.json` (automatique via npm)

- [ ] **Step 1 : Installer les dépendances**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected output (approximatif) :
```
added 3 packages in Xs
```

- [ ] **Step 2 : Vérifier que les packages sont dans package.json**

Ouvrir `package.json` et confirmer que `@dnd-kit/core`, `@dnd-kit/sortable` et `@dnd-kit/utilities` apparaissent dans `dependencies`.

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(todo): install dnd-kit for drag-and-drop"
```

---

## Task 2 — Ajouter le composant SortableTodoItem

**Files:**
- Modify: `app/todo/page.tsx`

Ce composant remplace le rendu inline de chaque todo. Il utilise `useSortable` pour gérer le drag. Si `todo.checked`, le drag est désactivé et la poignée masquée.

- [ ] **Step 1 : Ajouter les imports dnd-kit et GripVertical en haut du fichier**

Remplacer la ligne :
```tsx
import { Share2, Check } from 'lucide-react'
```
Par :
```tsx
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
```

- [ ] **Step 2 : Ajouter le composant SortableTodoItem juste après la déclaration du type Todo (avant `export default function TodoPage`)**

```tsx
function SortableTodoItem({
  todo,
  index,
  onToggle,
  onDelete,
}: {
  todo: Todo
  index: number
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
  } = useSortable({ id: String(index), disabled: todo.checked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-3xl p-4 md:p-6 flex items-center justify-between transition-all
        ${todo.checked ? 'opacity-40 scale-[0.98]' : ''}`}
    >
      {!todo.checked && (
        <button
          {...attributes}
          {...listeners}
          className="mr-3 md:mr-4 text-zinc-500 cursor-grab active:cursor-grabbing touch-none"
          tabIndex={-1}
          aria-label="Réordonner"
        >
          <GripVertical size={20} />
        </button>
      )}

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
        className="text-red-400 hover:text-red-300 text-lg"
      >
        Supprimer
      </button>
    </div>
  )
}
```

- [ ] **Step 3 : Lancer le serveur de dev et vérifier qu'il n'y a pas d'erreur TypeScript**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/todo`. La page doit s'afficher normalement (le drag ne fonctionne pas encore).

---

## Task 3 — Ajouter les sensors et le handler onDragEnd dans TodoPage

**Files:**
- Modify: `app/todo/page.tsx` — dans le corps de `TodoPage`

- [ ] **Step 1 : Ajouter `useSensors` après les déclarations de state existantes (après `const [loaded, setLoaded] = useState(false)`)**

```tsx
const sensors = useSensors(
  useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  }),
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
)
```

- [ ] **Step 2 : Ajouter le handler `handleDragEnd` juste avant la section `// ADD`**

```tsx
// REORDER

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  if (!over || active.id === over.id) return
  setTodos(prev => {
    const oldIndex = prev.findIndex((_, i) => String(i) === active.id)
    const newIndex = prev.findIndex((_, i) => String(i) === over.id)
    return arrayMove(prev, oldIndex, newIndex)
  })
}
```

- [ ] **Step 3 : Vérifier qu'il n'y a pas d'erreur TypeScript dans le terminal**

Le serveur de dev doit toujours tourner sans erreur.

---

## Task 4 — Remplacer le rendu de la liste par DndContext + SortableContext

**Files:**
- Modify: `app/todo/page.tsx` — section `{/* LIST */}`

- [ ] **Step 1 : Remplacer la section LIST entière**

Remplacer tout le bloc :
```tsx
{/* LIST */}

<div className="flex flex-col gap-4">

  {todos.map((todo, index) => (

    <div
      key={index}
      className={`glass-card rounded-3xl p-4 md:p-6 flex items-center justify-between transition-all
      ${
        todo.checked
          ? 'opacity-40 scale-[0.98]'
          : ''
      }`}
    >

      <button
        onClick={() => toggleTodo(index)}
        className="flex items-center gap-3 md:gap-6 flex-1 text-left"
      >

        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
          ${
            todo.checked
              ? 'bg-green-500 border-green-400'
              : 'border-white/30'
          }`}
        >

          {todo.checked && <Check size={14} />}

        </div>

        <span
          className={`text-lg md:text-2xl
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
```

Par :
```tsx
{/* LIST */}

<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext
    items={todos.map((_, i) => String(i))}
    strategy={verticalListSortingStrategy}
  >
    <div className="flex flex-col gap-4">
      {todos.map((todo, index) => (
        <SortableTodoItem
          key={index}
          todo={todo}
          index={index}
          onToggle={() => toggleTodo(index)}
          onDelete={() => deleteTodo(index)}
        />
      ))}
    </div>
  </SortableContext>
</DndContext>
```

---

## Task 5 — Test manuel et commit final

**Files:**
- Verify: `app/todo/page.tsx`

- [ ] **Step 1 : Tester le drag-and-drop sur desktop**

Aller sur `http://localhost:3000/todo`.

- Vérifier que l'icône `⋮⋮` (GripVertical) apparaît à gauche des todos non cochés.
- Faire glisser un todo vers le haut ou le bas — il doit se déplacer dans la liste.
- Vérifier que l'item devient semi-transparent pendant le drag.
- Relâcher — l'item doit se placer à la nouvelle position.

- [ ] **Step 2 : Tester les cas limites**

- Cocher un todo → il perd la poignée et ne peut plus être dragué.
- Essayer de draguer un todo coché → aucun effet.
- Draguer un todo non coché par-dessus un todo coché → le coché reste en place, le non coché change de position.
- Ajouter un todo → il apparaît en bas avec une poignée.
- Supprimer un todo → la liste se remet en ordre sans crash.

- [ ] **Step 3 : Vérifier la persistance**

- Réordonner des todos.
- Recharger la page.
- Vérifier que l'ordre est conservé (sauvegardé via l'API `/api/data/todos`).

- [ ] **Step 4 : Commit**

```bash
git add app/todo/page.tsx
git commit -m "feat(todo): drag-and-drop reordering with dnd-kit"
```
