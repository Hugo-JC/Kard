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
  GripVertical,
} from "lucide-react"
import { TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TaskCheckButton } from "@/components/ui/TaskCheckButton"
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
    data: {
      type: "task",
      task,
    },
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
        "group flex items-center justify-between gap-2.5 rounded-2xl border border-transparent px-2.5 py-2.5 transition-[background-color,border-color,box-shadow] duration-150 select-none sm:px-3 sm:py-3",
        isDragging
          ? "opacity-30 bg-muted/50 border-dashed border-border"
          : "hover:bg-muted/45 hover:border-border/40",
        isOverlay &&
          "bg-card shadow-xl border-border rounded-2xl px-3.5 cursor-grabbing scale-[1.01] z-50 ring-1 ring-primary/20"
      )}
    >
      {/* Left: Grip Handle, Dynamic Ordered Number, Title & Project Branding */}
      <div className="flex min-w-0 flex-1 items-start gap-2 @md:items-center sm:gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Arraste para reordenar tarefa ${task.title}`}
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/35 transition-colors hover:bg-muted hover:text-muted-foreground group-hover:text-muted-foreground/75 cursor-grab active:cursor-grabbing touch-none @md:mt-0"
        >
          <GripVertical className="size-3.5" />
        </button>

        <span className="mt-1 w-5 shrink-0 font-mono text-xs font-semibold tabular-nums text-muted-foreground/70 @md:mt-0">
          {formattedNumber}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1 @md:flex-row @md:items-center @md:justify-between @md:gap-3">
          <button
            type="button"
            onClick={() => (onSelectTask ? onSelectTask(task) : onToggleTask(task.id))}
            className={cn(
              "min-w-0 flex-1 text-left text-[13px] font-semibold leading-snug transition-colors duration-150 cursor-pointer line-clamp-2 @md:line-clamp-1 sm:text-sm",
              task.completed
                ? "text-muted-foreground line-through decoration-slate-400/50"
                : "text-card-foreground hover:text-primary"
            )}
          >
            {task.title}
          </button>

          {/* Project Highlight: Logo + Name only, plus subtle mobile metadata */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground shrink-0">
            {task.project && (
              <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                <ProjectLogoIcon project={task.project} className="size-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{task.project}</span>
              </span>
            )}

            {task.commentsCount > 0 && !task.completed && (
              <span className="inline-flex items-center gap-1 font-medium tabular-nums @sm:hidden">
                <span aria-hidden="true">·</span>
                <MessageSquare className="size-3" />
                <span>{task.commentsCount}</span>
              </span>
            )}

            {task.subtasksCount > 0 && !task.completed && (
              <span className="inline-flex items-center gap-1 font-medium tabular-nums @sm:hidden">
                <span aria-hidden="true">·</span>
                <GitBranch className="size-3 rotate-90" />
                <span>{task.subtasksCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Counts (desktop/tablet) & Organic Check Button */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {task.commentsCount > 0 && !task.completed && (
          <div className="hidden @sm:flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
            <span>{task.commentsCount}</span>
            <MessageSquare className="size-3.5" />
          </div>
        )}

        {task.subtasksCount > 0 && !task.completed && (
          <div className="hidden @sm:flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
            <span>{task.subtasksCount}</span>
            <GitBranch className="size-3.5 rotate-90" />
          </div>
        )}

        <TaskCheckButton
          checked={task.completed}
          onToggle={() => onToggleTask(task.id)}
          ariaLabel={
            task.completed
              ? `Marcar "${task.title}" como pendente`
              : `Marcar "${task.title}" como concluída`
          }
        />
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
    <div className="flex items-center justify-between gap-2.5 rounded-2xl px-2.5 py-2.5 select-none transition-colors hover:bg-muted/45 sm:px-3 sm:py-3">
      <div className="flex min-w-0 flex-1 items-start gap-2 @md:items-center sm:gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center text-muted-foreground/35 @md:mt-0">
          <GripVertical className="size-3.5" />
        </span>
        <span className="mt-1 w-5 shrink-0 font-mono text-xs font-semibold tabular-nums text-muted-foreground/70 @md:mt-0">
          {formattedNumber}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 @md:flex-row @md:items-center @md:justify-between @md:gap-3">
          <button
            type="button"
            onClick={() => (onSelectTask ? onSelectTask(task) : onToggleTask(task.id))}
            className={cn(
              "min-w-0 flex-1 text-left text-[13px] font-semibold leading-snug transition-colors duration-150 cursor-pointer line-clamp-2 @md:line-clamp-1 sm:text-sm",
              task.completed
                ? "text-muted-foreground line-through decoration-slate-400/50"
                : "text-card-foreground hover:text-primary"
            )}
          >
            {task.title}
          </button>
          {task.project && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground shrink-0">
              <ProjectLogoIcon project={task.project} className="size-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{task.project}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <TaskCheckButton
          checked={task.completed}
          onToggle={() => onToggleTask(task.id)}
          ariaLabel={
            task.completed
              ? `Marcar "${task.title}" como pendente`
              : `Marcar "${task.title}" como concluída`
          }
        />
      </div>
    </div>
  )
}

export function MyTasksCard({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
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
    <section
      aria-label="Minhas tarefas"
      className="@container flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6"
    >
      <div>
        {/* Header with Title, Editorial Count, and shadcn Button */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <h3 className="text-base font-bold tracking-tight text-card-foreground">
              My Tasks
            </h3>
            <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground truncate">
              · {formattedCount} ativas
            </span>
          </div>

          <Button
            type="button"
            onClick={onOpenNewTaskModal}
            variant="outline"
            size="sm"
            className="h-9 sm:h-8 shrink-0 gap-1.5 rounded-xl px-3 text-xs font-semibold"
            aria-label="Adicionar nova tarefa"
          >
            <Plus className="size-3.5 stroke-[2.25]" />
            <span>Nova tarefa</span>
          </Button>
        </div>

        {/* Task List with Drag & Drop or Static SSR fallback */}
        {!isMounted ? (
          <div className="mt-2.5 space-y-1">
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
            <div className="mt-2.5 space-y-1">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-xs text-muted-foreground">
                    Nenhuma tarefa encontrada neste filtro.
                  </p>
                  {filter !== "all" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="h-8 rounded-lg text-xs font-semibold text-primary"
                    >
                      Ver todas as tarefas
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenNewTaskModal}
                      className="h-8 rounded-xl text-xs font-semibold"
                    >
                      Criar primeira tarefa
                    </Button>
                  )}
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

      {/* Responsive Segmented Filter Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground @sm:flex-row @sm:items-center @sm:justify-between">
        <span className="font-medium tabular-nums">
          <strong className="text-foreground">{pendingCount}</strong> pendentes ·{" "}
          <strong className="text-foreground">{tasks.length - pendingCount}</strong>{" "}
          concluídas
        </span>

        <div
          role="tablist"
          aria-label="Filtrar tarefas"
          className="inline-flex w-full items-center gap-0.5 rounded-xl border border-border/50 bg-muted/60 p-1 @sm:w-auto"
        >
          {(
            [
              { id: "all", label: "Todas" },
              { id: "pending", label: "Ativas" },
              { id: "completed", label: "Concluídas" },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.id
            return (
              <Button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "h-8 flex-1 rounded-lg px-2.5 text-xs @sm:h-7 @sm:flex-initial",
                  isActive
                    ? "bg-card text-foreground font-semibold shadow-2xs hover:bg-card"
                    : "text-muted-foreground font-medium hover:text-foreground hover:bg-transparent"
                )}
              >
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
