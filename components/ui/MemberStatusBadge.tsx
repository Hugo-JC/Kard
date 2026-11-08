"use client"

import React from "react"
import { MemberStatus, MEMBER_STATUS_CONFIG } from "@/lib/data"
import { cn } from "@/lib/utils"

interface MemberStatusBadgeProps {
  status?: MemberStatus
  showLabel?: boolean
  size?: "sm" | "md"
  className?: string
}

export function MemberStatusBadge({
  status = "Offline",
  showLabel = true,
  size = "md",
  className,
}: MemberStatusBadgeProps) {
  const config = MEMBER_STATUS_CONFIG[status] || MEMBER_STATUS_CONFIG.Offline

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors",
        showLabel
          ? cn(
              "border px-2 py-0.5",
              size === "sm" ? "text-[10px]" : "text-[11px]",
              config.bg,
              config.color
            )
          : "",
        className
      )}
      title={`Status: ${config.label}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {(status === "Online" || status === "Focused") && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            config.dot
          )}
        />
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

export function MemberAvatarWithStatus({
  avatar,
  name,
  status = "Offline",
  size = "md",
  className,
}: {
  avatar: string
  name: string
  status?: MemberStatus
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const config = MEMBER_STATUS_CONFIG[status] || MEMBER_STATUS_CONFIG.Offline
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }[size]

  const dotClasses = {
    sm: "h-2 w-2 -bottom-0.5 -right-0.5 ring-1",
    md: "h-2.5 w-2.5 bottom-0 right-0 ring-2",
    lg: "h-3 w-3 bottom-0.5 right-0.5 ring-2",
  }[size]

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt={name}
        className={cn("rounded-full object-cover border border-border/80 shadow-2xs", sizeClasses)}
      />
      <span
        className={cn(
          "absolute rounded-full ring-card",
          config.dot,
          dotClasses
        )}
        title={`${name} is ${status}`}
      />
    </div>
  )
}
