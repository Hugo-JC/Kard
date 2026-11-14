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
  Activity,
  Mail,
  UserPlus,
  BookOpen,
  Pencil,
  Eye,
  ShieldCheck,
} from "lucide-react"
import {
  Project,
  TaskItem,
  Member,
  MemberStatus,
  MEMBER_STATUS_CONFIG,
  ProjectChatMessage,
  ProjectDocument,
  ProjectNote,
  ClientDeliverable,
  AVAILABLE_CONTRIBUTORS,
  TaskStage,
  ProjectInvitation,
} from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectSelectField, type ProjectSelectOption } from "@/components/projects/ProjectSelectField"
import { TaskComposer } from "@/components/projects/TaskComposer"
import { ProjectProgressSummaryCard } from "@/components/projects/ProjectProgressSummaryCard"
import { MemberStatusBadge, MemberAvatarWithStatus } from "@/components/ui/MemberStatusBadge"
import { ProjectTaskBoard } from "@/components/tasks/ProjectTaskBoard"
import { InviteCollaboratorModal } from "@/components/projects/InviteCollaboratorModal"
import { ClientPortalView } from "@/components/projects/ClientPortalView"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"
import { cn } from "@/lib/utils"

interface ProjectManageViewProps {
  project: Project
  tasks: TaskItem[]
  allProjects?: Project[]
  currentTier?: SubscriptionPlanTier
  initialTab?: "tasks" | "team" | "chat" | "files" | "portal"
  initialNoteId?: string | null
  onOpenPricingModal?: () => void
  onBack: () => void
  onUpdateProject: (updated: Project) => void
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
  onAddTask: (newTask: Omit<TaskItem, "id" | "number">) => void
  onDeleteTask?: (id: string) => void
  onUpdateTaskAssignee?: (taskId: string, assignee: Member) => void
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

const MEMBER_STATUS_OPTIONS: ProjectSelectOption[] = [
  { value: "Online", label: "Online", indicatorClassName: "bg-emerald-500" },
  { value: "In Meeting", label: "Em reunião", indicatorClassName: "bg-amber-500" },
  { value: "Focused", label: "Em foco", indicatorClassName: "bg-primary" },
  { value: "Offline", label: "Offline", indicatorClassName: "bg-muted-foreground" },
]

export function ProjectManageView({
  project,
  tasks,
  allProjects = [],
  currentTier = "free",
  initialTab = "tasks",
  initialNoteId = null,
  onOpenPricingModal,
  onBack,
  onUpdateProject,
  onToggleTask,
  onSelectTask,
  onAddTask,
  onDeleteTask,
  onUpdateTaskAssignee,
  onUpdateStage,
  onReorderTasks,
  onMoveTask,
  onInviteCollaborator,
  onCancelInvitation,
  onAcceptInvitationDirect,
  onRemoveCollaborator,
  onUpdateDeliverableStatus,
  onAddDeliverable,
}: ProjectManageViewProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "team" | "chat" | "files" | "portal">(initialTab)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    initialNoteId || project.notes?.[0]?.id || null
  )
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [noteTitleDraft, setNoteTitleDraft] = useState("")
  const [noteContentDraft, setNoteContentDraft] = useState("")

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

