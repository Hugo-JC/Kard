"use client"

import React, { useState } from "react"
import { Star, MoreVertical, Calendar, CheckCircle2, Clock } from "lucide-react"
import { GoogleLogo, SlackLogo } from "./Logos"
import { Avatar } from "@/components/ui/avatar"
import { Project } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  onToggleStar: (id: string) => void
  onUpdateStatus?: (id: string, newStatus: Project["status"]) => void
}

export function ProjectCard({
  project,
  onToggleStar,
  onUpdateStatus,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const percent = Math.round((project.completedTasks / project.totalTasks) * 100)

  // Tag color mapping matching the screenshot's soft pastel badges
  const getTagStyle = (tag: string) => {
    switch (tag.toUpperCase()) {
      case "IOS APP":
        return "bg-[#E6F8EE] text-[#059669]"
      case "UI/UX":
        return "bg-[#EBF3FF] text-[#2563EB]"
      case "ANDROID":
        return "bg-[#FFF6E5] text-[#D97706]"
      default:
        return "bg-slate-100 text-slate-600"
    }
  }

  return (
    <div className="relative rounded-[28px] bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]">
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50/80 border border-slate-100/60 shadow-2xs">
            {project.logo === "google" && <GoogleLogo className="w-7 h-7" />}
            {project.logo === "slack" && <SlackLogo className="w-7 h-7" />}
            {project.logo === "custom" && (
              <span className="text-base font-extrabold text-blue-600">
                {project.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {project.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{project.company}</p>
          </div>
        </div>

        {/* Action icons: Star & Three dots */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleStar(project.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-50 hover:text-amber-400 transition-colors cursor-pointer"
            aria-label="Star project"
          >
            <Star
              className={cn(
                "w-5 h-5 transition-transform duration-150 active:scale-125",
                project.isStarred
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-slate-300 hover:text-slate-400"
              )}
            />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Project actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-2xl bg-white p-2 shadow-lg border border-slate-100 text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    onUpdateStatus?.(project.id, "IN PROGRESS")
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Set as In Progress
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus?.(project.id, "COMPLETED")
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
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
              ? "bg-[#E8FAF1] text-[#10B981]"
              : "bg-[#F3F4F6] text-slate-500"
          )}
        >
          {project.status}
        </span>

        {/* Priority Badge */}
        <span
          className={cn(
            "rounded-lg border px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase",
            project.priority === "HIGH PRIORITY"
              ? "border-[#FF7A7A]/40 text-[#EF4444] bg-red-50/20"
              : "border-[#10B981]/40 text-[#10B981] bg-emerald-50/20"
          )}
        >
          {project.priority}
        </span>
      </div>

      {/* Task Progress Section */}
      <div className="mt-5">
        <div className="flex items-center text-xs text-slate-600 font-semibold mb-2.5">
          <span>Task Done :&nbsp;</span>
          <span className="font-bold text-slate-900 tabular-nums">
            {project.completedTasks}
          </span>
          <span className="text-slate-400">/{project.totalTasks}</span>
          <span className="ml-auto text-[11px] text-slate-400 font-medium tabular-nums">
            {percent}%
          </span>
        </div>

        {/* Custom Progress Bar matching screenshot */}
        <div
          className="relative h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: project.progressTrack }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percent}%`,
              backgroundColor: project.progressColor,
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
              className="ring-2 ring-white border border-slate-100 hover:z-10 hover:scale-105 transition-transform"
            />
          ))}
          {project.extraMembersCount > 0 && (
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white border border-slate-200">
              +{project.extraMembersCount}
            </div>
          )}
        </div>

        {/* Due Date pill matching screenshot */}
        <div className="rounded-xl bg-[#FFF0EB] px-3 py-1.5 text-[11px] font-bold text-[#FF5C38] tracking-wider uppercase shadow-2xs">
          DUE DATE: {project.dueDate}
        </div>
      </div>
    </div>
  )
}
