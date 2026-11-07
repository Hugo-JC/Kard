"use client"

import React, { useState, useRef } from "react"
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Plus,
  Users,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  Trash2,
  UserCheck
} from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Project, Member, AVAILABLE_CONTRIBUTORS, TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddProject: (
    project: Omit<Project, "id" | "completedTasks">,
    initialTasks?: Omit<TaskItem, "id" | "number">[]
  ) => void
}

const PRESET_COLORS = [
  { name: "Ocean Blue", value: "#3B82F6" },
  { name: "Deep Indigo", value: "#6366F1" },
  { name: "Royal Purple", value: "#8B5CF6" },
  { name: "Vibrant Pink", value: "#EC4899" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Cyan Teal", value: "#06B6D4" },
  { name: "Sunset Amber", value: "#F59E0B" },
  { name: "Crimson Rose", value: "#F43F5E" },
]

export function NewProjectModal({
  open,
  onOpenChange,
  onAddProject,
}: NewProjectModalProps) {
  // Form states
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState<Project["logo"]>("custom")
  const [accentColor, setAccentColor] = useState("#3B82F6")
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [priority, setPriority] = useState<Project["priority"]>("HIGH PRIORITY")
  const [status, setStatus] = useState<Project["status"]>("IN PROGRESS")
  const [dueDate, setDueDate] = useState("30 AUGUST")
  const [budget, setBudget] = useState("$45,000")
  const [sprintStage, setSprintStage] = useState("Sprint 1 / 4")
  const [tagsInput, setTagsInput] = useState("MOBILE, UI/UX")

  // Team Contributors selection
  const [selectedContributors, setSelectedContributors] = useState<Member[]>([
    AVAILABLE_CONTRIBUTORS[0], // Angelina
    AVAILABLE_CONTRIBUTORS[1], // Courtney
    AVAILABLE_CONTRIBUTORS[2], // John Doe
  ])

  // Initial starter tasks
  const [starterTasks, setStarterTasks] = useState<
    { title: string; priority: "High" | "Medium" | "Low"; assignee: Member }[]
  >([
    {
      title: "Kickoff & Architecture Discovery",
      priority: "High",
      assignee: AVAILABLE_CONTRIBUTORS[1],
    },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState<Member>(
    AVAILABLE_CONTRIBUTORS[1]
  )
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle uploading device image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setCustomImage(dataUrl)
      setLogo("custom")
    }
    reader.readAsDataURL(file)
  }

  const toggleContributor = (contributor: Member) => {
    if (selectedContributors.some((m) => m.name === contributor.name)) {
      if (selectedContributors.length > 1) {
        setSelectedContributors((prev) =>
          prev.filter((m) => m.name !== contributor.name)
        )
      }
    } else {
      setSelectedContributors((prev) => [...prev, contributor])
    }
  }

  const handleAddStarterTask = () => {
    if (!newTaskTitle.trim()) return
    setStarterTasks((prev) => [
      ...prev,
      {
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        assignee: newTaskAssignee,
      },
    ])
    setNewTaskTitle("")
  }

  const handleRemoveStarterTask = (idx: number) => {
    setStarterTasks((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !company.trim()) return

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)

    const initialTaskCount = Math.max(starterTasks.length, 12)

    onAddProject(
      {
        name: name.trim(),
        company: company.trim(),
        logo: customImage ? "custom" : logo,
        priority,
        status,
        dueDate: dueDate.toUpperCase().trim(),
        totalTasks: initialTaskCount,
        progressColor: accentColor,
        progressTrack: "#EBF3FF",
        accentColor,
        customImage: customImage || undefined,
        tags: parsedTags.length > 0 ? parsedTags : ["APP", "DEV"],
        isStarred: false,
        sprintStage,
        attachmentsCount: 2,
        budget,
        description: description.trim() || `Official project workspace for ${company.trim()}.`,
        members: selectedContributors,
        extraMembersCount: Math.max(0, AVAILABLE_CONTRIBUTORS.length - selectedContributors.length),
        chatMessages: [
          {
            id: `msg-init-${Date.now()}`,
            user: "Angelina Smith",
            avatar: "/avatars/angelina.jpg",
            role: "Project Manager (You)",
            text: `Welcome team! Project workspace created for ${name.trim()}.`,
            time: "Just now",
            isMe: true,
          },
        ],
        documents: [
          {
            id: `doc-init-${Date.now()}`,
            name: `${name.replace(/\s+/g, "_")}_Project_Brief.pdf`,
            size: "1.8 MB",
            date: "Today",
            type: "PDF",
          },
        ],
      },
      starterTasks.map((st) => ({
        title: st.title,
        project: name.trim(),
        commentsCount: 0,
        subtasksCount: 0,
        completed: false,
        priority: st.priority,
        tags: ["Deliverable"],
        dueDate,
        assignee: st.assignee,
        stage: "TODO",
      }))
    )

    // Reset fields
    setName("")
    setCompany("")
    setDescription("")
    setCustomImage(null)
    setStarterTasks([])
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Project"
      description="Configure visual branding, accent color, contributors, and starter tasks."
      className="max-w-3xl max-h-[92vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-3 text-card-foreground">
        {/* 1. Brand Identity & Device Image Upload */}
        <div className="rounded-2xl bg-muted/40 p-4 border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Project Identity & Device Image</span>
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Custom logo or cover image
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview Box */}
            <div className="relative group shrink-0">
              <div
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/80 bg-card flex flex-col items-center justify-center overflow-hidden shadow-xs transition-all group-hover:border-primary cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: customImage ? accentColor : undefined }}
              >
                {customImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={customImage}
                    alt="Uploaded project brand"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                    <span className="text-[9px] font-bold text-muted-foreground leading-tight">
                      Upload from Device
                    </span>
                  </div>
                )}
              </div>

              {customImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomImage(null)
                  }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-danger text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform"
                  title="Remove image"
                >
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose file from device...</span>
                </Button>
                {customImage && (
                  <span className="text-[11px] text-success font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Image attached
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Upload your company logo, PNG, SVG, or high-res icon from your computer.
              </p>
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="text-xs font-bold text-card-foreground block">
              Project Highlight / Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setAccentColor(preset.value)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ring-2",
                    accentColor === preset.value
                      ? "ring-foreground scale-110"
                      : "ring-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {accentColor === preset.value && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}

              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                  title="Pick custom hex color"
                />
                <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Core Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Project Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NextGen Web App"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Client / Organization *
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Acme Corp, Netflix"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-card-foreground block mb-1.5">
            Project Description & Scope
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key deliverables, design system requirements, milestones..."
            rows={2}
            className="w-full rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/60 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 3. Planning & Deliverable Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Project["priority"])}
              className="h-10 w-full rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/60 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="HIGH PRIORITY" className="bg-card">High Priority</option>
              <option value="MEDIUM PRIORITY" className="bg-card">Medium Priority</option>
              <option value="LOW PRIORITY" className="bg-card">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Project["status"])}
              className="h-10 w-full rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/60 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="IN PROGRESS" className="bg-card">In Progress</option>
              <option value="COMPLETED" className="bg-card">Completed</option>
              <option value="ON HOLD" className="bg-card">On Hold</option>
              <option value="SELECT PROGRESS" className="bg-card">Select Progress</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Due Date
            </label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. 30 AUGUST"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-card-foreground block mb-1.5">
              Budget
            </label>
            <Input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. $50,000"
            />
          </div>
        </div>

        {/* 4. Team Contributors Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Assign Contributors to Project ({selectedContributors.length})</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              Click to toggle members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {AVAILABLE_CONTRIBUTORS.map((contributor) => {
              const isSelected = selectedContributors.some(
                (m) => m.name === contributor.name
              )
              return (
                <div
                  key={contributor.name}
                  onClick={() => toggleContributor(contributor)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-card border-primary ring-1 ring-primary/40 shadow-xs"
                      : "bg-muted/30 border-border hover:bg-muted/70 opacity-70"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={contributor.avatar}
                      fallback={contributor.name[0]}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-card-foreground truncate">
                        {contributor.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {contributor.role}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-white transition-colors",
                      isSelected ? "bg-primary" : "border border-border"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 5. Initial Deliverable Tasks (Designating to Contributors) */}
        <div className="space-y-3 rounded-2xl bg-muted/30 p-4 border border-border/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Initial Tasks & Designated Contributors ({starterTasks.length})</span>
            </label>
          </div>

          {/* Quick task adder */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Design System tokens setup"
              className="flex-1 h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
            />

            <select
              value={newTaskAssignee.name}
              onChange={(e) => {
                const found = AVAILABLE_CONTRIBUTORS.find(
                  (m) => m.name === e.target.value
                )
                if (found) setNewTaskAssignee(found)
              }}
              className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none w-full sm:w-auto"
            >
              {AVAILABLE_CONTRIBUTORS.map((m) => (
                <option key={m.name} value={m.name} className="bg-card">
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={newTaskPriority}
              onChange={(e) =>
                setNewTaskPriority(e.target.value as "High" | "Medium" | "Low")
              }
              className="h-9 rounded-xl border border-border bg-card px-2 text-xs text-foreground focus:outline-none w-full sm:w-auto"
            >
              <option value="High" className="bg-card">High</option>
              <option value="Medium" className="bg-card">Medium</option>
              <option value="Low" className="bg-card">Low</option>
            </select>

            <Button
              type="button"
              size="sm"
              onClick={handleAddStarterTask}
              className="h-9 gap-1 shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </div>

          {/* Added starter tasks list */}
          <div className="space-y-1.5 pt-1">
            {starterTasks.map((st, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/70 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-semibold text-card-foreground truncate">
                    {st.title}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                      st.priority === "High"
                        ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {st.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Avatar
                      src={st.assignee.avatar}
                      fallback={st.assignee.name[0]}
                      size="sm"
                      className="w-5 h-5"
                    />
                    <span className="text-[11px] font-medium hidden sm:inline">
                      {st.assignee.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStarterTask(idx)}
                    className="p-1 text-muted-foreground/60 hover:text-danger cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-white font-semibold shadow-xs hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
