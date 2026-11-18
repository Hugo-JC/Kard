import type { User } from "firebase/auth"
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type WriteBatch,
} from "firebase/firestore"
import type {
  AutomationRule,
  CalendarEvent,
  ClientDeliverable,
  Member,
  MemberStatus,
  Project,
  ProjectAssetScope,
  ProjectDocument,
  ProjectNote,
  ProjectRole,
  TaskItem,
} from "@/lib/data"
import type { SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"
import { db, handleFirestoreError, OperationType } from "@/lib/firebase"
import { normalizeProjectRole } from "@/lib/rbac"
import type { WorkspaceSnapshot } from "@/lib/storage"

export interface PendingMigrationSummary {
  projectsCount: number
  tasksCount: number
  eventsCount: number
  rulesCount: number
  willArchiveCount: number
}

// Live registry of documents confirmed to exist in Firestore during the active session.
// Prevents blind updateDoc/deleteDoc calls on local/unmigrated demo docs and resolves
// async create -> update races via pendingProjectCreates.
const activeCloudProjectIds = new Set<string>()
const activeCloudTaskKeys = new Set<string>()
const activeCloudNoteKeys = new Set<string>()
const activeCloudDeliverableKeys = new Set<string>()
const activeCloudAutomationKeys = new Set<string>()
const pendingProjectCreates = new Map<string, Promise<void>>()

export function resetCloudRegistry(): void {
  activeCloudProjectIds.clear()
  activeCloudTaskKeys.clear()
  activeCloudNoteKeys.clear()
  activeCloudDeliverableKeys.clear()
  activeCloudAutomationKeys.clear()
  pendingProjectCreates.clear()
}

export function isProjectInCloud(projectId: string): boolean {
  return activeCloudProjectIds.has(sanitizeDocId(projectId))
}

export function sanitizeDocId(raw: string): string {
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128)
  return clean || `doc_${Date.now()}`
}

function clampStr(val: string | undefined, max: number): string {
  if (!val) return ""
  return val.slice(0, max)
}

function nonEmptyClampStr(val: string | undefined, fallback: string, max: number): string {
  const trimmed = (val || "").trim()
  return (trimmed || fallback).slice(0, max)
}

function safeInt(val: number | undefined, min = 0, max = 100000): number {
  const n = Number(val ?? 0)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.floor(n)))
}

function isValidFirestoreId(val?: string | null): val is string {
  return Boolean(val && /^[a-zA-Z0-9_-]{1,128}$/.test(val))
}

function sanitizeTags(tags?: string[]): string[] {
  return (tags || [])
    .map((t) => clampStr(t.trim(), 40))
    .filter((t) => t.length > 0)
    .slice(0, 10)
}

function sanitizeSafeCustomImage(url?: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith("data:")) return undefined
  if (url.length > 1000) return undefined
  return url
}

type BatchOp = {
  ref: ReturnType<typeof doc>
  data: Record<string, unknown>
  merge?: boolean
}

async function commitChunkedBatches(ops: BatchOp[]): Promise<void> {
  const CHUNK_SIZE = 400
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const chunk = ops.slice(i, i + CHUNK_SIZE)
    const batch: WriteBatch = writeBatch(db)
    for (const op of chunk) {
      if (op.merge) {
        batch.set(op.ref, op.data, { merge: true })
      } else {
        batch.set(op.ref, op.data)
      }
    }
    await batch.commit()
  }
}

function migrationStorageKey(uid: string): string {
  return `kard_migrated_uid_${uid}`
}

export function isMigrationMarkedForUid(uid: string): boolean {
  if (typeof window === "undefined") return false
  try {
    return Boolean(window.localStorage.getItem(migrationStorageKey(uid)))
  } catch {
    return false
  }
}

export function markMigrationDoneForUid(uid: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(migrationStorageKey(uid), new Date().toISOString())
  } catch {
    // ignore
  }
}

