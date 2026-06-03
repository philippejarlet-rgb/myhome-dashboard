# Spec — Drag-and-drop reordering pour le module Todo

Date : 2026-06-03  
Statut : approuvé

## Contexte

La page `/todo` affiche une liste de tâches (cochées/non cochées). L'utilisateur veut pouvoir réordonner les todos par glisser-déposer sur tablette tactile.

## Périmètre

- Seuls les **todos non cochés** sont déplaçables.
- Les todos cochés restent à leur position dans la liste mais ne sont pas draggables.
- Un todo non coché peut être déplacé au-dessus ou en dessous d'un todo coché.
- Fichier unique modifié : `app/todo/page.tsx`.

## Librairie choisie

**`@dnd-kit/core` + `@dnd-kit/sortable`**

Raison : touch-first, pas d'opinion sur le style, compatible React/Tailwind, bien maintenu.  
Rejeté : `@hello-pangea/dnd` (support tactile moyen), events custom (complexité inutile).

## Architecture

### Dépendances à installer

```
@dnd-kit/core
@dnd-kit/sortable
```

### Sensors

- `TouchSensor` avec `activationConstraint: { delay: 150, tolerance: 5 }` — évite les faux positifs au scroll.
- `PointerSensor` avec `activationConstraint: { distance: 8 }` — pour souris/stylet.

### Structure des composants

```
<DndContext sensors onDragEnd>
  <SortableContext items strategy=verticalListSortingStrategy>
    {todos.map((todo, i) =>
      <SortableTodoItem key={i} id={String(i)} todo={todo} disabled={todo.checked} />
    )}
  </SortableContext>
</DndContext>
```

Tous les items utilisent `useSortable` — les items cochés passent `disabled: true` pour qu'ils ne soient pas draggables, mais restent dans le calcul de positions du contexte. Sans cela, dnd-kit ne peut pas calculer correctement où déposer un item au-dessus/en dessous d'un item coché.

### Logique de réordonnancement (onDragEnd)

```ts
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  setTodos(prev => {
    const oldIndex = prev.findIndex((_, i) => String(i) === active.id)
    const newIndex = prev.findIndex((_, i) => String(i) === over.id)
    return arrayMove(prev, oldIndex, newIndex)
  })
}
```

Le `useEffect` de sauvegarde existant se déclenche automatiquement sur le changement de `todos`.

## UX & visuel

| Élément | Comportement |
|---|---|
| Poignée | Icône `GripVertical` (lucide-react) à gauche, visible uniquement sur items non cochés |
| Item en cours de drag | Opacité réduite (`opacity-30`) sur l'emplacement original |
| Item flottant | Léger `drop-shadow` pour le distinguer du fond glassmorphism |
| Curseur (desktop) | `cursor-grab` sur la poignée |
| Items cochés | Pas de poignée, `useSortable` disabled |

Le design glassmorphism, les arrondis et les couleurs existants ne sont pas modifiés.

## IDs de tri

Les IDs utilisés pour le `SortableContext` sont les **index stringifiés** (`"0"`, `"1"`, etc.). Simple et sans impact sur la structure de données `Todo`.

## Ce qui ne change pas

- Structure de données `Todo` (`{ text, checked }`)
- API `/api/data/todos` et logique de persistence
- Design visuel global
- Fonctionnalités ajouter / cocher / supprimer / partager
