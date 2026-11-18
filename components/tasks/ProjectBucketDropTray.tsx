"use client"

import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { FolderKanban, MoveRight } from "lucide-react"
import { Project } from "@/lib/data"
import { ProjectLogoIcon } from "@/components/Logos"
import { cn } from "@/lib/utils"

interface ProjectBucketDropTrayProps {
  currentProjectName: string
  projects: Project[]
  isDraggingTask: boolean
  activeTaskTitle?: string
}

function ProjectDropTarget({
  project,
  isCurrent,
  isDraggingTask,
}: {
  project: Project
  isCurrent: boolean
  isDraggingTask: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `project-bucket-${project.name}`,
    data: {
      type: "project-bucket",
      projectName: project.name,
    },
    disabled: isCurrent,
  })

  if (isCurrent) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-all text-xs font-medium",
        isOver
          ? "border-primary bg-primary-subtle text-primary shadow-sm ring-2 ring-primary/25"
          : isDraggingTask
          ? "border-dashed border-primary/40 bg-card text-foreground"
          : "border-border/60 bg-card text-muted-foreground"
      )}
    >
      <ProjectLogoIcon project={project.name} className="size-4 shrink-0" />

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-foreground">{project.name}</span>
        <span className="text-[11px] text-muted-foreground">
          {isOver ? "Solte para mover" : "Mover para este projeto"}
        </span>
      </div>

      {isOver && <MoveRight className="ml-auto size-3.5 text-primary" />}
    </div>
  )
}

export function ProjectBucketDropTray({
  currentProjectName,
  projects,
  isDraggingTask,
}: ProjectBucketDropTrayProps) {
  const otherProjects = projects.filter(
    (p) => p.name.toLowerCase() !== currentProjectName.toLowerCase() && !p.isArchived
  )

  if (otherProjects.length === 0) return null

  return (
    <div className="rounded-2xl bg-muted/40 p-3.5 transition-colors">
      <div className="mb-2.5 flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs">
          <FolderKanban className="size-3.5 text-primary" />
          <span className="font-semibold text-card-foreground">
            Mover para outro projeto
          </span>
          <span className="hidden text-muted-foreground sm:inline">
            · Arraste qualquer tarefa para um bucket abaixo
          </span>
        </div>

        {isDraggingTask && (
          <span className="text-xs font-semibold text-primary">
            Solte em um projeto para transferir
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {otherProjects.map((p) => (
          <ProjectDropTarget
            key={p.id}
            project={p}
            isCurrent={false}
            isDraggingTask={isDraggingTask}
          />
        ))}
      </div>
    </div>
  )
}
