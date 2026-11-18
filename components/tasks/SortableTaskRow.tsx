"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Clock,
  Trash2,
} from "lucide-react"
import { TaskItem, Member, TaskStage, TASK_STAGES } from "@/lib/data"
import { MemberAvatarWithStatus } from "@/components/ui/MemberStatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskCheckButton } from "@/components/ui/TaskCheckButton"
import { ProjectLogoIcon } from "@/components/Logos"
import { cn } from "@/lib/utils"

interface SortableTaskRowProps {
  task: TaskItem
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
  onDeleteTask?: (id: string) => void
  onUpdateAssignee?: (taskId: string, assignee: Member) => void
  onUpdateStage?: (taskId: string, stage: TaskStage) => void
  availableAssignees?: Member[]
  isOverlay?: boolean
}

export function SortableTaskRow({
  task,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onUpdateAssignee,
  onUpdateStage,
  availableAssignees = [],
  isOverlay = false,
}: SortableTaskRowProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border bg-card p-3 transition-all text-xs sm:flex-nowrap sm:gap-3 sm:p-3.5 sm:text-sm select-none",
        isDragging
          ? "opacity-30 border-dashed border-primary/50 shadow-inner"
          : "border-border/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:border-primary/40 hover:shadow-xs",
        isOverlay && "shadow-2xl border-primary ring-2 ring-primary/20 scale-[1.01] bg-card/95 backdrop-blur-md cursor-grabbing"
      )}
    >
      {/* Left: Drag Handle, Checkbox, Number & Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:gap-2.5">
        {/* Grip Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar tarefa"
          className="p-1 -ml-1 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing rounded-lg hover:bg-muted/60 transition-colors touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Organic Check Button */}
        <TaskCheckButton
          checked={task.completed}
          onToggle={(e) => {
            e.stopPropagation()
            onToggleTask(task.id)
          }}
          ariaLabel={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        />

        {/* Task Number */}
        <span className="text-xs font-mono font-semibold text-muted-foreground/70 tabular-nums shrink-0 w-5">
          {task.number}
        </span>

        {/* Task Title & Unboxed Project/Tags */}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectTask?.(task)
            }}
            className={cn(
              "text-left font-semibold truncate transition-colors cursor-pointer hover:text-primary block max-w-full",
              task.completed
                ? "text-muted-foreground line-through decoration-slate-400/50"
                : "text-card-foreground"
            )}
          >
            {task.title}
          </button>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
            {task.project && (
              <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                <ProjectLogoIcon project={task.project} className="w-3.5 h-3.5 shrink-0" />
                <span>{task.project}</span>
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                <span aria-hidden="true">·</span>
                <Clock className="w-3 h-3 text-muted-foreground" />
                {task.dueDate}
              </span>
            )}
            {task.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/85">
                <span aria-hidden="true">·</span>
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Controls: Stage Selector, Assignee, Priority, Delete */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Stage quick toggle */}
        {onUpdateStage && (
          <select
            value={task.stage || "TODO"}
            onChange={(e) => onUpdateStage(task.id, e.target.value as TaskStage)}
            className="hidden sm:inline-block text-[11px] font-semibold bg-muted/50 border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            onClick={(e) => e.stopPropagation()}
            aria-label="Change task workflow stage"
          >
            {TASK_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        )}

        {/* Assignee display / selector */}
        {task.assignee ? (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-muted/40 border border-border/60"
            title={`Assigned to ${task.assignee.name} (${task.assignee.status || "Offline"})`}
          >
            <MemberAvatarWithStatus
              avatar={task.assignee.avatar}
              name={task.assignee.name}
              status={task.assignee.status || "Offline"}
              size="sm"
              className="w-5 h-5 text-[9px]"
            />
            <span className="hidden md:inline text-xs font-medium text-card-foreground max-w-[80px] truncate">
              {task.assignee.name.split(" ")[0]}
            </span>
          </div>
        ) : availableAssignees.length > 0 && onUpdateAssignee ? (
          <select
            value=""
            onChange={(e) => {
              const selected = availableAssignees.find((m) => m.name === e.target.value)
              if (selected) onUpdateAssignee(task.id, selected)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Assign contributor"
            className="text-[11px] font-semibold bg-muted/50 border border-border rounded-lg px-2 py-1 text-muted-foreground cursor-pointer"
          >
            <option value="">Assign...</option>
            {availableAssignees.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        ) : null}

        {/* Priority Badge */}
        <Badge
          variant={
            task.priority === "High"
              ? "destructive"
              : task.priority === "Medium"
              ? "warning"
              : "info"
          }
          className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-md"
        >
          {task.priority}
        </Badge>

        {/* Delete */}
        {onDeleteTask && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteTask(task.id)
            }}
            aria-label="Excluir tarefa"
            className="size-8 opacity-75 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-danger hover:bg-danger-subtle rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
