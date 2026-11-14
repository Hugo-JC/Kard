"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  DollarSign,
  Paperclip,
  Users,
  Plus,
  ExternalLink,
  Clock,
  ArrowRight
} from "lucide-react"
import { Project, TaskItem } from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectDetailsDrawerProps {
  project: Project | null
  open: boolean
  onClose: () => void
  onToggleStar: (id: string) => void
  onUpdateStatus: (id: string, newStatus: Project["status"]) => void
  tasks: TaskItem[]
  onToggleTask: (id: string) => void
  onAddTaskToProject: (taskTitle: string, projectId: string) => void
}

export function ProjectDetailsDrawer({
  project,
  open,
  onClose,
  onToggleStar,
  onUpdateStatus,
  tasks,
  onToggleTask,
  onAddTaskToProject,
}: ProjectDetailsDrawerProps) {
  const [newTaskInput, setNewTaskInput] = useState("")

  if (!project) return null

  const projectTasks = tasks.filter(
    (t) => t.project.toLowerCase() === project.name.toLowerCase()
  )

  const percent =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskInput.trim()) return
    onAddTaskToProject(newTaskInput.trim(), project.name)
    setNewTaskInput("")
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden text-card-foreground"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 dark:bg-slate-900 border border-border/70">
                  {project.logo === "google" && <GoogleLogo className="w-7 h-7" />}
                  {project.logo === "slack" && <SlackLogo className="w-7 h-7" />}
                  {project.logo === "spotify" && <SpotifyLogo className="w-7 h-7" />}
                  {project.logo === "linear" && <LinearLogo className="w-7 h-7" />}
                  {project.logo === "custom" && (
                    <span className="text-base font-extrabold text-primary">
                      {project.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-card-foreground">
                      {project.name}
                    </h2>
                    <button
                      onClick={() => onToggleStar(project.id)}
                      className="p-1 rounded-md text-muted-foreground hover:text-amber-400 transition-colors cursor-pointer"
                      title="Star project"
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          project.isStarred
                            ? "fill-[#F59E0B] text-[#F59E0B]"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {project.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tags and Status row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase",
                      project.status === "COMPLETED"
                        ? "bg-success-subtle text-success-foreground dark:bg-emerald-950/40 dark:text-emerald-300"
                        : project.status === "IN PROGRESS"
                        ? "bg-primary-subtle text-primary dark:bg-blue-950/40 dark:text-blue-300"
                        : project.status === "ON HOLD"
                        ? "bg-warning-subtle text-warning-foreground dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {project.status}
                  </span>

                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase",
                      project.priority === "HIGH PRIORITY"
                        ? "border-red-400/40 text-red-500 bg-red-50/20 dark:bg-red-950/30 dark:text-red-400"
                        : project.priority === "MEDIUM PRIORITY"
                        ? "border-emerald-500/40 text-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "border-slate-300 dark:border-slate-700 text-muted-foreground bg-muted/30"
                    )}
                  >
                    {project.priority}
                  </span>

                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-muted/70 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quick Status Dropdown / Action */}
                <select
                  value={project.status}
                  onChange={(e) =>
                    onUpdateStatus(project.id, e.target.value as Project["status"])
                  }
                  className="rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="IN PROGRESS" className="bg-card">Set In Progress</option>
                  <option value="COMPLETED" className="bg-card">Set Completed</option>
                  <option value="ON HOLD" className="bg-card">Set On Hold</option>
                  <option value="SELECT PROGRESS" className="bg-card">Select Progress</option>
                </select>
              </div>

              {/* Description */}
              {project.description && (
                <div className="rounded-2xl bg-muted/30 p-4 border border-border/70 text-xs text-muted-foreground leading-relaxed">
                  {project.description}
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-card border border-border/80 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Tasks</span>
                  </div>
                  <p className="text-base font-bold text-card-foreground">
                    {project.completedTasks} / {project.totalTasks}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {percent}% Completed
                  </p>
                </div>

                <div className="rounded-2xl bg-card border border-border/80 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sprint Stage</span>
                  </div>
                  <p className="text-sm font-bold text-card-foreground truncate">
                    {project.sprintStage || "Sprint 1 / 4"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Active cycle
                  </p>
                </div>

                <div className="rounded-2xl bg-card border border-border/80 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Target Due</span>
                  </div>
                  <p className="text-sm font-bold text-card-foreground">
                    {project.dueDate}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Deliverable date
                  </p>
                </div>

                <div className="rounded-2xl bg-card border border-border/80 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    <span>Budget</span>
                  </div>
                  <p className="text-base font-bold text-card-foreground font-mono">
                    {project.budget || "$40,000"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Allocated
                  </p>
                </div>
              </div>

              {/* Progress Bar Detail */}
              <div className="space-y-2 rounded-2xl bg-muted/20 p-4 border border-border/70">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-card-foreground">Overall Completion</span>
                  <span className="text-primary font-bold">{percent}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: project.progressColor,
                    }}
                  />
                </div>
              </div>

              {/* Team Members Allocation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Team Members ({project.members.length + project.extraMembersCount})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {project.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-card border border-border/70 shadow-xs"
                    >
                      <Avatar
                        src={member.avatar}
                        fallback={member.name[0]}
                        size="md"
                        className="border border-border/60"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-card-foreground truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {member.role || "Core Contributor"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Project Deliverables & Tasks ({projectTasks.length})
                  </h3>
                </div>

                {/* Inline task creation */}
                <form onSubmit={handleAddNewTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder={`Add new task to ${project.name}...`}
                    className="flex-1 h-10 rounded-xl border border-border bg-muted/40 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="submit" size="sm" className="gap-1.5 h-10 px-3.5">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </form>

                {/* Task list items */}
                <div className="space-y-2">
                  {projectTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center italic">
                      No standalone tasks yet for this project. Add one above!
                    </p>
                  ) : (
                    projectTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onToggleTask(t.id)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70 hover:border-border transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => onToggleTask(t.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded-md border-border text-primary accent-primary cursor-pointer"
                          />
                          <span
                            className={cn(
                              "text-xs font-medium transition-all truncate",
                              t.completed
                                ? "line-through text-muted-foreground/60"
                                : "text-card-foreground group-hover:text-primary"
                            )}
                          >
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {t.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="text-[10px] font-bold text-muted-foreground/70">
                            {t.dueDate}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Deliverable Attachments ({project.attachmentsCount || 6})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70">
                    <div className="truncate">
                      <p className="font-semibold text-card-foreground truncate">
                        {project.name}_v2_Figma_Export.fig
                      </p>
                      <p className="text-[10px] text-muted-foreground">18.4 MB • 2 days ago</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70">
                    <div className="truncate">
                      <p className="font-semibold text-card-foreground truncate">
                        Architecture_Spec_Sheet.pdf
                      </p>
                      <p className="text-[10px] text-muted-foreground">4.2 MB • Yesterday</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Last updated today at 10:45 AM
              </span>
              <Button onClick={onClose} variant="outline" size="sm">
                Close Panel
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
