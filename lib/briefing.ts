import { CalendarEvent, NotificationItem, TaskItem } from "./data"

export interface MorningBriefingSummary {
  dueTodayTasks: TaskItem[]
  overdueTasks: TaskItem[]
  pendingInvitations: NotificationItem[]
  unreadMentions: NotificationItem[]
  todayEvents: CalendarEvent[]
  totalAttentionCount: number
}

function classifyTaskDueStatus(task: TaskItem): "today" | "overdue" | "upcoming" {
  if (task.dueKind) return task.dueKind
  const raw = (task.dueDate || "").toLowerCase().trim()
  if (!raw) return "upcoming"
  if (raw === "hoje" || raw === "today") return "today"
  if (raw === "ontem" || raw === "yesterday" || raw.includes("atras")) {
    return "overdue"
  }
  return "upcoming"
}

export function buildMorningBriefing(
  tasks: TaskItem[],
  notifications: NotificationItem[],
  calendarEvents: CalendarEvent[]
): MorningBriefingSummary {
  const openTasks = tasks.filter((t) => !t.completed)

  const dueTodayTasks = openTasks.filter(
    (t) => classifyTaskDueStatus(t) === "today"
  )

  const overdueTasks = openTasks.filter(
    (t) => classifyTaskDueStatus(t) === "overdue"
  )

  const pendingInvitations = notifications.filter(
    (n) =>
      n.type === "invitation" &&
      n.invitationData &&
      n.invitationData.status === "pending"
  )

  const unreadMentions = notifications.filter(
    (n) =>
      !n.read &&
      (n.type === "mention" || n.type === "comment" || n.type === "portal")
  )

  const todayEvents = calendarEvents.filter((ev) => ev.isToday)

  const totalAttentionCount =
    dueTodayTasks.length +
    overdueTasks.length +
    pendingInvitations.length +
    unreadMentions.length

  return {
    dueTodayTasks,
    overdueTasks,
    pendingInvitations,
    unreadMentions,
    todayEvents,
    totalAttentionCount,
  }
}
