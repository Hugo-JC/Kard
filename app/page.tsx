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
import { ProjectsView } from "@/components/projects/ProjectsView"
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TIMERS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  Project,
  TaskItem,
  Member,
  TrackedTimer,
  ChatMessage,
  NotificationItem,
} from "@/lib/data"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { toggleTheme } = useTheme()

  // Navigation State
  const [activeNav, setActiveNav] = useState<NavItemKey>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [managingProjectId, setManagingProjectId] = useState<string | null>(null)

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
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [timers])

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

  // Handle adding a new project (with optional starter tasks)
  const handleAddProject = (
    newProjectData: Omit<Project, "id" | "completedTasks">,
    initialTasks?: Omit<TaskItem, "id" | "number">[]
  ) => {
    const newProject: Project = {
      ...newProjectData,
      id: `proj-${Date.now()}`,
      completedTasks: 0,
    }
    setProjects((prev) => [newProject, ...prev])

    if (initialTasks && initialTasks.length > 0) {
      const createdTasks: TaskItem[] = initialTasks.map((t, idx) => ({
        ...t,
        id: `task-${Date.now()}-${idx}`,
        number: String(tasks.length + idx + 1).padStart(2, "0"),
      }))
      setTasks((prev) => [...createdTasks, ...prev])
    }
  }

  // Handle updating an existing project (e.g. from ProjectManageView)
  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  // Handle updating task assignee
  const handleUpdateTaskAssignee = (taskId: string, assignee: Member) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assignee } : t))
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

  // Handle project archive toggle
  const handleToggleArchive = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isArchived: !p.isArchived } : p))
    )
  }

  const [includeArchivedSearch, setIncludeArchivedSearch] = useState(false)

  // Handle timer play/pause toggle
  const handleToggleTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === timerId) {
          return { ...t, isRunning: !t.isRunning }
        }
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
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
    )
  }

  // Filter tasks and projects based on search query for Dashboard
  const query = searchQuery.trim().toLowerCase()
  const displayTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.project.toLowerCase().includes(query)
      )
    : tasks

  const matchingArchivedProjectsCount = query
    ? projects.filter(
        (p) =>
          p.isArchived &&
          (p.name.toLowerCase().includes(query) || p.company.toLowerCase().includes(query))
      ).length
    : projects.filter((p) => p.isArchived).length

  const displayProjects = query
    ? projects.filter(
        (p) =>
          (p.name.toLowerCase().includes(query) ||
            p.company.toLowerCase().includes(query)) &&
          (includeArchivedSearch ? true : !p.isArchived)
      )
    : projects.filter((p) => !p.isArchived)

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1560px] items-start gap-4 lg:gap-5">
        {/* 1. Sidebar Navigation */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={(key) => {
            setActiveNav(key)
            if (key === "projects") {
              setManagingProjectId(null)
            }
          }}
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

          {/* Active Search Notification Banner if searching on dashboard */}
          {query && activeNav === "dashboard" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-5 py-3 border border-border shadow-xs text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2.5">
                <span>
                  Filtering results for: <strong>&quot;{searchQuery}&quot;</strong> (
                  {displayTasks.length} tasks, {displayProjects.length} projects)
                </span>
                {matchingArchivedProjectsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIncludeArchivedSearch(!includeArchivedSearch)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors cursor-pointer",
                      includeArchivedSearch
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 font-bold"
                        : "bg-muted/70 border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {includeArchivedSearch
                      ? `Hide archived (${matchingArchivedProjectsCount})`
                      : `Include archived (${matchingArchivedProjectsCount})`}
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setIncludeArchivedSearch(false)
                }}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Views Switching */}
          <AnimatePresence mode="wait">
            {activeNav === "projects" ? (
              <motion.div
                key="projects-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectsView
                  projects={projects}
                  tasks={tasks}
                  onToggleStar={handleToggleStar}
                  onUpdateStatus={handleUpdateStatus}
                  onAddProject={handleAddProject}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onUpdateProject={handleUpdateProject}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTaskAssignee={handleUpdateTaskAssignee}
                  onToggleArchive={handleToggleArchive}
                  managingProjectId={managingProjectId}
                  onSetManagingProjectId={setManagingProjectId}
                />
              </motion.div>
            ) : activeNav === "my-tasks" ? (
              <motion.div
                key="tasks-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                <div className="lg:col-span-8">
                  <MyTasksCard
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                  />
                </div>
                <div className="lg:col-span-4 space-y-5">
                  <TimeTrackerCard
                    timers={timers}
                    onToggleTimer={handleToggleTimer}
                    onResetTimer={handleResetTimer}
                  />
                  <CalendarWidget />
                </div>
              </motion.div>
            ) : activeNav === "calendar" ? (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                <div className="lg:col-span-8">
                  <CalendarWidget />
                </div>
                <div className="lg:col-span-4">
                  <MyTasksCard
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                  />
                </div>
              </motion.div>
            ) : activeNav === "time-manage" ? (
              <motion.div
                key="time-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                <div className="lg:col-span-8">
                  <TimeTrackerCard
                    timers={timers}
                    onToggleTimer={handleToggleTimer}
                    onResetTimer={handleResetTimer}
                  />
                </div>
                <div className="lg:col-span-4">
                  <MessageWidget
                    messages={messages}
                    onSelectMessage={handleOpenChat}
                  />
                </div>
              </motion.div>
            ) : activeNav === "settings" ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-[28px] bg-card p-8 border border-border space-y-6 max-w-3xl"
              >
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">Workspace Settings</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage workspace themes, team preferences, and notification rules.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Interface Appearance</p>
                      <p className="text-xs text-muted-foreground">Toggle between Light mode and Deep Slate Dark mode.</p>
                    </div>
                    <Button onClick={toggleTheme} variant="outline" size="sm" className="gap-2 cursor-pointer">
                      <Sun className="hidden dark:block w-4 h-4 text-amber-400" />
                      <Moon className="block dark:hidden w-4 h-4 text-blue-500" />
                      <span className="capitalize">
                        <span className="hidden dark:inline">Switch to Light</span>
                        <span className="inline dark:hidden">Switch to Dark</span>
                      </span>
                    </Button>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Desktop Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive real-time alerts for project deadlines and team mentions.</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary-subtle px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">Kard Cloud Sync</p>
                      <p className="text-xs text-muted-foreground">Instant multi-device state synchronization.</p>
                    </div>
                    <span className="text-xs font-semibold text-success-foreground bg-success-subtle px-2.5 py-1 rounded-lg">
                      Connected
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* DEFAULT: Bento Grid Dashboard */
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start"
              >
                {/* COLUMN 1: Active Projects — lg:col-span-4 */}
                <div className="space-y-5 lg:col-span-4">
                  {displayProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onToggleStar={handleToggleStar}
                      onUpdateStatus={handleUpdateStatus}
                      onToggleArchive={handleToggleArchive}
                      onClick={() => {
                        setManagingProjectId(project.id)
                        setActiveNav("projects")
                      }}
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
                  <MyTasksCard
                    tasks={displayTasks}
                    onToggleTask={handleToggleTask}
                    onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                  />

                  <TimeTrackerCard
                    timers={timers}
                    onToggleTimer={handleToggleTimer}
                    onResetTimer={handleResetTimer}
                  />
                </div>

                {/* COLUMN 3: Calendar & Messages — lg:col-span-4 */}
                <div className="space-y-5 md:col-span-2 lg:col-span-4">
                  <CalendarWidget />

                  <MessageWidget
                    messages={messages}
                    onSelectMessage={handleOpenChat}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals */}
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
        onSelectAction={(key) => {
          setActiveNav(key)
          if (key === "projects") {
            setManagingProjectId(null)
          }
        }}
      />
    </div>
  )
}
