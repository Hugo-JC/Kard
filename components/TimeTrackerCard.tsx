"use client"

import React, { useState, useEffect } from "react"
import { Play, Pause, MoreVertical, Timer, RotateCcw } from "lucide-react"
import { TrackedTimer } from "@/lib/data"
import { cn } from "@/lib/utils"

import { Target } from "lucide-react"
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
  // Format seconds into "25m 20s" or "1h 10m 05s"
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

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6">
      <div>
        {/* Google Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ProjectLogoIcon project="Google" className="w-4 h-4" />
              <h4 className="text-sm font-bold text-card-foreground tracking-tight">
                Google
              </h4>
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border/60">
              <Play className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            {googleTimers.map((timer) => (
              <div
                key={timer.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3.5 transition-all duration-200",
                  timer.isRunning
                    ? "bg-primary-subtle/50 dark:bg-blue-950/25 border border-primary/20 dark:border-blue-800/40 shadow-2xs"
                    : "bg-slate-50/70 dark:bg-slate-900/40 hover:bg-muted/70 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      timer.isRunning
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-card text-muted-foreground border border-border/60"
                    )}
                  >
                    <Timer
                      className={cn(
                        "w-4 h-4",
                        timer.isRunning && "animate-spin-slow"
                      )}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-card-foreground truncate">
                    {timer.taskTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-bold tabular-nums",
                      timer.isRunning ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(timer.secondsElapsed)}
                  </span>

                  {/* Play/Pause Button */}
                  <button
                    onClick={() => onToggleTimer(timer.id)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full transition-transform active:scale-95 sm:size-8",
                      timer.isRunning
                        ? "bg-primary text-primary-foreground shadow-2xs hover:bg-blue-700"
                        : "border border-border text-muted-foreground hover:bg-muted hover:border-slate-400"
                    )}
                    aria-label={timer.isRunning ? "Pause timer" : "Start timer"}
                  >
                    {timer.isRunning ? (
                      <Pause className="w-3 h-3 fill-white" />
                    ) : (
                      <Play className="w-3 h-3 fill-muted-foreground translate-x-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onResetTimer?.(timer.id)}
                    className="text-muted-foreground/60 hover:text-card-foreground p-0.5 cursor-pointer"
                    title="Reset timer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slack Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-card-foreground tracking-tight">
              Slack
            </h4>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border/60">
              <Play className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            {slackTimers.map((timer) => (
              <div
                key={timer.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3 transition-colors",
                  timer.isRunning
                    ? "bg-primary-subtle/50 dark:bg-blue-950/25 border border-primary/20 shadow-2xs"
                    : "hover:bg-muted/70"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-card-foreground truncate">
                    {timer.taskTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                    {formatTime(timer.secondsElapsed)}
                  </span>

                  <button
                    onClick={() => onToggleTimer(timer.id)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full transition-transform active:scale-95 sm:size-8",
                      timer.isRunning
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
                    )}
                    aria-label={timer.isRunning ? "Pause timer" : "Start timer"}
                  >
                    {timer.isRunning ? (
                      <Pause className="w-3 h-3 fill-white" />
                    ) : (
                      <Play className="w-3 h-3 fill-muted-foreground translate-x-0.2" />
                    )}
                  </button>

                  <button
                    onClick={() => onResetTimer?.(timer.id)}
                    className="text-muted-foreground/60 hover:text-card-foreground p-0.5 cursor-pointer"
                    title="Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer subtle summary */}
      <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Active Tracker: Google</span>
        <span className="text-success font-semibold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Synchronized
        </span>
      </div>
    </div>
  )
}
