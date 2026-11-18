"use client"

import React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare2,
  CalendarDays,
  Clock3,
  Zap,
  Settings2,
  X,
  Sparkles,
  Command,
  ChevronRight,
  type LucideIcon,
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

type NavItem = { key: NavItemKey; label: string; icon: LucideIcon; shortcut?: string }

const navigationGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { key: "dashboard", label: "Visão geral", icon: LayoutDashboard, shortcut: "G H" },
      { key: "projects", label: "Projetos", icon: FolderKanban, shortcut: "G P" },
      { key: "my-tasks", label: "Minhas tarefas", icon: CheckSquare2, shortcut: "G T" },
    ],
  },
  {
    label: "Planeamento",
    items: [
      { key: "calendar", label: "Calendário", icon: CalendarDays },
      { key: "time-manage", label: "Controlo de tempo", icon: Clock3 },
      { key: "automations", label: "Automações", icon: Zap },
    ],
  },
]

export function Sidebar({
  activeNav,
  onSelectNav,
  isMobileOpen = false,
  onCloseMobile,
  onOpenPricingModal,
  currentTier = "free",
}: SidebarProps) {
  const select = (key: NavItemKey) => {
    onSelectNav(key)
    onCloseMobile?.()
  }

  const content = (
    <div className="flex h-full min-h-0 flex-col px-3 pb-3 pt-5 sm:px-4 sm:pb-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex min-w-0 items-center">
          <Image
            src="/kard_logo_light.svg"
            alt="Kard"
            width={132}
            height={50}
            priority
            className="h-9 w-auto dark:hidden"
          />
          <Image
            src="/kard_logo_dark.svg"
            alt="Kard"
            width={132}
            height={50}
            priority
            className="hidden h-9 w-auto dark:block"
          />
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar navegação"
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="mx-1 mt-6 flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/35 px-3 py-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-[11px] font-bold text-primary">K</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">O teu espaço de trabalho</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Workspace</p>
        </div>
        <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-label="Espaço ativo" />
      </div>

      <nav aria-label="Navegação principal" className="mt-7 flex-1 space-y-7 overflow-y-auto px-1">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/75">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = activeNav === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => select(item.key)}
                    className={cn(
                      "group relative flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[13px] font-medium transition-[background,color,transform] duration-150 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/12"
                        : "text-muted-foreground hover:bg-muted/75 hover:text-foreground active:scale-[0.99]"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="kard-sidebar-active"
                        className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className={cn("size-[17px] shrink-0 transition-transform duration-150 group-hover:scale-105", active ? "text-primary" : "text-muted-foreground")} strokeWidth={active ? 2.1 : 1.8} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.shortcut && (
                      <span className="hidden text-[9px] font-medium tracking-wide text-muted-foreground/55 transition-colors group-hover:text-muted-foreground xl:inline">
                        {item.shortcut}
                      </span>
                    )}
                    {active && <ChevronRight className="size-3.5 text-primary/70" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-border/70 pt-3">
        <button
          type="button"
          onClick={() => select("settings")}
          aria-current={activeNav === "settings" ? "page" : undefined}
          className={cn(
            "flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors",
            activeNav === "settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/75 hover:text-foreground"
          )}
        >
          <Settings2 className="size-[17px]" />
          Definições
        </button>

        <div className="mt-3 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.09] via-card to-card p-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Kard {currentTier === "free" ? "Free" : currentTier === "pro" ? "Pro" : "Business"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{currentTier === "free" ? "Plano atual" : "Subscrição ativa"}</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {currentTier === "free"
              ? "Descobre as opções disponíveis para a tua equipa."
              : "Consulta e gere as opções do teu plano."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenPricingModal}
            disabled={!onOpenPricingModal}
            className="mt-3 h-8 w-full justify-between rounded-lg bg-card px-3 text-[11px]"
          >
            Ver planos
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-muted-foreground/65">
          <span>Feito para trabalhar melhor</span>
          <span className="inline-flex items-center gap-1"><Command className="size-3" /> K</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-[252px] shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_32px_-20px_rgba(0,0,0,0.35)] lg:block">
        {content}
      </aside>

      <AnimatePresence>
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <motion.aside
            initial={{ x: -24, opacity: 0.7 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navegação principal"
            className="relative z-10 h-full w-[min(19rem,88vw)] border-r border-border bg-card shadow-2xl"
          >
            {content}
          </motion.aside>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}
