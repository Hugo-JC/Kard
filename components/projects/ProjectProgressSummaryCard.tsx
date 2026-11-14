"use client"

import React from "react"
import { Clock, TrendingUp, Zap, Target } from "lucide-react"
import { Project, TaskItem } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"

interface ProjectProgressSummaryCardProps {
  project: Project
  tasks: TaskItem[]
}

export function ProjectProgressSummaryCard({
  project,
  tasks,
}: ProjectProgressSummaryCardProps) {
  const accentColor = project.accentColor || project.progressColor || "#3B82F6"

  const projectTasks = tasks.filter(
    (t) => t.project.toLowerCase() === project.name.toLowerCase()
  )
  const totalTasks = Math.max(project.totalTasks, projectTasks.length, 1)
  const completedTasks =
    projectTasks.filter((t) => t.completed).length || project.completedTasks
  const inProgressTasks = projectTasks.filter(
    (t) => !t.completed && (t.stage === "IN PROGRESS" || t.priority === "High")
  ).length
  const todoTasks = Math.max(0, totalTasks - completedTasks - inProgressTasks)

  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  const getEstimatedRemaining = (dueDateStr: string) => {
    const upper = dueDateStr.toUpperCase()
    if (upper.includes("JUNE"))
      return { days: 12, hours: 38, label: "12 dias restantes" }
    if (upper.includes("JULY"))
      return { days: 28, hours: 64, label: "28 dias restantes" }
    if (upper.includes("AUGUST"))
      return { days: 45, hours: 92, label: "45 dias restantes" }
    if (upper.includes("SEPTEMBER"))
      return { days: 60, hours: 120, label: "60 dias restantes" }
    return { days: 18, hours: 48, label: "18 dias restantes" }
  }

  const remaining = getEstimatedRemaining(project.dueDate)

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionRate / 100) * circumference

  const s1Val = Math.min(25, Math.round(completionRate * 0.3))
  const s2Val = Math.min(60, Math.round(completionRate * 0.7))
  const s3Val = completionRate
  const sparklinePoints = [
    { x: 10, y: 55 - (s1Val / 100) * 45 },
    { x: 50, y: 55 - (s2Val / 100) * 45 },
    { x: 90, y: 55 - (s3Val / 100) * 45 },
    { x: 130, y: 10 },
  ]
  const pathD = `M ${sparklinePoints[0].x} ${sparklinePoints[0].y} Q ${
    sparklinePoints[1].x - 10
  } ${sparklinePoints[1].y + 5}, ${sparklinePoints[1].x} ${
    sparklinePoints[1].y
  } T ${sparklinePoints[2].x} ${sparklinePoints[2].y} T ${
    sparklinePoints[3].x
  } ${sparklinePoints[3].y}`
  const areaD = `${pathD} L 130 65 L 10 65 Z`

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Top Row: Clean heading + unboxed inline metadata */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: accentColor }}
            >
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-card-foreground">
                Resumo de Progresso e Velocidade
              </h3>
              <p className="text-xs text-muted-foreground">
                Distribuição de entregas, ritmo da sprint e taxa média de conclusão.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="text-success-foreground font-semibold">No prazo</span>
            <span>·</span>
            <span>{project.sprintStage || "Sprint 3 / 6"}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">~{remaining.hours}h restantes</span>
          </div>
        </div>

        {/* 3 Clean Bento Sub-Surfaces (no nested borders) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Metric 1: Total Deliverables */}
          <div className="flex flex-col justify-between space-y-4 rounded-2xl bg-muted/40 p-5">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">Total de entregas</span>
                <Target className="size-4 text-primary" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tabular-nums text-card-foreground">
                  {totalTasks}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  tarefas
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`${completedTasks} Concluídas`}
                />
                <div
                  style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                  className="h-full bg-primary transition-all duration-300"
                  title={`${inProgressTasks} Em andamento`}
                />
                <div
                  style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                  className="h-full bg-muted-foreground/30 transition-all duration-300"
                  title={`${todoTasks} A fazer`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground tabular-nums">
                <span className="flex items-center gap-1.5 text-success-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {completedTasks} Feitas
                </span>
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {inProgressTasks} Ativas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                  {todoTasks} A fazer
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2: Remaining Timeline */}
          <div className="flex flex-col justify-between space-y-4 rounded-2xl bg-muted/40 p-5">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">Prazo estimado</span>
                <Clock className="size-4 text-muted-foreground" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tabular-nums text-card-foreground">
                  {remaining.days}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  dias até a entrega
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data alvo</span>
                <span className="font-semibold text-card-foreground">
                  {project.dueDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ritmo da sprint</span>
                <span className="flex items-center gap-1 font-semibold text-success-foreground tabular-nums">
                  <Zap className="size-3" />
                  1.8 tarefas/dia
                </span>
              </div>
            </div>
          </div>

          {/* Metric 3: Average Completion */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/40 p-5">
            <div className="space-y-1">
              <span className="block text-xs font-medium text-muted-foreground">
                Taxa de conclusão
              </span>
              <div className="text-3xl font-extrabold tracking-tight tabular-nums text-card-foreground">
                {completionRate}%
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                +{Math.min(18, Math.round(completionRate * 0.25))}% vs ciclo anterior
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center">
              <div className="relative flex size-20 items-center justify-center">
                <svg className="size-20 -rotate-90 transform" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="transparent"
                    className="text-muted"
                  />
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
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-card-foreground">
                  {completionRate}%
                </div>
              </div>

              <div className="mt-1 h-6 w-24 overflow-hidden" title="Trajetória da sprint">
                <svg className="size-full" viewBox="0 0 140 65" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`grad-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
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
                </svg>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
