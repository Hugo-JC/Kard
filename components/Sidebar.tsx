"use client"

import React from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare2,
  CalendarDays,
  Clock,
  PieChart,
  Settings,
  X,
  HelpCircle,
  Sparkles
} from "lucide-react"
import { KardLogoMark } from "./Logos"
import { cn } from "@/lib/utils"

export type NavItemKey =
  | "dashboard"
  | "projects"
  | "my-tasks"
  | "calendar"
  | "time-manage"
  | "reports"
  | "settings"

interface SidebarProps {
  activeNav: NavItemKey
  onSelectNav: (key: NavItemKey) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({
  activeNav,
  onSelectNav,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems: { key: NavItemKey; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    { key: "projects", label: "PROJECTS", icon: FolderKanban },
    { key: "my-tasks", label: "MY TASKS", icon: CheckSquare2 },
    { key: "calendar", label: "CALENDAR", icon: CalendarDays },
    { key: "time-manage", label: "TIME MANAGE", icon: Clock },
    { key: "reports", label: "REPORTS", icon: PieChart },
    { key: "settings", label: "SETTINGS", icon: Settings },
  ]

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-6 px-4">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-2 lg:justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 dark:bg-blue-600 shadow-md shadow-slate-900/10 dark:shadow-blue-500/20 text-white">
              <KardLogoMark className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col lg:hidden">
              <span className="font-extrabold text-xl tracking-tight text-foreground">Kard</span>
              <span className="text-[11px] text-muted-foreground font-medium">Workspace v2.4</span>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="mt-10 flex w-full flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.key

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectNav(item.key)
                  if (onCloseMobile) onCloseMobile()
                }}
                className={cn(
                  "group relative flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary-subtle text-primary shadow-xs font-extrabold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>

                {isActive && (
                  <span className="absolute right-3.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom helper card / Pro banner */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 p-4 border border-blue-100/60 dark:border-blue-900/40 text-center">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs mb-2">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs font-bold text-foreground">Kard Pro</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Sprint velocity +38%</p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Documentation</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <aside className="hidden lg:block w-[240px] shrink-0 sticky top-6 self-start h-[calc(100vh-3rem)] rounded-[32px] bg-card border border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[80vw] h-full bg-card shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
