"use client"

import React from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare2,
  CalendarDays,
  Clock,
  Zap,
  Settings,
  X,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type NavItemKey =
  | "dashboard"
  | "projects"
  | "my-tasks"
  | "calendar"
  | "time-manage"
  | "automations"
  | "settings"

interface SidebarProps {
  activeNav: NavItemKey
  onSelectNav: (key: NavItemKey) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
  onOpenPricingModal?: () => void
  currentTier?: "free" | "pro" | "business"
}

export function Sidebar({
  activeNav,
  onSelectNav,
  isMobileOpen = false,
  onCloseMobile,
  onOpenPricingModal,
  currentTier = "free",
}: SidebarProps) {
  const navItems: { key: NavItemKey; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    { key: "projects", label: "PROJECTS", icon: FolderKanban },
    { key: "my-tasks", label: "MY TASKS", icon: CheckSquare2 },
    { key: "calendar", label: "CALENDAR", icon: CalendarDays },
    { key: "time-manage", label: "TIME MANAGE", icon: Clock },
    { key: "automations", label: "AUTOMATIONS", icon: Zap },
    { key: "settings", label: "SETTINGS", icon: Settings },
  ]

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-6 px-4">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-2 lg:justify-center">
          <div className="flex flex-col items-start gap-1.5 lg:items-center">
            <Image
              src="/kard_logo_light.svg"
              alt="Kard"
              width={148}
              height={56}
              priority
              className="h-11 w-auto dark:hidden"
            />
            <Image
              src="/kard_logo_dark.svg"
              alt="Kard"
              width={148}
              height={56}
              priority
              className="hidden h-11 w-auto dark:block"
            />
            <span className="text-[11px] font-medium text-muted-foreground lg:hidden">Workspace v2.4</span>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              type="button"
              aria-label="Close navigation menu"
              className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav aria-label="Main navigation" className="mt-8 flex w-full flex-col gap-2 sm:mt-10">
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
                  "group relative flex min-h-11 w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200 cursor-pointer sm:gap-3.5 sm:px-4 sm:tracking-wider",
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

      {/* Bottom Plan Card */}
      <div className="mt-6 rounded-2xl bg-muted/45 p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-bold text-foreground">
              {currentTier === "free" ? "Kard Pro" : `Kard ${currentTier.toUpperCase()}`}
            </p>
          </div>
          {currentTier === "free" && (
            <span className="text-[11px] font-semibold text-success-foreground">
              50% OFF
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {currentTier === "free"
            ? "Projetos ilimitados e sprints com desconto na 1ª compra."
            : "Todos os recursos avançados estão ativos."}
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenPricingModal}
          className="w-full h-8 text-xs font-semibold rounded-xl bg-card"
        >
          {currentTier === "free" ? "Ver planos" : "Gerenciar plano"}
        </Button>
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
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div role="dialog" aria-modal="true" aria-label="Main navigation" className="relative z-10 h-full w-72 max-w-[80vw] bg-card shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
