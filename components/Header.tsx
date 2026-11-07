"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, Bell, Menu, Check, Trash2, Shield, User, LogOut } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { NotificationItem } from "@/lib/data"
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
    <header className="relative z-30 flex items-center justify-between gap-4 rounded-[28px] bg-white px-5 py-3.5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100/80">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex w-full max-w-xl items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, tasks, or team members..."
            className="h-10 w-full rounded-2xl bg-[#F6F7F9] pl-11 pr-20 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all border border-transparent"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs border border-slate-200/80">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Notification bell & User avatar */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onMarkNotificationRead(item.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer",
                        item.read ? "bg-transparent hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-50"
                      )}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-100 text-blue-600">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-semibold text-slate-900", !item.read && "text-blue-950 font-bold")}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {item.time}
                        </span>
                      </div>
                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 rounded-full p-0.5 hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer"
          >
            <Avatar
              src="/avatars/angelina.jpg"
              fallback="AS"
              alt="Angelina Smith"
              size="md"
              className="ring-2 ring-white shadow-xs"
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 p-2 border-b border-slate-100 pb-3">
                <Avatar src="/avatars/angelina.jpg" fallback="AS" size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Angelina Smith</p>
                  <p className="text-[11px] text-slate-400 truncate">angelina@kard.dev</p>
                </div>
              </div>

              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 cursor-pointer">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Settings</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 cursor-pointer">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Workspace Role: Admin</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
                  <LogOut className="w-4 h-4 text-red-500" />
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
