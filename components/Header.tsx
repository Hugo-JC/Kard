"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, Bell, Menu, Sun, Moon, Shield, User, LogOut } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
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
}

export function Header({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenMobileMenu,
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

      {/* Right: Theme Toggle, Notification bell & User avatar */}
      <div className="order-1 ml-auto flex shrink-0 items-center gap-1 sm:order-2 sm:ml-0 sm:gap-3">
        {/* Dark/Light Theme Toggle (CSS-controlled to guarantee zero hydration mismatch) */}
        <button
          onClick={toggleTheme}
          className="relative flex size-11 items-center justify-center rounded-2xl border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme appearance"
          title="Toggle theme appearance"
        >
          <Sun className="hidden dark:block w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
          <Moon className="block dark:hidden w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex size-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-card-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-bold text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onMarkNotificationRead(item.id)}
                      className={cn(
                        "flex min-h-11 w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors",
                        item.read ? "bg-transparent hover:bg-muted/60" : "bg-primary-subtle/50 hover:bg-primary-subtle"
                      )}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card shadow-2xs border border-border text-primary">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-semibold text-card-foreground", !item.read && "font-bold text-primary")}>
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
                  ))
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
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-card p-3 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150 text-card-foreground">
              <div className="flex items-center gap-3 p-2 border-b border-border pb-3">
                <div className="relative">
                  <Avatar src="/avatars/angelina.jpg" fallback="AS" size="md" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-card-foreground truncate">Angelina Smith</p>
                  <p className="text-[11px] text-muted-foreground truncate">angelina@kard.dev</p>
                  <div className="mt-1">
                    <MemberStatusBadge status="Online" size="sm" />
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-muted hover:text-foreground cursor-pointer">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-muted hover:text-foreground cursor-pointer">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Workspace: Admin</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-danger hover:bg-danger-subtle cursor-pointer">
                  <LogOut className="w-4 h-4 text-danger" />
                  <span>Log out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
