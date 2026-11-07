"use client"

import React from "react"
import { Project } from "@/lib/data"
import { ProjectCard } from "@/components/ProjectCard"
import { Layers, Paperclip, DollarSign } from "lucide-react"

interface ProjectCardGridProps {
  projects: Project[]
  onToggleStar: (id: string) => void
  onUpdateStatus: (id: string, newStatus: Project["status"]) => void
  onSelectProject: (project: Project) => void
}

export function ProjectCardGrid({
  projects,
  onToggleStar,
  onUpdateStatus,
  onSelectProject,
}: ProjectCardGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-[28px] bg-card p-12 text-center text-muted-foreground border border-border">
        <p className="text-sm font-semibold">No projects match your current filters.</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Try adjusting your search query, status tab, or priority filter.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {projects.map((project) => (
        <div key={project.id} className="relative group">
          <ProjectCard
            project={project}
            onToggleStar={onToggleStar}
            onUpdateStatus={onUpdateStatus}
            onClick={() => onSelectProject(project)}
          />

          {/* Extra Meta Strip for Projects Page View */}
          {(project.sprintStage || project.attachmentsCount || project.budget) && (
            <div className="mt-2 px-3 flex items-center justify-between text-[11px] text-muted-foreground/80">
              <div className="flex items-center gap-3">
                {project.sprintStage && (
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-3 h-3 text-primary" />
                    {project.sprintStage}
                  </span>
                )}
                {project.attachmentsCount && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    {project.attachmentsCount} files
                  </span>
                )}
              </div>

              {project.budget && (
                <span className="font-semibold text-card-foreground">
                  {project.budget}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
