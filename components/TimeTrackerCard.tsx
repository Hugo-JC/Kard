"use client"

import React from "react"
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
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${String(seconds).padStart(2, "0")}s`
    }
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`
  }

  const googleTimers = timers.filter((t) => t.project === "Google")
  const slackTimers = timers.filter((t) => t.project === "Slack")

  const renderTimerRow = (timer: TrackedTimer) => (
    <div
      key={timer.id}
      className={cn(
        "flex items-center justify-between gap-2.5 rounded-2xl p-3 transition-[background-color,border-color] duration-150 sm:p-3.5",
        timer.isRunning
          ? "border border-primary/25 bg-primary-subtle/50 shadow-2xs"
          : "border border-transparent bg-muted/40 hover:bg-muted/70"
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

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <span
          className={cn(
            "font-mono text-xs font-bold tabular-nums sm:text-sm",
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
            title="Zerar cronômetro"
            aria-label={`Zerar ${timer.taskTitle}`}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <section
      aria-label="Controle de tempo"
      className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6"
    >
      <div className="space-y-5">
        {/* Google Section */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <ProjectLogoIcon project="Google" className="size-4" />
            <h4 className="text-sm font-bold tracking-tight text-card-foreground">
              Google
            </h4>
          </div>
          <div className="space-y-2">{googleTimers.map(renderTimerRow)}</div>
        </div>

        {/* Slack Section */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <ProjectLogoIcon project="Slack" className="size-4" />
            <h4 className="text-sm font-bold tracking-tight text-card-foreground">
              Slack
            </h4>
          </div>
          <div className="space-y-2">{slackTimers.map(renderTimerRow)}</div>
        </div>
      </div>

      {/* Footer summary + Focus Mode shortcut */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/70 pt-3.5 text-xs text-muted-foreground">
        <span>Sincronizado · Local</span>
        {onOpenFocusMode ? (
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
        ) : (
          <span className="font-semibold text-success-foreground">Ativo</span>
        )}
      </div>
    </section>
  )
}
