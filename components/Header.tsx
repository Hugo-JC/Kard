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
  Users,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Target,
  WifiOff,
  HardDrive,
  Cloud,
  LogOut,
  Calendar,
  FolderSync,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { useFirebase } from "@/components/auth/FirebaseProvider"
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { MemberStatus, MEMBER_STATUS_CONFIG, NotificationItem } from "@/lib/data"
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
  onOpenSettings?: () => void
  onToggleFocusMode?: () => void
  isFocusModeActive?: boolean
  currentTier?: "free" | "pro" | "business"
  userStatus?: MemberStatus
  userStatusNote?: string
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
  onOpenSettings,
  onToggleFocusMode,
  isFocusModeActive = false,
  currentTier = "free",
  userStatus = "Online",
  userStatusNote = "",
  isOffline = false,
  lastSavedAt = null,
}: HeaderProps) {
  const statusConfig = MEMBER_STATUS_CONFIG[userStatus] || MEMBER_STATUS_CONFIG.Online
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { toggleTheme } = useTheme()
  const {
    user,
    authReady,
    isSigningIn,
    hasWorkspaceConnected,
    isConnectingWorkspace,
    signInGoogle,
    connectWorkspace,
    disconnectWorkspace,
    signOut,
  } = useFirebase()

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Modo Local"
  const displayEmail = user?.email || "Rascunho offline no navegador"
  const avatarSrc = user?.photoURL || "/avatars/angelina.jpg"
  const avatarFallback = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

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
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-x-2 gap-y-3 rounded-2xl border border-border/80 bg-card p-2.5 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-3.5">
      {/* Pesquisa e navegação móvel */}
      <div className="order-2 flex w-full min-w-0 items-center gap-2 sm:order-1 sm:flex-1 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex min-w-0 flex-1 items-center sm:max-w-xl">
          <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Pesquisar tarefas e projetos"
            placeholder="Pesquisar tarefas e projetos..."
            className="h-11 w-full rounded-2xl border border-transparent bg-muted/55 pl-11 pr-4 sm:pr-20 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 border-border/70 dark:bg-muted/35"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1 rounded-md bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs border border-border">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Estado da ligação, foco, tema, notificações e conta */}
      <div className="order-1 ml-auto flex max-w-full flex-wrap items-center justify-end gap-1.5 sm:order-2 sm:ml-0 sm:shrink-0 sm:flex-nowrap sm:gap-2">
        {isOffline ? (
          <span
            title="Sem conexão com a internet — alterações continuam salvas localmente"
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-warning-foreground"
          >
            <WifiOff className="size-3.5" />
            <span>Offline · Local</span>
          </span>
        ) : user ? (
          <span
            title="Ligação à nuvem ativa"
            className="hidden xl:inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-success-foreground"
          >
            <Cloud className="size-3.5" />
            <span>Nuvem Ativa</span>
          </span>
        ) : lastSavedAt ? (
          <span
            title="Persistência local-first ativa no navegador"
            className="hidden xl:inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] tabular-nums text-muted-foreground"
          >
            <HardDrive className="size-3.5 text-success-foreground" />
            <span>Local {lastSavedAt}</span>
          </span>
        ) : null}

        {/* Atalho para o modo de foco */}
        {onToggleFocusMode && (
          <Button
            type="button"
            variant={isFocusModeActive ? "default" : "outline"}
            size="sm"
            onClick={onToggleFocusMode}
            className="h-9 gap-1.5 rounded-xl px-3 text-xs font-semibold"
            title="Alternar Modo Foco sem distrações"
          >
            <Target
              className={cn(
                "w-3.5 h-3.5",
                isFocusModeActive ? "text-primary-foreground" : "text-primary"
              )}
            />
            <span className="hidden sm:inline">Modo Foco</span>
          </Button>
        )}

        {/* Acesso aos planos */}
        {onOpenPricingModal && (
          <Button
            type="button"
            variant={currentTier === "free" ? "default" : "secondary"}
            size="sm"
            onClick={onOpenPricingModal}
            className="hidden md:inline-flex h-9 gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentTier === "free" ? "Ver planos" : `Kard ${currentTier.toUpperCase()}`}</span>
          </Button>
        )}

        {/* Alternar tema */}
        <button
          type="button"
          onClick={toggleTheme}
          className="relative flex size-10 items-center justify-center rounded-2xl border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted hover:text-foreground cursor-pointer"
          aria-label="Alternar tema claro ou escuro"
          title="Alternar tema claro ou escuro"
        >
          <Sun className="hidden dark:block w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          <Moon className="block dark:hidden w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
        </button>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex size-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Ver notificações"
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
            <div className="fixed left-3 right-3 top-[4.5rem] z-50 flex max-h-[calc(100dvh-6rem)] flex-col rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(26rem,calc(100vw-2rem))] sm:max-h-none">
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
                    type="button"
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
                            <strong className="text-foreground">{inv.invitedBy}</strong> convidou-te para colaborar no projeto{" "}
                            <strong className="text-foreground">{inv.projectName}</strong> como{" "}
                            <strong className="text-foreground">{inv.role}</strong>.
                          </p>

                          {/* Ações do convite */}
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
                              <span>Convite aceite · Já fazes parte do projeto</span>
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

        {/* User Auth & Profile Dropdown */}
        {authReady && !user ? (
          <GoogleSignInButton
            onClick={signInGoogle}
            disabled={isSigningIn}
            size="sm"
          />
        ) : (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative flex items-center gap-2.5 rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
              title={`${displayName} · ${statusConfig.label}${userStatusNote ? ` (${userStatusNote})` : ""}`}
              aria-label="Abrir menu do perfil"
            >
              <Avatar
                src={avatarSrc}
                fallback={avatarFallback}
                alt={displayName}
                size="md"
                className="ring-2 ring-card shadow-xs"
              />
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                  statusConfig.dot
                )}
                title={statusConfig.label}
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="fixed left-3 right-3 top-[4.5rem] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl bg-card p-3 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150 text-card-foreground sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-72 sm:max-h-none">
                <div className="flex items-center gap-3 p-2 border-b border-border pb-3">
                  <div className="relative">
                    <Avatar src={avatarSrc} fallback={avatarFallback} size="md" />
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                        statusConfig.dot
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-card-foreground truncate">
                        {displayName}
                      </p>
                      {currentTier !== "free" && (
                        <span className="rounded-md bg-primary text-primary-foreground text-[9px] font-extrabold px-1.5 py-0.5 uppercase">
                          {currentTier}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {displayEmail}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <MemberStatusBadge status={userStatus} size="sm" />
                      {onOpenSettings && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false)
                            onOpenSettings()
                          }}
                          className="text-[10.5px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Alterar
                        </button>
                      )}
                    </div>
                    {userStatusNote && (
                      <p className="mt-1 truncate text-[10.5px] text-muted-foreground">
                        {userStatusNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ecosystem Integrations Quick Status */}
                <div className="mt-2 space-y-1.5 rounded-2xl border border-border/70 bg-muted/30 p-2.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Cloud className="size-3.5 text-success-foreground" />
                      <span>Dados da aplicação</span>
                    </span>
                    <span className="font-semibold text-success-foreground">
                      {user ? "Conectado" : "Local"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <FolderSync className="size-3.5 text-primary" />
                      <span>Armazenamento</span>
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        "text-warning-foreground"
                      )}
                    >
                      Migração pendente
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5 text-amber-500" />
                      <span>Google Workspace</span>
                    </span>
                    {hasWorkspaceConnected ? (
                      <button
                        type="button"
                        onClick={disconnectWorkspace}
                        className="font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isConnectingWorkspace}
                        onClick={() => connectWorkspace()}
                        className="font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {isConnectingWorkspace ? "Conectando..." : "Conectar"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Upgrade Promo Row inside Profile */}
                {onOpenPricingModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      onOpenPricingModal()
                    }}
                    className="mt-2 w-full p-2.5 rounded-2xl bg-muted/60 border border-border/80 hover:border-border transition-all cursor-pointer flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {currentTier === "free" ? "Ver planos" : "Gerir plano"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Consultar opções do plano</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </button>
                )}

                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      onOpenSettings?.()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Definições e integrações</span>
                  </button>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false)
                        signOut()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-danger-foreground hover:bg-danger-subtle/60 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da conta</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>Modo local</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
