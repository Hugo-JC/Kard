"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Check,
  Clock,
  Flag,
  MessageSquare,
  GitBranch,
  Trash2,
} from "lucide-react"
import { TaskItem, Member } from "@/lib/data"
import { MemberAvatarWithStatus } from "@/components/ui/MemberStatusBadge"
import { Badge } from "@/components/ui/badge"
import { ProjectLogoIcon } from "@/components/Logos"
import { cn } from "@/lib/utils"

interface TaskBucketCardProps {
  task: TaskItem
  onToggleTask: (id: string) => void
  onDeleteTask?: (id: string) => void
  onUpdateAssignee?: (taskId: string, assignee: Member) => void
  availableAssignees?: Member[]
  isOverlay?: boolean
}

export function TaskBucketCard({
  task,
  onToggleTask,
  onDeleteTask,
  onUpdateAssignee,
  availableAssignees = [],
  isOverlay = false,
}: TaskBucketCardProps) {
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
        "group relative flex flex-col gap-2.5 rounded-2xl border bg-card p-3.5 transition-all text-xs select-none",
        isDragging
          ? "opacity-25 border-dashed border-primary shadow-inner scale-[0.98]"
          : "border-border/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:border-primary/40 hover:shadow-xs",
        isOverlay &&
          "shadow-2xl border-primary ring-2 ring-primary/25 scale-105 rotate-1 bg-card/95 backdrop-blur-md cursor-grabbing z-50"
      )}
    >
      {/* Top row: Number, priority badge, and Grip Handle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Grip handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag task"
            className="p-1 -ml-1 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing rounded-md hover:bg-muted/60 transition-colors touch-none"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          <span className="font-semibold text-muted-foreground/70 tabular-nums text-[11px]">
            #{task.number}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge
            variant={
              task.priority === "High"
                ? "destructive"
                : task.priority === "Medium"
                ? "warning"
                : "info"
            }
            className="text-[9px] font-bold px-1.5 py-0.2 uppercase tracking-wider rounded-md"
          >
            {task.priority}
          </Badge>

          {onDeleteTask && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTask(task.id)
              }}
              aria-label="Delete task"
              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-danger rounded-md transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Title with Checkbox */}
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleTask(task.id)
          }}
          className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          ) : (
            <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary-subtle/50 transition-colors" />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "font-semibold text-sm leading-snug break-words transition-all",
              task.completed
                ? "text-muted-foreground line-through decoration-slate-400/50"
                : "text-card-foreground"
            )}
          >
            {task.title}
          </p>

          {/* Project Highlight: Logo + Name only */}
          {task.project && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 border border-border/50 text-[10px] font-semibold text-muted-foreground">
              <ProjectLogoIcon project={task.project} className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px]">{task.project}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags if any */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted/70 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom info bar: Due Date, Counters & Assignee */}
      <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px]">
              <Clock className="w-3 h-3 text-muted-foreground/70" />
              {task.dueDate}
            </span>
          )}

          {task.commentsCount > 0 && (
            <span className="inline-flex items-center gap-0.5 tabular-nums">
              <MessageSquare className="w-3 h-3 text-muted-foreground/70" />
              {task.commentsCount}
            </span>
          )}

          {task.subtasksCount > 0 && (
            <span className="inline-flex items-center gap-0.5 tabular-nums">
              <GitBranch className="w-3 h-3 text-muted-foreground/70 rotate-90" />
              {task.subtasksCount}
            </span>
          )}
        </div>

        {/* Assignee Avatar with Live Status */}
        {task.assignee ? (
          <div
            title={`Assigned to ${task.assignee.name} (${task.assignee.status || "Offline"})`}
            className="flex items-center"
          >
            <MemberAvatarWithStatus
              avatar={task.assignee.avatar}
              name={task.assignee.name}
              status={task.assignee.status || "Offline"}
              size="sm"
              className="w-5 h-5 text-[9px]"
            />
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
            className="text-[10px] bg-muted/60 border border-border rounded px-1.5 py-0.5 text-muted-foreground"
          >
            <option value="">+ Assign</option>
            {availableAssignees.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  )
}
