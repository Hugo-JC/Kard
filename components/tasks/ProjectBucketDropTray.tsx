"use client"

import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { FolderKanban, ArrowRight, MoveRight } from "lucide-react"
import { Project } from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
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
        "relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-all text-xs font-semibold",
        isOver
          ? "border-primary bg-primary/10 text-primary scale-105 shadow-md ring-2 ring-primary/30"
          : isDraggingTask
          ? "border-dashed border-border/90 bg-muted/30 text-muted-foreground hover:border-primary/50"
          : "border-border/60 bg-card text-muted-foreground"
      )}
    >
      {/* Project Logo */}
      <div className="size-5 shrink-0 flex items-center justify-center">
        {project.logo === "google" ? (
          <GoogleLogo className="w-4 h-4" />
        ) : project.logo === "slack" ? (
          <SlackLogo className="w-4 h-4" />
        ) : project.logo === "spotify" ? (
          <SpotifyLogo className="w-4 h-4" />
        ) : project.logo === "linear" ? (
          <LinearLogo className="w-4 h-4" />
        ) : (
          <FolderKanban className="w-4 h-4" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <span className="truncate text-foreground font-bold">{project.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {isOver ? "Release to move here!" : "Project bucket"}
        </span>
      </div>

      {isOver && <MoveRight className="w-3.5 h-3.5 text-primary ml-auto animate-pulse" />}
    </div>
  )
}

export function ProjectBucketDropTray({
  currentProjectName,
  projects,
  isDraggingTask,
  activeTaskTitle,
}: ProjectBucketDropTrayProps) {
  const otherProjects = projects.filter(
    (p) => p.name.toLowerCase() !== currentProjectName.toLowerCase() && !p.isArchived
  )

  if (otherProjects.length === 0) return null

  return (
    <div className="rounded-2xl border border-border/80 bg-muted/20 p-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 text-xs">
          <FolderKanban className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-card-foreground">Move to Other Project Buckets</span>
          <span className="text-muted-foreground hidden sm:inline">
            (Drag a task and drop it on any bucket below to transfer project ownership)
          </span>
        </div>

        {isDraggingTask && (
          <span className="text-[11px] font-semibold text-primary animate-pulse">
            Drop task onto any project below to reassign
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
