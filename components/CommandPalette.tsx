"use client"

import React, { useEffect, useState } from "react"
import { Search, FolderKanban, CheckSquare2, Calendar, Clock, ArrowRight } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { NavItemKey } from "./Sidebar"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAction: (key: NavItemKey) => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectAction,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("")

  const actions: { id: NavItemKey; title: string; category: string; icon: React.ElementType }[] = [
    { id: "dashboard", title: "Open Dashboard View", category: "Navigation", icon: FolderKanban },
    { id: "projects", title: "View All Projects (Google, Slack)", category: "Projects", icon: FolderKanban },
    { id: "my-tasks", title: "Check My Tasks & Backlog", category: "Tasks", icon: CheckSquare2 },
    { id: "calendar", title: "Calendar & Milestone Deadlines", category: "Schedule", icon: Calendar },
    { id: "time-manage", title: "Time Tracker & Stopwatch", category: "Productivity", icon: Clock },
  ]

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl p-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search..."
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          autoFocus
        />
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          ESC
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No matching actions found.
          </div>
        ) : (
          filtered.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAction(item.id)
                  onOpenChange(false)
                }}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.category}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            )
          })
        )}
      </div>
    </Dialog>
  )
}
