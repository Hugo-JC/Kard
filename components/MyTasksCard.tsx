"use client"

import React, { useState } from "react"
import { Plus, MessageSquare, GitBranch, Check, Trash2 } from "lucide-react"
import { TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"

interface MyTasksCardProps {
  tasks: TaskItem[]
  onToggleTask: (id: string) => void
  onOpenNewTaskModal: () => void
  onDeleteTask?: (id: string) => void
}

export function MyTasksCard({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
  onDeleteTask,
}: MyTasksCardProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")

  const pendingCount = tasks.filter((t) => !t.completed).length

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  // Format pending count with leading zero e.g. (05)
  const formattedCount = String(pendingCount).padStart(2, "0")

  return (
    <div className="rounded-[28px] bg-card p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] border border-border/80 text-card-foreground flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-card-foreground tracking-tight">
              My Tasks
            </h3>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">
              ({formattedCount})
            </span>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary-subtle hover:text-primary transition-colors cursor-pointer border border-border/60"
            aria-label="Add new task"
            title="Add task"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Task List */}
        <div className="mt-2 divide-y divide-border/70">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No tasks found in this view.
            </div>
          ) : (
            filteredTasks.map((task) => {
              return (
                <div
                  key={task.id}
                  className="group flex items-center justify-between py-3.5 transition-colors"
                >
                  {/* Left: Number and Title */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <span className="text-xs font-semibold text-muted-foreground/80 tabular-nums w-5 shrink-0">
                      {task.number}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        onClick={() => onToggleTask(task.id)}
                        className={cn(
                          "text-sm font-medium transition-all duration-200 truncate cursor-pointer select-none",
                          task.completed
                            ? "text-muted-foreground line-through decoration-slate-400/50 decoration-1.5"
                            : "text-card-foreground hover:text-primary"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                  </div>

                  {/* Right: Comments, subtasks, and Checkbox */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Comments count */}
                    {task.commentsCount > 0 && !task.completed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium tabular-nums">
                        <span>{task.commentsCount}</span>
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Subtasks count */}
                    {task.subtasksCount > 0 && !task.completed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium tabular-nums">
                        <span>{task.subtasksCount}</span>
                        <GitBranch className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
                      </div>
                    )}

                    {/* Interactive Checkbox Button matching screenshot */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="relative flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer"
                      aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary-subtle/50 transition-colors group-hover:border-slate-400 dark:group-hover:border-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Subtle filter buttons footer */}
      <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-medium">
          {pendingCount} remaining · {tasks.length - pendingCount} done
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer",
              filter === "all" ? "bg-muted text-card-foreground font-bold" : "hover:text-card-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer",
              filter === "pending" ? "bg-muted text-card-foreground font-bold" : "hover:text-card-foreground"
            )}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer",
              filter === "completed" ? "bg-muted text-card-foreground font-bold" : "hover:text-card-foreground"
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
