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
  MoreVertical,
  ChevronDown,
  UserCheck,
  Palette
} from "lucide-react"
import {
  Project,
  TaskItem,
  Member,
  ProjectChatMessage,
  ProjectDocument,
  AVAILABLE_CONTRIBUTORS,
} from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

  // Inline task creation
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState<Member>(
    project.members[0] || AVAILABLE_CONTRIBUTORS[0]
  )
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState("28 June")

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

  // Handle adding task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    onAddTask({
      title: newTaskTitle.trim(),
      project: project.name,
      commentsCount: 0,
      subtasksCount: 0,
      completed: false,
      priority: newTaskPriority,
      tags: ["Deliverable"],
      dueDate: newTaskDueDate,
      assignee: newTaskAssignee,
      stage: "TODO",
    })

    setNewTaskTitle("")
  }

  // Handle sending chat message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const newMsg: ProjectChatMessage = {
      id: `chat-${Date.now()}`,
      user: "Angelina Smith",
      avatar: "/avatars/angelina.jpg",
      role: "Project Manager (You)",
      text: chatInput.trim(),
      time: "Just now",
      isMe: true,
    }

    const updated = [...projectChats, newMsg]
    setProjectChats(updated)
    onUpdateProject({
      ...project,
      chatMessages: updated,
    })
    setChatInput("")
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

            {/* Status & Priority Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={project.status}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    status: e.target.value as Project["status"],
                  })
                }
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold tracking-wider uppercase border focus:outline-none cursor-pointer",
                  project.status === "COMPLETED"
                    ? "bg-success-subtle text-success-foreground border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : project.status === "IN PROGRESS"
                    ? "bg-primary-subtle text-primary border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-300"
                    : project.status === "ON HOLD"
                    ? "bg-warning-subtle text-warning-foreground border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                <option value="IN PROGRESS" className="bg-card">IN PROGRESS</option>
                <option value="COMPLETED" className="bg-card">COMPLETED</option>
                <option value="ON HOLD" className="bg-card">ON HOLD</option>
                <option value="SELECT PROGRESS" className="bg-card">SELECT PROGRESS</option>
              </select>

              <select
                value={project.priority}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    priority: e.target.value as Project["priority"],
                  })
                }
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold tracking-wider uppercase border focus:outline-none cursor-pointer",
                  project.priority === "HIGH PRIORITY"
                    ? "border-red-400/40 text-red-500 bg-red-50/20 dark:bg-red-950/30 dark:text-red-400"
                    : project.priority === "MEDIUM PRIORITY"
                    ? "border-emerald-500/40 text-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border-slate-300 dark:border-slate-700 text-muted-foreground bg-muted/30"
                )}
              >
                <option value="HIGH PRIORITY" className="bg-card">HIGH PRIORITY</option>
                <option value="MEDIUM PRIORITY" className="bg-card">MEDIUM PRIORITY</option>
                <option value="LOW PRIORITY" className="bg-card">LOW PRIORITY</option>
              </select>
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

      {/* 3. Tabbed Navigation Bar */}
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
        <div className="space-y-5">
          {/* Controls: Filter by Assignee, Status, and Inline Creator */}
          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">
                Filter Assignee:
              </span>
              <button
                onClick={() => setTaskFilterAssignee("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors",
                  taskFilterAssignee === "ALL"
                    ? "bg-muted text-card-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              {project.members.map((member) => (
                <button
                  key={member.name}
                  onClick={() => setTaskFilterAssignee(member.name)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors",
                    taskFilterAssignee === member.name
                      ? "bg-primary-subtle text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Avatar src={member.avatar} fallback={member.name[0]} size="sm" className="w-4 h-4" />
                  <span>{member.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskFilterStatus("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer",
                  taskFilterStatus === "ALL"
                    ? "bg-muted text-card-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              <button
                onClick={() => setTaskFilterStatus("ACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer",
                  taskFilterStatus === "ACTIVE"
                    ? "bg-muted text-card-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Active
              </button>
              <button
                onClick={() => setTaskFilterStatus("COMPLETED")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer",
                  taskFilterStatus === "COMPLETED"
                    ? "bg-muted text-card-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Done
              </button>
            </div>
          </div>

          {/* Quick Task Creator Form */}
          <form
            onSubmit={handleCreateTask}
            className="rounded-2xl bg-card p-4 border border-border shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add Task & Designate Contributor</span>
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={`New deliverable for ${project.name}...`}
                className="flex-1 h-10 rounded-xl border border-border bg-muted/40 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                required
              />

              {/* Assignee select */}
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <select
                  value={newTaskAssignee.name}
                  onChange={(e) => {
                    const found = AVAILABLE_CONTRIBUTORS.find(
                      (m) => m.name === e.target.value
                    )
                    if (found) setNewTaskAssignee(found)
                  }}
                  className="h-10 rounded-xl border border-border bg-muted/40 px-3 text-xs font-semibold text-foreground focus:outline-none cursor-pointer w-full sm:w-auto"
                >
                  {project.members.map((m) => (
                    <option key={m.name} value={m.name} className="bg-card">
                      👤 {m.name} ({m.role || "Contributor"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority select */}
              <select
                value={newTaskPriority}
                onChange={(e) =>
                  setNewTaskPriority(e.target.value as "High" | "Medium" | "Low")
                }
                className="h-10 rounded-xl border border-border bg-muted/40 px-3 text-xs font-semibold text-foreground focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="High" className="bg-card">High Priority</option>
                <option value="Medium" className="bg-card">Medium Priority</option>
                <option value="Low" className="bg-card">Low Priority</option>
              </select>

              <Button type="submit" size="sm" className="h-10 gap-1.5 px-4 shrink-0 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span>Assign Task</span>
              </Button>
            </div>
          </form>

          {/* Task List Items */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl bg-card p-10 text-center border border-border text-muted-foreground">
                <p className="text-sm font-semibold">No tasks found matching your filter.</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Create a task above or adjust your contributor filter.
                </p>
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 hover:border-border transition-all cursor-pointer shadow-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => onToggleTask(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded-md border-border text-primary accent-primary cursor-pointer shrink-0"
                    />

                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-semibold transition-all truncate",
                          t.completed
                            ? "line-through text-muted-foreground/60"
                            : "text-card-foreground group-hover:text-primary"
                        )}
                      >
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        {t.tags?.map((tag) => (
                          <span key={tag} className="uppercase font-medium">
                            #{tag}
                          </span>
                        ))}
                        {t.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Contributor designation and priority badge */}
                  <div
                    className="flex items-center justify-between sm:justify-end gap-3 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Designated Contributor Selector / Avatar */}
                    <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-xl border border-border/60">
                      <Avatar
                        src={t.assignee?.avatar || project.members[0]?.avatar || "/avatars/courtney.jpg"}
                        fallback={t.assignee?.name[0] || "U"}
                        size="sm"
                        className="w-5 h-5"
                      />
                      <select
                        value={t.assignee?.name || project.members[0]?.name}
                        onChange={(e) => {
                          const found = AVAILABLE_CONTRIBUTORS.find(
                            (m) => m.name === e.target.value
                          )
                          if (found && onUpdateTaskAssignee) {
                            onUpdateTaskAssignee(t.id, found)
                          }
                        }}
                        className="bg-transparent text-[11px] font-semibold text-card-foreground focus:outline-none cursor-pointer"
                      >
                        {project.members.map((m) => (
                          <option key={m.name} value={m.name} className="bg-card">
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                        t.priority === "High"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900"
                          : t.priority === "Medium"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {t.priority}
                    </span>

                    {onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1 text-muted-foreground/50 hover:text-danger transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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

              return (
                <div
                  key={member.name}
                  className="rounded-2xl bg-card p-4 border border-border shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.avatar}
                        fallback={member.name[0]}
                        size="md"
                        className="border border-border/80"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-card-foreground">
                          {member.name}
                        </h4>
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

                  <div className="rounded-xl bg-muted/40 p-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tasks Allocation:</span>
                    <span className="font-bold text-card-foreground">
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

      {/* 6. Tab 3: Project Team Chat */}
      {activeTab === "chat" && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col h-[520px]">
          {/* Chat Room Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <div>
                <h4 className="text-sm font-bold text-card-foreground">
                  #{project.name.toLowerCase().replace(/\s+/g, "-")}-team
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {project.members.length} team members in channel
                </p>
              </div>
            </div>

            <div className="flex items-center -space-x-1.5">
              {project.members.map((m, idx) => (
                <Avatar
                  key={idx}
                  src={m.avatar}
                  fallback={m.name[0]}
                  size="sm"
                  className="w-6 h-6 border border-card"
                />
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {projectChats.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  msg.isMe && "flex-row-reverse"
                )}
              >
                <Avatar
                  src={msg.avatar}
                  fallback={msg.user[0]}
                  size="sm"
                  className="w-7 h-7 mt-0.5"
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
                      "flex items-center gap-2 text-[10px] font-semibold",
                      msg.isMe ? "text-primary-foreground/80 justify-end" : "text-muted-foreground"
                    )}
                  >
                    <span>{msg.user}</span>
                    <span>• {msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
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
      )}

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
