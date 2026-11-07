"use client"

import React, { useState, useEffect } from "react"
import { Play, Pause, MoreVertical, Timer, RotateCcw } from "lucide-react"
import { TrackedTimer } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TimeTrackerCardProps {
  timers: TrackedTimer[]
  onToggleTimer: (id: string) => void
  onResetTimer?: (id: string) => void
}

export function TimeTrackerCard({
  timers,
  onToggleTimer,
  onResetTimer,
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
    <div className="rounded-[28px] bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
      <div>
        {/* Google Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Google
            </h4>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
              <Play className="w-3 h-3 fill-slate-400 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            {googleTimers.map((timer) => (
              <div
                key={timer.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3.5 transition-all duration-200",
                  timer.isRunning
                    ? "bg-[#F5F8FF] border border-blue-100/80 shadow-2xs"
                    : "bg-slate-50/70 hover:bg-slate-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      timer.isRunning
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-500 border border-slate-200/60"
                    )}
                  >
                    <Timer
                      className={cn(
                        "w-4 h-4",
                        timer.isRunning && "animate-spin-slow"
                      )}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {timer.taskTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-bold tabular-nums",
                      timer.isRunning ? "text-blue-600" : "text-slate-600"
                    )}
                  >
                    {formatTime(timer.secondsElapsed)}
                  </span>

                  {/* Play/Pause Button */}
                  <button
                    onClick={() => onToggleTimer(timer.id)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-95 cursor-pointer",
                      timer.isRunning
                        ? "bg-[#0D6EFD] text-white shadow-2xs hover:bg-blue-700"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                    )}
                    aria-label={timer.isRunning ? "Pause timer" : "Start timer"}
                  >
                    {timer.isRunning ? (
                      <Pause className="w-3 h-3 fill-white" />
                    ) : (
                      <Play className="w-3 h-3 fill-slate-600 translate-x-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onResetTimer?.(timer.id)}
                    className="text-slate-300 hover:text-slate-600 p-0.5"
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
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Slack
            </h4>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
              <Play className="w-3 h-3 fill-slate-400 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            {slackTimers.map((timer) => (
              <div
                key={timer.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3 transition-colors",
                  timer.isRunning
                    ? "bg-[#F5F8FF] border border-blue-100 shadow-2xs"
                    : "hover:bg-slate-50/80"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {timer.taskTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {formatTime(timer.secondsElapsed)}
                  </span>

                  <button
                    onClick={() => onToggleTimer(timer.id)}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-95 cursor-pointer",
                      timer.isRunning
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    )}
                    aria-label={timer.isRunning ? "Pause timer" : "Start timer"}
                  >
                    {timer.isRunning ? (
                      <Pause className="w-3 h-3 fill-white" />
                    ) : (
                      <Play className="w-3 h-3 fill-slate-400 translate-x-0.2" />
                    )}
                  </button>

                  <button
                    onClick={() => onResetTimer?.(timer.id)}
                    className="text-slate-300 hover:text-slate-600 p-0.5"
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
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Active Tracker: Google</span>
        <span className="text-emerald-600 font-semibold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Synchronized
        </span>
      </div>
    </div>
  )
}
