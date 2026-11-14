"use client"

import React, { useMemo, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Sun,
  CalendarClock,
  AlertCircle,
  BellRing,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Plus,
} from "lucide-react"
import { CalendarEvent, NotificationItem, TaskItem } from "@/lib/data"
import { buildMorningBriefing } from "@/lib/briefing"
import { Button } from "@/components/ui/button"
import { TaskCheckButton } from "@/components/ui/TaskCheckButton"
import { ProjectLogoIcon } from "@/components/Logos"
import { cn } from "@/lib/utils"

interface MorningBriefingCardProps {
  tasks: TaskItem[]
  notifications: NotificationItem[]
  calendarEvents: CalendarEvent[]
  collapsed: boolean
  onToggleCollapse: () => void
  onToggleTask: (taskId: string) => void
  onOpenTask: (task: TaskItem) => void
  onOpenNewTaskModal: () => void
  onAcceptInvitation: (
    notifId: string,
    invitationData: NonNullable<NotificationItem["invitationData"]>
  ) => void
  onDeclineInvitation: (notifId: string) => void
  onMarkNotificationRead: (notifId: string) => void
}

export function MorningBriefingCard({
  tasks,
  notifications,
  calendarEvents,
  collapsed,
  onToggleCollapse,
  onToggleTask,
  onOpenTask,
  onOpenNewTaskModal,
  onAcceptInvitation,
  onDeclineInvitation,
  onMarkNotificationRead,
}: MorningBriefingCardProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const todayFormatted = useMemo(() => {
    if (!isMounted) return "Resumo do dia"
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    })
  }, [isMounted])

  const briefing = useMemo(
    () => buildMorningBriefing(tasks, notifications, calendarEvents),
    [tasks, notifications, calendarEvents]
  )

  return (
    <section
      aria-label="Briefing Matinal"
      className="rounded-3xl border border-border/80 bg-card text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)]"
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <Sun className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                Briefing Matinal
              </h2>
              <span className="text-xs text-muted-foreground capitalize">
                · {todayFormatted}
              </span>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {briefing.dueTodayTasks.length} vencem hoje ·{" "}
              {briefing.overdueTasks.length} em atraso ·{" "}
              {briefing.pendingInvitations.length + briefing.unreadMentions.length}{" "}
              menções e convites
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenNewTaskModal}
            className="h-8 gap-1 rounded-xl text-xs font-semibold"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Nova tarefa</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 gap-1 rounded-xl text-xs font-semibold text-muted-foreground"
            aria-expanded={!collapsed}
          >
            <span>{collapsed ? "Expandir" : "Recolher"}</span>
            {collapsed ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronUp className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible 3-Column Briefing Grid */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="border-t border-border/70 px-5 py-4 sm:px-6"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Column 1: Vence Hoje */}
              <div className="space-y-2.5 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Vence Hoje
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">
                    {briefing.dueTodayTasks.length}
                  </span>
                </div>

                {briefing.dueTodayTasks.length === 0 &&
                briefing.todayEvents.length === 0 ? (
                  <p className="py-3 text-xs text-muted-foreground">
                    Nenhuma entrega vencendo hoje.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {briefing.dueTodayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 border border-border/60"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <TaskCheckButton
                            checked={task.completed}
                            size="sm"
                            onToggle={() => onToggleTask(task.id)}
                            ariaLabel={`Concluir ${task.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => onOpenTask(task)}
                            className="min-w-0 flex-1 text-left cursor-pointer group"
                          >
                            <p className="truncate text-xs font-semibold text-card-foreground group-hover:text-primary">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <ProjectLogoIcon
                                project={task.project}
                                className="size-3 shrink-0"
                              />
                              <span className="truncate">{task.project}</span>
                              <span>·</span>
                              <span className="font-mono">{task.priority}</span>
                            </div>
                          </button>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenTask(task)}
                          aria-label={`Abrir ${task.title}`}
                          className="size-7 shrink-0 text-muted-foreground"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </div>
                    ))}

                    {briefing.todayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground"
                      >
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ev.dots[0] || "#3B82F6" }}
                        />
                        <span className="truncate">Agenda: {ev.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Atrasadas */}
              <div className="space-y-2.5 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-warning" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Atrasadas / Atenção
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-warning-foreground">
                    {briefing.overdueTasks.length}
                  </span>
                </div>

                {briefing.overdueTasks.length === 0 ? (
                  <p className="py-3 text-xs text-muted-foreground">
                    Tudo em dia — zero tarefas atrasadas.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {briefing.overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 border border-border/60"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <TaskCheckButton
                            checked={task.completed}
                            size="sm"
                            variant="warning"
                            onToggle={() => onToggleTask(task.id)}
                            ariaLabel={`Concluir ${task.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => onOpenTask(task)}
                            className="min-w-0 flex-1 text-left cursor-pointer group"
                          >
                            <p className="truncate text-xs font-semibold text-card-foreground group-hover:text-primary">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <ProjectLogoIcon
                                project={task.project}
                                className="size-3 shrink-0"
                              />
                              <span className="truncate">{task.project}</span>
                              <span>·</span>
                              <span className="font-semibold text-danger-foreground">
                                {task.dueDate || "Atrasada"}
                              </span>
                            </div>
                          </button>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenTask(task)}
                          aria-label={`Abrir ${task.title}`}
                          className="size-7 shrink-0 text-muted-foreground"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 3: Menções & Convites */}
              <div className="space-y-2.5 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="size-4 text-success" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Menções & Convites
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">
                    {briefing.pendingInvitations.length +
                      briefing.unreadMentions.length}
                  </span>
                </div>

                {briefing.pendingInvitations.length === 0 &&
                briefing.unreadMentions.length === 0 ? (
                  <p className="py-3 text-xs text-muted-foreground">
                    Nenhuma menção ou convite pendente.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {briefing.pendingInvitations.map((notif) => {
                      const inv = notif.invitationData
                      if (!inv) return null
                      return (
                        <div
                          key={notif.id}
                          className="rounded-xl border border-border/60 bg-card p-3 space-y-2"
                        >
                          <div className="text-xs">
                            <p className="font-semibold text-card-foreground">
                              Convite: {inv.projectName}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {inv.invitedBy} · {inv.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onAcceptInvitation(notif.id, inv)}
                              className="h-7 flex-1 gap-1 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <Check className="size-3" />
                              <span>Colaborar</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onDeclineInvitation(notif.id)}
                              className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
                            >
                              <X className="size-3" />
                              <span>Negar</span>
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    {briefing.unreadMentions.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-card-foreground">
                            {notif.title}
                          </p>
                          <p className="line-clamp-2 text-[11px] text-muted-foreground mt-0.5">
                            {notif.description}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onMarkNotificationRead(notif.id)}
                          aria-label="Marcar menção como lida"
                          className="size-7 shrink-0 text-muted-foreground hover:text-primary"
                        >
                          <Check className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
