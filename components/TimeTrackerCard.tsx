"use client"

import React, { useMemo } from "react"
import { Play, Pause, RotateCcw, Timer, Target } from "lucide-react"
import { TrackedTimer } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProjectLogoIcon } from "@/components/Logos"

interface TimeTrackerCardProps {
  timers: TrackedTimer[]
  onToggleTimer: (id: string) => void
  onResetTimer?: (id: string) => void
  onOpenFocusMode?: () => void
}

export function TimeTrackerCard({
  timers,
  onToggleTimer,
  onResetTimer,
  onOpenFocusMode,
}: TimeTrackerCardProps) {
  const timersByProject = useMemo(() => {
    const groups = new Map<string, TrackedTimer[]>()

    for (const timer of timers) {
      const project = timer.project?.trim() || "Sem projeto"
      const group = groups.get(project) ?? []
      group.push(timer)
      groups.set(project, group)
    }

    return [...groups.entries()].sort(([a], [b]) => {
      if (a === "Google") return -1
      if (b === "Google") return 1
      if (a === "Slack") return -1
      if (b === "Slack") return 1
      return a.localeCompare(b, "pt-PT")
    })
  }, [timers])

  const formatTime = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds))
    const hours = Math.floor(safeSeconds / 3600)
    const minutes = Math.floor((safeSeconds % 3600) / 60)
    const seconds = safeSeconds % 60

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
    }
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`
  }

  const renderTimerRow = (timer: TrackedTimer) => (
    <div
      key={timer.id}
      className={cn(
        "flex min-w-0 items-center justify-between gap-2.5 rounded-2xl border p-3 transition-[background-color,border-color,box-shadow] duration-150 sm:p-3.5",
        timer.isRunning
          ? "border-primary/25 bg-primary-subtle/50 shadow-2xs"
          : "border-transparent bg-muted/40 hover:border-border/70 hover:bg-muted/70"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
            timer.isRunning
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border/60 bg-card text-muted-foreground"
          )}
        >
          <Timer className={cn("size-4", timer.isRunning && "animate-spin-slow")} />
        </div>
        <span className="truncate text-xs font-semibold text-card-foreground sm:text-sm">
          {timer.taskTitle}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span
          className={cn(
            "min-w-[4.5rem] text-right font-mono text-xs font-bold tabular-nums sm:text-sm",
            timer.isRunning ? "text-primary" : "text-muted-foreground"
          )}
        >
          {formatTime(timer.secondsElapsed)}
        </span>

        <Button
          type="button"
          variant={timer.isRunning ? "default" : "outline"}
          size="icon"
          onClick={() => onToggleTimer(timer.id)}
          className="size-9 rounded-full sm:size-8"
          aria-label={timer.isRunning ? `Pausar ${timer.taskTitle}` : `Iniciar ${timer.taskTitle}`}
        >
          {timer.isRunning ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 translate-x-0.5 fill-current" />
          )}
        </Button>

        {onResetTimer && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onResetTimer(timer.id)}
            className="size-8 rounded-lg text-muted-foreground/70 hover:text-foreground"
            title="Repor cronómetro"
            aria-label={`Repor tempo de ${timer.taskTitle}`}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <section
      aria-label="Controlo de tempo"
      className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6"
    >
      <div className="space-y-5">
        {timersByProject.length > 0 ? (
          timersByProject.map(([project, projectTimers]) => (
            <div key={project} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <ProjectLogoIcon project={project} className="size-4" />
                <h4 className="text-sm font-bold tracking-tight text-card-foreground">
                  {project}
                </h4>
                <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
                  {projectTimers.length}
                </span>
              </div>
              <div className="space-y-2">{projectTimers.map(renderTimerRow)}</div>
            </div>
          ))
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-7 text-center">
            <span className="mb-3 flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-card text-muted-foreground">
              <Timer className="size-5" />
            </span>
            <p className="text-sm font-semibold text-card-foreground">
              Ainda não há cronómetros
            </p>
            <p className="mt-1 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
              Quando iniciares o registo de tempo numa tarefa, poderás acompanhá-lo aqui.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/70 pt-3.5 text-xs text-muted-foreground">
        <span>
          {timers.length === 1 ? "1 cronómetro" : `${timers.length} cronómetros`}
        </span>
        {onOpenFocusMode && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenFocusMode}
            className="h-8 gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-primary"
          >
            <Target className="size-3.5" />
            <span>Modo Foco</span>
          </Button>
        )}
      </div>
    </section>
  )
}
