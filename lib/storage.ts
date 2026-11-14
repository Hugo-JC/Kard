import {
  AutomationLog,
  AutomationRule,
  CalendarEvent,
  ChatMessage,
  INITIAL_AUTOMATION_LOGS,
  INITIAL_AUTOMATION_RULES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TIMERS,
  NotificationItem,
  Project,
  TaskItem,
  TrackedTimer,
} from "./data"

import type { SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"

export const KARD_STORAGE_KEY = "kard_workspace_local_v1"

export interface KardPersistedWorkspace {
  version: number
  savedAt: string
  projects: Project[]
  tasks: TaskItem[]
  timers: TrackedTimer[]
  messages: ChatMessage[]
  notifications: NotificationItem[]
  calendarEvents: CalendarEvent[]
  automationRules: AutomationRule[]
  automationLogs: AutomationLog[]
  userTier: SubscriptionPlanTier
  briefingCollapsed?: boolean
}

export interface WorkspaceSnapshot {
  projects: Project[]
  tasks: TaskItem[]
  timers: TrackedTimer[]
  messages: ChatMessage[]
  notifications: NotificationItem[]
  calendarEvents: CalendarEvent[]
  automationRules: AutomationRule[]
  automationLogs: AutomationLog[]
  userTier: SubscriptionPlanTier
  briefingCollapsed: boolean
  lastSavedAt: string | null
}

export const DEFAULT_WORKSPACE_SNAPSHOT: WorkspaceSnapshot = {
  projects: INITIAL_PROJECTS,
  tasks: INITIAL_TASKS,
  timers: INITIAL_TIMERS,
  messages: INITIAL_MESSAGES,
  notifications: INITIAL_NOTIFICATIONS,
  calendarEvents: INITIAL_CALENDAR_EVENTS,
  automationRules: INITIAL_AUTOMATION_RULES,
  automationLogs: INITIAL_AUTOMATION_LOGS,
  userTier: "free",
  briefingCollapsed: false,
  lastSavedAt: null,
}

export function loadWorkspaceFromStorage(): KardPersistedWorkspace | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KARD_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as KardPersistedWorkspace
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.projects) ||
      !Array.isArray(parsed.tasks)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveWorkspaceToStorage(
  payload: Omit<KardPersistedWorkspace, "version" | "savedAt">
): string | null {
  if (typeof window === "undefined") return null
  try {
    const now = new Date()
    const savedAt = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const serialized: KardPersistedWorkspace = {
      version: 1,
      savedAt,
      ...payload,
    }
    window.localStorage.setItem(KARD_STORAGE_KEY, JSON.stringify(serialized))
    return savedAt
  } catch {
    return null
  }
}

export function clearWorkspaceStorage(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KARD_STORAGE_KEY)
  } catch {
    // Ignore storage errors in restricted iframes
  }
}

// External store for hydration-safe & React-19-compliant local-first synchronization
let workspaceSnapshot: WorkspaceSnapshot = DEFAULT_WORKSPACE_SNAPSHOT
const workspaceListeners = new Set<() => void>()

function emitWorkspaceChange(): void {
  workspaceListeners.forEach((listener) => listener())
}

function mergePersistedSnapshot(saved: KardPersistedWorkspace): WorkspaceSnapshot {
  return {
    projects: saved.projects,
    tasks: saved.tasks,
    timers: Array.isArray(saved.timers) ? saved.timers : INITIAL_TIMERS,
    messages: Array.isArray(saved.messages) ? saved.messages : INITIAL_MESSAGES,
    notifications: Array.isArray(saved.notifications)
      ? saved.notifications
      : INITIAL_NOTIFICATIONS,
    calendarEvents: Array.isArray(saved.calendarEvents)
      ? saved.calendarEvents
      : INITIAL_CALENDAR_EVENTS,
    automationRules: Array.isArray(saved.automationRules)
      ? saved.automationRules
      : INITIAL_AUTOMATION_RULES,
    automationLogs: Array.isArray(saved.automationLogs)
      ? saved.automationLogs
      : INITIAL_AUTOMATION_LOGS,
    userTier: saved.userTier || "free",
    briefingCollapsed:
      typeof saved.briefingCollapsed === "boolean" ? saved.briefingCollapsed : false,
    lastSavedAt: saved.savedAt || null,
  }
}

export function subscribeWorkspace(listener: () => void): () => void {
  workspaceListeners.add(listener)
  if (typeof window === "undefined") {
    return () => {
      workspaceListeners.delete(listener)
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KARD_STORAGE_KEY) return
    const saved = loadWorkspaceFromStorage()
    workspaceSnapshot = saved ? mergePersistedSnapshot(saved) : DEFAULT_WORKSPACE_SNAPSHOT
    emitWorkspaceChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    workspaceListeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function getWorkspaceSnapshot(): WorkspaceSnapshot {
  return workspaceSnapshot
}

export function getServerWorkspaceSnapshot(): WorkspaceSnapshot {
  return DEFAULT_WORKSPACE_SNAPSHOT
}

export function hydrateWorkspaceFromStorage(): void {
  const saved = loadWorkspaceFromStorage()
  if (!saved) return
  workspaceSnapshot = mergePersistedSnapshot(saved)
  emitWorkspaceChange()
}

export function updateWorkspaceStore(
  updater: (prev: WorkspaceSnapshot) => WorkspaceSnapshot
): void {
  const next = updater(workspaceSnapshot)
  const savedAt = saveWorkspaceToStorage({
    projects: next.projects,
    tasks: next.tasks,
    timers: next.timers,
    messages: next.messages,
    notifications: next.notifications,
    calendarEvents: next.calendarEvents,
    automationRules: next.automationRules,
    automationLogs: next.automationLogs,
    userTier: next.userTier,
    briefingCollapsed: next.briefingCollapsed,
  })
  workspaceSnapshot = {
    ...next,
    lastSavedAt: savedAt ?? next.lastSavedAt,
  }
  emitWorkspaceChange()
}

export function resetWorkspaceStore(): void {
  clearWorkspaceStorage()
  workspaceSnapshot = DEFAULT_WORKSPACE_SNAPSHOT
  emitWorkspaceChange()
}

// External store for online/offline browser connectivity
export function subscribeNetworkStatus(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  window.addEventListener("online", listener)
  window.addEventListener("offline", listener)
  return () => {
    window.removeEventListener("online", listener)
    window.removeEventListener("offline", listener)
  }
}

export function getOnlineSnapshot(): boolean {
  if (typeof window === "undefined") return true
  return window.navigator.onLine
}

export function getServerOnlineSnapshot(): boolean {
  return true
}
