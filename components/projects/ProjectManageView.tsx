"use client"

import React, { useEffect, useState, useRef } from "react"
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
  Link2,
  Download,
  Lock,
  AlertCircle,
} from "lucide-react"
import {
  Project,
  TaskItem,
  Member,
  MemberStatus,
  ProjectChatMessage,
  ProjectDocument,
  ProjectNote,
  ClientDeliverable,
  AVAILABLE_CONTRIBUTORS,
  TaskStage,
  ProjectInvitation,
  ProjectAssetScope,
  ProjectRole,
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
import { ChatMessageStream } from "@/components/chat/ChatMessageStream"
import { SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"
import { useFirebase } from "@/components/auth/FirebaseProvider"
import { DriveLinkModal, type DriveFileItem } from "@/components/workspace/DriveLinkModal"
import { deleteR2Object, getR2SignedDownloadUrl, uploadFileToR2 } from "@/lib/r2Client"
import {
  deleteCloudAssetMetadata,
  saveCloudAssetMetadata,
  updateCloudMemberRole,
} from "@/lib/firestoreSync"
import {
  PROJECT_ROLE_LABELS,
  RBAC_PERMISSION_MATRIX,
  canArchiveOrDeleteProject,
  canDeleteProjectAsset,
  canInviteRole,
  canManageProjectSettings,
  canManageRoles,
  canPublishDeliverable,
  canRemoveMember,
  canUploadAssetScope,
  getMemberProjectRole,
  resolveUserProjectRole,
} from "@/lib/rbac"
import { cn } from "@/lib/utils"

function createClientAssetId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

interface ProjectManageViewProps {
  project: Project
  tasks: TaskItem[]
  allProjects?: Project[]
  currentTier?: SubscriptionPlanTier
  userStatus?: MemberStatus
  userStatusNote?: string
  initialTab?: "tasks" | "team" | "chat" | "files" | "portal"
  initialNoteId?: string | null
  onOpenPricingModal?: () => void
  onOpenSettings?: () => void
  onBack: () => void
  onUpdateProject: (updated: Project) => void
  onSaveNote?: (projectId: string, note: ProjectNote, isNew: boolean) => void
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
  onAddTask: (newTask: Omit<TaskItem, "id" | "number">) => void
  onDeleteTask?: (id: string) => void
  onUpdateTaskAssignee?: (taskId: string, assignee: Member) => void
  onUpdateStage?: (taskId: string, stage: TaskStage) => void
  onReorderTasks?: (tasks: TaskItem[]) => void
  onMoveTask?: (taskId: string, targetStage?: TaskStage, targetProject?: string) => void
  onInviteCollaborator?: (
    projectId: string,
    email: string,
    role: string,
    projectRole?: ProjectRole
  ) => void
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

export function ProjectManageView({
  project,
  tasks,
  allProjects = [],
  currentTier = "free",
  userStatus = "Online",
  userStatusNote = "",
  initialTab = "tasks",
  initialNoteId = null,
  onOpenPricingModal,
  onOpenSettings,
  onBack,
  onUpdateProject,
  onSaveNote,
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
  const { user, r2Configured, workspaceAccessToken, connectWorkspace } = useFirebase()
  const currentRole = resolveUserProjectRole(project, user?.uid, user?.email)
  const currentActorName =
    user?.displayName || user?.email?.split("@")[0] || "Angelina Smith"
  const currentActorAvatar = user?.photoURL || "/avatars/angelina.jpg"

  const [activeTab, setActiveTab] = useState<"tasks" | "team" | "chat" | "files" | "portal">(initialTab)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false)
  const [uploadScope, setUploadScope] = useState<ProjectAssetScope>("internal")
  const [isUploadingAsset, setIsUploadingAsset] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [assetActionError, setAssetActionError] = useState<string | null>(null)
  const [resolvedCover, setResolvedCover] = useState<{ key: string; url: string } | null>(null)
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

  useEffect(() => {
    const coverKey = project.coverAssetKey
    if (!coverKey || project.customImage || !user || !r2Configured) return
    let cancelled = false
    getR2SignedDownloadUrl(project.id, coverKey)
      .then((url) => {
        if (!cancelled) {
          setResolvedCover({ key: coverKey, url })
        }
      })
      .catch(() => {
        // Ignore transient R2 signing failure for cover thumbnail
      })
    return () => {
      cancelled = true
    }
  }, [project.id, project.coverAssetKey, project.customImage, user, r2Configured])

  // Chat state
  const [projectChats, setProjectChats] = useState<ProjectChatMessage[]>(
    project.chatMessages || [
      {
        id: "msg-default-1",
        user: currentActorName,
        avatar: currentActorAvatar,
        role: PROJECT_ROLE_LABELS[currentRole],
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

  // Documents state (prefers live cloud/project documents if present)
  const [localDefaultDocs, setLocalDefaultDocs] = useState<ProjectDocument[]>([
    {
      id: "doc-1",
      name: `${project.name.replace(/\s+/g, "_")}_Deliverables_v1.fig`,
      size: "18.4 MB",
      date: "Ontem",
      type: "FIGMA",
      source: "local",
      scope: "deliverable",
    },
    {
      id: "doc-2",
      name: "Technical_Specifications.pdf",
      size: "3.2 MB",
      date: "3 dias atrás",
      type: "PDF",
      source: "local",
      scope: "internal",
    },
  ])
  const documents = project.ownerId
    ? project.documents || []
    : project.documents ?? localDefaultDocs

  const displayedCoverImage =
    project.customImage ||
    (project.coverAssetKey && resolvedCover?.key === project.coverAssetKey
      ? resolvedCover.url
      : undefined)

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

  const formatBytesLabel = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
    return `${bytes} B`
  }

  // Handle uploading cover/logo image (R2 presigned upload when authenticated & configured, otherwise local preview)
  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !canUploadAssetScope(currentRole, "cover")) return

    setAssetActionError(null)
    if (user && r2Configured) {
      setIsUploadingAsset(true)
      setUploadProgress(5)
      try {
        const uploaded = await uploadFileToR2(project.id, file, "cover", setUploadProgress)
        const signedPreviewUrl = await getR2SignedDownloadUrl(project.id, uploaded.r2Key)
        setResolvedCover({ key: uploaded.r2Key, url: signedPreviewUrl })
        await saveCloudAssetMetadata(user, project.id, project.ownerId || user.uid, {
          id: uploaded.assetId,
          source: "r2",
          scope: "cover",
          r2Key: uploaded.r2Key,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
        })
        onUpdateProject({
          ...project,
          coverAssetKey: uploaded.r2Key,
          customImage: signedPreviewUrl.length <= 1000 ? signedPreviewUrl : undefined,
          logo: "custom",
        })
      } catch (err) {
        setAssetActionError(
          err instanceof Error ? err.message : "Falha ao enviar capa para o Cloudflare R2."
        )
      } finally {
        setIsUploadingAsset(false)
        setUploadProgress(0)
      }
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setAssetActionError("Para salvar localmente sem R2, escolha uma imagem de até 2 MB.")
      return
    }

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

  // Handle document upload to Cloudflare R2 private bucket (or local fallback if guest/unconfigured)
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const effectiveScope: ProjectAssetScope = canUploadAssetScope(currentRole, uploadScope)
      ? uploadScope
      : "internal"

    setAssetActionError(null)
    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE"

    if (user && r2Configured) {
      setIsUploadingAsset(true)
      setUploadProgress(5)
      try {
        const uploaded = await uploadFileToR2(
          project.id,
          file,
          effectiveScope,
          setUploadProgress
        )
        await saveCloudAssetMetadata(user, project.id, project.ownerId || user.uid, {
          id: uploaded.assetId,
          source: "r2",
          scope: effectiveScope,
          r2Key: uploaded.r2Key,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
        })

        const newDoc: ProjectDocument = {
          id: uploaded.assetId,
          name: uploaded.fileName,
          size: formatBytesLabel(uploaded.sizeBytes),
          sizeBytes: uploaded.sizeBytes,
          date: "Agora · R2",
          type: ext,
          mimeType: uploaded.mimeType,
          source: "r2",
          scope: effectiveScope,
          r2Key: uploaded.r2Key,
          uploadedBy: user.uid,
          uploadedByName: user.displayName || user.email || "Você",
        }
        const updatedDocs = [newDoc, ...documents]
        setLocalDefaultDocs(updatedDocs)
        onUpdateProject({
          ...project,
          documents: updatedDocs,
          attachmentsCount: updatedDocs.length,
        })
      } catch (err) {
        setAssetActionError(
          err instanceof Error ? err.message : "Erro ao enviar arquivo para o Cloudflare R2."
        )
      } finally {
        setIsUploadingAsset(false)
        setUploadProgress(0)
      }
      return
    }

    if (user && !r2Configured) {
      setAssetActionError(
        "Segredos R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME não configurados no servidor. Registro salvo apenas localmente."
      )
    }

    const newDoc: ProjectDocument = {
      id: createClientAssetId("doc"),
      name: file.name,
      size: formatBytesLabel(file.size),
      sizeBytes: file.size,
      date: "Agora · Local",
      type: ext,
      mimeType: file.type,
      source: "local",
      scope: effectiveScope,
      uploadedBy: user?.uid,
    }

    const updatedDocs = [newDoc, ...documents]
    setLocalDefaultDocs(updatedDocs)
    onUpdateProject({
      ...project,
      documents: updatedDocs,
      attachmentsCount: updatedDocs.length,
    })
  }

  const handleLinkDriveFile = async (file: DriveFileItem, scope: ProjectAssetScope) => {
    setAssetActionError(null)
    const assetId = createClientAssetId("drv")
    const effectiveScope: ProjectAssetScope = canUploadAssetScope(currentRole, scope)
      ? scope
      : "internal"
    const sizeBytes = Number(file.size || 0)

    if (user) {
      try {
        await saveCloudAssetMetadata(user, project.id, project.ownerId || user.uid, {
          id: assetId,
          source: "google_drive",
          scope: effectiveScope,
          driveFileId: file.id,
          driveExternalUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
          fileName: file.name,
          mimeType: file.mimeType || "application/vnd.google-apps.file",
          sizeBytes,
        })
      } catch (err) {
        setAssetActionError(
          err instanceof Error ? err.message : "Falha ao salvar vínculo do Drive no Firestore."
        )
      }
    }

    const newDoc: ProjectDocument = {
      id: assetId,
      name: file.name,
      size: sizeBytes > 0 ? formatBytesLabel(sizeBytes) : "Drive",
      sizeBytes,
      date: "Google Drive",
      type: "DRIVE",
      mimeType: file.mimeType,
      source: "google_drive",
      scope: effectiveScope,
      driveFileId: file.id,
      driveExternalUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      uploadedBy: user?.uid,
      uploadedByName: user?.displayName || user?.email || "Você",
    }

    const updatedDocs = [newDoc, ...documents]
    setLocalDefaultDocs(updatedDocs)
    onUpdateProject({
      ...project,
      documents: updatedDocs,
      attachmentsCount: updatedDocs.length,
    })
  }

  const triggerExternalNavigation = (url: string) => {
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  const handleOpenOrDownloadDoc = async (docItem: ProjectDocument) => {
    setAssetActionError(null)
    if (docItem.source === "google_drive" && docItem.driveExternalUrl) {
      triggerExternalNavigation(docItem.driveExternalUrl)
      return
    }
    if (docItem.source === "r2" && docItem.r2Key) {
      try {
        const signedUrl = await getR2SignedDownloadUrl(project.id, docItem.r2Key)
        triggerExternalNavigation(signedUrl)
      } catch (err) {
        setAssetActionError(
          err instanceof Error ? err.message : "Permissão negada ao gerar link de download R2."
        )
      }
      return
    }
    setAssetActionError("Arquivo de demonstração local (não possui blob na nuvem).")
  }

  const handleDeleteDoc = async (docItem: ProjectDocument) => {
    if (!canDeleteProjectAsset(currentRole, docItem, user?.uid)) {
      setAssetActionError("Seu cargo permite excluir apenas os arquivos que você enviou.")
      return
    }
    setAssetActionError(null)

    try {
      if (user && docItem.source === "r2") {
        await deleteR2Object(project.id, docItem.id, docItem.r2Key)
      }
      if (user && (docItem.source === "r2" || docItem.source === "google_drive")) {
        await deleteCloudAssetMetadata(project.id, docItem.id)
      }
      const updatedDocs = documents.filter((d) => d.id !== docItem.id)
      setLocalDefaultDocs(updatedDocs)
      onUpdateProject({
        ...project,
        documents: updatedDocs,
        attachmentsCount: updatedDocs.length,
      })
    } catch (err) {
      setAssetActionError(
        err instanceof Error ? err.message : "Falha ao remover arquivo."
      )
    }
  }

  const handleChangeMemberRole = async (member: Member, nextRole: ProjectRole) => {
    if (!canManageRoles(currentRole)) return
    if (user && member.uid) {
      try {
        await updateCloudMemberRole(
          project.id,
          member.uid,
          nextRole,
          PROJECT_ROLE_LABELS[nextRole]
        )
      } catch (err) {
        setAssetActionError(
          err instanceof Error ? err.message : "Erro ao atualizar cargo no Firestore."
        )
        return
      }
    }
    const updatedMembers = project.members.map((m) =>
      (member.uid && m.uid === member.uid) || m.name === member.name
        ? { ...m, projectRole: nextRole, role: PROJECT_ROLE_LABELS[nextRole] }
        : m
    )
    onUpdateProject({
      ...project,
      members: updatedMembers,
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
  const handleSendChatMessage = (payload: {
    text: string
    replyTo?: ProjectChatMessage["replyTo"]
  }) => {
    const nowLabel = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const newMsg: ProjectChatMessage = {
      id: createClientAssetId("chat"),
      user: currentActorName,
      avatar: currentActorAvatar,
      role: PROJECT_ROLE_LABELS[currentRole],
      text: payload.text,
      time: `Hoje às ${nowLabel}`,
      isMe: true,
      userStatus,
      replyTo: payload.replyTo,
    }

    const updated = [...projectChats, newMsg]
    setProjectChats(updated)
    onUpdateProject({
      ...project,
      chatMessages: updated,
    })
  }

  const handleToggleChatReaction = (messageId: string, emoji: string) => {
    const updated = projectChats.map((msg) => {
      if (msg.id !== messageId) return msg
      const existingList = msg.reactions || []
      const existing = existingList.find((r) => r.emoji === emoji)
      let nextReactions
      if (!existing) {
        nextReactions = [...existingList, { emoji, count: 1, reactedByMe: true }]
      } else if (existing.reactedByMe) {
        nextReactions =
          existing.count <= 1
            ? existingList.filter((r) => r.emoji !== emoji)
            : existingList.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, reactedByMe: false }
                  : r
              )
      } else {
        nextReactions = existingList.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, reactedByMe: true }
            : r
        )
      }
      return { ...msg, reactions: nextReactions }
    })

    setProjectChats(updated)
    onUpdateProject({
      ...project,
      chatMessages: updated,
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

          {canArchiveOrDeleteProject(currentRole) && (
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
          )}

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
          {canUploadAssetScope(currentRole, "cover") && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative z-10 inline-flex items-center gap-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{r2Configured && user ? "Enviar Capa (R2)" : "Upload Device Logo / Image"}</span>
            </button>
          )}

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
              <button
                type="button"
                disabled={!canUploadAssetScope(currentRole, "cover")}
                className="relative group h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-card border-4 border-card shadow-xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer disabled:cursor-default"
                onClick={() => {
                  if (canUploadAssetScope(currentRole, "cover")) {
                    fileInputRef.current?.click()
                  }
                }}
                title="Alterar imagem de capa do projeto"
                aria-label="Alterar imagem de capa do projeto"
              >
                {displayedCoverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={displayedCoverImage}
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

                {canUploadAssetScope(currentRole, "cover") && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-center p-1">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">Alterar</span>
                  </div>
                )}
              </button>

              <div className="pt-2">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
                    {project.name}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {project.company} · Seu cargo: <strong className="text-foreground">{PROJECT_ROLE_LABELS[currentRole]}</strong>
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
              {canInviteRole(currentRole, "colaborador") ? (
                <>
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
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  <span>Somente Owner/Gestor convidam</span>
                </span>
              )}
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
              const isSelf =
                (user?.uid && member.uid === user.uid) ||
                (user?.email && member.email?.toLowerCase() === user.email.toLowerCase()) ||
                (!user && member.name === "Angelina Smith")
              const currentStatus: MemberStatus = isSelf
                ? userStatus
                : member.status || "Offline"
              const currentStatusNote = isSelf ? userStatusNote : member.statusNote
              const memberEmail =
                member.email ||
                `${member.name.toLowerCase().replace(/\s+/g, ".")}@kard.dev`
              const memberRbacRole = getMemberProjectRole(member, project.ownerId)

              return (
                <Card key={member.uid || member.email || member.name} className="rounded-2xl">
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
                            {isSelf && (
                              <Badge variant="info" className="px-1.5 py-0 text-[10px]">
                                Você
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {PROJECT_ROLE_LABELS[memberRbacRole]} · {member.role || "Membro"}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/80">
                            {memberEmail}
                          </p>
                        </div>
                      </div>

                      {project.members.length > 1 &&
                        canRemoveMember(currentRole, memberRbacRole) && (
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

                    {canManageRoles(currentRole) && memberRbacRole !== "owner" && (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/25 p-2.5 text-xs">
                        <span className="font-medium text-muted-foreground">Cargo RBAC</span>
                        <ProjectSelectField
                          ariaLabel={`Alterar cargo RBAC de ${member.name}`}
                          value={memberRbacRole}
                          options={[
                            {
                              value: "gestor",
                              label: PROJECT_ROLE_LABELS.gestor,
                              indicatorClassName: "bg-primary",
                            },
                            {
                              value: "colaborador",
                              label: PROJECT_ROLE_LABELS.colaborador,
                              indicatorClassName: "bg-success",
                            },
                          ]}
                          onValueChange={(value) =>
                            handleChangeMemberRole(member, value as ProjectRole)
                          }
                          triggerClassName="h-8 min-h-8 w-36 rounded-lg text-xs"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 p-2.5 text-xs">
                      <MemberStatusBadge status={currentStatus} size="sm" />

                      {isSelf && onOpenSettings ? (
                        <button
                          type="button"
                          onClick={onOpenSettings}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Definir em Configurações
                        </button>
                      ) : (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {currentStatusNote || "Definido pelo usuário"}
                        </span>
                      )}
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
                  type="button"
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
                  <button
                    type="button"
                    key={contributor.name}
                    onClick={() => handleAddContributorToProject(contributor)}
                    className="flex w-full items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary cursor-pointer transition-all text-left"
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Authoritative RBAC Matrix (Firestore & Cloudflare R2) */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Matriz de Permissões · Firestore & Cloudflare R2
                </h4>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Seu cargo atual: <strong className="text-foreground">{PROJECT_ROLE_LABELS[currentRole]}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground">
                    <th className="px-4 py-2.5">Recurso / Ação</th>
                    <th className="px-4 py-2.5">Owner do projeto</th>
                    <th className="px-4 py-2.5">Gestor</th>
                    <th className="px-4 py-2.5">Colaborador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {RBAC_PERMISSION_MATRIX.map((row) => (
                    <tr key={row.capability} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {row.capability}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.owner}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.gestor}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.colaborador}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* 6. Tab 3: Project Team Chat (Kard Cozy/Compact Stream with Markdown, @mentions & #files) */}
      <TabsContent value="chat">
        <ChatMessageStream
          channelName={`${project.name.toLowerCase().replace(/\s+/g, "-")}-team`}
          accentColor={accentColor}
          messages={projectChats}
          members={project.members}
          projectFiles={documents}
          currentUserName={currentActorName}
          currentUserAvatar={currentActorAvatar}
          currentUserStatus={userStatus}
          currentUserStatusNote={userStatusNote}
          onSendMessage={handleSendChatMessage}
          onToggleReaction={handleToggleChatReaction}
          onOpenFile={() => setActiveTab("files")}
          onOpenSettings={onOpenSettings}
        />
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
                author: currentActorName,
              }
              const updatedNotes = [created, ...notes]
              onUpdateProject({ ...project, notes: updatedNotes })
              onSaveNote?.(project.id, created, true)
              setSelectedNoteId(created.id)
              setNoteTitleDraft(created.title)
              setNoteContentDraft(created.contentMarkdown)
              setIsEditingNote(true)
            }

            const handleSaveNote = () => {
              if (!activeNote) return
              const updatedNote: ProjectNote = {
                ...activeNote,
                title: noteTitleDraft.trim() || activeNote.title,
                contentMarkdown: noteContentDraft,
                updatedAt: "Agora",
              }
              const updatedNotes = notes.map((n) =>
                n.id === activeNote.id ? updatedNote : n
              )
              onUpdateProject({ ...project, notes: updatedNotes })
              onSaveNote?.(project.id, updatedNote, false)
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

          {/* Cloudflare R2 Private Files & Google Drive Links */}
          <div className="space-y-4 border-t border-border/70 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-card-foreground">
                  Arquivos Privados (Cloudflare R2) & Google Drive
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bucket privado com URLs pré-assinadas por cargo ({PROJECT_ROLE_LABELS[currentRole]}) ou vínculos do Google Drive.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ProjectSelectField
                  ariaLabel="Escopo do anexo"
                  value={canUploadAssetScope(currentRole, uploadScope) ? uploadScope : "internal"}
                  options={[
                    {
                      value: "internal",
                      label: "Escopo: Interno",
                      indicatorClassName: "bg-info",
                    },
                    ...(canUploadAssetScope(currentRole, "deliverable")
                      ? [
                          {
                            value: "deliverable",
                            label: "Escopo: Entregável",
                            indicatorClassName: "bg-success",
                          },
                        ]
                      : []),
                  ]}
                  onValueChange={(val) => setUploadScope(val as ProjectAssetScope)}
                  triggerClassName="h-9 min-h-9 w-40 rounded-xl text-xs"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDriveModalOpen(true)}
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Link2 className="w-4 h-4 text-primary" />
                  <span>Vincular Drive</span>
                </Button>

                <Button
                  type="button"
                  disabled={isUploadingAsset}
                  onClick={() => docFileInputRef.current?.click()}
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingAsset ? `Enviando ${uploadProgress}%` : "Enviar arquivo"}</span>
                </Button>
              </div>

              <input
                type="file"
                ref={docFileInputRef}
                onChange={handleDocUpload}
                className="hidden"
              />
            </div>

            {isUploadingAsset && (
              <div className="space-y-1.5 rounded-2xl border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Enviando objeto via URL pré-assinada para o Cloudflare R2...
                  </span>
                  <span className="font-mono font-bold tabular-nums text-primary">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {assetActionError && (
              <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-subtle/60 p-3 text-xs text-foreground">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                <span>{assetActionError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((docItem) => {
                const canDelete = canDeleteProjectAsset(currentRole, docItem, user?.uid)
                const sourceLabel =
                  docItem.source === "r2"
                    ? "R2 Privado"
                    : docItem.source === "google_drive"
                    ? "Google Drive"
                    : "Local"
                const scopeLabel =
                  docItem.scope === "deliverable"
                    ? "Entregável"
                    : docItem.scope === "cover"
                    ? "Capa"
                    : "Interno"

                return (
                  <div
                    key={docItem.id}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-primary shrink-0 border border-border">
                        {docItem.source === "google_drive" ? (
                          <Link2 className="w-5 h-5" />
                        ) : (
                          <Paperclip className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-card-foreground truncate">
                          {docItem.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono tabular-nums truncate">
                          {docItem.size} · {sourceLabel} · {scopeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenOrDownloadDoc(docItem)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title={
                          docItem.source === "r2"
                            ? "Gerar link pré-assinado e baixar"
                            : "Abrir arquivo"
                        }
                      >
                        {docItem.source === "r2" ? (
                          <Download className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(docItem)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Excluir arquivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* 8. Tab 5: Client Portal with Deliverable Approval */}
      <TabsContent value="portal">
        <ClientPortalView
          project={project}
          currentTier={currentTier}
          canPublishDeliverables={canPublishDeliverable(currentRole)}
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
        actorRole={currentRole}
        onInviteCollaborator={(projId, email, role, projectRole) => {
          onInviteCollaborator?.(projId, email, role, projectRole)
        }}
      />

      {/* Google Drive File Link Modal */}
      <DriveLinkModal
        open={isDriveModalOpen}
        onOpenChange={setIsDriveModalOpen}
        projectName={project.name}
        allowedScope={canUploadAssetScope(currentRole, uploadScope) ? uploadScope : "internal"}
        workspaceAccessToken={workspaceAccessToken}
        onConnectWorkspace={connectWorkspace}
        onSelectDriveFile={handleLinkDriveFile}
      />
    </div>
  )
}
