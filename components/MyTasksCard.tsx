"use client"

import React, { useState, useSyncExternalStore } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Plus,
  MessageSquare,
  GitBranch,
  Check,
  GripVertical,
} from "lucide-react"
import { TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProjectLogoIcon } from "@/components/Logos"

interface MyTasksCardProps {
  tasks: TaskItem[]
  onToggleTask: (id: string) => void
  onOpenNewTaskModal: () => void
  onDeleteTask?: (id: string) => void
  onReorderTasks?: (tasks: TaskItem[]) => void
  onSelectTask?: (task: TaskItem) => void
}

function SortableDashboardTaskRow({
  task,
  displayIndex,
  onToggleTask,
  onSelectTask,
  isOverlay = false,
}: {
  task: TaskItem
  displayIndex: number
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
  isOverlay?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formattedNumber = String(displayIndex + 1).padStart(2, "0")

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between py-3 px-3 rounded-2xl transition-all duration-150 select-none border border-transparent",
        isDragging
          ? "opacity-30 bg-muted/50 border-dashed border-border"
          : "hover:bg-muted/40 hover:border-border/40",
        isOverlay &&
          "bg-card shadow-2xl border-border rounded-2xl px-4 cursor-grabbing scale-[1.02] z-50 ring-1 ring-primary/20"
      )}
    >
      {/* Left: Grip Handle, Dynamic Ordered Number, Title & Project Pill */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {/* Grip Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Arraste para reordenar tarefa ${task.title}`}
          className="p-1 -ml-1 text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing rounded hover:bg-muted transition-colors touch-none shrink-0"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Dynamic Ordered Number (auto-updates when reordered) */}
        <span className="text-xs font-mono font-bold text-muted-foreground/80 tabular-nums w-5 shrink-0">
          {formattedNumber}
        </span>

        {/* Task Title & Project Branding */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => (onSelectTask ? onSelectTask(task) : onToggleTask(task.id))}
            className={cn(
              "text-left text-sm font-semibold transition-all duration-200 cursor-pointer truncate max-w-[200px] sm:max-w-[260px]",
              task.completed
                ? "text-muted-foreground line-through decoration-slate-400/50 decoration-1.5"
                : "text-card-foreground hover:text-primary"
            )}
          >
            {task.title}
          </button>

          {/* Project Highlight: Logo + Name only */}
          {task.project && (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
              <ProjectLogoIcon project={task.project} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[100px]">{task.project}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Comments, subtasks, and Checkbox */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Comments count */}
        {task.commentsCount > 0 && !task.completed && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-medium tabular-nums">
            <span>{task.commentsCount}</span>
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}

        {/* Subtasks count */}
        {task.subtasksCount > 0 && !task.completed && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-medium tabular-nums">
            <span>{task.subtasksCount}</span>
            <GitBranch className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
          </div>
        )}

        {/* Interactive Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          className="relative flex size-8 items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer"
          aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        >
          {task.completed ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary-subtle/50 transition-colors group-hover:border-slate-400 dark:group-hover:border-slate-500" />
          )}
        </button>
      </div>
    </div>
  )
}

function StaticDashboardTaskRow({
  task,
  displayIndex,
  onToggleTask,
  onSelectTask,
}: {
  task: TaskItem
  displayIndex: number
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
}) {
  const formattedNumber = String(displayIndex + 1).padStart(2, "0")

  return (
    <div className="flex items-center justify-between py-3 px-3 rounded-2xl select-none hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <span className="p-1 -ml-1 text-muted-foreground/30">
          <GripVertical className="w-3.5 h-3.5" />
        </span>
        <span className="text-xs font-mono font-bold text-muted-foreground/80 tabular-nums w-5 shrink-0">
          {formattedNumber}
        </span>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => (onSelectTask ? onSelectTask(task) : onToggleTask(task.id))}
            className={cn(
              "text-left text-sm font-semibold transition-all duration-200 cursor-pointer truncate max-w-[200px] sm:max-w-[260px]",
              task.completed
                ? "text-muted-foreground line-through decoration-slate-400/50 decoration-1.5"
                : "text-card-foreground hover:text-primary"
            )}
          >
            {task.title}
          </button>
          {task.project && (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
              <ProjectLogoIcon project={task.project} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[100px]">{task.project}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          className="relative flex size-8 items-center justify-center rounded-full cursor-pointer"
        >
          {task.completed ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600" />
          )}
        </button>
      </div>
    </div>
  )
}

export function MyTasksCard({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
  onDeleteTask,
  onReorderTasks,
  onSelectTask,
}: MyTasksCardProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const pendingCount = tasks.filter((t) => !t.completed).length

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  // Format pending count with leading zero e.g. (05)
  const formattedCount = String(pendingCount).padStart(2, "0")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      // Reorder array AND auto-update number property so #1 dragged to #3 becomes #3!
      const moved = arrayMove(tasks, oldIndex, newIndex)
      const reindexed = moved.map((t, idx) => ({
        ...t,
        number: String(idx + 1).padStart(2, "0"),
      }))
      onReorderTasks?.(reindexed)
    }
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId)
  const activeTaskIndex = activeTask
    ? filteredTasks.findIndex((t) => t.id === activeTask.id)
    : 0

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6">
      {/* Header with Title, Count, and shadcn Button */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-card-foreground tracking-tight">
              My Tasks
            </h3>
            <span className="text-xs font-mono font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border/60 tabular-nums">
              {formattedCount}
            </span>
          </div>

          <Button
            onClick={onOpenNewTaskModal}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
            aria-label="Adicionar nova tarefa"
            title="Criar tarefa"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>

        {/* Task List with Drag & Drop or Static SSR fallback */}
        {!isMounted ? (
          <div className="mt-3 space-y-1">
            {filteredTasks.map((task, idx) => (
              <StaticDashboardTaskRow
                key={task.id}
                task={task}
                displayIndex={idx}
                onToggleTask={onToggleTask}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        ) : (
          <DndContext
            id="my-tasks-dnd"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="mt-3 space-y-1">
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Nenhuma tarefa encontrada neste filtro.
                </div>
              ) : (
                <SortableContext
                  items={filteredTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTasks.map((task, idx) => (
                    <SortableDashboardTaskRow
                      key={task.id}
                      task={task}
                      displayIndex={idx}
                      onToggleTask={onToggleTask}
                      onSelectTask={onSelectTask}
                    />
                  ))}
                </SortableContext>
              )}
            </div>

            <DragOverlay>
              {activeTask ? (
                <SortableDashboardTaskRow
                  task={activeTask}
                  displayIndex={activeTaskIndex}
                  onToggleTask={() => {}}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Filter tabs footer using shadcn Button components */}
      <div className="mt-5 flex flex-col items-start justify-between gap-3 border-t border-border/80 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span className="font-medium text-xs">
          <strong className="text-foreground">{pendingCount}</strong> pendentes ·{" "}
          <strong className="text-foreground">{tasks.length - pendingCount}</strong> concluídas
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-7 px-2.5 text-xs font-semibold rounded-lg"
          >
            Todas
          </Button>
          <Button
            type="button"
            variant={filter === "pending" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("pending")}
            className="h-7 px-2.5 text-xs font-semibold rounded-lg"
          >
            Ativas
          </Button>
          <Button
            type="button"
            variant={filter === "completed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("completed")}
            className="h-7 px-2.5 text-xs font-semibold rounded-lg"
          >
            Concluídas
          </Button>
        </div>
      </div>
    </div>
  )
}
