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
  FolderKanban,
  Archive,
  ArchiveRestore,
  Lock,
  Sparkles,
} from "lucide-react"
import {
  Project,
  TaskItem,
  Member,
  TaskStage,
  ProjectInvitation,
  ClientDeliverable,
} from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectCardGrid } from "./ProjectCardGrid"
import { ProjectTableView } from "./ProjectTableView"
import { NewProjectModal } from "./NewProjectModal"
import { ProjectManageView } from "./ProjectManageView"
import { SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"
import { cn } from "@/lib/utils"

interface ProjectsViewProps {
  projects: Project[]
  tasks: TaskItem[]
  currentTier?: SubscriptionPlanTier
  initialProjectTab?: "tasks" | "team" | "chat" | "files" | "portal"
  initialNoteId?: string | null
  onOpenPricingModal?: () => void
  onToggleStar: (id: string) => void
  onUpdateStatus: (id: string, newStatus: Project["status"]) => void
  onAddProject: (
    projectData: Omit<Project, "id" | "completedTasks">,
    initialTasks?: Omit<TaskItem, "id" | "number">[]
  ) => void
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
  onAddTask: (newTaskData: Omit<TaskItem, "id" | "number">) => void
  onUpdateProject: (project: Project) => void
  onDeleteTask?: (id: string) => void
  onUpdateTaskAssignee?: (taskId: string, assignee: Member) => void
  onToggleArchive?: (id: string) => void
  onUpdateStage?: (taskId: string, stage: TaskStage) => void
  onReorderTasks?: (tasks: TaskItem[]) => void
  onMoveTask?: (taskId: string, targetStage?: TaskStage, targetProject?: string) => void
  onInviteCollaborator?: (projectId: string, email: string, role: string) => void
  onCancelInvitation?: (projectId: string, inviteId: string) => void
  onAcceptInvitationDirect?: (projectId: string, invite: ProjectInvitation) => void
  onRemoveCollaborator?: (projectId: string, memberNameOrEmail: string) => void
  onUpdateDeliverableStatus?: (
    projectId: string,
    deliverableId: string,
    status: ClientDeliverable["status"],
    feedback?: string
  ) => void
  onAddDeliverable?: (
    projectId: string,
    deliverable: Omit<ClientDeliverable, "id" | "updatedAt">
  ) => void
  managingProjectId?: string | null
  onSetManagingProjectId?: (id: string | null) => void
}

type StatusFilter = "ALL" | "IN PROGRESS" | "COMPLETED" | "ON HOLD" | "ARCHIVED"
type PriorityFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW"
type ViewMode = "grid" | "table"

export function ProjectsView({
  projects,
  tasks,
  currentTier = "free",
  initialProjectTab = "tasks",
  initialNoteId = null,
  onOpenPricingModal,
  onToggleStar,
  onUpdateStatus,
  onAddProject,
  onToggleTask,
  onSelectTask,
  onAddTask,
  onUpdateProject,
  onDeleteTask,
  onUpdateTaskAssignee,
  onToggleArchive,
  onUpdateStage,
  onReorderTasks,
  onMoveTask,
  onInviteCollaborator,
  onCancelInvitation,
  onAcceptInvitationDirect,
  onRemoveCollaborator,
  onUpdateDeliverableStatus,
  onAddDeliverable,
  managingProjectId,
  onSetManagingProjectId,
}: ProjectsViewProps) {
  // View states
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal & Plan limit alert state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [freeLimitAlert, setFreeLimitAlert] = useState(false)

  const activeProjectsCount = useMemo(
    () => projects.filter((p) => !p.isArchived).length,
    [projects]
  )
  const isAtFreeProjectLimit = currentTier === "free" && activeProjectsCount >= 3

  // Internal managing project state fallback if not controlled by parent
  const [internalManagingId, setInternalManagingId] = useState<string | null>(null)
  const activeManagingId = managingProjectId !== undefined ? managingProjectId : internalManagingId
  const setActiveManagingId = onSetManagingProjectId || setInternalManagingId

  // Find currently managed project
  const currentManagedProject = useMemo(() => {
    if (!activeManagingId) return null
    return projects.find((p) => p.id === activeManagingId) || null
  }, [projects, activeManagingId])

  // Status counts (separating active projects from archived)
  const counts = useMemo(() => {
    const active = projects.filter((p) => !p.isArchived)
    return {
      all: active.length,
      inProgress: active.filter((p) => p.status === "IN PROGRESS" || p.status === "SELECT PROGRESS").length,
      completed: active.filter((p) => p.status === "COMPLETED").length,
      onHold: active.filter((p) => p.status === "ON HOLD").length,
      archived: projects.filter((p) => p.isArchived).length,
    }
  }, [projects])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Archived projects logic:
      if (statusFilter === "ARCHIVED") {
        if (!project.isArchived) return false
      } else {
        // Hide archived projects from all active tabs
        if (project.isArchived) return false

        // Status filter
        if (statusFilter === "IN PROGRESS") {
          if (project.status !== "IN PROGRESS" && project.status !== "SELECT PROGRESS") return false
        } else if (statusFilter === "COMPLETED") {
          if (project.status !== "COMPLETED") return false
        } else if (statusFilter === "ON HOLD") {
          if (project.status !== "ON HOLD") return false
        }
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
        key={`${currentManagedProject.id}-${initialProjectTab}-${initialNoteId || ""}`}
        project={currentManagedProject}
        tasks={tasks}
        allProjects={projects}
        currentTier={currentTier}
        initialTab={initialProjectTab}
        initialNoteId={initialNoteId}
        onOpenPricingModal={onOpenPricingModal}
        onBack={() => setActiveManagingId(null)}
        onUpdateProject={onUpdateProject}
        onToggleTask={onToggleTask}
        onSelectTask={onSelectTask}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
        onUpdateTaskAssignee={onUpdateTaskAssignee}
        onUpdateStage={onUpdateStage}
        onReorderTasks={onReorderTasks}
        onMoveTask={onMoveTask}
        onInviteCollaborator={onInviteCollaborator}
        onCancelInvitation={onCancelInvitation}
        onAcceptInvitationDirect={onAcceptInvitationDirect}
        onRemoveCollaborator={onRemoveCollaborator}
        onUpdateDeliverableStatus={onUpdateDeliverableStatus}
        onAddDeliverable={onAddDeliverable}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Projects Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Projects
            </h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
              {activeProjectsCount}{currentTier === "free" ? "/3 ativos" : ` ativos`}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Click on any project to open its full management view, Markdown notes, deliverables, client portal, and team chat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (isAtFreeProjectLimit) {
                setFreeLimitAlert(true)
              } else {
                setFreeLimitAlert(false)
                setIsNewProjectModalOpen(true)
              }
            }}
            className="min-h-11 gap-2 bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-blue-700 sm:min-h-9"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Free Tier 3-Active-Project Limit Callout */}
      {freeLimitAlert && isAtFreeProjectLimit && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning-subtle/60 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
            <div className="space-y-0.5">
              <p className="font-bold text-foreground">
                Limite do plano Kard Free atingido (3 projetos ativos)
              </p>
              <p className="text-muted-foreground">
                Arquive um projeto concluído para liberar vaga sem custo ou faça upgrade para o Kard Pro para projetos ilimitados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFreeLimitAlert(false)}
              className="h-8 rounded-xl bg-card text-xs font-semibold"
            >
              Fechar
            </Button>
            {onOpenPricingModal && (
              <Button
                type="button"
                size="sm"
                onClick={onOpenPricingModal}
                className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <Sparkles className="size-3.5" />
                <span>Fazer Upgrade</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. Control Bar (Status Tabs, Search, Priority, View Toggle) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-card p-2.5 sm:p-3 border border-border/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors sm:min-h-9",
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
              "min-h-11 shrink-0 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors sm:min-h-9",
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
              "min-h-11 shrink-0 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors sm:min-h-9",
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
              "min-h-11 shrink-0 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors sm:min-h-9",
              statusFilter === "ON HOLD"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            On Hold <span className="opacity-70 ml-1">({counts.onHold})</span>
          </button>

          <button
            onClick={() => setStatusFilter("ARCHIVED")}
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors sm:min-h-9 flex items-center gap-1.5",
              statusFilter === "ARCHIVED"
                ? "bg-amber-500 text-white shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
            title="View archived projects"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
            <span className="opacity-80 ml-0.5">({counts.archived})</span>
          </button>
        </div>

        {/* Search, Priority Filter, and View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full min-w-0 flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or tags..."
              aria-label="Search projects or tags"
              className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              aria-label="Filter by priority"
              className="h-11 max-w-full rounded-xl border border-border bg-muted/40 px-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all sm:min-h-9",
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
                "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all sm:min-h-9",
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
              onToggleArchive={onToggleArchive}
            />
          ) : (
            <ProjectTableView
              projects={filteredProjects}
              onToggleStar={onToggleStar}
              onUpdateStatus={onUpdateStatus}
              onSelectProject={(proj) => setActiveManagingId(proj.id)}
              onToggleArchive={onToggleArchive}
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
