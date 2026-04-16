# Task Status Collapsible UX Notes

This document explains exactly what was changed in `app/project/[id]/page.tsx` and why, so you can reuse the same pattern in other components.

## Goals We Implemented

1. Close the status `Collapsible` right after selecting a new status.
2. Move the task immediately to its new position (based on status ordering).
3. Scroll to the updated task card after it moves.
4. Temporarily highlight the updated card with a status color at 70% opacity.

## 1) Make the `Collapsible` controlled

### Why
By default, each `Collapsible` manages its own open state. To force it to close after an update, we need to control the open state from React.

### What we added

- State:
  - `openTaskId: string | null`
- Logic:
  - A task card is open only when `openTaskId === task.id`.
  - On open/close toggle, set `openTaskId` to the current task id or `null`.
  - On status click, set `openTaskId(null)` to close it.

### Core pattern

```tsx
const [openTaskId, setOpenTaskId] = useState<string | null>(null);

<Collapsible
  open={openTaskId === task.id}
  onOpenChange={(isOpen) => setOpenTaskId(isOpen ? task.id : null)}
>
```

Then inside the status update handler:

```tsx
setOpenTaskId(null);
```

## 2) Reorder immediately with optimistic status state

### Why
If you only wait for database response, the item feels delayed. Optimistic UI updates give immediate visual feedback and make the card move right away.

### What we added

- Local optimistic state:
  - `localStatusByTaskId: Record<string, string>`
- On update click:
  - Save previous status for rollback.
  - Set optimistic status in local state immediately.
  - If DB call fails, rollback to previous status.

### Core pattern

```tsx
const [localStatusByTaskId, setLocalStatusByTaskId] =
  useState<Record<string, string>>({});

const previousStatus =
  localStatusByTaskId[taskId] ||
  projectTasks?.find((task) => task.id === taskId)?.status ||
  "pending";

setLocalStatusByTaskId((prev) => ({ ...prev, [taskId]: newStatus }));

const { error } = await supabase
  .from("project_tasks")
  .update({ status: newStatus })
  .eq("id", taskId);

if (error) {
  setLocalStatusByTaskId((prev) => ({ ...prev, [taskId]: previousStatus }));
}
```

## 3) Use one combined sort (status first, time second)

### Why
Two separate `.sort()` calls can be confusing and can unintentionally override ordering logic. A single comparator is clearer and more reliable.

### What we changed

- Sort by status rank first.
- If equal status, sort by `created_at`.
- Use optimistic status (`localStatusByTaskId`) during sorting.
- Handle nullable `created_at` safely.

### Core pattern

```tsx
const statusOrder: { [key: string]: number } = {
  in_progress: 1,
  pending: 2,
  completed: 3,
  cancelled: 4,
};

.sort((a, b) => {
  const aStatus = localStatusByTaskId[a.id] || a.status;
  const bStatus = localStatusByTaskId[b.id] || b.status;

  const statusDiff = (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99);
  if (statusDiff !== 0) return statusDiff;

  const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0;
  const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0;
  return aCreatedAt - bCreatedAt;
});
```

## 4) Scroll to the updated card after reorder

### Why
Once the list reorders, users can lose track of the changed item. Auto-scroll keeps context and confirms the action.

### What we added

- Card `id`: `task-card-${task.id}`
- After optimistic update and re-render, call `scrollIntoView`.
- Used double `requestAnimationFrame` so the DOM has time to reorder before scrolling.

### Core pattern

```tsx
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const updatedTaskCard = document.getElementById(`task-card-${taskId}`);
    updatedTaskCard?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
```

## 5) Highlight updated card temporarily with status color

### Why
A quick visual flash confirms success instantly.

### What we added

- State:
  - `highlightedTaskId: string | null`
  - `highlightedTaskStatus: string | null`
- Timeout ref to clear highlight after 1500 ms.
- Cleanup effect on unmount to avoid timer leaks.
- Conditional card background classes:
  - pending -> `bg-yellow-600/70`
  - in_progress -> `bg-blue-600/70`
  - completed -> `bg-green-600/70`
  - cancelled -> `bg-red-600/70`

### Core pattern

```tsx
const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
const [highlightedTaskStatus, setHighlightedTaskStatus] = useState<string | null>(null);
const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

if (highlightTimeoutRef.current) {
  clearTimeout(highlightTimeoutRef.current);
}

setHighlightedTaskId(taskId);
setHighlightedTaskStatus(newStatus);

highlightTimeoutRef.current = setTimeout(() => {
  setHighlightedTaskId(null);
  setHighlightedTaskStatus(null);
}, 1500);
```

And on the card:

```tsx
<Card
  id={`task-card-${task.id}`}
  className={`transition-colors duration-500 ${
    highlightedTaskId === task.id
      ? highlightedTaskStatus === "pending"
        ? "bg-yellow-600/70"
        : highlightedTaskStatus === "in_progress"
          ? "bg-blue-600/70"
          : highlightedTaskStatus === "completed"
            ? "bg-green-600/70"
            : highlightedTaskStatus === "cancelled"
              ? "bg-red-600/70"
              : ""
      : ""
  }`}
>
```

## 6) Better status label formatting

### Why
`in_progress` should display as `In Progress` for users.

### What we changed

Converted snake_case status values to Title Case words before rendering in the button.

## Final Result

After these changes:

- Selecting a status closes the dropdown immediately.
- The task moves instantly to the correct section/order.
- The viewport smoothly scrolls to the moved card.
- The card gets a temporary status-colored highlight so users can confirm the update.

## Reusable Checklist

Use this checklist for similar UI interactions:

- [ ] Use controlled state for open/closed UI elements.
- [ ] Apply optimistic updates for immediate feedback.
- [ ] Keep rollback path for failed API requests.
- [ ] Use one explicit comparator for stable sort intent.
- [ ] Scroll to updated element after re-render.
- [ ] Add temporary highlight to confirm change.
- [ ] Cleanup timers in `useEffect` return.
