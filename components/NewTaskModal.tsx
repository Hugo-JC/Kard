"use client"

import React, { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskItem, Project } from "@/lib/data"

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Omit<TaskItem, "id" | "number">) => void
  projects?: Project[]
}

export function NewTaskModal({
  open,
  onOpenChange,
  onAddTask,
  projects = [],
}: NewTaskModalProps) {
  const activeProjectNames = projects
    .filter((p) => !p.isArchived)
    .map((p) => p.name)
  const projectOptions =
    activeProjectNames.length > 0
      ? activeProjectNames
      : ["Google", "Slack", "Spotify Mobile", "Linear Sync"]

  const [title, setTitle] = useState("")
  const [project, setProject] = useState(projectOptions[0] || "Google")
  const [priority, setPriority] = useState<TaskItem["priority"]>("Medium")
  const [tag, setTag] = useState("UI/UX")
  const [dueDate, setDueDate] = useState("28 June")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAddTask({
      title: title.trim(),
      project,
      priority,
      commentsCount: 0,
      subtasksCount: 0,
      completed: false,
      tags: [tag],
      dueDate,
    })

    setTitle("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Task"
      description="Add a task to your Kard productivity sprint."
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div>
          <label className="text-xs font-bold text-card-foreground block mb-1.5">
            Task Name
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design Dark Mode UI or Review PR"
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/60 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {projectOptions.map((projName) => (
                <option key={projName} value={projName} className="bg-card text-card-foreground">
                  {projName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskItem["priority"])}
              className="h-11 w-full rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/60 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="High" className="bg-card text-card-foreground">High Priority</option>
              <option value="Medium" className="bg-card text-card-foreground">Medium Priority</option>
              <option value="Low" className="bg-card text-card-foreground">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Category Tag
            </label>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. IOS APP, UI/UX"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Due Date
            </label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. 25 June"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-blue-700 text-primary-foreground font-semibold">
            Create Task
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
