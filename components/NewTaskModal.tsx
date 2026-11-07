"use client"

import React, { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskItem } from "@/lib/data"

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Omit<TaskItem, "id" | "number">) => void
}

export function NewTaskModal({ open, onOpenChange, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState("")
  const [project, setProject] = useState("Google")
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
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="Google">Google</option>
              <option value="Slack">Slack</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskItem["priority"])}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Category Tag
            </label>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. IOS APP, UI/UX"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Due Date
            </label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. 25 June"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0D6EFD] hover:bg-blue-700 text-white font-semibold">
            Create Task
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
