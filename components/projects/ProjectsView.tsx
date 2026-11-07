"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  LayoutGrid,
  Table as TableIcon,
  Plus,
  Search,
  X,
  Filter,
  CheckCircle2,
  Clock,
  PauseCircle,
  FolderKanban
} from "lucide-react"
import { Project, TaskItem, Member } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectCardGrid } from "./ProjectCardGrid"
import { ProjectTableView } from "./ProjectTableView"
import { NewProjectModal } from "./NewProjectModal"
import { ProjectManageView } from "./ProjectManageView"
import { cn } from "@/lib/utils"

interface ProjectsViewProps {
  projects: Project[]
  tasks: TaskItem[]
  onToggleStar: (id: string) => void
  onUpdateStatus: (id: string, newStatus: Project["status"]) => void
  onAddProject: (
    projectData: Omit<Project, "id" | "completedTasks">,
    initialTasks?: Omit<TaskItem, "id" | "number">[]
  ) => void
  onToggleTask: (id: string) => void
  onAddTask: (newTaskData: Omit<TaskItem, "id" | "number">) => void
  onUpdateProject: (project: Project) => void
  onDeleteTask?: (id: string) => void
  onUpdateTaskAssignee?: (taskId: string, assignee: Member) => void
  managingProjectId?: string | null
  onSetManagingProjectId?: (id: string | null) => void
}

type StatusFilter = "ALL" | "IN PROGRESS" | "COMPLETED" | "ON HOLD"
type PriorityFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW"
type ViewMode = "grid" | "table"

export function ProjectsView({
  projects,
  tasks,
  onToggleStar,
  onUpdateStatus,
  onAddProject,
  onToggleTask,
  onAddTask,
  onUpdateProject,
  onDeleteTask,
  onUpdateTaskAssignee,
  managingProjectId,
  onSetManagingProjectId,
}: ProjectsViewProps) {
  // View states
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)

  // Internal managing project state fallback if not controlled by parent
  const [internalManagingId, setInternalManagingId] = useState<string | null>(null)
  const activeManagingId = managingProjectId !== undefined ? managingProjectId : internalManagingId
  const setActiveManagingId = onSetManagingProjectId || setInternalManagingId

  // Find currently managed project
  const currentManagedProject = useMemo(() => {
    if (!activeManagingId) return null
    return projects.find((p) => p.id === activeManagingId) || null
  }, [projects, activeManagingId])

  // Status counts
  const counts = useMemo(() => {
    return {
      all: projects.length,
      inProgress: projects.filter((p) => p.status === "IN PROGRESS" || p.status === "SELECT PROGRESS").length,
      completed: projects.filter((p) => p.status === "COMPLETED").length,
      onHold: projects.filter((p) => p.status === "ON HOLD").length,
    }
  }, [projects])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Status filter
      if (statusFilter === "IN PROGRESS") {
        if (project.status !== "IN PROGRESS" && project.status !== "SELECT PROGRESS") return false
      } else if (statusFilter === "COMPLETED") {
        if (project.status !== "COMPLETED") return false
      } else if (statusFilter === "ON HOLD") {
        if (project.status !== "ON HOLD") return false
      }

      // Priority filter
      if (priorityFilter === "HIGH" && !project.priority.includes("HIGH")) return false
      if (priorityFilter === "MEDIUM" && !project.priority.includes("MEDIUM")) return false
      if (priorityFilter === "LOW" && !project.priority.includes("LOW")) return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = project.name.toLowerCase().includes(query)
        const matchesCompany = project.company.toLowerCase().includes(query)
        const matchesTag = project.tags.some((t) => t.toLowerCase().includes(query))
        if (!matchesName && !matchesCompany && !matchesTag) return false
      }

      return true
    })
  }, [projects, statusFilter, priorityFilter, searchQuery])

  // If a project is actively selected for management, render the dedicated Project Management screen
  if (currentManagedProject) {
    return (
      <ProjectManageView
        project={currentManagedProject}
        tasks={tasks}
        onBack={() => setActiveManagingId(null)}
        onUpdateProject={onUpdateProject}
        onToggleTask={onToggleTask}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
        onUpdateTaskAssignee={onUpdateTaskAssignee}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Projects Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Projects
            </h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {projects.length} Total
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Click on any project to open its full management view, contributors, deliverables, and team chat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="gap-2 bg-primary hover:bg-blue-700 text-primary-foreground font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* 2. Control Bar (Status Tabs, Search, Priority, View Toggle) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-card p-2.5 sm:p-3 border border-border/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            All <span className="opacity-70 ml-1">({counts.all})</span>
          </button>

          <button
            onClick={() => setStatusFilter("IN PROGRESS")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
              statusFilter === "IN PROGRESS"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            In Progress <span className="opacity-70 ml-1">({counts.inProgress})</span>
          </button>

          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
              statusFilter === "COMPLETED"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            Completed <span className="opacity-70 ml-1">({counts.completed})</span>
          </button>

          <button
            onClick={() => setStatusFilter("ON HOLD")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
              statusFilter === "ON HOLD"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            On Hold <span className="opacity-70 ml-1">({counts.onHold})</span>
          </button>
        </div>

        {/* Search, Priority Filter, and View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or tags..."
              className="w-full h-9 pl-8 pr-7 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="h-9 rounded-xl border border-border bg-muted/40 px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL" className="bg-card">All Priorities</option>
              <option value="HIGH" className="bg-card">High Priority</option>
              <option value="MEDIUM" className="bg-card">Medium Priority</option>
              <option value="LOW" className="bg-card">Low Priority</option>
            </select>
          </div>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center rounded-xl bg-muted/50 p-1 border border-border/80">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Bento Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="High-Density Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Projects Content (Bento Grid or High-Density Table) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {viewMode === "grid" ? (
            <ProjectCardGrid
              projects={filteredProjects}
              onToggleStar={onToggleStar}
              onUpdateStatus={onUpdateStatus}
              onSelectProject={(proj) => setActiveManagingId(proj.id)}
            />
          ) : (
            <ProjectTableView
              projects={filteredProjects}
              onToggleStar={onToggleStar}
              onUpdateStatus={onUpdateStatus}
              onSelectProject={(proj) => setActiveManagingId(proj.id)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. Enhanced Project Creation Modal */}
      <NewProjectModal
        open={isNewProjectModalOpen}
        onOpenChange={setIsNewProjectModalOpen}
        onAddProject={onAddProject}
      />
    </div>
  )
}
