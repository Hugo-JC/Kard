"use client"

import React from "react"
import { Star, MoreVertical, ArrowUpRight, Paperclip, Archive, ArchiveRestore } from "lucide-react"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Avatar } from "@/components/ui/avatar"
import { Project } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProjectTableViewProps {
  projects: Project[]
  onToggleStar: (id: string) => void
  onUpdateStatus: (id: string, newStatus: Project["status"]) => void
  onSelectProject: (project: Project) => void
  onToggleArchive?: (id: string) => void
}

export function ProjectTableView({
  projects,
  onToggleStar,
  onUpdateStatus,
  onSelectProject,
  onToggleArchive,
}: ProjectTableViewProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-[28px] bg-card p-12 text-center text-muted-foreground border border-border">
        <p className="text-sm font-semibold">No projects found.</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Adjust your filters or create a new project.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] bg-card border border-border/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] overflow-hidden text-card-foreground">
      <div role="region" aria-label="Scrollable projects table" tabIndex={0} className="overflow-x-auto focus-visible:outline-offset-[-2px]">
        <table className="w-full min-w-[860px] text-left text-sm lg:min-w-full">
          {/* Table Header */}
          <thead className="border-b border-border/70 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-4 pl-6 pr-3 font-bold w-10">★</th>
              <th className="py-4 px-4 font-bold">Project & Client</th>
              <th className="py-4 px-4 font-bold">Status</th>
              <th className="py-4 px-4 font-bold">Priority</th>
              <th className="py-4 px-4 font-bold min-w-[180px]">Task Progress</th>
              <th className="py-4 px-4 font-bold">Team</th>
              <th className="py-4 px-4 font-bold">Sprint / Milestone</th>
              <th className="py-4 px-4 font-bold">Due Date</th>
              <th className="py-4 px-4 font-bold">Budget</th>
              <th className="py-4 pr-6 pl-3 text-right font-bold">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/60">
            {projects.map((project) => {
              const percent = Math.round((project.completedTasks / project.totalTasks) * 100)

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Star Toggle */}
                  <td
                    className="py-3.5 pl-6 pr-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleStar(project.id)
                    }}
                  >
                    <button
                      type="button"
                      className="flex size-11 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:text-amber-400 sm:size-9"
                      aria-label="Toggle star"
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          project.isStarred
                            ? "fill-[#F59E0B] text-[#F59E0B]"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                      />
                    </button>
                  </td>

                  {/* Project Info & Logo */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 dark:bg-slate-900/80 border border-border/60 overflow-hidden">
                        {project.customImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={project.customImage} alt={project.name} className="h-full w-full object-cover" />
                        ) : project.logo === "google" ? (
                          <GoogleLogo className="w-5 h-5" />
                        ) : project.logo === "slack" ? (
                          <SlackLogo className="w-5 h-5" />
                        ) : project.logo === "spotify" ? (
                          <SpotifyLogo className="w-5 h-5" />
                        ) : project.logo === "linear" ? (
                          <LinearLogo className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-extrabold text-primary">
                            {project.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-card-foreground group-hover:text-primary transition-colors truncate text-sm">
                          {project.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {project.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase",
                          project.status === "COMPLETED"
                            ? "bg-success-subtle text-success-foreground dark:bg-emerald-950/40 dark:text-emerald-300"
                            : project.status === "IN PROGRESS"
                            ? "bg-primary-subtle text-primary dark:bg-blue-950/40 dark:text-blue-300"
                            : project.status === "ON HOLD"
                            ? "bg-warning-subtle text-warning-foreground dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {project.status}
                      </span>
                      {project.isArchived && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                          <Archive className="w-2.5 h-2.5" />
                          Archived
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase",
                        project.priority === "HIGH PRIORITY"
                          ? "border-red-400/40 text-red-500 bg-red-50/20 dark:bg-red-950/30 dark:text-red-400"
                          : project.priority === "MEDIUM PRIORITY"
                          ? "border-emerald-500/40 text-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "border-slate-300 dark:border-slate-700 text-muted-foreground bg-muted/30"
                      )}
                    >
                      {project.priority.replace(" PRIORITY", "")}
                    </span>
                  </td>

                  {/* Task Progress */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                        <span className="font-semibold text-card-foreground tabular-nums">
                          {project.completedTasks}/{project.totalTasks} tasks
                        </span>
                        <span className="tabular-nums font-bold text-card-foreground">
                          {percent}%
                        </span>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: project.accentColor || project.progressColor,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Team Members */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
                      {project.members.slice(0, 3).map((member, idx) => (
                        <Avatar
                          key={idx}
                          src={member.avatar}
                          fallback={member.name[0]}
                          size="sm"
                          className="ring-2 ring-card border border-border/50"
                        />
                      ))}
                      {project.extraMembersCount > 0 && (
                        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground ring-2 ring-card border border-border">
                          +{project.extraMembersCount}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Sprint / Milestone */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                    <span className="font-medium text-card-foreground">
                      {project.sprintStage || "Sprint 1"}
                    </span>
                    {project.attachmentsCount && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-[11px] text-muted-foreground/70">
                        <Paperclip className="w-2.5 h-2.5" />
                        {project.attachmentsCount}
                      </span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="rounded-lg bg-danger-subtle/80 px-2 py-0.5 text-[11px] font-bold text-danger-foreground dark:bg-red-950/30 dark:text-red-400">
                      {project.dueDate}
                    </span>
                  </td>

                  {/* Budget */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-card-foreground tabular-nums">
                    {project.budget || "$30,000"}
                  </td>

                  {/* Quick Action Button */}
                  <td
                    className="py-3.5 pr-6 pl-3 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {onToggleArchive && (
                        <button
                          type="button"
                          onClick={() => onToggleArchive(project.id)}
                          className={cn(
                            "inline-flex min-h-11 items-center gap-1 rounded-xl px-2.5 text-xs font-semibold transition-colors sm:min-h-9 cursor-pointer",
                            project.isArchived
                              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              : "bg-muted/60 text-muted-foreground hover:text-amber-500 hover:bg-muted"
                          )}
                          title={project.isArchived ? "Restore to active board" : "Archive project"}
                        >
                          {project.isArchived ? (
                            <ArchiveRestore className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-muted/80 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary sm:min-h-9 cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
