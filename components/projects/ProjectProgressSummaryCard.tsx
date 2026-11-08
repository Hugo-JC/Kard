"use client"

import React from "react"
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  AlertCircle,
  Zap,
  Target
} from "lucide-react"
import { Project, TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProjectProgressSummaryCardProps {
  project: Project
  tasks: TaskItem[]
}

export function ProjectProgressSummaryCard({
  project,
  tasks,
}: ProjectProgressSummaryCardProps) {
  const accentColor = project.accentColor || project.progressColor || "#5E6AD2"

  // Tasks metrics
  const projectTasks = tasks.filter(
    (t) => t.project.toLowerCase() === project.name.toLowerCase()
  )
  const totalTasks = Math.max(project.totalTasks, projectTasks.length, 1)
  const completedTasks = projectTasks.filter((t) => t.completed).length || project.completedTasks
  const inProgressTasks = projectTasks.filter((t) => !t.completed && (t.stage === "IN PROGRESS" || t.priority === "High")).length
  const todoTasks = Math.max(0, totalTasks - completedTasks - inProgressTasks)

  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  // Estimated remaining time / days calculation
  const getEstimatedRemaining = (dueDateStr: string) => {
    // Return sensible human-friendly remaining timeline based on dueDate
    const upper = dueDateStr.toUpperCase()
    if (upper.includes("JUNE")) return { days: 12, hours: 38, label: "12 Days Remaining" }
    if (upper.includes("JULY")) return { days: 28, hours: 64, label: "28 Days Remaining" }
    if (upper.includes("AUGUST")) return { days: 45, hours: 92, label: "45 Days Remaining" }
    if (upper.includes("SEPTEMBER")) return { days: 60, hours: 120, label: "60 Days Remaining" }
    return { days: 18, hours: 48, label: "18 Days Remaining" }
  }

  const remaining = getEstimatedRemaining(project.dueDate)

  // Radial chart calculations
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionRate / 100) * circumference

  // Mini burnup / sprint sparkline points: S1 -> S2 -> S3 -> Target
  const s1Val = Math.min(25, Math.round(completionRate * 0.3))
  const s2Val = Math.min(60, Math.round(completionRate * 0.7))
  const s3Val = completionRate
  const sparklinePoints = [
    { x: 10, y: 55 - (s1Val / 100) * 45, label: "S1", val: `${s1Val}%` },
    { x: 50, y: 55 - (s2Val / 100) * 45, label: "S2", val: `${s2Val}%` },
    { x: 90, y: 55 - (s3Val / 100) * 45, label: "S3", val: `${s3Val}%` },
    { x: 130, y: 10, label: "Target", val: "100%" },
  ]
  const pathD = `M ${sparklinePoints[0].x} ${sparklinePoints[0].y} Q ${sparklinePoints[1].x - 10} ${sparklinePoints[1].y + 5}, ${sparklinePoints[1].x} ${sparklinePoints[1].y} T ${sparklinePoints[2].x} ${sparklinePoints[2].y} T ${sparklinePoints[3].x} ${sparklinePoints[3].y}`
  const areaD = `${pathD} L 130 65 L 10 65 Z`

  return (
    <div className="rounded-[28px] bg-card border border-border shadow-[0_2px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] p-5 sm:p-6 space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-2xs"
            style={{ backgroundColor: accentColor }}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-card-foreground tracking-tight flex items-center gap-2">
              <span>Project Progress & Velocity Summary</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                On Track
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Live milestone telemetry, task distribution, and burnup completion rate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="rounded-lg bg-muted/60 px-2.5 py-1 border border-border/60">
            {project.sprintStage || "Sprint 3 / 6"}
          </span>
          <span className="rounded-lg bg-muted/60 px-2.5 py-1 border border-border/60 font-mono">
            Effort: ~{remaining.hours}h left
          </span>
        </div>
      </div>

      {/* 3 Core Summary Metric Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Metric 1: Total Number of Tasks & Stacked Distribution */}
        <div className="rounded-2xl bg-muted/30 dark:bg-[#121418] p-4 border border-border/70 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Total Deliverables
              </span>
              <Target className="w-3.5 h-3.5 text-primary" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-card-foreground tabular-nums">
                {totalTasks}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Total Tasks
              </span>
            </div>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden flex">
              <div
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`${completedTasks} Completed`}
              />
              <div
                style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                className="h-full bg-primary transition-all duration-500"
                title={`${inProgressTasks} In Progress`}
              />
              <div
                style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all duration-500"
                title={`${todoTasks} To Do`}
              />
            </div>

            {/* Sub-counts legend */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {completedTasks} Done
              </span>
              <span className="flex items-center gap-1 text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {inProgressTasks} In Progress
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                {todoTasks} To Do
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Remaining Time & Pace */}
        <div className="rounded-2xl bg-muted/30 dark:bg-[#121418] p-4 border border-border/70 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Estimated Time Remaining
              </span>
              <Clock className="w-3.5 h-3.5 text-rose-500" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-card-foreground tabular-nums">
                {remaining.days}
              </span>
              <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                Days to Deadline
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-card dark:bg-[#16181E] p-2.5 border border-border/60 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Target Delivery:</span>
              <span className="font-bold text-card-foreground">{project.dueDate}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Sprint Pace:</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 1.8 tasks/day
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Completion Rate with Mini Progress Chart */}
        <div className="rounded-2xl bg-muted/30 dark:bg-[#121418] p-4 border border-border/70 flex items-center justify-between gap-3">
          {/* Left: Numbers */}
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground block">
              Average Completion
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-card-foreground tracking-tight tabular-nums">
              {completionRate}%
            </div>
            <p className="text-[11px] text-muted-foreground">
              +{Math.min(18, Math.round(completionRate * 0.25))}% vs previous cycle
            </p>
          </div>

          {/* Right: Small Radial Chart & Mini Trendline */}
          <div className="flex flex-col items-center shrink-0">
            {/* Circular Progress Gauge */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 90 90">
                {/* Background Ring */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="transparent"
                  className="text-slate-200 dark:text-zinc-800"
                />
                {/* Foreground Progress Ring */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke={accentColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-card-foreground">
                {completionRate}%
              </div>
            </div>

            {/* Mini SVG Sparkline under chart */}
            <div className="w-28 h-7 mt-1 overflow-hidden" title="Sprint trajectory">
              <svg className="w-full h-full" viewBox="0 0 140 65" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#grad-${project.id})`} />
                <path
                  d={pathD}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {sparklinePoints.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === 2 ? 3 : 2}
                    fill={accentColor}
                    className="stroke-card"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
