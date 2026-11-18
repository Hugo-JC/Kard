"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Search,
  FolderKanban,
  CheckSquare2,
  CalendarDays,
  Clock3,
  ArrowRight,
  Zap,
  Settings2,
  LayoutDashboard,
  CornerDownLeft,
  Command,
} from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { NavItemKey } from "./Sidebar"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAction: (key: NavItemKey) => void
}

const actions: {
  id: NavItemKey
  title: string
  category: string
  description: string
  icon: React.ElementType
  keywords: string
}[] = [
  { id: "dashboard", title: "Visão geral", category: "Workspace", description: "Resumo do teu espaço de trabalho", icon: LayoutDashboard, keywords: "início home dashboard briefing" },
  { id: "projects", title: "Projetos", category: "Workspace", description: "Consultar e gerir projetos", icon: FolderKanban, keywords: "project quadro board kanban" },
  { id: "my-tasks", title: "Minhas tarefas", category: "Workspace", description: "Ver tarefas atribuídas a ti", icon: CheckSquare2, keywords: "tasks issues afazeres" },
  { id: "calendar", title: "Calendário", category: "Planeamento", description: "Consultar datas e eventos", icon: CalendarDays, keywords: "calendar agenda prazo" },
  { id: "time-manage", title: "Controlo de tempo", category: "Produtividade", description: "Acompanhar tempo e sessões", icon: Clock3, keywords: "timer tracker foco time" },
  { id: "automations", title: "Automações", category: "Produtividade", description: "Gerir regras de automatização", icon: Zap, keywords: "workflow rules" },
  { id: "settings", title: "Definições", category: "Sistema", description: "Preferências e integrações", icon: Settings2, keywords: "settings preferences conta" },
]

export function CommandPalette({ open, onOpenChange, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-PT")
    if (!normalized) return actions
    return actions.filter((item) =>
      [item.title, item.category, item.description, item.keywords]
        .join(" ")
        .toLocaleLowerCase("pt-PT")
        .includes(normalized)
    )
  }, [query])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("")
      setActiveIndex(0)
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const choose = (key: NavItemKey) => {
    onSelectAction(key)
    handleOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Pesquisa rápida"
      description="Navega pelo Kard sem interromper o teu fluxo."
      className="max-w-[34rem] overflow-hidden p-0"
    >
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0) }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && filtered.length > 0) {
                event.preventDefault()
                setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
              } else if (event.key === "ArrowUp" && filtered.length > 0) {
                event.preventDefault()
                setActiveIndex((index) => Math.max(index - 1, 0))
              } else if (event.key === "Enter" && filtered[activeIndex]) {
                event.preventDefault()
                choose(filtered[activeIndex].id)
              }
            }}
            placeholder="Pesquisar secções e comandos..."
            aria-label="Pesquisar secções e comandos"
            className="h-8 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted">
              Limpar
            </button>
          )}
          <kbd className="rounded-md border border-border bg-muted/60 px-1.5 py-1 text-[10px] font-medium text-muted-foreground">ESC</kbd>
        </div>

        <div className="max-h-[min(62vh,27rem)] overflow-y-auto p-2.5">
          <div className="mb-2 flex items-center justify-between px-2.5 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Navegação</span>
            <span className="text-[10px] text-muted-foreground">{filtered.length} resultados</span>
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Search className="mx-auto size-5 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-foreground">Não encontrámos comandos</p>
              <p className="mt-1 text-xs text-muted-foreground">Experimenta pesquisar por projetos, tarefas ou calendário.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, index) => {
                const Icon = item.icon
                const active = activeIndex === index
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100",
                      active ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-muted/70"
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card", active && "border-primary/20 bg-primary/10 text-primary")}>
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="block truncate text-[13px] font-medium">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground">{item.category}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{item.description}</span>
                    </span>
                    {active ? (
                      <span className="flex items-center gap-1 text-[10px] text-primary">
                        <CornerDownLeft className="size-3" /> Abrir
                      </span>
                    ) : (
                      <ArrowRight className="size-3.5 text-muted-foreground/50" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/25 px-4 py-2.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Command className="size-3" /> K para abrir</span>
          <span>↑ ↓ navegar · Enter selecionar · Esc fechar</span>
        </div>
      </div>
    </Dialog>
  )
}
