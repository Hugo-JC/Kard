"use client"

import React, { useState } from "react"
import { Star, MoreVertical, Calendar, CheckCircle2, Clock } from "lucide-react"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "./Logos"
import { Avatar } from "@/components/ui/avatar"
import { Project } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  onToggleStar: (id: string) => void
  onUpdateStatus?: (id: string, newStatus: Project["status"]) => void
  onClick?: () => void
}

export function ProjectCard({
  project,
  onToggleStar,
  onUpdateStatus,
  onClick,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const percent = Math.round((project.completedTasks / project.totalTasks) * 100)

  // Tag color mapping matching the screenshot's soft pastel badges
  const getTagStyle = (tag: string) => {
    switch (tag.toUpperCase()) {
      case "IOS APP":
        return "bg-success-subtle text-success-foreground dark:bg-emerald-950/40 dark:text-emerald-300"
      case "UI/UX":
        return "bg-primary-subtle text-primary dark:bg-blue-950/40 dark:text-blue-300"
      case "ANDROID":
        return "bg-warning-subtle text-warning-foreground dark:bg-amber-950/40 dark:text-amber-300"
      case "AUDIO API":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      case "GRAPHQL":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-[28px] bg-card p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] border border-border/80 transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] text-card-foreground",
        onClick && "cursor-pointer"
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 dark:bg-slate-900/80 border border-border/60 shadow-2xs overflow-hidden">
            {project.customImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={project.customImage} alt={project.name} className="h-full w-full object-cover" />
            ) : project.logo === "google" ? (
              <GoogleLogo className="w-7 h-7" />
            ) : project.logo === "slack" ? (
              <SlackLogo className="w-7 h-7" />
            ) : project.logo === "spotify" ? (
              <SpotifyLogo className="w-7 h-7" />
            ) : project.logo === "linear" ? (
              <LinearLogo className="w-7 h-7" />
            ) : (
              <span className="text-base font-extrabold text-primary">
                {project.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-card-foreground tracking-tight">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">{project.company}</p>
          </div>
        </div>

        {/* Action icons: Star & Three dots */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleStar(project.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-amber-400 transition-colors cursor-pointer"
            aria-label="Star project"
          >
            <Star
              className={cn(
                "w-5 h-5 transition-transform duration-150 active:scale-125",
                project.isStarred
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
            />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors cursor-pointer"
              aria-label="Project actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-2xl bg-card p-2 shadow-lg border border-border text-xs animate-in fade-in zoom-in-95 text-card-foreground">
                <button
                  onClick={() => {
                    onUpdateStatus?.(project.id, "IN PROGRESS")
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-card-foreground hover:bg-muted font-medium cursor-pointer"
                >
                  Set as In Progress
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus?.(project.id, "COMPLETED")
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-card-foreground hover:bg-muted font-medium cursor-pointer"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges: Status and Priority */}
      <div className="mt-5 flex items-center justify-between gap-2">
        {/* Status Badge */}
        <span
          className={cn(
            "rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors",
            project.status === "COMPLETED"
              ? "bg-success-subtle text-success-foreground dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-slate-300"
          )}
        >
          {project.status}
        </span>

        {/* Priority Badge */}
        <span
          className={cn(
            "rounded-lg border px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase",
            project.priority === "HIGH PRIORITY"
              ? "border-red-400/40 text-red-500 bg-red-50/20 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/40"
              : "border-emerald-500/40 text-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/40"
          )}
        >
          {project.priority}
        </span>
      </div>

      {/* Task Progress Section */}
      <div className="mt-5">
        <div className="flex items-center text-xs text-muted-foreground font-semibold mb-2.5">
          <span>Task Done :&nbsp;</span>
          <span className="font-bold text-card-foreground tabular-nums">
            {project.completedTasks}
          </span>
          <span className="text-muted-foreground">/{project.totalTasks}</span>
          <span className="ml-auto text-[11px] text-muted-foreground font-medium tabular-nums">
            {percent}%
          </span>
        </div>

        {/* Custom Progress Bar matching screenshot */}
        <div
          className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percent}%`,
              backgroundColor: project.accentColor || project.progressColor,
            }}
          />
        </div>
      </div>

      {/* Tag pills */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "rounded-lg px-3 py-1 text-[11px] font-bold tracking-wider",
              getTagStyle(tag)
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer: Member avatars & Due date */}
      <div className="mt-6 flex items-center justify-between pt-1">
        {/* Overlapping member avatars */}
        <div className="flex items-center -space-x-2 overflow-hidden py-1">
          {project.members.map((member, idx) => (
            <Avatar
              key={idx}
              src={member.avatar}
              fallback={member.name[0]}
              size="sm"
              className="ring-2 ring-card border border-border/60 hover:z-10 hover:scale-105 transition-transform"
            />
          ))}
          {project.extraMembersCount > 0 && (
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card border border-border">
              +{project.extraMembersCount}
            </div>
          )}
        </div>

        {/* Due Date pill matching screenshot */}
        <div className="rounded-xl bg-danger-subtle px-3 py-1.5 text-[11px] font-bold text-danger-foreground dark:bg-red-950/40 dark:text-red-400 tracking-wider uppercase shadow-2xs">
          DUE DATE: {project.dueDate}
        </div>
      </div>
    </div>
  )
}