export async function ensureUserProfileDocs(user: User): Promise<{
  userTier: SubscriptionPlanTier
  briefingCollapsed: boolean
  userStatus: MemberStatus
  userStatusNote: string
  migratedLocalAt?: string
}> {
  const publicPath = `users/${user.uid}/public/profile`
  const privatePath = `users/${user.uid}/private/info`
  let resolvedStatus: MemberStatus = "Online"
  let resolvedStatusNote = ""

  try {
    const publicRef = doc(db, "users", user.uid, "public", "profile")
    const publicSnap = await getDoc(publicRef)
    const displayName = nonEmptyClampStr(
      user.displayName || user.email?.split("@")[0],
      "Usuário Kard",
      120
    )

    if (!publicSnap.exists()) {
      await setDoc(publicRef, {
        uid: user.uid,
        displayName,
        ...(user.photoURL ? { photoUrl: clampStr(user.photoURL, 1000) } : {}),
        status: "Online",
        statusNote: "Conectado ao Kard",
        updatedAt: serverTimestamp(),
      })
      resolvedStatus = "Online"
      resolvedStatusNote = "Conectado ao Kard"
    } else {
      const pubData = publicSnap.data()
      const rawStatus = pubData.status
      resolvedStatus =
        rawStatus === "Online" ||
        rawStatus === "In Meeting" ||
        rawStatus === "Focused" ||
        rawStatus === "Offline"
          ? rawStatus
          : "Online"
      resolvedStatusNote = typeof pubData.statusNote === "string" ? pubData.statusNote : ""
      await updateDoc(publicRef, {
        displayName,
        ...(user.photoURL ? { photoUrl: clampStr(user.photoURL, 1000) } : {}),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath)
  }

  try {
    const privateRef = doc(db, "users", user.uid, "private", "info")
    const privateSnap = await getDoc(privateRef)

    if (!privateSnap.exists()) {
      await setDoc(privateRef, {
        uid: user.uid,
        email: nonEmptyClampStr(user.email || undefined, "usuario@kard.dev", 254),
        userTier: "free",
        activeProjectsCount: 0,
        briefingCollapsed: false,
        updatedAt: serverTimestamp(),
      })
      return {
        userTier: "free",
        briefingCollapsed: false,
        userStatus: resolvedStatus,
        userStatusNote: resolvedStatusNote,
      }
    }

    const data = privateSnap.data()
    return {
      userTier: (data.userTier as SubscriptionPlanTier) || "free",
      briefingCollapsed: Boolean(data.briefingCollapsed),
      userStatus: resolvedStatus,
      userStatusNote: resolvedStatusNote,
      migratedLocalAt: data.migratedLocalAt as string | undefined,
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath)
  }
}

export async function checkPendingLocalMigration(
  uid: string,
  localSnapshot: WorkspaceSnapshot
): Promise<PendingMigrationSummary | null> {
  if (isMigrationMarkedForUid(uid)) return null

  const membershipsPath = `users/${uid}/memberships`
  try {
    const snap = await getDocs(
      query(collection(db, "users", uid, "memberships"), where("uid", "==", uid))
    )
    if (!snap.empty) {
      markMigrationDoneForUid(uid)
      return null
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, membershipsPath)
  }

  const activeProjects = localSnapshot.projects.filter((p) => !p.isArchived)
  const willArchiveCount =
    localSnapshot.userTier === "free" && activeProjects.length > 3
      ? activeProjects.length - 3
      : 0

  return {
    projectsCount: localSnapshot.projects.length,
    tasksCount: localSnapshot.tasks.length,
    eventsCount: localSnapshot.calendarEvents.length,
    rulesCount: localSnapshot.automationRules.length,
    willArchiveCount,
  }
}

function formatFileSizeBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function buildProjectBatchOps(
  user: User,
  project: Project,
  projectTasks: TaskItem[],
  options?: { forceArchived?: boolean }
): {
  projectId: string
  ops: BatchOp[]
  taskIds: string[]
  noteIds: string[]
  delivIds: string[]
} {
  const projectId = sanitizeDocId(project.id)
  const ownerName = nonEmptyClampStr(user.displayName || user.email?.split("@")[0], "Owner", 120)
  const ownerAvatar = clampStr(user.photoURL || "/avatars/angelina.jpg", 512)
  const ownerEmail = clampStr(user.email || "", 254)
  const isArchived = options?.forceArchived ?? Boolean(project.isArchived)

  const ops: BatchOp[] = []
  const taskIds: string[] = []
  const noteIds: string[] = []
  const delivIds: string[] = []

  const safeTags = sanitizeTags(project.tags)
  const safeCustomImage = sanitizeSafeCustomImage(project.customImage)

  ops.push({
    ref: doc(db, "projects", projectId),
    data: {
      id: projectId,
      ownerId: user.uid,
      name: nonEmptyClampStr(project.name, "Projeto", 120),
      company: nonEmptyClampStr(project.company, "Cliente", 120),
      logo: project.logo || "custom",
      status: project.status || "IN PROGRESS",
      priority: project.priority || "MEDIUM PRIORITY",
      completedTasks: safeInt(project.completedTasks, 0, 100000),
      totalTasks: safeInt(project.totalTasks, 0, 100000),
      ...(project.progressColor ? { progressColor: clampStr(project.progressColor, 32) } : {}),
      ...(project.progressTrack ? { progressTrack: clampStr(project.progressTrack, 32) } : {}),
      ...(project.accentColor ? { accentColor: clampStr(project.accentColor, 32) } : {}),
      tags: safeTags,
      isStarred: Boolean(project.isStarred),
      isArchived,
      ...(project.dueDate ? { dueDate: clampStr(project.dueDate, 64) } : {}),
      ...(project.sprintStage ? { sprintStage: clampStr(project.sprintStage, 64) } : {}),
      attachmentsCount: safeInt(project.attachmentsCount, 0, 100000),
      ...(project.budget ? { budget: clampStr(project.budget, 64) } : {}),
      ...(project.description ? { description: clampStr(project.description, 2000) } : {}),
      ...(project.coverAssetKey ? { coverAssetKey: clampStr(project.coverAssetKey, 512) } : {}),
      ...(safeCustomImage ? { customImage: safeCustomImage } : {}),
      portalEnabled: project.portalEnabled ?? true,
      ...(project.portalShareCode
        ? { portalShareCode: clampStr(project.portalShareCode, 128) }
        : {}),
      extraMembersCount: safeInt(project.extraMembersCount, 0, 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  })

  // Authoritative Owner membership doc in subcollection
  ops.push({
    ref: doc(db, "projects", projectId, "members", user.uid),
    data: {
      uid: user.uid,
      projectId,
      name: ownerName,
      email: ownerEmail,
      avatar: ownerAvatar,
      projectRole: "owner",
      jobTitle: "Owner do projeto",
      status: "Online",
      statusNote: "Criador do workspace",
      addedBy: user.uid,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  })

  // User membership pointer for O(1) listing
  ops.push({
    ref: doc(db, "users", user.uid, "memberships", projectId),
    data: {
      uid: user.uid,
      projectId,
      projectName: nonEmptyClampStr(project.name, "Projeto", 120),
      projectRole: "owner",
      joinedAt: serverTimestamp(),
    },
  })

  // Project tasks
  for (const task of projectTasks) {
    const taskId = sanitizeDocId(task.id)
    taskIds.push(taskId)
    ops.push({
      ref: doc(db, "projects", projectId, "tasks", taskId),
      data: {
        id: taskId,
        projectId,
        ownerId: user.uid,
        number: clampStr(task.number || "01", 16),
        title: nonEmptyClampStr(task.title, "Tarefa", 240),
        project: nonEmptyClampStr(project.name, "Projeto", 120),
        commentsCount: safeInt(task.comments?.length ?? task.commentsCount, 0, 10000),
        subtasksCount: safeInt(task.checklist?.length ?? task.subtasksCount, 0, 1000),
        completed: Boolean(task.completed),
        priority: task.priority || "Medium",
        stage: task.stage || (task.completed ? "DONE" : "TODO"),
        tags: sanitizeTags(task.tags),
        ...(task.dueDate ? { dueDate: clampStr(task.dueDate, 64) } : {}),
        ...(task.dueKind ? { dueKind: task.dueKind } : {}),
        ...(task.assignee?.name ? { assigneeName: clampStr(task.assignee.name, 120) } : {}),
        ...(isValidFirestoreId(task.assignee?.uid) ? { assigneeUid: task.assignee.uid } : {}),
        ...(task.descriptionMarkdown
          ? { descriptionMarkdown: clampStr(task.descriptionMarkdown, 20000) }
          : {}),
        checklist: (task.checklist || []).slice(0, 50),
        comments: (task.comments || []).slice(0, 200),
        ...(task.linkedNoteId ? { linkedNoteId: clampStr(task.linkedNoteId, 128) } : {}),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    })
  }

  // Project Markdown notes
  for (const note of project.notes || []) {
    const noteId = sanitizeDocId(note.id)
    noteIds.push(noteId)
    ops.push({
      ref: doc(db, "projects", projectId, "notes", noteId),
      data: {
        id: noteId,
        projectId,
        ownerId: user.uid,
        title: nonEmptyClampStr(note.title, "Nota do projeto", 200),
        contentMarkdown: clampStr(note.contentMarkdown, 50000),
        author: nonEmptyClampStr(note.author, ownerName, 120),
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    })
  }

  // Client Portal deliverables
  for (const deliv of project.deliverables || []) {
    const delivId = sanitizeDocId(deliv.id)
    delivIds.push(delivId)
    ops.push({
      ref: doc(db, "projects", projectId, "deliverables", delivId),
      data: {
        id: delivId,
        projectId,
        ownerId: user.uid,
        title: nonEmptyClampStr(deliv.title, "Entregável", 200),
        description: clampStr(deliv.description, 2000),
        milestone: nonEmptyClampStr(deliv.milestone, "Marco", 100),
        status: deliv.status || "pending_review",
        ...(deliv.clientFeedback
          ? { clientFeedback: clampStr(deliv.clientFeedback, 2000) }
          : {}),
        publishedBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    })
  }

  return { projectId, ops, taskIds, noteIds, delivIds }
}

export async function migrateLocalWorkspaceToFirestore(
  user: User,
  localSnapshot: WorkspaceSnapshot
): Promise<void> {
  const ops: BatchOp[] = []
  const ownerEmail = nonEmptyClampStr(user.email || undefined, "usuario@kard.dev", 254)

  let activeSeen = 0
  const maxActiveFree = localSnapshot.userTier === "free" ? 3 : 999

  const createdProjIds: string[] = []
  const createdTaskKeys: string[] = []
  const createdNoteKeys: string[] = []
  const createdDelivKeys: string[] = []
  const createdRuleKeys: string[] = []

  for (const project of localSnapshot.projects) {
    let isArchived = Boolean(project.isArchived)
    if (!isArchived) {
      activeSeen += 1
      if (activeSeen > maxActiveFree) {
        isArchived = true
      }
    }

    const projectTasks = localSnapshot.tasks.filter(
      (t) => t.project.toLowerCase() === project.name.toLowerCase()
    )
    const built = buildProjectBatchOps(user, project, projectTasks, {
      forceArchived: isArchived,
    })
    ops.push(...built.ops)
    createdProjIds.push(built.projectId)
    built.taskIds.forEach((tid) => createdTaskKeys.push(`${built.projectId}:${tid}`))
    built.noteIds.forEach((nid) => createdNoteKeys.push(`${built.projectId}:${nid}`))
    built.delivIds.forEach((did) => createdDelivKeys.push(`${built.projectId}:${did}`))
  }

  // Automation rules attached to primary migrated project (if any)
  const primaryProject = localSnapshot.projects[0]
  if (primaryProject) {
    const primaryId = sanitizeDocId(primaryProject.id)
    for (const rule of localSnapshot.automationRules) {
      const ruleId = sanitizeDocId(rule.id)
      createdRuleKeys.push(`${primaryId}:${ruleId}`)
      ops.push({
        ref: doc(db, "projects", primaryId, "automations", ruleId),
        data: {
          id: ruleId,
          projectId: primaryId,
          ownerId: user.uid,
          naturalText: nonEmptyClampStr(rule.naturalText, "Regra de automação", 500),
          triggerType: rule.triggerType,
          ...(rule.triggerValue ? { triggerValue: clampStr(rule.triggerValue, 120) } : {}),
          ...(rule.triggerLabel ? { triggerLabel: clampStr(rule.triggerLabel, 200) } : {}),
          actionType: rule.actionType,
          ...(rule.actionValue ? { actionValue: clampStr(rule.actionValue, 120) } : {}),
          ...(rule.actionLabel ? { actionLabel: clampStr(rule.actionLabel, 200) } : {}),
          enabled: Boolean(rule.enabled),
          runsCount: safeInt(rule.runsCount, 0, 1000000),
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      })
    }
  }

  // Calendar events
  for (const ev of localSnapshot.calendarEvents) {
    const evId = sanitizeDocId(ev.id)
    ops.push({
      ref: doc(db, "users", user.uid, "calendarEvents", evId),
      data: {
        id: evId,
        userId: user.uid,
        day: Math.min(31, Math.max(1, safeInt(ev.day, 1, 31))),
        month: Math.min(11, Math.max(0, safeInt(ev.month, 0, 11))),
        year: Math.min(2100, Math.max(2000, safeInt(ev.year, 2000, 2100))),
        dots: (ev.dots || ["#3B82F6"]).slice(0, 5),
        title: nonEmptyClampStr(ev.title, "Evento", 240),
        source: ev.source === "google_calendar" ? "google_calendar" : "local",
        ...(ev.googleEventId ? { googleEventId: clampStr(ev.googleEventId, 256) } : {}),
        ...(ev.startIso ? { startIso: clampStr(ev.startIso, 64) } : {}),
        createdAt: serverTimestamp(),
      },
    })
  }

  const migratedAtIso = new Date().toISOString()
  ops.push({
    ref: doc(db, "users", user.uid, "private", "info"),
    data: {
      uid: user.uid,
      email: ownerEmail,
      userTier: localSnapshot.userTier || "free",
      activeProjectsCount: Math.min(activeSeen, maxActiveFree),
      briefingCollapsed: Boolean(localSnapshot.briefingCollapsed),
      migratedLocalAt: migratedAtIso,
      updatedAt: serverTimestamp(),
    },
    merge: true,
  })

  try {
    await commitChunkedBatches(ops)
    createdProjIds.forEach((id) => activeCloudProjectIds.add(id))
    createdTaskKeys.forEach((k) => activeCloudTaskKeys.add(k))
    createdNoteKeys.forEach((k) => activeCloudNoteKeys.add(k))
    createdDelivKeys.forEach((k) => activeCloudDeliverableKeys.add(k))
    createdRuleKeys.forEach((k) => activeCloudAutomationKeys.add(k))
    markMigrationDoneForUid(user.uid)
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `migration/${user.uid}`)
  }
}

export interface CloudWorkspaceCallbacks {
  onProjectsLoaded: (projects: Project[]) => void
  onTasksLoaded: (tasks: TaskItem[]) => void
  onCalendarEventsLoaded: (events: CalendarEvent[]) => void
  onAutomationsLoaded: (rules: AutomationRule[]) => void
  onError?: (err: Error) => void
}

export function subscribeUserCloudWorkspace(
  user: User,
  callbacks: CloudWorkspaceCallbacks
): () => void {
  resetCloudRegistry()

  const projectMap = new Map<string, Project>()
  const membersMap = new Map<string, Member[]>()
  const notesMap = new Map<string, ProjectNote[]>()
  const deliverablesMap = new Map<string, ClientDeliverable[]>()
  const assetsMap = new Map<string, ProjectDocument[]>()
  const tasksMap = new Map<string, TaskItem[]>()
  const automationsMap = new Map<string, AutomationRule[]>()

  const projectUnsubs = new Map<string, () => void>()
  let hasLoadedMemberships = false

  const emitAll = () => {
    const mergedProjects: Project[] = Array.from(projectMap.values()).map((proj) => ({
      ...proj,
      members: membersMap.get(proj.id) || proj.members || [],
      notes: notesMap.get(proj.id) || proj.notes || [],
      deliverables: deliverablesMap.get(proj.id) || proj.deliverables || [],
      documents: assetsMap.get(proj.id) || proj.documents || [],
    }))

    const migrationHandled = isMigrationMarkedForUid(user.uid)

    if (mergedProjects.length > 0 || (hasLoadedMemberships && migrationHandled)) {
      callbacks.onProjectsLoaded(mergedProjects)
    }

    const mergedTasks = Array.from(tasksMap.values()).flat().map((task) => {
      if (!task.assignee) return task
      const proj = Array.from(projectMap.values()).find(
        (p) => p.name.toLowerCase() === task.project.toLowerCase()
      )
      const members = proj ? membersMap.get(proj.id) || [] : []
      const matched = members.find(
        (m) =>
          (task.assignee?.uid && m.uid === task.assignee.uid) ||
          m.name.toLowerCase() === task.assignee?.name.toLowerCase()
      )
      if (!matched) return task
      return {
        ...task,
        assignee: {
          ...task.assignee,
          avatar: matched.avatar,
          status: matched.status,
        },
      }
    })

    if (
      mergedTasks.length > 0 ||
      mergedProjects.length > 0 ||
      (hasLoadedMemberships && migrationHandled)
    ) {
      callbacks.onTasksLoaded(mergedTasks)
    }

    const mergedRules = Array.from(automationsMap.values()).flat()
    if (mergedRules.length > 0 || (hasLoadedMemberships && migrationHandled)) {
      callbacks.onAutomationsLoaded(mergedRules)
    }
  }

  const clearProjectKeys = (projectId: string) => {
    activeCloudProjectIds.delete(projectId)
    for (const k of Array.from(activeCloudTaskKeys)) {
      if (k.startsWith(`${projectId}:`)) activeCloudTaskKeys.delete(k)
    }
    for (const k of Array.from(activeCloudNoteKeys)) {
      if (k.startsWith(`${projectId}:`)) activeCloudNoteKeys.delete(k)
    }
    for (const k of Array.from(activeCloudDeliverableKeys)) {
      if (k.startsWith(`${projectId}:`)) activeCloudDeliverableKeys.delete(k)
    }
    for (const k of Array.from(activeCloudAutomationKeys)) {
      if (k.startsWith(`${projectId}:`)) activeCloudAutomationKeys.delete(k)
    }
  }

  const attachProjectListeners = (projectId: string) => {
    if (projectUnsubs.has(projectId)) return

    const unsubProj = onSnapshot(
      doc(db, "projects", projectId),
      (snap) => {
        if (!snap.exists()) {
          projectMap.delete(projectId)
          activeCloudProjectIds.delete(projectId)
        } else {
          const d = snap.data()
          activeCloudProjectIds.add(projectId)
          projectMap.set(projectId, {
            id: d.id || projectId,
            ownerId: d.ownerId,
            name: d.name,
            company: d.company,
            logo: d.logo || "custom",
            status: d.status || "IN PROGRESS",
            priority: d.priority || "MEDIUM PRIORITY",
            completedTasks: d.completedTasks ?? 0,
            totalTasks: d.totalTasks ?? 0,
            progressColor: d.progressColor || "#3B82F6",
            progressTrack: d.progressTrack || "#E5E9F2",
            accentColor: d.accentColor || "#3B82F6",
            tags: Array.isArray(d.tags) ? d.tags : [],
            isStarred: Boolean(d.isStarred),
            isArchived: Boolean(d.isArchived),
            dueDate: d.dueDate || "TBD",
            sprintStage: d.sprintStage,
            attachmentsCount: d.attachmentsCount ?? 0,
            budget: d.budget,
            description: d.description,
            coverAssetKey: d.coverAssetKey,
            customImage: d.customImage,
            portalEnabled: d.portalEnabled ?? true,
            portalShareCode: d.portalShareCode,
            members: membersMap.get(projectId) || [],
            extraMembersCount: d.extraMembersCount ?? 0,
          })
        }
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.GET, `projects/${projectId}`)
      }
    )

    const unsubMembers = onSnapshot(
      query(collection(db, "projects", projectId, "members"), where("projectId", "==", projectId)),
      (snap) => {
        const list: Member[] = snap.docs.map((docSnap) => {
          const d = docSnap.data()
          return {
            uid: d.uid,
            name: d.name,
            avatar: d.avatar || "/avatars/angelina.jpg",
            projectRole: normalizeProjectRole(d.projectRole),
            role: d.jobTitle || d.projectRole,
            email: d.email,
            status: d.status || "Online",
            statusNote: d.statusNote,
          }
        })
        membersMap.set(projectId, list)
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/members`)
      }
    )

    const unsubTasks = onSnapshot(
      query(collection(db, "projects", projectId, "tasks"), where("projectId", "==", projectId)),
      (snap) => {
        for (const k of Array.from(activeCloudTaskKeys)) {
          if (k.startsWith(`${projectId}:`)) activeCloudTaskKeys.delete(k)
        }
        const list: TaskItem[] = snap.docs.map((docSnap) => {
          const d = docSnap.data()
          const tid = d.id || docSnap.id
          activeCloudTaskKeys.add(`${projectId}:${tid}`)
          return {
            id: tid,
            number: d.number || "01",
            title: d.title,
            project: d.project,
            commentsCount: d.commentsCount ?? (Array.isArray(d.comments) ? d.comments.length : 0),
            subtasksCount: d.subtasksCount ?? (Array.isArray(d.checklist) ? d.checklist.length : 0),
            completed: Boolean(d.completed),
            priority: d.priority || "Medium",
            stage: d.stage || "TODO",
            tags: Array.isArray(d.tags) ? d.tags : [],
            dueDate: d.dueDate,
            dueKind: d.dueKind,
            assignee: d.assigneeName
              ? { name: d.assigneeName, avatar: "/avatars/courtney.jpg", uid: d.assigneeUid }
              : undefined,
            descriptionMarkdown: d.descriptionMarkdown,
            checklist: Array.isArray(d.checklist) ? d.checklist : [],
            comments: Array.isArray(d.comments) ? d.comments : [],
            linkedNoteId: d.linkedNoteId,
          }
        })
        tasksMap.set(projectId, list)
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/tasks`)
      }
    )

    const unsubNotes = onSnapshot(
      query(collection(db, "projects", projectId, "notes"), where("projectId", "==", projectId)),
      (snap) => {
        for (const k of Array.from(activeCloudNoteKeys)) {
          if (k.startsWith(`${projectId}:`)) activeCloudNoteKeys.delete(k)
        }
        const list: ProjectNote[] = snap.docs.map((docSnap) => {
          const d = docSnap.data()
          const nid = d.id || docSnap.id
          activeCloudNoteKeys.add(`${projectId}:${nid}`)
          return {
            id: nid,
            title: d.title,
            contentMarkdown: d.contentMarkdown || "",
            author: d.author || "Equipe",
            updatedAt: "Sincronizado",
          }
        })
        notesMap.set(projectId, list)
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/notes`)
      }
    )

    const unsubDeliverables = onSnapshot(
      query(
        collection(db, "projects", projectId, "deliverables"),
        where("projectId", "==", projectId)
      ),
      (snap) => {
        for (const k of Array.from(activeCloudDeliverableKeys)) {
          if (k.startsWith(`${projectId}:`)) activeCloudDeliverableKeys.delete(k)
        }
        const list: ClientDeliverable[] = snap.docs.map((docSnap) => {
          const d = docSnap.data()
          const did = d.id || docSnap.id
          activeCloudDeliverableKeys.add(`${projectId}:${did}`)
          return {
            id: did,
            title: d.title,
            description: d.description || "",
            milestone: d.milestone || "Marco",
            status: d.status || "pending_review",
            clientFeedback: d.clientFeedback,
            updatedAt: "Sincronizado",
          }
        })
        deliverablesMap.set(projectId, list)
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/deliverables`)
      }
    )

    const unsubAssets = onSnapshot(
      query(collection(db, "projects", projectId, "assets"), where("projectId", "==", projectId)),
      (snap) => {
        const list: ProjectDocument[] = snap.docs.map((docSnap) => {
          const d = docSnap.data()
          const ext = d.fileName?.split(".").pop()?.toUpperCase() || "FILE"
          return {
            id: d.id || docSnap.id,
            name: d.fileName,
            size: formatFileSizeBytes(Number(d.sizeBytes || 0)),
            sizeBytes: Number(d.sizeBytes || 0),
            date: "Nuvem",
            type: d.source === "google_drive" ? "DRIVE" : ext,
            mimeType: d.mimeType,
            source: d.source,
            scope: d.scope,
            r2Key: d.r2Key,
            driveFileId: d.driveFileId,
            driveExternalUrl: d.driveExternalUrl,
            uploadedBy: d.uploadedBy,
            uploadedByName: d.uploadedByName,
          }
        })
        assetsMap.set(projectId, list)
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/assets`)
      }
    )

    const unsubAutomations = onSnapshot(
      query(
        collection(db, "projects", projectId, "automations"),
        where("projectId", "==", projectId)
      ),
      (snap) => {
        for (const k of Array.from(activeCloudAutomationKeys)) {
          if (k.startsWith(`${projectId}:`)) activeCloudAutomationKeys.delete(k)
        }
        const list: AutomationRule[] = snap.docs.map((docSnap) => {
          const d = docSnap.data()
          const rid = d.id || docSnap.id
          activeCloudAutomationKeys.add(`${projectId}:${rid}`)
          return {
            id: rid,
            naturalText: d.naturalText,
            triggerType: d.triggerType,
            triggerValue: d.triggerValue,
            triggerLabel: d.triggerLabel || d.triggerType,
            actionType: d.actionType,
            actionValue: d.actionValue,
            actionLabel: d.actionLabel || d.actionType,
            enabled: Boolean(d.enabled),
            runsCount: d.runsCount ?? 0,
            createdAt: "Nuvem",
          }
        })
        automationsMap.set(projectId, list)
        emitAll()
      },
      (err) => {
        callbacks.onError?.(err)
        handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/automations`)
      }
    )

    projectUnsubs.set(projectId, () => {
      unsubProj()
      unsubMembers()
      unsubTasks()
      unsubNotes()
      unsubDeliverables()
      unsubAssets()
      unsubAutomations()
    })
  }

  const unsubMemberships = onSnapshot(
    query(collection(db, "users", user.uid, "memberships"), where("uid", "==", user.uid)),
    (snap) => {
      hasLoadedMemberships = true
      const currentIds = new Set<string>()
      snap.docs.forEach((docSnap) => {
        const pid = docSnap.id
        currentIds.add(pid)
        attachProjectListeners(pid)
      })
      for (const [pid, unsub] of projectUnsubs.entries()) {
        if (!currentIds.has(pid)) {
          unsub()
          projectUnsubs.delete(pid)
          projectMap.delete(pid)
          membersMap.delete(pid)
          tasksMap.delete(pid)
          notesMap.delete(pid)
          deliverablesMap.delete(pid)
          assetsMap.delete(pid)
          automationsMap.delete(pid)
          clearProjectKeys(pid)
        }
      }
      emitAll()
    },
    (err) => {
      callbacks.onError?.(err)
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/memberships`)
    }
  )

  const unsubEvents = onSnapshot(
    query(
      collection(db, "users", user.uid, "calendarEvents"),
      where("userId", "==", user.uid)
    ),
    (snap) => {
      const evs: CalendarEvent[] = snap.docs.map((docSnap) => {
        const d = docSnap.data()
        return {
          id: d.id || docSnap.id,
          day: d.day,
          month: d.month,
          year: d.year,
          dots: Array.isArray(d.dots) ? d.dots : ["#3B82F6"],
          title: d.title,
          source: d.source || "local",
          googleEventId: d.googleEventId,
          startIso: d.startIso,
        }
      })
      if (evs.length > 0 || isMigrationMarkedForUid(user.uid)) {
        callbacks.onCalendarEventsLoaded(evs)
      }
    },
    (err) => {
      callbacks.onError?.(err)
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/calendarEvents`)
    }
  )

  return () => {
    unsubMemberships()
    unsubEvents()
    for (const unsub of projectUnsubs.values()) {
      unsub()
    }
    projectUnsubs.clear()
    resetCloudRegistry()
  }
}

export async function createCloudProject(
  user: User,
  project: Project,
  initialTasks: TaskItem[] = []
): Promise<void> {
  const built = buildProjectBatchOps(user, project, initialTasks)
  const commitPromise = (async () => {
    try {
      await commitChunkedBatches(built.ops)
      activeCloudProjectIds.add(built.projectId)
      built.taskIds.forEach((tid) => activeCloudTaskKeys.add(`${built.projectId}:${tid}`))
      built.noteIds.forEach((nid) => activeCloudNoteKeys.add(`${built.projectId}:${nid}`))
      built.delivIds.forEach((did) => activeCloudDeliverableKeys.add(`${built.projectId}:${did}`))
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${built.projectId}`)
    } finally {
      pendingProjectCreates.delete(built.projectId)
    }
  })()

  pendingProjectCreates.set(built.projectId, commitPromise)
  await commitPromise
}

export async function updateCloudProjectFields(
  projectId: string,
  patch: Partial<Project>,
  promotionContext?: {
    user: User
    fullProject: Project
    projectTasks?: TaskItem[]
  }
): Promise<void> {
  const safeId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeId)
  if (pending) {
    await pending
  }

  if (!activeCloudProjectIds.has(safeId)) {
    if (promotionContext?.user && isMigrationMarkedForUid(promotionContext.user.uid)) {
      await createCloudProject(
        promotionContext.user,
        promotionContext.fullProject,
        promotionContext.projectTasks || []
      )
    }
    return
  }

  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }

  if (patch.name !== undefined) payload.name = nonEmptyClampStr(patch.name, "Projeto", 120)
  if (patch.company !== undefined) payload.company = nonEmptyClampStr(patch.company, "Cliente", 120)
  if (patch.logo !== undefined) payload.logo = patch.logo
  if (patch.status !== undefined) payload.status = patch.status
  if (patch.priority !== undefined) payload.priority = patch.priority
  if (patch.completedTasks !== undefined) {
    payload.completedTasks = safeInt(patch.completedTasks, 0, 100000)
  }
  if (patch.totalTasks !== undefined) {
    payload.totalTasks = safeInt(patch.totalTasks, 0, 100000)
  }
  if (patch.accentColor !== undefined) payload.accentColor = clampStr(patch.accentColor, 32)
  if (patch.progressColor !== undefined) payload.progressColor = clampStr(patch.progressColor, 32)
  if (patch.progressTrack !== undefined) payload.progressTrack = clampStr(patch.progressTrack, 32)
  if (patch.tags !== undefined) payload.tags = sanitizeTags(patch.tags)
  if (patch.isStarred !== undefined) payload.isStarred = Boolean(patch.isStarred)
  if (patch.isArchived !== undefined) payload.isArchived = Boolean(patch.isArchived)
  if (patch.dueDate !== undefined) payload.dueDate = clampStr(patch.dueDate, 64)
  if (patch.sprintStage !== undefined) payload.sprintStage = clampStr(patch.sprintStage, 64)
  if (patch.attachmentsCount !== undefined) {
    payload.attachmentsCount = safeInt(patch.attachmentsCount, 0, 100000)
  }
  if (patch.budget !== undefined) payload.budget = clampStr(patch.budget, 64)
  if (patch.description !== undefined) payload.description = clampStr(patch.description, 2000)
  if (patch.coverAssetKey !== undefined) payload.coverAssetKey = clampStr(patch.coverAssetKey, 512)
  if (patch.customImage !== undefined) {
    const safeImg = sanitizeSafeCustomImage(patch.customImage)
    if (safeImg) payload.customImage = safeImg
  }
  if (patch.portalEnabled !== undefined) payload.portalEnabled = Boolean(patch.portalEnabled)
  if (patch.portalShareCode !== undefined) {
    payload.portalShareCode = clampStr(patch.portalShareCode, 128)
  }
  if (patch.extraMembersCount !== undefined) {
    payload.extraMembersCount = safeInt(patch.extraMembersCount, 0, 1000)
  }

  // Do not perform an empty metadata write if no root Firestore field actually changed
  if (Object.keys(payload).length <= 1) return

  try {
    await updateDoc(doc(db, "projects", safeId), payload)
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${safeId}`)
  }
}

export async function updateCloudMemberRole(
  projectId: string,
  memberUid: string,
  newRole: ProjectRole,
  jobTitle?: string
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) await pending
  if (!activeCloudProjectIds.has(safeProjectId)) return

  const safeMemberUid = sanitizeDocId(memberUid)
  try {
    await updateDoc(doc(db, "projects", safeProjectId, "members", safeMemberUid), {
      projectRole: newRole,
      ...(jobTitle ? { jobTitle: clampStr(jobTitle, 120) } : {}),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `projects/${safeProjectId}/members/${safeMemberUid}`
    )
  }
}

export async function saveCloudAssetMetadata(
  user: User,
  projectId: string,
  ownerId: string,
  docData: {
    id: string
    source: "r2" | "google_drive"
    scope: ProjectAssetScope
    r2Key?: string
    driveFileId?: string
    driveExternalUrl?: string
    fileName: string
    mimeType: string
    sizeBytes: number
    linkedTaskId?: string
  }
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) await pending
  if (!activeCloudProjectIds.has(safeProjectId)) return

  const safeAssetId = sanitizeDocId(docData.id)

  try {
    await setDoc(doc(db, "projects", safeProjectId, "assets", safeAssetId), {
      id: safeAssetId,
      projectId: safeProjectId,
      ownerId: sanitizeDocId(ownerId),
      source: docData.source,
      scope: docData.scope,
      ...(docData.r2Key ? { r2Key: clampStr(docData.r2Key, 512) } : {}),
      ...(docData.driveFileId ? { driveFileId: clampStr(docData.driveFileId, 256) } : {}),
      ...(docData.driveExternalUrl
        ? { driveExternalUrl: clampStr(docData.driveExternalUrl, 1000) }
        : {}),
      fileName: nonEmptyClampStr(docData.fileName, "arquivo", 255),
      mimeType: nonEmptyClampStr(docData.mimeType, "application/octet-stream", 150),
      sizeBytes: safeInt(docData.sizeBytes, 0, 52428800),
      ...(docData.linkedTaskId ? { linkedTaskId: sanitizeDocId(docData.linkedTaskId) } : {}),
      uploadedBy: user.uid,
      uploadedByName: nonEmptyClampStr(user.displayName || user.email || undefined, "Membro", 120),
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.CREATE,
      `projects/${safeProjectId}/assets/${safeAssetId}`
    )
  }
}

export async function deleteCloudAssetMetadata(
  projectId: string,
  assetId: string
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  if (!activeCloudProjectIds.has(safeProjectId)) return

  const safeAssetId = sanitizeDocId(assetId)
  try {
    await deleteDoc(doc(db, "projects", safeProjectId, "assets", safeAssetId))
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `projects/${safeProjectId}/assets/${safeAssetId}`
    )
  }
}

export async function saveCloudCalendarEvent(
  user: User,
  event: CalendarEvent
): Promise<void> {
  const safeId = sanitizeDocId(event.id)
  try {
    await setDoc(doc(db, "users", user.uid, "calendarEvents", safeId), {
      id: safeId,
      userId: user.uid,
      day: Math.min(31, Math.max(1, safeInt(event.day, 1, 31))),
      month: Math.min(11, Math.max(0, safeInt(event.month, 0, 11))),
      year: Math.min(2100, Math.max(2000, safeInt(event.year, 2000, 2100))),
      dots: (event.dots || ["#3B82F6"]).slice(0, 5),
      title: nonEmptyClampStr(event.title, "Evento", 240),
      source: event.source === "google_calendar" ? "google_calendar" : "local",
      ...(event.googleEventId ? { googleEventId: clampStr(event.googleEventId, 256) } : {}),
      ...(event.startIso ? { startIso: clampStr(event.startIso, 64) } : {}),
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.CREATE,
      `users/${user.uid}/calendarEvents/${safeId}`
    )
  }
}

export async function updateCloudUserTier(
  user: User,
  tier: SubscriptionPlanTier
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", user.uid, "private", "info"), {
      userTier: tier,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/private/info`)
  }
}

export async function updateCloudUserPresence(
  user: User,
  projects: Project[],
  status: MemberStatus,
  statusNote: string
): Promise<void> {
  const safeNote = clampStr(statusNote.trim(), 200)
  try {
    await updateDoc(doc(db, "users", user.uid, "public", "profile"), {
      status,
      statusNote: safeNote,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/public/profile`)
  }

  await Promise.all(
    projects
      .filter((proj) => {
        const safeId = sanitizeDocId(proj.id)
        if (!activeCloudProjectIds.has(safeId)) return false
        return proj.members.some(
          (m) =>
            m.uid === user.uid ||
            (user.email && m.email?.toLowerCase() === user.email.toLowerCase())
        )
      })
      .map(async (proj) => {
        const safeProjectId = sanitizeDocId(proj.id)
        try {
          await updateDoc(doc(db, "projects", safeProjectId, "members", user.uid), {
            status,
            statusNote: safeNote,
            updatedAt: serverTimestamp(),
          })
        } catch {
          // Ignore non-cloud local projects or pending member docs
        }
      })
  )
}

export async function saveCloudTask(
  user: User,
  projectId: string,
  ownerId: string,
  task: TaskItem,
  isNew: boolean
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) {
    await pending
  }

  if (!activeCloudProjectIds.has(safeProjectId)) {
    return
  }

  const safeTaskId = sanitizeDocId(task.id)
  const taskKey = `${safeProjectId}:${safeTaskId}`
  const taskRef = doc(db, "projects", safeProjectId, "tasks", safeTaskId)

  // If caller wanted to update, but document does not exist in Firestore yet, promote to create
  const shouldCreate = isNew || !activeCloudTaskKeys.has(taskKey)

  try {
    if (shouldCreate) {
      await setDoc(taskRef, {
        id: safeTaskId,
        projectId: safeProjectId,
        ownerId: sanitizeDocId(ownerId),
        number: clampStr(task.number || "01", 16),
        title: nonEmptyClampStr(task.title, "Tarefa", 240),
        project: nonEmptyClampStr(task.project, "Projeto", 120),
        commentsCount: safeInt(task.comments?.length ?? task.commentsCount, 0, 10000),
        subtasksCount: safeInt(task.checklist?.length ?? task.subtasksCount, 0, 1000),
        completed: Boolean(task.completed),
        priority: task.priority || "Medium",
        stage: task.stage || (task.completed ? "DONE" : "TODO"),
        tags: sanitizeTags(task.tags),
        ...(task.dueDate ? { dueDate: clampStr(task.dueDate, 64) } : {}),
        ...(task.dueKind ? { dueKind: task.dueKind } : {}),
        ...(task.assignee?.name ? { assigneeName: clampStr(task.assignee.name, 120) } : {}),
        ...(isValidFirestoreId(task.assignee?.uid) ? { assigneeUid: task.assignee.uid } : {}),
        ...(task.descriptionMarkdown
          ? { descriptionMarkdown: clampStr(task.descriptionMarkdown, 20000) }
          : {}),
        checklist: (task.checklist || []).slice(0, 50),
        comments: (task.comments || []).slice(0, 200),
        ...(task.linkedNoteId ? { linkedNoteId: clampStr(task.linkedNoteId, 128) } : {}),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      activeCloudTaskKeys.add(taskKey)
    } else {
      await updateDoc(taskRef, {
        number: clampStr(task.number || "01", 16),
        title: nonEmptyClampStr(task.title, "Tarefa", 240),
        completed: Boolean(task.completed),
        priority: task.priority || "Medium",
        stage: task.stage || (task.completed ? "DONE" : "TODO"),
        tags: sanitizeTags(task.tags),
        dueDate: task.dueDate ? clampStr(task.dueDate, 64) : deleteField(),
        dueKind: task.dueKind ? task.dueKind : deleteField(),
        assigneeName: task.assignee?.name ? clampStr(task.assignee.name, 120) : deleteField(),
        assigneeUid: isValidFirestoreId(task.assignee?.uid) ? task.assignee.uid : deleteField(),
        ...(task.descriptionMarkdown !== undefined
          ? { descriptionMarkdown: clampStr(task.descriptionMarkdown, 20000) }
          : {}),
        checklist: (task.checklist || []).slice(0, 50),
        comments: (task.comments || []).slice(0, 200),
        commentsCount: safeInt(task.comments?.length ?? task.commentsCount, 0, 10000),
        subtasksCount: safeInt(task.checklist?.length ?? task.subtasksCount, 0, 1000),
        linkedNoteId: task.linkedNoteId ? clampStr(task.linkedNoteId, 128) : deleteField(),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    handleFirestoreError(
      error,
      shouldCreate ? OperationType.CREATE : OperationType.UPDATE,
      `projects/${safeProjectId}/tasks/${safeTaskId}`
    )
  }
}

export async function deleteCloudTask(projectId: string, taskId: string): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) await pending

  const safeTaskId = sanitizeDocId(taskId)
  const taskKey = `${safeProjectId}:${safeTaskId}`
  if (!activeCloudProjectIds.has(safeProjectId) || !activeCloudTaskKeys.has(taskKey)) {
    return
  }

  try {
    await deleteDoc(doc(db, "projects", safeProjectId, "tasks", safeTaskId))
    activeCloudTaskKeys.delete(taskKey)
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `projects/${safeProjectId}/tasks/${safeTaskId}`
    )
  }
}

export async function saveCloudNote(
  user: User,
  projectId: string,
  ownerId: string,
  note: ProjectNote,
  isNew: boolean
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) await pending
  if (!activeCloudProjectIds.has(safeProjectId)) return

  const safeNoteId = sanitizeDocId(note.id)
  const noteKey = `${safeProjectId}:${safeNoteId}`
  const noteRef = doc(db, "projects", safeProjectId, "notes", safeNoteId)
  const shouldCreate = isNew || !activeCloudNoteKeys.has(noteKey)

  try {
    if (shouldCreate) {
      await setDoc(noteRef, {
        id: safeNoteId,
        projectId: safeProjectId,
        ownerId: sanitizeDocId(ownerId),
        title: nonEmptyClampStr(note.title, "Nova nota", 200),
        contentMarkdown: clampStr(note.contentMarkdown, 50000),
        author: nonEmptyClampStr(note.author || user.displayName || undefined, "Equipe", 120),
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      activeCloudNoteKeys.add(noteKey)
    } else {
      await updateDoc(noteRef, {
        title: nonEmptyClampStr(note.title, "Nova nota", 200),
        contentMarkdown: clampStr(note.contentMarkdown, 50000),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    handleFirestoreError(
      error,
      shouldCreate ? OperationType.CREATE : OperationType.UPDATE,
      `projects/${safeProjectId}/notes/${safeNoteId}`
    )
  }
}

export async function saveCloudDeliverable(
  user: User,
  projectId: string,
  ownerId: string,
  deliverable: ClientDeliverable,
  isNew: boolean
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) await pending
  if (!activeCloudProjectIds.has(safeProjectId)) return

  const safeDelivId = sanitizeDocId(deliverable.id)
  const delivKey = `${safeProjectId}:${safeDelivId}`
  const delivRef = doc(db, "projects", safeProjectId, "deliverables", safeDelivId)
  const shouldCreate = isNew || !activeCloudDeliverableKeys.has(delivKey)

  try {
    if (shouldCreate) {
      await setDoc(delivRef, {
        id: safeDelivId,
        projectId: safeProjectId,
        ownerId: sanitizeDocId(ownerId),
        title: nonEmptyClampStr(deliverable.title, "Entregável", 200),
        description: clampStr(deliverable.description, 2000),
        milestone: nonEmptyClampStr(deliverable.milestone, "Marco", 100),
        status: deliverable.status || "pending_review",
        ...(deliverable.clientFeedback
          ? { clientFeedback: clampStr(deliverable.clientFeedback, 2000) }
          : {}),
        publishedBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      activeCloudDeliverableKeys.add(delivKey)
    } else {
      await updateDoc(delivRef, {
        title: nonEmptyClampStr(deliverable.title, "Entregável", 200),
        description: clampStr(deliverable.description, 2000),
        milestone: nonEmptyClampStr(deliverable.milestone, "Marco", 100),
        status: deliverable.status || "pending_review",
        ...(deliverable.clientFeedback
          ? { clientFeedback: clampStr(deliverable.clientFeedback, 2000) }
          : {}),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    handleFirestoreError(
      error,
      shouldCreate ? OperationType.CREATE : OperationType.UPDATE,
      `projects/${safeProjectId}/deliverables/${safeDelivId}`
    )
  }
}

export async function saveCloudAutomationRule(
  user: User,
  projectId: string,
  ownerId: string,
  rule: AutomationRule,
  isNew: boolean
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const pending = pendingProjectCreates.get(safeProjectId)
  if (pending) await pending
  if (!activeCloudProjectIds.has(safeProjectId)) return

  const safeRuleId = sanitizeDocId(rule.id)
  const ruleKey = `${safeProjectId}:${safeRuleId}`
  const ruleRef = doc(db, "projects", safeProjectId, "automations", safeRuleId)
  const shouldCreate = isNew || !activeCloudAutomationKeys.has(ruleKey)

  try {
    if (shouldCreate) {
      await setDoc(ruleRef, {
        id: safeRuleId,
        projectId: safeProjectId,
        ownerId: sanitizeDocId(ownerId),
        naturalText: nonEmptyClampStr(rule.naturalText, "Regra de automação", 500),
        triggerType: rule.triggerType,
        ...(rule.triggerValue ? { triggerValue: clampStr(rule.triggerValue, 120) } : {}),
        ...(rule.triggerLabel ? { triggerLabel: clampStr(rule.triggerLabel, 200) } : {}),
        actionType: rule.actionType,
        ...(rule.actionValue ? { actionValue: clampStr(rule.actionValue, 120) } : {}),
        ...(rule.actionLabel ? { actionLabel: clampStr(rule.actionLabel, 200) } : {}),
        enabled: Boolean(rule.enabled),
        runsCount: safeInt(rule.runsCount, 0, 1000000),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      activeCloudAutomationKeys.add(ruleKey)
    } else {
      await updateDoc(ruleRef, {
        enabled: Boolean(rule.enabled),
        runsCount: safeInt(rule.runsCount, 0, 1000000),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    handleFirestoreError(
      error,
      shouldCreate ? OperationType.CREATE : OperationType.UPDATE,
      `projects/${safeProjectId}/automations/${safeRuleId}`
    )
  }
}

export async function deleteCloudAutomationRule(
  projectId: string,
  ruleId: string
): Promise<void> {
  const safeProjectId = sanitizeDocId(projectId)
  const safeRuleId = sanitizeDocId(ruleId)
  const ruleKey = `${safeProjectId}:${safeRuleId}`
  if (!activeCloudProjectIds.has(safeProjectId) || !activeCloudAutomationKeys.has(ruleKey)) {
    return
  }

  try {
    await deleteDoc(doc(db, "projects", safeProjectId, "automations", safeRuleId))
    activeCloudAutomationKeys.delete(ruleKey)
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `projects/${safeProjectId}/automations/${safeRuleId}`
    )
  }
}
