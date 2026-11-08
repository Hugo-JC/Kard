"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  DollarSign,
  Users,
  Paperclip,
  Upload,
  Plus,
  Send,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Check,
  Clock,
  Flag,
  MoreVertical,
  ChevronDown,
  UserCheck,
  Palette,
  Archive,
  ArchiveRestore,
  Shield,
  Activity
} from "lucide-react"
import {
  Project,
  TaskItem,
  Member,
  MemberStatus,
  MEMBER_STATUS_CONFIG,
  ProjectChatMessage,
  ProjectDocument,
  AVAILABLE_CONTRIBUTORS,
} from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { ProjectSelectField, memberSelectOptions, type ProjectSelectOption } from "@/components/projects/ProjectSelectField"
import { TaskComposer } from "@/components/projects/TaskComposer"
import { ProjectProgressSummaryCard } from "@/components/projects/ProjectProgressSummaryCard"
import { MemberStatusBadge, MemberAvatarWithStatus } from "@/components/ui/MemberStatusBadge"
import { cn } from "@/lib/utils"

interface ProjectManageViewProps {
  project: Project
  tasks: TaskItem[]
  onBack: () => void
  onUpdateProject: (updated: Project) => void
  onToggleTask: (id: string) => void
  onAddTask: (newTask: Omit<TaskItem, "id" | "number">) => void
  onDeleteTask?: (id: string) => void
  onUpdateTaskAssignee?: (taskId: string, assignee: Member) => void
}

const PRESET_ACCENTS = [
  "#3B82F6", // Ocean Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#F59E0B", // Amber
  "#F43F5E", // Rose
]

const PROJECT_STATUS_OPTIONS: ProjectSelectOption[] = [
  { value: "SELECT PROGRESS", label: "Planejado", indicatorClassName: "bg-muted-foreground" },
  { value: "IN PROGRESS", label: "Em andamento", indicatorClassName: "bg-primary" },
  { value: "COMPLETED", label: "Concluído", indicatorClassName: "bg-success" },
  { value: "ON HOLD", label: "Pausado", indicatorClassName: "bg-warning" },
]

const PROJECT_PRIORITY_OPTIONS: ProjectSelectOption[] = [
  { value: "HIGH PRIORITY", label: "Alta", indicatorClassName: "bg-danger" },
  { value: "MEDIUM PRIORITY", label: "Média", indicatorClassName: "bg-warning" },
  { value: "LOW PRIORITY", label: "Baixa", indicatorClassName: "bg-info" },
]

