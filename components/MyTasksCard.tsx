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
    <div className="rounded-[28px] bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              My Tasks
            </h3>
            <span className="text-sm font-semibold text-slate-400 tabular-nums">
              ({formattedCount})
            </span>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer border border-slate-200/60"
            aria-label="Add new task"
            title="Add task"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Task List */}
        <div className="mt-2 divide-y divide-slate-100/80">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
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
                    <span className="text-xs font-semibold text-slate-400 tabular-nums w-5 shrink-0">
                      {task.number}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        onClick={() => onToggleTask(task.id)}
                        className={cn(
                          "text-sm font-medium transition-all duration-200 truncate cursor-pointer select-none",
                          task.completed
                            ? "text-slate-400 line-through decoration-slate-300 decoration-1.5"
                            : "text-slate-800 hover:text-blue-600"
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
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium tabular-nums">
                        <span>{task.commentsCount}</span>
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    )}

                    {/* Subtasks count */}
                    {task.subtasksCount > 0 && !task.completed && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium tabular-nums">
                        <span>{task.subtasksCount}</span>
                        <GitBranch className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                      </div>
                    )}

                    {/* Interactive Checkbox Button matching screenshot */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="relative flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer"
                      aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981] text-white shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 transition-colors group-hover:border-slate-400" />
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
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium">
          {pendingCount} remaining · {tasks.length - pendingCount} done
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors",
              filter === "all" ? "bg-slate-100 text-slate-900 font-bold" : "hover:text-slate-700"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors",
              filter === "pending" ? "bg-slate-100 text-slate-900 font-bold" : "hover:text-slate-700"
            )}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors",
              filter === "completed" ? "bg-slate-100 text-slate-900 font-bold" : "hover:text-slate-700"
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
