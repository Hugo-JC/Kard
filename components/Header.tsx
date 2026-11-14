"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Users,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Target,
  WifiOff,
  HardDrive,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { NotificationItem } from "@/lib/data"
import { MemberStatusBadge } from "@/components/ui/MemberStatusBadge"
import { cn } from "@/lib/utils"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  notifications: NotificationItem[]
  onMarkNotificationRead: (id: string) => void
  onClearAllNotifications: () => void
  onOpenMobileMenu: () => void
  onAcceptInvitation?: (
    notifId: string,
    invitationData: NonNullable<NotificationItem["invitationData"]>
  ) => void
  onDeclineInvitation?: (notifId: string) => void
  onOpenPricingModal?: () => void
  onToggleFocusMode?: () => void
  isFocusModeActive?: boolean
  currentTier?: "free" | "pro" | "business"
  isOffline?: boolean
  lastSavedAt?: string | null
}

export function Header({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenMobileMenu,
  onAcceptInvitation,
  onDeclineInvitation,
  onOpenPricingModal,
  onToggleFocusMode,
  isFocusModeActive = false,
  currentTier = "free",
  isOffline = false,
  lastSavedAt = null,
}: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { toggleTheme } = useTheme()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-x-2 gap-y-3 rounded-3xl border border-border/80 bg-card p-3 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-3.5">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="order-2 flex w-full min-w-0 items-center gap-2 sm:order-1 sm:flex-1 sm:gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex min-w-0 flex-1 items-center sm:max-w-xl">
          <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search projects, tasks, or team members"
            placeholder="Search projects, tasks, or team members..."
            className="h-11 w-full rounded-2xl border border-transparent bg-slate-100/70 pl-11 pr-20 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border/60 dark:bg-slate-900/60"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1 rounded-md bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs border border-border">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Local-First Status, Focus Mode, Theme Toggle, Kard Pro Upgrade Button, Notification bell & User avatar */}
      <div className="order-1 ml-auto flex shrink-0 items-center gap-1.5 sm:order-2 sm:ml-0 sm:gap-2">
        {isOffline ? (
          <span
            title="Sem conexão com a internet — alterações continuam salvas localmente"
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-warning-foreground"
          >
            <WifiOff className="size-3.5" />
            <span>Offline · Local</span>
          </span>
        ) : lastSavedAt ? (
          <span
            title="Persistência local-first ativa no navegador"
            className="hidden xl:inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] tabular-nums text-muted-foreground"
          >
            <HardDrive className="size-3.5 text-success-foreground" />
            <span>Salvo {lastSavedAt}</span>
          </span>
        ) : null}

        {/* Focus Mode Trigger */}
        {onToggleFocusMode && (
          <Button
            type="button"
            variant={isFocusModeActive ? "default" : "outline"}
            size="sm"
            onClick={onToggleFocusMode}
            className="h-9 gap-1.5 rounded-xl px-3 text-xs font-semibold"
            title="Alternar Modo Foco sem distrações"
          >
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Modo Foco</span>
          </Button>
        )}

        {/* Quick Plan / Upgrade Trigger */}
        {onOpenPricingModal && (
          <Button
            type="button"
            variant={currentTier === "free" ? "default" : "secondary"}
            size="sm"
            onClick={onOpenPricingModal}
            className="hidden md:inline-flex h-9 gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentTier === "free" ? "Planos · 50% OFF" : `Kard ${currentTier.toUpperCase()}`}</span>
          </Button>
        )}

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex size-10 items-center justify-center rounded-2xl border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted hover:text-foreground cursor-pointer"
          aria-label="Toggle theme appearance"
          title="Toggle theme appearance"
        >
          <Sun className="hidden dark:block w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          <Moon className="block dark:hidden w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex size-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
              </span>
            )}
          </button>

          {/* Notification Dropdown with GitHub-style Colaborar / Negar cards */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-[min(26rem,calc(100vw-1.5rem))] rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-card-foreground">Caixa de Notificações</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-bold text-primary">
                      {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pr-0.5">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    Nenhuma notificação no momento.
                  </p>
                ) : (
                  notifications.map((item) => {
                    // GitHub-style Collaborator Invitation Card
                    if (item.type === "invitation" && item.invitationData) {
                      const inv = item.invitationData
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-2xl p-4 space-y-3 transition-colors",
                            inv.status === "pending"
                              ? "bg-muted/50 border border-border/80"
                              : "bg-muted/25"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                                <Users className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-card-foreground">
                                  {item.title}
                                </h5>
                                <span className="text-[11px] text-muted-foreground">
                                  {item.time}
                                </span>
                              </div>
                            </div>

                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {inv.projectName}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">{inv.invitedBy}</strong> convidou você para colaborar no projeto{" "}
                            <strong className="text-foreground">{inv.projectName}</strong> como{" "}
                            <strong className="text-foreground">{inv.role}</strong>.
                          </p>

                          {/* GitHub-style action buttons: Colaborar / Negar */}
                          {inv.status === "pending" ? (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => onAcceptInvitation?.(item.id, inv)}
                                className="flex-1 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Colaborar</span>
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onDeclineInvitation?.(item.id)}
                                className="h-8 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Negar</span>
                              </Button>
                            </div>
                          ) : inv.status === "accepted" ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-success-foreground">
                              <Check className="w-3.5 h-3.5" />
                              <span>Convite aceito · Você agora é colaborador</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <X className="w-3.5 h-3.5" />
                              <span>Convite recusado</span>
                            </div>
                          )}
                        </div>
                      )
                    }

                    // Standard Notification Card
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => onMarkNotificationRead(item.id)}
                        className={cn(
                          "flex min-h-11 w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer",
                          item.read
                            ? "bg-transparent hover:bg-muted/60"
                            : "bg-primary-subtle/50 hover:bg-primary-subtle"
                        )}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card shadow-2xs border border-border text-primary">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-xs font-semibold text-card-foreground",
                              !item.read && "font-bold text-primary"
                            )}
                          >
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                            {item.time}
                          </span>
                        </div>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Presence Indicator */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative flex items-center gap-2.5 rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
            title="Angelina Smith (Online)"
          >
            <Avatar
              src="/avatars/angelina.jpg"
              fallback="AS"
              alt="Angelina Smith"
              size="md"
              className="ring-2 ring-card shadow-xs"
            />
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
              title="Online"
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-card p-3 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150 text-card-foreground z-50">
              <div className="flex items-center gap-3 p-2 border-b border-border pb-3">
                <div className="relative">
                  <Avatar src="/avatars/angelina.jpg" fallback="AS" size="md" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-card-foreground truncate">
                      Angelina Smith
                    </p>
                    {currentTier !== "free" && (
                      <span className="rounded-md bg-primary text-primary-foreground text-[9px] font-extrabold px-1.5 py-0.2 uppercase">
                        {currentTier}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    angelina@kard.dev
                  </p>
                  <div className="mt-1">
                    <MemberStatusBadge status="Online" size="sm" />
                  </div>
                </div>
              </div>

              {/* Upgrade Promo Row inside Profile */}
              {onOpenPricingModal && (
                <div
                  onClick={() => {
                    setIsProfileOpen(false)
                    onOpenPricingModal()
                  }}
                  className="mt-2 p-2.5 rounded-2xl bg-muted/60 border border-border/80 hover:border-border transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {currentTier === "free" ? "Upgrade Kard Pro" : "Gerenciar Plano"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">50% OFF 1ª compra</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                </div>
              )}

              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-muted hover:text-foreground cursor-pointer">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Configurações do Perfil</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-muted hover:text-foreground cursor-pointer">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Workspace: Admin</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-danger hover:bg-danger-subtle cursor-pointer">
                  <LogOut className="w-4 h-4 text-danger" />
                  <span>Sair da Conta</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
