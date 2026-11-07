"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sidebar, NavItemKey } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { ProjectCard } from "@/components/ProjectCard"
import { MyTasksCard } from "@/components/MyTasksCard"
import { TimeTrackerCard } from "@/components/TimeTrackerCard"
import { CalendarWidget } from "@/components/CalendarWidget"
import { MessageWidget } from "@/components/MessageWidget"
import { NewTaskModal } from "@/components/NewTaskModal"
import { QuickChatModal } from "@/components/QuickChatModal"
import { CommandPalette } from "@/components/CommandPalette"
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TIMERS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  Project,
  TaskItem,
  TrackedTimer,
  ChatMessage,
  NotificationItem,
} from "@/lib/data"

export default function DashboardPage() {
  // Navigation State
  const [activeNav, setActiveNav] = useState<NavItemKey>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Data States
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS)
  const [timers, setTimers] = useState<TrackedTimer[]>(INITIAL_TIMERS)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  // Modal & Search States
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [selectedChatUser, setSelectedChatUser] = useState<ChatMessage | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Live Timer Interval (Chronometer ticks up every second when any timer is running)
  useEffect(() => {
    const isAnyRunning = timers.some((t) => t.isRunning)
    if (!isAnyRunning) return

    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) =>
          t.isRunning ? { ...t, secondsElapsed: t.secondsElapsed + 1 } : t
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  // Handle toggling task completion
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedCompleted = !t.completed
          // Also update project task completed count if matched
          setProjects((pList) =>
            pList.map((p) => {
              if (p.name.toLowerCase() === t.project.toLowerCase()) {
                const diff = updatedCompleted ? 1 : -1
                return {
                  ...p,
                  completedTasks: Math.max(0, Math.min(p.totalTasks, p.completedTasks + diff)),
                }
              }
              return p
            })
          )
          return { ...t, completed: updatedCompleted }
        }
        return t
      })
    )
  }

  // Handle adding a new task
  const handleAddTask = (newTaskData: Omit<TaskItem, "id" | "number">) => {
    const nextIndex = tasks.length + 1
    const nextNumber = String(nextIndex).padStart(2, "0")
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      number: nextNumber,
    }

    setTasks((prev) => [newTask, ...prev])

    // Update project total task count
    setProjects((prev) =>
      prev.map((p) => {
        if (p.name.toLowerCase() === newTask.project.toLowerCase()) {
          return { ...p, totalTasks: p.totalTasks + 1 }
        }
        return p
      })
    )
  }

  // Handle star toggle
  const handleToggleStar = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isStarred: !p.isStarred } : p))
    )
  }

  // Handle project status update
  const handleUpdateStatus = (projectId: string, newStatus: Project["status"]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    )
  }

  // Handle timer play/pause toggle
  const handleToggleTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === timerId) {
          return { ...t, isRunning: !t.isRunning }
        }
        // If we want only one active timer running at once:
        return { ...t, isRunning: false }
      })
    )
  }

  // Handle timer reset
  const handleResetTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, secondsElapsed: 0, isRunning: false } : t))
    )
  }

  // Handle notification read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Handle opening chat
  const handleOpenChat = (msg: ChatMessage) => {
    setSelectedChatUser(msg)
    setIsChatOpen(true)
    // Mark message as read
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
    )
  }

  // Filter tasks and projects based on search query
  const query = searchQuery.trim().toLowerCase()
  const displayTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.project.toLowerCase().includes(query)
      )
    : tasks

  const displayProjects = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.company.toLowerCase().includes(query)
      )
    : projects

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 p-3 sm:p-5 md:p-6 lg:p-7">
      <div className="mx-auto flex max-w-[1560px] gap-5 items-start">
        {/* 1. Sidebar Component */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={(key) => setActiveNav(key)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* 2. Main Content Area */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Header Bar */}
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearAllNotifications={handleClearAllNotifications}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Active Search Notification Banner if searching */}
          {query && (
            <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-3 border border-border shadow-xs text-xs text-muted-foreground">
              <span>
                Filtering results for: <strong>&quot;{searchQuery}&quot;</strong> (
                {displayTasks.length} tasks, {displayProjects.length} projects found)
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Main Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
            {/* COLUMN 1: Active Projects (Google & Slack) — lg:col-span-4 */}
            <div className="space-y-5 lg:col-span-4">
              {displayProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onToggleStar={handleToggleStar}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}

              {displayProjects.length === 0 && (
                <div className="rounded-[28px] bg-card p-8 text-center text-xs text-muted-foreground border border-border">
                  No projects matching your search.
                </div>
              )}
            </div>

            {/* COLUMN 2: My Tasks & Time Manage (Chronometer) — lg:col-span-4 */}
            <div className="space-y-5 lg:col-span-4">
              {/* My Tasks Card */}
              <MyTasksCard
                tasks={displayTasks}
                onToggleTask={handleToggleTask}
                onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
              />

              {/* Time Tracker Stopwatch Card */}
              <TimeTrackerCard
                timers={timers}
                onToggleTimer={handleToggleTimer}
                onResetTimer={handleResetTimer}
              />
            </div>

            {/* COLUMN 3: Calendar & Messages — lg:col-span-4 */}
            <div className="space-y-5 md:col-span-2 lg:col-span-4">
              {/* Calendar Widget */}
              <CalendarWidget />

              {/* Message Widget */}
              <MessageWidget
                messages={messages}
                onSelectMessage={handleOpenChat}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <NewTaskModal
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        onAddTask={handleAddTask}
      />

      <QuickChatModal
        message={selectedChatUser}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onSelectAction={(key) => setActiveNav(key)}
      />
    </div>
  )
}