export function ProjectManageView({
  project,
  tasks,
  onBack,
  onUpdateProject,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTaskAssignee,
}: ProjectManageViewProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "team" | "chat" | "files">("tasks")

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docFileInputRef = useRef<HTMLInputElement>(null)

  // Task filter state
  const [taskFilterAssignee, setTaskFilterAssignee] = useState<string>("ALL")
  const [taskFilterStatus, setTaskFilterStatus] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL")

  // Chat state
  const [chatInput, setChatInput] = useState("")
  const [projectChats, setProjectChats] = useState<ProjectChatMessage[]>(
    project.chatMessages || [
      {
        id: "msg-default-1",
        user: "Angelina Smith",
        avatar: "/avatars/angelina.jpg",
        role: "Project Manager (You)",
        text: `Welcome to the ${project.name} management room! Discuss sprint goals and deliverables here.`,
        time: "10:00 AM",
        isMe: true,
      },
      {
        id: "msg-default-2",
        user: project.members[0]?.name || "Courtney Henry",
        avatar: project.members[0]?.avatar || "/avatars/courtney.jpg",
        role: project.members[0]?.role || "Design Lead",
        text: "I am finishing up the latest review pass. Let me know if you need any adjustments!",
        time: "10:30 AM",
      },
    ]
  )

  // Documents state
  const [documents, setDocuments] = useState<ProjectDocument[]>(
    project.documents || [
      {
        id: "doc-1",
        name: `${project.name.replace(/\s+/g, "_")}_Deliverables_v1.fig`,
        size: "18.4 MB",
        date: "Yesterday",
        type: "FIGMA",
      },
      {
        id: "doc-2",
        name: "Technical_Specifications.pdf",
        size: "3.2 MB",
        date: "3 days ago",
        type: "PDF",
      },
    ]
  )

  // Add Contributor Modal state
  const [showAddContributor, setShowAddContributor] = useState(false)

  const accentColor = project.accentColor || project.progressColor || "#3B82F6"

  // Filter tasks specific to this project
  const projectTasks = tasks.filter(
    (t) => t.project.toLowerCase() === project.name.toLowerCase()
  )

  const filteredTasks = projectTasks.filter((t) => {
    if (taskFilterStatus === "ACTIVE" && t.completed) return false
    if (taskFilterStatus === "COMPLETED" && !t.completed) return false
    if (taskFilterAssignee !== "ALL" && t.assignee?.name !== taskFilterAssignee) return false
    return true
  })

  const percent = Math.round((project.completedTasks / Math.max(1, project.totalTasks)) * 100)
  const projectAssignees = project.members.length > 0 ? project.members : AVAILABLE_CONTRIBUTORS
  const assigneeOptions = memberSelectOptions(projectAssignees)
  const taskFilterOptions: ProjectSelectOption[] = [
    { value: "ALL", label: "Todas as pessoas", indicatorClassName: "bg-primary" },
    ...assigneeOptions,
  ]

  // Handle uploading device image for project branding
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      onUpdateProject({
        ...project,
        customImage: dataUrl,
        logo: "custom",
      })
    }
    reader.readAsDataURL(file)
  }

  // Handle document upload simulation from device
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE"
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB"

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: sizeMb,
      date: "Just now",
      type: ext,
    }

    const updatedDocs = [newDoc, ...documents]
    setDocuments(updatedDocs)
    onUpdateProject({
      ...project,
      documents: updatedDocs,
      attachmentsCount: (project.attachmentsCount || 0) + 1,
    })
  }

  // Handle changing accent color
  const handleChangeAccentColor = (newColor: string) => {
    onUpdateProject({
      ...project,
      accentColor: newColor,
      progressColor: newColor,
    })
  }

  // Handle sending chat message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const myCurrentStatus =
      project.members.find((m) => m.name === "Angelina Smith")?.status || "Online"

    const newMsg: ProjectChatMessage = {
      id: `chat-${Date.now()}`,
      user: "Angelina Smith",
      avatar: "/avatars/angelina.jpg",
      role: "Project Manager (You)",
      text: chatInput.trim(),
      time: "Just now",
      isMe: true,
      userStatus: myCurrentStatus,
    }

    const updated = [...projectChats, newMsg]
    setProjectChats(updated)
    onUpdateProject({
      ...project,
      chatMessages: updated,
    })
    setChatInput("")
  }

  // Handle updating member status
  const handleUpdateMemberStatus = (memberName: string, newStatus: MemberStatus) => {
    const updatedMembers = project.members.map((m) =>
      m.name === memberName ? { ...m, status: newStatus } : m
    )
    onUpdateProject({
      ...project,
      members: updatedMembers,
    })
  }

  // Handle adding contributor to project
  const handleAddContributorToProject = (member: Member) => {
    if (project.members.some((m) => m.name === member.name)) return
    const updatedMembers = [...project.members, member]
    onUpdateProject({
      ...project,
      members: updatedMembers,
    })
    setShowAddContributor(false)
  }

  const handleRemoveContributor = (name: string) => {
    if (project.members.length <= 1) return
    const updatedMembers = project.members.filter((m) => m.name !== name)
    onUpdateProject({
      ...project,
      members: updatedMembers,
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick star button */}
          <button
            onClick={() =>
              onUpdateProject({ ...project, isStarred: !project.isStarred })
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-amber-400 transition-colors cursor-pointer"
            title="Star project"
          >
            <Star
              className={cn(
                "w-4 h-4",
                project.isStarred
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            />
          </button>

          {/* Archive / Restore Button */}
          <button
            onClick={() =>
              onUpdateProject({ ...project, isArchived: !project.isArchived })
            }
            className={cn(
              "flex items-center gap-1.5 h-9 rounded-xl border px-3 text-xs font-semibold transition-colors cursor-pointer",
              project.isArchived
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/20"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={
              project.isArchived
                ? "Restore project to active board"
                : "Archive project (removes from active dashboard, keeps data accessible via Archive filter)"
            }
          >
            {project.isArchived ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5 text-amber-500" />
                <span>Restore to Active</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Archive Project</span>
                <span className="sm:hidden">Archive</span>
              </>
            )}
          </button>

          {/* Accent Color Picker trigger */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-2 h-9 rounded-xl bg-card border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Change project highlight color"
            >
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: accentColor }}
              />
              <span className="hidden sm:inline">Highlight Color</span>
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 mt-2 z-30 w-56 rounded-2xl bg-card p-3 shadow-xl border border-border space-y-2.5 animate-in fade-in zoom-in-95">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Project Accent Color
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_ACCENTS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        handleChangeAccentColor(color)
                        setShowColorPicker(false)
                      }}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ring-2",
                        accentColor === color
                          ? "ring-foreground scale-110"
                          : "ring-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {accentColor === color && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">{accentColor}</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => handleChangeAccentColor(e.target.value)}
                    className="h-6 w-6 rounded cursor-pointer border border-border bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archived Notice Banner if project is archived */}
      {project.isArchived && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-medium">
            <Archive className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              <strong>Archived Project:</strong> This project is hidden from the main active dashboard. Its historical data and tasks remain preserved and accessible via search and the Archived filter.
            </span>
          </div>
          <button
            onClick={() => onUpdateProject({ ...project, isArchived: false })}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <ArchiveRestore className="w-3.5 h-3.5" />
            <span>Restore Project</span>
          </button>
        </div>
      )}

      {/* 2. Hero Project Header with Accent Banner & Device Image */}
      <div className="rounded-[32px] bg-card border border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Banner with project accent color */}
        <div
          className="relative h-32 sm:h-36 w-full p-6 flex items-start justify-end transition-colors"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 60%, #1e1b4b 100%)`,
          }}
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Quick upload device image trigger from banner */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative z-10 inline-flex items-center gap-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Device Logo / Image</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDeviceImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Content beneath banner */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-5">
            {/* Project Brand Image */}
            <div className="flex items-end gap-4">
              <div
                className="relative group h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-card border-4 border-card shadow-xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change project image from device"
              >
                {project.customImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.customImage}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                ) : project.logo === "google" ? (
                  <GoogleLogo className="w-14 h-14" />
                ) : project.logo === "slack" ? (
                  <SlackLogo className="w-14 h-14" />
                ) : project.logo === "spotify" ? (
                  <SpotifyLogo className="w-14 h-14" />
                ) : project.logo === "linear" ? (
                  <LinearLogo className="w-14 h-14" />
                ) : (
                  <span
                    className="text-3xl font-extrabold"
                    style={{ color: accentColor }}
                  >
                    {project.name.charAt(0)}
                  </span>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-center p-1">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold">Change</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
                    {project.name}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {project.company}
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
              <ProjectSelectField
                ariaLabel="Status do projeto"
                value={project.status}
                options={PROJECT_STATUS_OPTIONS}
                onValueChange={(value) =>
                  onUpdateProject({ ...project, status: value as Project["status"] })
                }
                className="w-full sm:w-auto"
                triggerClassName="sm:w-44"
              />
              <ProjectSelectField
                ariaLabel="Prioridade do projeto"
                value={project.priority}
                options={PROJECT_PRIORITY_OPTIONS}
                onValueChange={(value) =>
                  onUpdateProject({ ...project, priority: value as Project["priority"] })
                }
                className="w-full sm:w-auto"
                triggerClassName="sm:w-36"
              />
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-4xl leading-relaxed mb-6">
              {project.description}
            </p>
          )}

          {/* Key Metric Cards Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/80">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Task Deliverables</span>
              </div>
              <p className="text-lg font-extrabold text-card-foreground">
                {project.completedTasks} / {project.totalTasks}
              </p>
              <div className="mt-2 relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/80">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sprint Milestone</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-card-foreground truncate">
                {project.sprintStage || "Sprint 3 / 6"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Active Cycle</p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/80">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Target Due Date</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-card-foreground">
                {project.dueDate}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Milestone delivery</p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/80">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                <span>Project Budget</span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-card-foreground font-mono">
                {project.budget || "$54,000"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Allocated Funds</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Progress Summary Card (Deliverables, Remaining Time, Average Completion Radial Chart) */}
      <ProjectProgressSummaryCard project={project} tasks={tasks} />

      {/* 4. Tabbed Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("tasks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap",
            activeTab === "tasks"
              ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Tasks & Assignees ({projectTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap",
            activeTab === "team"
              ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Contributors ({project.members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap",
            activeTab === "chat"
              ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Project Chat ({projectChats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap",
            activeTab === "files"
              ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Paperclip className="w-4 h-4" />
          <span>Files & Docs ({documents.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Tasks & Designated Assignees */}
      {activeTab === "tasks" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs sm:flex-row sm:items-end sm:justify-between sm:p-4">
            <ProjectSelectField
              label="Responsável"
              value={taskFilterAssignee}
              options={taskFilterOptions}
              onValueChange={setTaskFilterAssignee}
              className="w-full sm:max-w-60"
              triggerClassName="bg-background"
            />
            <div
              role="group"
              aria-label="Filtrar tarefas por status"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/60 p-1"
            >
              {[
                { value: "ALL", label: "Todas" },
                { value: "ACTIVE", label: "Ativas" },
                { value: "COMPLETED", label: "Concluídas" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={taskFilterStatus === option.value}
                  onClick={() => setTaskFilterStatus(option.value as typeof taskFilterStatus)}
                  className={cn(
                    "min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors",
                    taskFilterStatus === option.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <TaskComposer
            project={project}
            assignees={projectAssignees}
            onAddTask={onAddTask}
          />

          <section aria-label="Lista de tarefas" className="flex flex-col gap-3">
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card-subtle p-8 text-center sm:p-10">
                <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-primary-subtle text-primary">
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                </span>
                <p className="text-base font-semibold text-card-foreground">
                  Nenhuma tarefa corresponde a esses filtros.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie uma tarefa acima ou ajuste os filtros.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <motion.article
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="grid min-w-0 gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:border-primary/25 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4"
                >
                  <Field orientation="horizontal" className="items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={(checked) => {
                        if (checked !== task.completed) {
                          onToggleTask(task.id)
                        }
                      }}
                      aria-label={
                        task.completed
                          ? `Reabrir tarefa: ${task.title}`
                          : `Concluir tarefa: ${task.title}`
                      }
                      className="mt-0.5 size-5 rounded-md border-2 border-muted-foreground/35 bg-background transition-colors data-checked:border-success data-checked:bg-success data-checked:text-white"
                    />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <FieldLabel
                        htmlFor={`task-${task.id}`}
                        className={cn(
                          "cursor-pointer text-sm leading-snug sm:text-base",
                          task.completed
                            ? "text-muted-foreground line-through"
                            : "text-card-foreground"
                        )}
                      >
                        {task.title}
                      </FieldLabel>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-muted-foreground">
                        {task.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-md px-2 py-0.5 text-xs font-semibold normal-case tracking-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock aria-hidden="true" className="size-4" />
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </Field>

                  <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
                    <ProjectSelectField
                      ariaLabel={`Responsável pela tarefa ${task.title}`}
                      value={
                        task.assignee?.name ?? projectAssignees[0]?.name ?? ""
                      }
                      options={assigneeOptions}
                      onValueChange={(value) => {
                        const assignee = projectAssignees.find(
                          (member) => member.name === value
                        )
                        if (assignee) onUpdateTaskAssignee?.(task.id, assignee)
                      }}
                      disabled={!onUpdateTaskAssignee}
                      className="min-w-0 flex-1 sm:flex-none"
                      triggerClassName="h-11 w-full sm:w-48"
                      contentClassName="min-w-56"
                    />
                    <Badge
                      variant={
                        task.priority === "High"
                          ? "destructive"
                          : task.priority === "Medium"
                          ? "warning"
                          : "info"
                      }
                      className="min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold uppercase"
                    >
                      <Flag aria-hidden="true" className="size-3.5" />
                      {task.priority === "High"
                        ? "Alta"
                        : task.priority === "Medium"
                        ? "Média"
                        : "Baixa"}
                    </Badge>
                    {onDeleteTask && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label={`Excluir tarefa: ${task.title}`}
                        title="Excluir tarefa"
                        className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    )}
                  </div>
                </motion.article>
              ))
            )}
          </section>
        </div>
      )}

      {/* 5. Tab 2: Contributors & Team */}
      {activeTab === "team" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-card-foreground">
                Project Contributors & Role Assignments
              </h3>
              <p className="text-xs text-muted-foreground">
                Engineers, designers, and managers assigned to {project.name}.
              </p>
            </div>

            <Button
              onClick={() => setShowAddContributor(true)}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contributor</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members.map((member) => {
              const assignedTasks = projectTasks.filter(
                (t) => t.assignee?.name === member.name
              )
              const completedAssigned = assignedTasks.filter((t) => t.completed).length
              const currentStatus: MemberStatus = member.status || "Offline"

              return (
                <div
                  key={member.name}
                  className="rounded-2xl bg-card p-4 border border-border shadow-xs space-y-3.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <MemberAvatarWithStatus
                        avatar={member.avatar}
                        name={member.name}
                        status={currentStatus}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-card-foreground">
                            {member.name}
                          </h4>
                          {member.name === "Angelina Smith" && (
                            <span className="rounded-md bg-primary-subtle text-primary px-1.5 py-0.2 text-[10px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {member.role || "Team Contributor"}
                        </p>
                      </div>
                    </div>

                    {project.members.length > 1 && (
                      <button
                        onClick={() => handleRemoveContributor(member.name)}
                        className="text-muted-foreground/60 hover:text-danger p-1 cursor-pointer"
                        title="Remove from project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Indicator & Live Switcher */}
                  <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 text-xs border border-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Status:
                      </span>
                      <MemberStatusBadge status={currentStatus} size="sm" />
                    </div>

                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        handleUpdateMemberStatus(member.name, e.target.value as MemberStatus)
                      }
                      aria-label={`Change status for ${member.name}`}
                      className="text-[11px] font-semibold bg-card border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    >
                      <option value="Online">Online</option>
                      <option value="In Meeting">In Meeting</option>
                      <option value="Focused">Focused</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="rounded-xl bg-muted/30 p-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tasks Allocation:</span>
                    <span className="font-bold text-card-foreground tabular-nums">
                      {completedAssigned} / {assignedTasks.length} Done
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add Contributor Drawer / Selector */}
          {showAddContributor && (
            <div className="rounded-2xl bg-muted/30 p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Team Member to Add to Project
                </h4>
                <button
                  onClick={() => setShowAddContributor(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {AVAILABLE_CONTRIBUTORS.filter(
                  (c) => !project.members.some((m) => m.name === c.name)
                ).map((contributor) => (
                  <div
                    key={contributor.name}
                    onClick={() => handleAddContributorToProject(contributor)}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={contributor.avatar}
                        fallback={contributor.name[0]}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-card-foreground">
                          {contributor.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {contributor.role}
                        </p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Project Team Chat with Team Status Indicators */}
      {activeTab === "chat" && (() => {
        const onlineCount = project.members.filter((m) => m.status === "Online").length
        const meetingCount = project.members.filter((m) => m.status === "In Meeting").length
        const focusedCount = project.members.filter((m) => m.status === "Focused").length
        const myMember = project.members.find((m) => m.name === "Angelina Smith")
        const myStatus = myMember?.status || "Online"

        return (
          <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col h-[560px]">
            {/* Chat Room Header with Status Breakdown */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <div>
                  <h4 className="text-sm font-bold text-card-foreground">
                    #{project.name.toLowerCase().replace(/\s+/g, "-")}-team
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-semibold">{project.members.length} members</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {onlineCount} Online
                    </span>
                    {meetingCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-amber-500">{meetingCount} In Meeting</span>
                      </>
                    )}
                    {focusedCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-purple-500">{focusedCount} Focused</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contributor Avatars with Live Status Rings */}
              <div className="flex items-center -space-x-1.5">
                {project.members.map((m, idx) => (
                  <MemberAvatarWithStatus
                    key={idx}
                    avatar={m.avatar}
                    name={m.name}
                    status={m.status || "Offline"}
                    size="sm"
                    className="w-6 h-6 border-2 border-card"
                  />
                ))}
              </div>
            </div>

            {/* Chat Messages Log with Member Status Reflecting */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {projectChats.map((msg) => {
                const memberInfo = project.members.find((m) => m.name === msg.user)
                const currentMsgStatus: MemberStatus =
                  memberInfo?.status || msg.userStatus || (msg.isMe ? myStatus : "Online")

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-3",
                      msg.isMe && "flex-row-reverse"
                    )}
                  >
                    <MemberAvatarWithStatus
                      avatar={msg.avatar}
                      name={msg.user}
                      status={currentMsgStatus}
                      size="sm"
                      className="mt-0.5"
                    />

                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs space-y-1",
                        msg.isMe
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-muted/60 dark:bg-slate-900 border border-border/80 text-card-foreground rounded-tl-xs"
                      )}
                    >
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-1.5 text-[10px] font-semibold",
                          msg.isMe ? "text-primary-foreground/90 justify-end" : "text-muted-foreground"
                        )}
                      >
                        <span className="font-bold">{msg.user}</span>
                        <MemberStatusBadge
                          status={currentMsgStatus}
                          size="sm"
                          className={msg.isMe ? "border-white/20 bg-white/15 text-white" : ""}
                        />
                        <span>• {msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Live Presence Status Switcher for User (Angelina Smith) */}
            <div className="px-3.5 py-2 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-semibold">Your status:</span>
                <MemberStatusBadge status={myStatus} size="sm" />
              </div>

              <div className="flex items-center gap-1">
                {(["Online", "In Meeting", "Focused", "Offline"] as MemberStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateMemberStatus("Angelina Smith", st)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer",
                      myStatus === st
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3 border-t border-border flex items-center gap-2 bg-card"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Message #${project.name.toLowerCase().replace(/\s+/g, "-")}-team...`}
                className="flex-1 h-10 rounded-xl border border-border bg-muted/40 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="sm" className="h-10 px-4 gap-1.5">
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        )
      })()}

      {/* 7. Tab 4: Files & Deliverables */}
      {activeTab === "files" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-card-foreground">
                Deliverable Documents & Assets
              </h3>
              <p className="text-xs text-muted-foreground">
                Figma wireframes, PDF architectural specs, and exported client bundles.
              </p>
            </div>

            <Button
              onClick={() => docFileInputRef.current?.click()}
              size="sm"
              className="gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </Button>

            <input
              type="file"
              ref={docFileInputRef}
              onChange={handleDocUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-primary shrink-0 border border-border">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-card-foreground truncate">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {doc.size} • {doc.date} • {doc.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    title="Download / Open file"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
