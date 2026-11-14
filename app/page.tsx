"use client"

import React, { useState, useEffect, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sidebar, NavItemKey } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { ProjectCard } from "@/components/ProjectCard"
import { MyTasksCard } from "@/components/MyTasksCard"
import { TimeTrackerCard } from "@/components/TimeTrackerCard"
import { CalendarWidget } from "@/components/CalendarWidget"
import { MessageWidget } from "@/components/MessageWidget"
import { NewTaskModal } from "@/components/NewTaskModal"
import { QuickChatModal } from "@/components/QuickChatModal"
import { CommandPalette } from "@/components/CommandPalette"
import { ProjectsView } from "@/components/projects/ProjectsView"
import { MorningBriefingCard } from "@/components/dashboard/MorningBriefingCard"
import { TaskInspectorDrawer } from "@/components/tasks/TaskInspectorDrawer"
import { AutomationsPanel } from "@/components/automations/AutomationsPanel"
import {
  Project,
  TaskItem,
  Member,
  TrackedTimer,
  ChatMessage,
  NotificationItem,
  TaskStage,
  ProjectInvitation,
  CalendarEvent,
  AutomationRule,
  AutomationLog,
  ClientDeliverable,
  AutomationTriggerType,
} from "@/lib/data"
import { evaluateAutomationRules } from "@/lib/automations"
import {
  getOnlineSnapshot,
  getServerOnlineSnapshot,
  getServerWorkspaceSnapshot,
  getWorkspaceSnapshot,
  hydrateWorkspaceFromStorage,
  resetWorkspaceStore,
  subscribeNetworkStatus,
  subscribeWorkspace,
  updateWorkspaceStore,
} from "@/lib/storage"
import { PricingPlansModal, SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"
import { FocusModeView } from "@/components/focus/FocusModeView"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun, RotateCcw, HardDrive, WifiOff, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { toggleTheme } = useTheme()

  // Navigation State
  const [activeNav, setActiveNav] = useState<NavItemKey>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [managingProjectId, setManagingProjectId] = useState<string | null>(null)
  const [projectInitialTab, setProjectInitialTab] = useState<
    "tasks" | "team" | "chat" | "files" | "portal"
  >("tasks")
  const [projectInitialNoteId, setProjectInitialNoteId] = useState<string | null>(null)

  // Local-first external workspace & network connectivity stores (hydration-safe)
  const workspace = useSyncExternalStore(
    subscribeWorkspace,
    getWorkspaceSnapshot,
    getServerWorkspaceSnapshot
  )
  const isOnline = useSyncExternalStore(
    subscribeNetworkStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  )
  const isOffline = !isOnline

  const {
    projects,
    tasks,
    timers,
    messages,
    notifications,
    calendarEvents,
    automationRules,
    automationLogs,
    userTier,
    briefingCollapsed,
    lastSavedAt,
  } = workspace

  const [freeLimitNotice, setFreeLimitNotice] = useState<string | null>(null)

  // Modal, Plan, Inspector & Search States
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [selectedChatUser, setSelectedChatUser] = useState<ChatMessage | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  // Store-backed state updaters (automatically persist to localStorage)
  const setProjects = (updater: Project[] | ((prev: Project[]) => Project[])) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      projects: typeof updater === "function" ? updater(prev.projects) : updater,
    }))

  const setTasks = (updater: TaskItem[] | ((prev: TaskItem[]) => TaskItem[])) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      tasks: typeof updater === "function" ? updater(prev.tasks) : updater,
    }))

  const setTimers = (
    updater: TrackedTimer[] | ((prev: TrackedTimer[]) => TrackedTimer[])
  ) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      timers: typeof updater === "function" ? updater(prev.timers) : updater,
    }))

  const setMessages = (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      messages: typeof updater === "function" ? updater(prev.messages) : updater,
    }))

  const setNotifications = (
    updater: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])
  ) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      notifications:
        typeof updater === "function" ? updater(prev.notifications) : updater,
    }))

  const setCalendarEvents = (
    updater: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])
  ) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      calendarEvents:
        typeof updater === "function" ? updater(prev.calendarEvents) : updater,
    }))

  const setAutomationRules = (
    updater: AutomationRule[] | ((prev: AutomationRule[]) => AutomationRule[])
  ) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      automationRules:
        typeof updater === "function" ? updater(prev.automationRules) : updater,
    }))

  const setAutomationLogs = (
    updater: AutomationLog[] | ((prev: AutomationLog[]) => AutomationLog[])
  ) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      automationLogs:
        typeof updater === "function" ? updater(prev.automationLogs) : updater,
    }))

  const setUserTier = (tier: SubscriptionPlanTier) =>
    updateWorkspaceStore((prev) => ({ ...prev, userTier: tier }))

  const setBriefingCollapsed = (updater: boolean | ((prev: boolean) => boolean)) =>
    updateWorkspaceStore((prev) => ({
      ...prev,
      briefingCollapsed:
        typeof updater === "function" ? updater(prev.briefingCollapsed) : updater,
    }))

  // Hydrate workspace from localStorage once on mount (zero SSR hydration mismatch)
  useEffect(() => {
    hydrateWorkspaceFromStorage()
  }, [])

  // Live Timer Interval (Chronometer ticks up every second when any timer is running)
  const isAnyTimerRunning = timers.some((t) => t.isRunning)
  useEffect(() => {
    if (!isAnyTimerRunning) return

    const interval = setInterval(() => {
      updateWorkspaceStore((prev) => ({
        ...prev,
        timers: prev.timers.map((t) =>
          t.isRunning ? { ...t, secondsElapsed: t.secondsElapsed + 1 } : t
        ),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isAnyTimerRunning])

  // Helper to evaluate natural-language automation rules synchronously
  const runAutomationsForEvent = (
    eventType: AutomationTriggerType,
    eventValue: string | undefined,
    targetLabel: string,
    taskId?: string
  ) => {
    const timestampLabel = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const result = evaluateAutomationRules(
      automationRules,
      { eventType, eventValue, targetLabel, taskId },
      timestampLabel
    )
    if (result.newLogs.length > 0) {
      setAutomationRules(result.updatedRules)
      setAutomationLogs((prev) => [...result.newLogs, ...prev])
    }
    if (result.newNotifications.length > 0) {
      setNotifications((prev) => [...result.newNotifications, ...prev])
    }
    if (result.taskPatches.length > 0) {
      setTasks((prev) =>
        prev.map((t) => {
          const patch = result.taskPatches.find((p) => p.taskId === t.id)
          if (!patch) return t
          return {
            ...t,
            completed: patch.completed ?? t.completed,
            stage: patch.stage ?? t.stage,
            priority: patch.priority ?? t.priority,
          }
        })
      )
    }
  }

  // Handle toggling task completion
  const handleToggleTask = (id: string) => {
    const target = tasks.find((t) => t.id === id)
    if (!target) return

    const updatedCompleted = !target.completed
    const diff = updatedCompleted ? 1 : -1

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: updatedCompleted,
              stage: updatedCompleted ? "DONE" : t.stage === "DONE" ? "IN PROGRESS" : t.stage,
            }
          : t
      )
    )

    setProjects((pList) =>
      pList.map((p) => {
        if (p.name.toLowerCase() === target.project.toLowerCase()) {
          return {
            ...p,
            completedTasks: Math.max(0, Math.min(p.totalTasks, p.completedTasks + diff)),
          }
        }
        return p
      })
    )

    if (updatedCompleted) {
      runAutomationsForEvent("task_completed", "true", target.title, target.id)
    }
  }

  // Handle full task edit from Rich Markdown Task Inspector Drawer
  const handleUpdateTask = (updatedTask: TaskItem) => {
    const previous = tasks.find((t) => t.id === updatedTask.id)
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))

    if (previous && previous.completed !== updatedTask.completed) {
      const diff = updatedTask.completed ? 1 : -1
      setProjects((pList) =>
        pList.map((p) => {
          if (p.name.toLowerCase() === updatedTask.project.toLowerCase()) {
            return {
              ...p,
              completedTasks: Math.max(0, Math.min(p.totalTasks, p.completedTasks + diff)),
            }
          }
          return p
        })
      )
      if (updatedTask.completed) {
        runAutomationsForEvent("task_completed", "true", updatedTask.title, updatedTask.id)
      }
    }

    if (previous && previous.stage !== updatedTask.stage && updatedTask.stage) {
      runAutomationsForEvent(
        "stage_change",
        updatedTask.stage,
        updatedTask.title,
        updatedTask.id
      )
    }

    if (
      previous &&
      previous.priority !== updatedTask.priority &&
      updatedTask.priority === "High"
    ) {
      runAutomationsForEvent("priority_high", "High", updatedTask.title, updatedTask.id)
    }
  }

  // Handle adding a new task
  const handleAddTask = (newTaskData: Omit<TaskItem, "id" | "number">) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      number: "01",
    }

    setTasks((prev) =>
      [newTask, ...prev].map((t, idx) => ({
        ...t,
        number: String(idx + 1).padStart(2, "0"),
      }))
    )

    // Update project total task count
    setProjects((prev) =>
      prev.map((p) => {
        if (p.name.toLowerCase() === newTask.project.toLowerCase()) {
          return {
            ...p,
            totalTasks: p.totalTasks + 1,
            completedTasks: newTask.completed ? p.completedTasks + 1 : p.completedTasks,
          }
        }
        return p
      })
    )
  }

  // Handle adding a new project (with 3-active-project Free limit enforcement)
  const handleAddProject = (
    newProjectData: Omit<Project, "id" | "completedTasks">,
    initialTasks?: Omit<TaskItem, "id" | "number">[]
  ) => {
    const activeCount = projects.filter((p) => !p.isArchived).length
    if (userTier === "free" && activeCount >= 3 && !newProjectData.isArchived) {
      setFreeLimitNotice(
        "O plano Kard Free permite até 3 projetos ativos. Arquive um projeto ou faça upgrade para criar novos."
      )
      setIsPricingModalOpen(true)
      return
    }

    const newProject: Project = {
      ...newProjectData,
      id: `proj-${Date.now()}`,
      completedTasks: 0,
      portalEnabled: true,
      portalShareCode: newProjectData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      notes: newProjectData.notes || [],
      deliverables: newProjectData.deliverables || [],
    }
    setProjects((prev) => [newProject, ...prev])
    setFreeLimitNotice(null)

    if (initialTasks && initialTasks.length > 0) {
      const createdTasks: TaskItem[] = initialTasks.map((t, idx) => ({
        ...t,
        id: `task-${Date.now()}-${idx}`,
        number: String(idx + 1).padStart(2, "0"),
      }))
      setTasks((prev) =>
        [...createdTasks, ...prev].map((t, idx) => ({
          ...t,
          number: String(idx + 1).padStart(2, "0"),
        }))
      )
    }
  }

  // Handle updating an existing project (enforcing 3-active-project limit when restoring from archive)
  const handleUpdateProject = (updated: Project) => {
    const prevProject = projects.find((p) => p.id === updated.id)
    if (prevProject?.isArchived && !updated.isArchived && userTier === "free") {
      const activeCount = projects.filter((p) => !p.isArchived).length
      if (activeCount >= 3) {
        setFreeLimitNotice(
          "Limite de 3 projetos ativos no Kard Free atingido. Arquive outro projeto antes de restaurar este."
        )
        return
      }
    }
    setFreeLimitNotice(null)
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId)
    setTasks((prev) =>
      prev
        .filter((t) => t.id !== taskId)
        .map((t, idx) => ({
          ...t,
          number: String(idx + 1).padStart(2, "0"),
        }))
    )

    if (target) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.name.toLowerCase() === target.project.toLowerCase()) {
            return {
              ...p,
              totalTasks: Math.max(0, p.totalTasks - 1),
              completedTasks: target.completed
                ? Math.max(0, p.completedTasks - 1)
                : p.completedTasks,
            }
          }
          return p
        })
      )
    }
  }

  // Handle updating task assignee
  const handleUpdateTaskAssignee = (taskId: string, assignee: Member) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assignee } : t))
    )
  }

  // Handle reordering tasks array (DnD within list/dashboard) - automatically updates task numbers
  const handleReorderTasks = (newTasks: TaskItem[]) => {
    const reindexed = newTasks.map((t, idx) => ({
      ...t,
      number: String(idx + 1).padStart(2, "0"),
    }))
    setTasks(reindexed)
  }

  // Handle moving a task across workflow stages or to another project (DnD)
  const handleMoveTask = (
    taskId: string,
    targetStage?: TaskStage,
    targetProject?: string
  ) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const prevProject = task.project
    const prevCompleted = task.completed
    const isNowDone = targetStage ? targetStage === "DONE" : prevCompleted
    const newStage = targetStage || task.stage
    const newProject = targetProject || task.project

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              stage: newStage,
              completed: isNowDone,
              project: newProject,
            }
          : t
      )
    )

    // Update project statistics if project ownership or completion changed
    if (
      prevProject.toLowerCase() !== newProject.toLowerCase() ||
      prevCompleted !== isNowDone
    ) {
      setProjects((projList) =>
        projList.map((p) => {
          const updated = { ...p }
          // Leaving old project
          if (
            p.name.toLowerCase() === prevProject.toLowerCase() &&
            prevProject.toLowerCase() !== newProject.toLowerCase()
          ) {
            updated.totalTasks = Math.max(0, updated.totalTasks - 1)
            if (prevCompleted) {
              updated.completedTasks = Math.max(0, updated.completedTasks - 1)
            }
          }
          // Entering new project
          if (
            p.name.toLowerCase() === newProject.toLowerCase() &&
            prevProject.toLowerCase() !== newProject.toLowerCase()
          ) {
            updated.totalTasks = updated.totalTasks + 1
            if (isNowDone) {
              updated.completedTasks = updated.completedTasks + 1
            }
          }
          // Same project, status flipped
          if (
            p.name.toLowerCase() === newProject.toLowerCase() &&
            prevProject.toLowerCase() === newProject.toLowerCase()
          ) {
            if (prevCompleted !== isNowDone) {
              const diff = isNowDone ? 1 : -1
              updated.completedTasks = Math.max(
                0,
                Math.min(updated.totalTasks, updated.completedTasks + diff)
              )
            }
          }
          return updated
        })
      )
    }
    if (targetStage && task.stage !== targetStage) {
      runAutomationsForEvent("stage_change", targetStage, task.title, task.id)
    }
  }

  // Handle updating task stage directly
  const handleUpdateTaskStage = (taskId: string, stage: TaskStage) => {
    handleMoveTask(taskId, stage, undefined)
  }

  // Handle star toggle
  const handleToggleStar = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isStarred: !p.isStarred } : p))
    )
  }

  // Handle project status update
  const handleUpdateStatus = (projectId: string, newStatus: Project["status"]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    )
  }

  // Handle project archive toggle (enforcing 3 active projects on Free when restoring)
  const handleToggleArchive = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId)
    if (!target) return
    if (target.isArchived && userTier === "free") {
      const activeCount = projects.filter((p) => !p.isArchived).length
      if (activeCount >= 3) {
        setFreeLimitNotice(
          "Limite de 3 projetos ativos no Kard Free atingido. Arquive outro projeto antes de restaurar este."
        )
        return
      }
    }
    setFreeLimitNotice(null)
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isArchived: !p.isArchived } : p))
    )
  }

  // Handle Client Portal Deliverable Approval / Revision Request
  const handleUpdateDeliverableStatus = (
    projectId: string,
    deliverableId: string,
    status: ClientDeliverable["status"],
    feedback?: string
  ) => {
    const targetProject = projects.find((p) => p.id === projectId)
    const targetDeliverable = targetProject?.deliverables?.find(
      (d) => d.id === deliverableId
    )
    const nowTime = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          deliverables: (p.deliverables || []).map((d) =>
            d.id === deliverableId
              ? {
                  ...d,
                  status,
                  clientFeedback: feedback ?? d.clientFeedback,
                  updatedAt: `Hoje, ${nowTime}`,
                }
              : d
          ),
        }
      })
    )

    if (targetProject && targetDeliverable) {
      const portalNotif: NotificationItem = {
        id: `notif-portal-${Date.now()}`,
        title:
          status === "approved"
            ? `Entrega aprovada em ${targetProject.name}`
            : `Revisão solicitada em ${targetProject.name}`,
        description: `${targetDeliverable.title}${
          feedback ? ` — "${feedback}"` : ""
        }`,
        time: "Agora",
        read: false,
        type: "portal",
      }
      setNotifications((prev) => [portalNotif, ...prev])

      runAutomationsForEvent(
        status === "approved" ? "portal_approved" : "portal_changes_requested",
        status,
        `${targetDeliverable.title} (${targetProject.name})`
      )
    }
  }

  const handleAddDeliverable = (
    projectId: string,
    deliverable: Omit<ClientDeliverable, "id" | "updatedAt">
  ) => {
    const newDeliverable: ClientDeliverable = {
      ...deliverable,
      id: `deliv-${Date.now()}`,
      updatedAt: "Agora",
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              deliverables: [newDeliverable, ...(p.deliverables || [])],
            }
          : p
      )
    )
  }

  // Calendar event persistence handler
  const handleAddCalendarEvent = (eventData: Omit<CalendarEvent, "id">) => {
    setCalendarEvents((prev) => [
      ...prev,
      { ...eventData, id: `ev-${Date.now()}` },
    ])
  }

  // Automations CRUD handlers
  const handleAddAutomationRule = (
    ruleData: Omit<AutomationRule, "id" | "runsCount" | "createdAt">
  ) => {
    const created: AutomationRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      runsCount: 0,
      createdAt: "Agora",
    }
    setAutomationRules((prev) => [created, ...prev])
  }

  const handleToggleAutomationRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const handleDeleteAutomationRule = (ruleId: string) => {
    setAutomationRules((prev) => prev.filter((r) => r.id !== ruleId))
  }

  // Reset local-first demo data
  const handleResetDemoWorkspace = () => {
    resetWorkspaceStore()
    setFreeLimitNotice(null)
  }

  // Handle inviting a collaborator by email (creates pending invite + GitHub-style notification)
  const handleInviteCollaborator = (
    projectId: string,
    email: string,
    role: string
  ) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const newInvite: ProjectInvitation = {
      id: `inv-${Date.now()}`,
      projectId,
      projectName: project.name,
      email,
      role,
      sentAt: "Agora",
      status: "pending",
      invitedBy: "Angelina Smith",
    }

    // Add to project pending invitations
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              pendingInvitations: [newInvite, ...(p.pendingInvitations || [])],
            }
          : p
      )
    )

    // Add notification with Colaborar / Negar interactive actions
    const newNotification: NotificationItem = {
      id: `notif-inv-${Date.now()}`,
      title: "Convite para Colaborar no Projeto",
      description: `Angelina Smith convidou ${email} para colaborar no projeto ${project.name} como ${role}.`,
      time: "Agora",
      read: false,
      type: "invitation",
      invitationData: {
        projectId,
        projectName: project.name,
        projectLogo: project.logo,
        email,
        role,
        invitedBy: "Angelina Smith",
        status: "pending",
      },
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  // Handle canceling a pending collaborator invitation
  const handleCancelInvitation = (projectId: string, inviteId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              pendingInvitations: (p.pendingInvitations || []).filter(
                (inv) => inv.id !== inviteId
              ),
            }
          : p
      )
    )
  }

  // Handle accepting an invitation (Colaborar)
  const handleAcceptInvitation = (
    notifId: string,
    invitationData: NonNullable<NotificationItem["invitationData"]>
  ) => {
    const rawName = invitationData.email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())

    const newMember: Member = {
      name: rawName || "Novo Colaborador",
      avatar: "/avatars/courtney.jpg",
      role: invitationData.role,
      email: invitationData.email,
      status: "Online",
      statusNote: "Recém ingressou no projeto",
      invitedAt: "Hoje",
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (
          p.id === invitationData.projectId ||
          p.name.toLowerCase() === invitationData.projectName.toLowerCase()
        ) {
          const alreadyIn = p.members.some(
            (m) =>
              m.name.toLowerCase() === newMember.name.toLowerCase() ||
              m.email?.toLowerCase() === newMember.email?.toLowerCase()
          )
          const updatedMembers = alreadyIn ? p.members : [...p.members, newMember]
          const updatedInvites = (p.pendingInvitations || []).filter(
            (inv) => inv.email.toLowerCase() !== invitationData.email.toLowerCase()
          )
          return {
            ...p,
            members: updatedMembers,
            pendingInvitations: updatedInvites,
          }
        }
        return p
      })
    )

    // Mark notification as accepted
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId
          ? {
              ...n,
              read: true,
              invitationData: n.invitationData
                ? { ...n.invitationData, status: "accepted" as const }
                : undefined,
            }
          : n
      )
    )
  }

  // Handle declining an invitation (Negar)
  const handleDeclineInvitation = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId
          ? {
              ...n,
              read: true,
              invitationData: n.invitationData
                ? { ...n.invitationData, status: "declined" as const }
                : undefined,
            }
          : n
      )
    )
  }

  // Handle removing a collaborator from project
  const handleRemoveCollaborator = (
    projectId: string,
    memberNameOrEmail: string
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId && p.members.length > 1) {
          const updated = p.members.filter(
            (m) =>
              m.name !== memberNameOrEmail && m.email !== memberNameOrEmail
          )
          return { ...p, members: updated }
        }
        return p
      })
    )
  }

  const [includeArchivedSearch, setIncludeArchivedSearch] = useState(false)

  // Handle timer play/pause toggle
  const handleToggleTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === timerId) {
          return { ...t, isRunning: !t.isRunning }
        }
        return { ...t, isRunning: false }
      })
    )
  }

  // Handle timer reset
  const handleResetTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, secondsElapsed: 0, isRunning: false } : t))
    )
  }

  // Handle notification read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Handle opening chat
  const handleOpenChat = (msg: ChatMessage) => {
    setSelectedChatUser(msg)
    setIsChatOpen(true)
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
    )
  }

  // Filter tasks and projects based on search query for Dashboard
  const query = searchQuery.trim().toLowerCase()
  const displayTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.project.toLowerCase().includes(query)
      )
    : tasks

  const matchingArchivedProjectsCount = query
    ? projects.filter(
        (p) =>
          p.isArchived &&
          (p.name.toLowerCase().includes(query) || p.company.toLowerCase().includes(query))
      ).length
    : projects.filter((p) => p.isArchived).length

  const displayProjects = query
    ? projects.filter(
        (p) =>
          (p.name.toLowerCase().includes(query) ||
            p.company.toLowerCase().includes(query)) &&
          (includeArchivedSearch ? true : !p.isArchived)
      )
    : projects.filter((p) => !p.isArchived)

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1560px] items-start gap-4 lg:gap-5">
        {/* 1. Sidebar Navigation */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={(key) => {
            setActiveNav(key)
            if (key === "projects") {
              setManagingProjectId(null)
              setProjectInitialTab("tasks")
              setProjectInitialNoteId(null)
            }
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
          currentTier={userTier}
        />

        {/* 2. Main Content Area */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Header Bar */}
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearAllNotifications={handleClearAllNotifications}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            onOpenPricingModal={() => setIsPricingModalOpen(true)}
            onOpenSettings={() => setActiveNav("settings")}
            onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
            isFocusModeActive={isFocusMode}
            currentTier={userTier}
            isOffline={isOffline}
            lastSavedAt={lastSavedAt}
          />

          {/* Free Tier Limit Warning Banner if triggered */}
          {freeLimitNotice && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning-subtle/70 px-5 py-3 text-xs text-foreground">
              <span>{freeLimitNotice}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFreeLimitNotice(null)}
                  className="h-7 rounded-lg bg-card text-xs"
                >
                  Dispensar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="h-7 rounded-lg text-xs font-semibold"
                >
                  Ver planos
                </Button>
              </div>
            </div>
          )}

          {/* Active Search Notification Banner if searching on dashboard */}
          {query && activeNav === "dashboard" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-5 py-3 border border-border shadow-xs text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2.5">
                <span>
                  Filtering results for: <strong>&quot;{searchQuery}&quot;</strong> (
                  {displayTasks.length} tasks, {displayProjects.length} projects)
                </span>
                {matchingArchivedProjectsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIncludeArchivedSearch(!includeArchivedSearch)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors cursor-pointer",
                      includeArchivedSearch
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 font-bold"
                        : "bg-muted/70 border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {includeArchivedSearch
                      ? `Hide archived (${matchingArchivedProjectsCount})`
                      : `Include archived (${matchingArchivedProjectsCount})`}
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setIncludeArchivedSearch(false)
                }}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Views Switching */}
          <AnimatePresence mode="wait">
            {activeNav === "projects" ? (
              <motion.div
                key="projects-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectsView
                  projects={projects}
                  tasks={tasks}
                  currentTier={userTier}
                  initialProjectTab={projectInitialTab}
                  initialNoteId={projectInitialNoteId}
                  onOpenPricingModal={() => setIsPricingModalOpen(true)}
                  onToggleStar={handleToggleStar}
                  onUpdateStatus={handleUpdateStatus}
                  onAddProject={handleAddProject}
                  onToggleTask={handleToggleTask}
                  onSelectTask={(task) => setSelectedTaskId(task.id)}
                  onAddTask={handleAddTask}
                  onUpdateProject={handleUpdateProject}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTaskAssignee={handleUpdateTaskAssignee}
                  onToggleArchive={handleToggleArchive}
                  onUpdateStage={handleUpdateTaskStage}
                  onReorderTasks={handleReorderTasks}
                  onMoveTask={handleMoveTask}
                  onInviteCollaborator={handleInviteCollaborator}
                  onCancelInvitation={handleCancelInvitation}
                  onAcceptInvitationDirect={(projId, inv) =>
                    handleAcceptInvitation(`direct-${inv.id}`, inv)
                  }
                  onRemoveCollaborator={handleRemoveCollaborator}
                  onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
                  onAddDeliverable={handleAddDeliverable}
                  managingProjectId={managingProjectId}
                  onSetManagingProjectId={(id) => {
                    setManagingProjectId(id)
                    if (!id) {
                      setProjectInitialTab("tasks")
                      setProjectInitialNoteId(null)
                    }
                  }}
                />
              </motion.div>
            ) : activeNav === "my-tasks" ? (
              <motion.div
                key="tasks-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
              >
                <div className="lg:col-span-7">
                  <MyTasksCard
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onSelectTask={(task) => setSelectedTaskId(task.id)}
                    onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                    onDeleteTask={handleDeleteTask}
                    onReorderTasks={handleReorderTasks}
                  />
                </div>
                <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 items-start">
                  <TimeTrackerCard
                    timers={timers}
                    onToggleTimer={handleToggleTimer}
                    onResetTimer={handleResetTimer}
                    onOpenFocusMode={() => setIsFocusMode(true)}
                  />
                  <CalendarWidget
                    events={calendarEvents}
                    onAddEvent={handleAddCalendarEvent}
                  />
                </div>
              </motion.div>
            ) : activeNav === "calendar" ? (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
              >
                <div className="lg:col-span-7">
                  <CalendarWidget
                    events={calendarEvents}
                    onAddEvent={handleAddCalendarEvent}
                  />
                </div>
                <div className="lg:col-span-5">
                  <MyTasksCard
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onSelectTask={(task) => setSelectedTaskId(task.id)}
                    onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                    onDeleteTask={handleDeleteTask}
                    onReorderTasks={handleReorderTasks}
                  />
                </div>
              </motion.div>
            ) : activeNav === "time-manage" ? (
              <motion.div
                key="time-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                <div className="lg:col-span-8">
                  <TimeTrackerCard
                    timers={timers}
                    onToggleTimer={handleToggleTimer}
                    onResetTimer={handleResetTimer}
                    onOpenFocusMode={() => setIsFocusMode(true)}
                  />
                </div>
                <div className="lg:col-span-4">
                  <MessageWidget
                    messages={messages}
                    onSelectMessage={handleOpenChat}
                  />
                </div>
              </motion.div>
            ) : activeNav === "automations" ? (
              <motion.div
                key="automations-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AutomationsPanel
                  rules={automationRules}
                  logs={automationLogs}
                  onAddRule={handleAddAutomationRule}
                  onToggleRule={handleToggleAutomationRule}
                  onDeleteRule={handleDeleteAutomationRule}
                />
              </motion.div>
            ) : activeNav === "settings" ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-[28px] bg-card p-8 border border-border space-y-6 max-w-3xl"
              >
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">Workspace Settings</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gerencie tema visual, persistência local-first offline, regras de automação e dados de demonstração.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Aparência da Interface</p>
                      <p className="text-xs text-muted-foreground">Alternar entre Modo Claro e Modo Escuro Obsidian.</p>
                    </div>
                    <Button onClick={toggleTheme} variant="outline" size="sm" className="gap-2 cursor-pointer rounded-xl">
                      <Sun className="hidden dark:block w-4 h-4 text-amber-400" />
                      <Moon className="block dark:hidden w-4 h-4 text-blue-500" />
                      <span className="capitalize">
                        <span className="hidden dark:inline">Modo Claro</span>
                        <span className="inline dark:hidden">Modo Escuro</span>
                      </span>
                    </Button>
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Automações em Texto Natural</p>
                      <p className="text-xs text-muted-foreground">
                        {automationRules.filter((r) => r.enabled).length} regras ativas executando automaticamente no navegador.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveNav("automations")}
                      className="gap-1.5 rounded-xl text-xs font-semibold"
                    >
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span>Gerenciar regras</span>
                    </Button>
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Persistência Local-First Offline</p>
                      <p className="text-xs text-muted-foreground">
                        {isOffline
                          ? "Sem conexão — alterações seguem salvas localmente no navegador."
                          : lastSavedAt
                          ? `Último salvamento automático no navegador às ${lastSavedAt}.`
                          : "Salvamento automático ativo no armazenamento local do navegador."}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-foreground bg-success-subtle px-2.5 py-1 rounded-lg shrink-0">
                      {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
                      <span>{isOffline ? "Modo Offline" : "Local Ativo"}</span>
                    </span>
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Restaurar Ambiente de Demonstração</p>
                      <p className="text-xs text-muted-foreground">
                        Limpa alterações salvas localmente no navegador e restaura os dados iniciais do Kard.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetDemoWorkspace}
                      className="gap-1.5 rounded-xl text-xs font-semibold text-danger hover:text-danger"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar padrão</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* DEFAULT: Morning Briefing + Bento Grid Dashboard */
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <MorningBriefingCard
                  tasks={tasks}
                  notifications={notifications}
                  calendarEvents={calendarEvents}
                  collapsed={briefingCollapsed}
                  onToggleCollapse={() => setBriefingCollapsed((prev) => !prev)}
                  onToggleTask={handleToggleTask}
                  onOpenTask={(task) => setSelectedTaskId(task.id)}
                  onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                  onAcceptInvitation={handleAcceptInvitation}
                  onDeclineInvitation={handleDeclineInvitation}
                  onMarkNotificationRead={handleMarkNotificationRead}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
                  {/* COLUMN 1: Active Projects — lg:col-span-4 */}
                  <div className="space-y-5 lg:col-span-4">
                    {displayProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onToggleStar={handleToggleStar}
                        onUpdateStatus={handleUpdateStatus}
                        onToggleArchive={handleToggleArchive}
                        onClick={() => {
                          setManagingProjectId(project.id)
                          setProjectInitialTab("tasks")
                          setProjectInitialNoteId(null)
                          setActiveNav("projects")
                        }}
                      />
                    ))}

                    {displayProjects.length === 0 && (
                      <div className="rounded-[28px] bg-card p-8 text-center text-xs text-muted-foreground border border-border">
                        No projects matching your search.
                      </div>
                    )}
                  </div>

                  {/* COLUMN 2: My Tasks & Time Manage (Chronometer) — lg:col-span-4 */}
                  <div className="space-y-5 lg:col-span-4">
                    <MyTasksCard
                      tasks={displayTasks}
                      onToggleTask={handleToggleTask}
                      onSelectTask={(task) => setSelectedTaskId(task.id)}
                      onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                      onDeleteTask={handleDeleteTask}
                      onReorderTasks={handleReorderTasks}
                    />

                    <TimeTrackerCard
                      timers={timers}
                      onToggleTimer={handleToggleTimer}
                      onResetTimer={handleResetTimer}
                      onOpenFocusMode={() => setIsFocusMode(true)}
                    />
                  </div>

                  {/* COLUMN 3: Calendar & Messages — lg:col-span-4 */}
                  <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 items-start">
                    <CalendarWidget
                      events={calendarEvents}
                      onAddEvent={handleAddCalendarEvent}
                    />

                    <MessageWidget
                      messages={messages}
                      onSelectMessage={handleOpenChat}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <TaskInspectorDrawer
        task={selectedTask}
        projects={projects}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={handleUpdateTask}
        onToggleTask={handleToggleTask}
        onOpenProjectNote={(projId, noteId) => {
          setSelectedTaskId(null)
          setManagingProjectId(projId)
          setProjectInitialTab("files")
          setProjectInitialNoteId(noteId)
          setActiveNav("projects")
        }}
      />

      <NewTaskModal
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        onAddTask={handleAddTask}
        projects={projects}
      />

      <QuickChatModal
        message={selectedChatUser}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onSelectAction={(key) => {
          setActiveNav(key)
          if (key === "projects") {
            setManagingProjectId(null)
            setProjectInitialTab("tasks")
            setProjectInitialNoteId(null)
          }
        }}
      />

      {/* Kard Pro & Business Pricing Plans Modal */}
      <PricingPlansModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
        currentTier={userTier}
        onUpgradeSuccess={(tier) => {
          setUserTier(tier)
          setFreeLimitNotice(null)
        }}
      />

      {/* Distraction-Free Focus Mode (Zen fullscreen experience) */}
      <AnimatePresence>
        {isFocusMode && (
          <FocusModeView
            timers={timers}
            tasks={tasks}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onToggleTask={handleToggleTask}
            onClose={() => setIsFocusMode(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