  const handleRemoveContributor = (nameOrEmail: string) => {
    if (project.members.length <= 1) return
    if (onRemoveCollaborator) {
      onRemoveCollaborator(project.id, nameOrEmail)
    } else {
      const updatedMembers = project.members.filter(
        (m) => m.name !== nameOrEmail && m.email !== nameOrEmail
      )
      onUpdateProject({
        ...project,
        members: updatedMembers,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-9 gap-2 rounded-xl bg-card px-3.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos Projetos</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              onUpdateProject({ ...project, isStarred: !project.isStarred })
            }
            className="size-9 rounded-xl bg-card"
            title="Favoritar projeto"
          >
            <Star
              className={cn(
                "w-4 h-4",
                project.isStarred
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-muted-foreground/60"
              )}
            />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateProject({ ...project, isArchived: !project.isArchived })
            }
            className={cn(
              "h-9 gap-1.5 rounded-xl px-3 text-xs font-semibold",
              project.isArchived
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-card"
            )}
            title={
              project.isArchived
                ? "Restaurar projeto para ativos"
                : "Arquivar projeto"
            }
          >
            {project.isArchived ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5 text-amber-500" />
                <span>Restaurar</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Arquivar Projeto</span>
                <span className="sm:hidden">Arquivar</span>
              </>
            )}
          </Button>

          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-9 gap-2 rounded-xl bg-card px-3 text-xs font-semibold"
              title="Alterar cor de destaque do projeto"
            >
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: accentColor }}
              />
              <span className="hidden sm:inline">Cor</span>
              <Palette className="w-3.5 h-3.5" />
            </Button>

            {showColorPicker && (
              <div className="absolute right-0 mt-2 z-30 w-56 rounded-2xl bg-card p-3 shadow-xl border border-border space-y-2.5 animate-in fade-in zoom-in-95">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Cor do projeto
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_ACCENTS.map((color) => (
                    <button
                      key={color}
                      type="button"
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

      {/* Archived Notice Banner */}
      {project.isArchived && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-medium">
            <Archive className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              <strong>Projeto Arquivado:</strong> Este projeto está oculto do painel ativo, mas suas tarefas e histórico continuam preservados.
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => onUpdateProject({ ...project, isArchived: false })}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shrink-0"
          >
            <ArchiveRestore className="w-3.5 h-3.5" />
            <span>Restaurar Projeto</span>
          </Button>
        </div>
      )}

      {/* 2. Hero Project Header */}
      <div className="rounded-[32px] bg-card border border-border/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)] overflow-hidden">
        <div
          className="relative h-32 sm:h-36 w-full p-6 flex items-start justify-end transition-colors"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 78%, #0f172a) 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

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

      {/* 3. Visual Progress Summary Card */}
      <ProjectProgressSummaryCard project={project} tasks={tasks} />

      {/* 4. Tabbed Navigation Bar using shadcn Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "tasks" | "team" | "chat" | "files" | "portal")
        }
        className="gap-5"
      >
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="tasks" className="gap-2 px-3.5 py-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tarefas ({projectTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 px-3.5 py-2">
            <Users className="w-4 h-4" />
            <span>Colaboradores ({project.members.length})</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2 px-3.5 py-2">
            <MessageSquare className="w-4 h-4" />
            <span>Chat ({projectChats.length})</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2 px-3.5 py-2">
            <BookOpen className="w-4 h-4" />
            <span>
              Notas & Arquivos ({(project.notes?.length || 0) + documents.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-2 px-3.5 py-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Portal do Cliente ({project.deliverables?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

      {/* 4. Tab 1: Tasks & Designated Assignees */}
      <TabsContent value="tasks">
        <div className="flex flex-col gap-5">
          <TaskComposer
            project={project}
            assignees={projectAssignees}
            onAddTask={onAddTask}
          />

          <ProjectTaskBoard
            project={project}
            tasks={tasks}
            allProjects={allProjects}
            onToggleTask={onToggleTask}
            onSelectTask={onSelectTask}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onUpdateAssignee={onUpdateTaskAssignee}
            onUpdateStage={onUpdateStage}
            onReorderTasks={onReorderTasks}
            onMoveTask={onMoveTask}
          />
        </div>
      </TabsContent>

      {/* 5. Tab 2: Contributors & Team */}
      <TabsContent value="team">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-card-foreground">
                Colaboradores & Gestão de Acessos
              </h3>
              <p className="text-xs text-muted-foreground">
                Membros da equipe, convites por e-mail e permissões atribuídas a {project.name}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                size="sm"
                className="h-9 gap-1.5 rounded-xl px-4 text-xs font-semibold"
              >
                <Mail className="w-4 h-4" />
                <span>Convidar por E-mail</span>
              </Button>

              <Button
                type="button"
                onClick={() => setShowAddContributor(true)}
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Adicionar da Equipe</span>
                <span className="sm:hidden">Equipe</span>
              </Button>
            </div>
          </div>

          {/* Pending Invitations Section */}
          {project.pendingInvitations && project.pendingInvitations.length > 0 && (
            <div className="rounded-2xl bg-muted/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-card-foreground">
                    Convites pendentes ({project.pendingInvitations.length})
                  </h4>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Aguardando resposta na caixa de notificações
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {project.pendingInvitations.map((inv) => (
                  <Card key={inv.id} className="rounded-2xl shadow-none">
                    <CardContent className="flex items-center justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-card-foreground">
                          {inv.email}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {inv.role} · {inv.sentAt}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {onAcceptInvitationDirect && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onAcceptInvitationDirect(project.id, inv)}
                            className="h-8 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                            title="Aceitar convite de colaboração"
                          >
                            Colaborar
                          </Button>
                        )}
                        {onCancelInvitation && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onCancelInvitation(project.id, inv.id)}
                            className="size-8 text-muted-foreground hover:text-destructive"
                            title="Cancelar convite"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Current Collaborators Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.members.map((member) => {
              const assignedTasks = projectTasks.filter(
                (t) => t.assignee?.name === member.name
              )
              const completedAssigned = assignedTasks.filter((t) => t.completed).length
              const currentStatus: MemberStatus = member.status || "Offline"
              const memberEmail =
                member.email ||
                `${member.name.toLowerCase().replace(/\s+/g, ".")}@kard.dev`

              return (
                <Card key={member.name} className="rounded-2xl">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <MemberAvatarWithStatus
                          avatar={member.avatar}
                          name={member.name}
                          status={currentStatus}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate text-sm font-bold text-card-foreground">
                              {member.name}
                            </h4>
                            {member.name === "Angelina Smith" && (
                              <Badge variant="info" className="px-1.5 py-0 text-[10px]">
                                Você
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.role || "Colaborador"}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/80">
                            {memberEmail}
                          </p>
                        </div>
                      </div>

                      {project.members.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveContributor(member.email || member.name)}
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          title="Remover colaborador do projeto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 p-2.5 text-xs">
                      <MemberStatusBadge status={currentStatus} size="sm" />

                      <ProjectSelectField
                        ariaLabel={`Alterar status de ${member.name}`}
                        value={currentStatus}
                        options={MEMBER_STATUS_OPTIONS}
                        onValueChange={(value) =>
                          handleUpdateMemberStatus(member.name, value as MemberStatus)
                        }
                        triggerClassName="h-8 min-h-8 w-36 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tarefas alocadas</span>
                      <span className="font-semibold tabular-nums text-card-foreground">
                        {completedAssigned} / {assignedTasks.length} concluídas
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Add Contributor Drawer / Quick Selector */}
          {showAddContributor && (
            <div className="rounded-2xl bg-muted/30 p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Adicionar Membro Existente da Equipe
                </h4>
                <button
                  onClick={() => setShowAddContributor(false)}
                  className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {AVAILABLE_CONTRIBUTORS.filter(
                  (c) => !project.members.some((m) => m.name === c.name || m.email === c.email)
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
                          {contributor.role} • {contributor.email}
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
      </TabsContent>

      {/* 6. Tab 3: Project Team Chat with Team Status Indicators */}
      <TabsContent value="chat">
        {(() => {
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
                    <span className="font-semibold">{project.members.length} membros</span>
                    <span>·</span>
                    <span className="font-semibold text-success-foreground">
                      {onlineCount} Online
                    </span>
                    {meetingCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="font-semibold text-warning-foreground">{meetingCount} Em reunião</span>
                      </>
                    )}
                    {focusedCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="font-semibold text-primary">{focusedCount} Em foco</span>
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
              className="p-3 border-t border-border/70 flex items-center gap-2 bg-card"
            >
              <Input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Mensagem para #${project.name.toLowerCase().replace(/\s+/g, "-")}-team...`}
                className="flex-1 h-10 rounded-xl text-xs"
              />
              <Button type="submit" size="sm" className="h-10 px-4 gap-1.5 rounded-xl">
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
          )
        })()}
      </TabsContent>

      {/* 7. Tab 4: Coupled Markdown Notes & Files */}
      <TabsContent value="files">
        <div className="space-y-6">
          {/* Coupled Project Markdown Notes */}
          {(() => {
            const notes: ProjectNote[] = project.notes || []
            const activeNote =
              notes.find((n) => n.id === selectedNoteId) || notes[0] || null

            const startEditingNote = (note: ProjectNote) => {
              setSelectedNoteId(note.id)
              setNoteTitleDraft(note.title)
              setNoteContentDraft(note.contentMarkdown)
              setIsEditingNote(true)
            }

            const handleCreateNote = () => {
              const created: ProjectNote = {
                id: `note-${Date.now()}`,
                title: "Nova nota do projeto",
                contentMarkdown:
                  "## Contexto\n\nEscreva aqui especificações, decisões ou links importantes em Markdown.",
                updatedAt: "Agora",
                author: "Angelina Smith",
              }
              const updatedNotes = [created, ...notes]
              onUpdateProject({ ...project, notes: updatedNotes })
              setSelectedNoteId(created.id)
              setNoteTitleDraft(created.title)
              setNoteContentDraft(created.contentMarkdown)
              setIsEditingNote(true)
            }

            const handleSaveNote = () => {
              if (!activeNote) return
              const updatedNotes = notes.map((n) =>
                n.id === activeNote.id
                  ? {
                      ...n,
                      title: noteTitleDraft.trim() || n.title,
                      contentMarkdown: noteContentDraft,
                      updatedAt: "Agora",
                    }
                  : n
              )
              onUpdateProject({ ...project, notes: updatedNotes })
              setIsEditingNote(false)
            }

            return (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-card-foreground">
                      Notas em Markdown do Projeto
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Documentação acoplada às tarefas de {project.name} sem precisar sair do Kard.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNote}
                    className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                  >
                    <Plus className="size-3.5" />
                    <span>Nova nota Markdown</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
                  <div className="space-y-2 lg:col-span-4">
                    {notes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        Nenhuma nota criada ainda.
                      </div>
                    ) : (
                      notes.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => {
                            setSelectedNoteId(note.id)
                            setIsEditingNote(false)
                          }}
                          className={cn(
                            "w-full rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                            activeNote?.id === note.id
                              ? "border-primary bg-primary-subtle/35"
                              : "border-border bg-card hover:border-border/80"
                          )}
                        >
                          <p className="truncate text-xs font-bold text-foreground">
                            {note.title}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {note.author} · {note.updatedAt}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-8">
                    {activeNote ? (
                      isEditingNote ? (
                        <div className="space-y-3">
                          <Input
                            value={noteTitleDraft}
                            onChange={(e) => setNoteTitleDraft(e.target.value)}
                            className="h-10 rounded-xl text-sm font-bold"
                          />
                          <textarea
                            value={noteContentDraft}
                            onChange={(e) => setNoteContentDraft(e.target.value)}
                            rows={8}
                            className="w-full rounded-xl border border-border bg-muted/20 p-3 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingNote(false)}
                            >
                              <Eye className="size-3.5" />
                              <span>Cancelar</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleSaveNote}
                              className="rounded-xl text-xs font-semibold"
                            >
                              Salvar nota
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                            <div>
                              <h4 className="text-base font-bold text-foreground">
                                {activeNote.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {activeNote.author} · Atualizado {activeNote.updatedAt}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingNote(activeNote)}
                              className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
                            >
                              <Pencil className="size-3.5" />
                              <span>Editar</span>
                            </Button>
                          </div>

                          <MarkdownRenderer content={activeNote.contentMarkdown} />
                        </div>
                      )
                    ) : (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        Selecione ou crie uma nota Markdown para visualizar aqui.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Existing Files & Deliverables List */}
          <div className="space-y-4 border-t border-border/70 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-card-foreground">
                  Arquivos & Anexos
                </h3>
                <p className="text-xs text-muted-foreground">
                  Wireframes Figma, especificações em PDF e pacotes exportados.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => docFileInputRef.current?.click()}
                size="sm"
                className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <Upload className="w-4 h-4" />
                <span>Enviar arquivo</span>
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
                        {doc.size} · {doc.date} · {doc.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
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
        </div>
      </TabsContent>

      {/* 8. Tab 5: Client Portal with Deliverable Approval */}
      <TabsContent value="portal">
        <ClientPortalView
          project={project}
          currentTier={currentTier}
          onOpenPricingModal={onOpenPricingModal}
          onUpdateDeliverableStatus={(projId, delivId, status, feedback) =>
            onUpdateDeliverableStatus?.(projId, delivId, status, feedback)
          }
          onAddDeliverable={(projId, deliverable) =>
            onAddDeliverable?.(projId, deliverable)
          }
        />
      </TabsContent>
      </Tabs>

      {/* Invite Collaborator by Email Modal */}
      <InviteCollaboratorModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        project={project}
        onInviteCollaborator={(projId, email, role) => {
          onInviteCollaborator?.(projId, email, role)
        }}
      />
    </div>
  )
}
