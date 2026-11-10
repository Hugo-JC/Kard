"use client"

import React, { useState, useMemo } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import {
  Kanban,
  List,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  ArrowUpDown,
  MoveRight,
} from "lucide-react"
import { Project, TaskItem, Member, TaskStage, TASK_STAGES } from "@/lib/data"
import { TaskBucketCard } from "./TaskBucketCard"
import { SortableTaskRow } from "./SortableTaskRow"
import { ProjectBucketDropTray } from "./ProjectBucketDropTray"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectTaskBoardProps {
  project: Project
  tasks: TaskItem[]
  allProjects?: Project[]
  onToggleTask: (id: string) => void
  onAddTask: (newTask: Omit<TaskItem, "id" | "number">) => void
  onDeleteTask?: (id: string) => void
  onUpdateAssignee?: (taskId: string, assignee: Member) => void
  onUpdateStage?: (taskId: string, stage: TaskStage) => void
  onReorderTasks?: (tasks: TaskItem[]) => void
  onMoveTask?: (taskId: string, targetStage?: TaskStage, targetProject?: string) => void
}

/**
 * Droppable Stage Column for Kanban view
 */
function StageColumn({
  stage,
  tasks,
  onToggleTask,
  onDeleteTask,
  onUpdateAssignee,
  availableAssignees,
  onQuickAddTask,
}: {
  stage: { id: TaskStage; label: string; accent: string; dot: string }
  tasks: TaskItem[]
  onToggleTask: (id: string) => void
  onDeleteTask?: (id: string) => void
  onUpdateAssignee?: (taskId: string, assignee: Member) => void
  availableAssignees: Member[]
  onQuickAddTask: (stageId: TaskStage) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: {
      type: "stage-column",
      stageId: stage.id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border bg-muted/20 p-3 transition-colors min-h-[420px]",
        isOver
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border/70"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full shrink-0", stage.dot)} />
          <h4 className="font-bold text-xs uppercase tracking-wider text-card-foreground">
            {stage.label}
          </h4>
          <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/60 tabular-nums">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onQuickAddTask(stage.id)}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={`Add task to ${stage.label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task Cards in this stage */}
      <div className="mt-3 flex flex-col gap-2.5 flex-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskBucketCard
              key={task.id}
              task={task}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onUpdateAssignee={onUpdateAssignee}
              availableAssignees={availableAssignees}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/60 rounded-xl bg-card/40 my-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              Drop tasks here
            </span>
            <button
              type="button"
              onClick={() => onQuickAddTask(stage.id)}
              className="mt-2 text-[11px] font-bold text-primary hover:underline"
            >
              + Add task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ProjectTaskBoard({
  project,
  tasks,
  allProjects = [],
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateAssignee,
  onUpdateStage,
  onReorderTasks,
  onMoveTask,
}: ProjectTaskBoardProps) {
  // View mode switcher: "board" (Kanban Buckets) vs "list" (Sortable List)
  const [boardView, setBoardView] = useState<"board" | "list">("board")

  // Filter states
  const [searchFilter, setSearchFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  // Active dragged item for DragOverlay
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Configure sensors with a distance threshold to avoid capturing normal clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter tasks belonging strictly to this project
  const projectTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.project.toLowerCase() === project.name.toLowerCase()
    )
  }, [tasks, project.name])

  // Filtered task set based on local filters
  const filteredTasks = useMemo(() => {
    return projectTasks.filter((t) => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim()
        const matchesTitle = t.title.toLowerCase().includes(query)
        const matchesTag = t.tags?.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesTitle && !matchesTag) return false
      }

      if (assigneeFilter !== "ALL") {
        if (t.assignee?.name !== assigneeFilter) return false
      }

      if (priorityFilter !== "ALL") {
        if (t.priority !== priorityFilter) return false
      }

      return true
    })
  }, [projectTasks, searchFilter, assigneeFilter, priorityFilter])

  // Group tasks by stage
  const tasksByStage = useMemo(() => {
    const map: Record<TaskStage, TaskItem[]> = {
      TODO: [],
      "IN PROGRESS": [],
      REVIEW: [],
      DONE: [],
    }

    filteredTasks.forEach((task) => {
      const stage: TaskStage = task.stage || (task.completed ? "DONE" : "TODO")
      if (map[stage]) {
        map[stage].push(task)
      } else {
        map.TODO.push(task)
      }
    })

    return map
  }, [filteredTasks])

  // Active task object for the DragOverlay
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null
    return tasks.find((t) => t.id === activeTaskId) || null
  }, [activeTaskId, tasks])

  // Handlers for DnD
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Case 1: Dropped onto a Project Bucket in the drop tray!
    if (overId.startsWith("project-bucket-")) {
      const targetProjectName = overId.replace("project-bucket-", "")
      onMoveTask?.(activeId, undefined, targetProjectName)
      return
    }

    // Case 2: Dropped onto a Stage Column directly
    if (overId.startsWith("stage-")) {
      const targetStage = overId.replace("stage-", "") as TaskStage
      onMoveTask?.(activeId, targetStage, undefined)
      return
    }

    // Case 3: Dropped onto another task card
    const sourceTask = tasks.find((t) => t.id === activeId)
    const targetTask = tasks.find((t) => t.id === overId)

    if (!sourceTask || !targetTask) return

    // If target task belongs to a different stage, move to that stage
    const sourceStage = sourceTask.stage || (sourceTask.completed ? "DONE" : "TODO")
    const targetStage = targetTask.stage || (targetTask.completed ? "DONE" : "TODO")

    if (sourceStage !== targetStage) {
      onMoveTask?.(activeId, targetStage, undefined)
    }

    // Reorder within the list
    if (activeId !== overId) {
      const oldIndex = tasks.findIndex((t) => t.id === activeId)
      const newIndex = tasks.findIndex((t) => t.id === overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(tasks, oldIndex, newIndex)
        onReorderTasks?.(reordered)
      }
    }
  }

  const handleQuickAddTask = (stageId: TaskStage) => {
    onAddTask({
      title: "New Deliverable",
      project: project.name,
      commentsCount: 0,
      subtasksCount: 0,
      completed: stageId === "DONE",
      priority: "Medium",
      stage: stageId,
      assignee: project.members[0],
      dueDate: project.dueDate,
      tags: ["Sprint"],
    })
  }

  return (
    <div className="space-y-4">
      {/* 1. Control Toolbar: Search, Filters, and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-card p-3 border border-border shadow-xs">
        {/* Left: Search & Filter inputs */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter tasks..."
            className="h-9 px-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
          />

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            aria-label="Filter by contributor"
            className="h-9 px-2.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Contributors</option>
            {project.members.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="h-9 px-2.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Right: Drag cue & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium px-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
            <span>Drag & drop cards to reorder or move</span>
          </div>

          <div className="flex items-center rounded-xl bg-muted/50 p-1 border border-border">
            <button
              type="button"
              onClick={() => setBoardView("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                boardView === "board"
                  ? "bg-card text-foreground shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Buckets</span>
            </button>

            <button
              type="button"
              onClick={() => setBoardView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                boardView === "list"
                  ? "bg-card text-foreground shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* DndContext wrapping both the Board/List and the Cross-Project Tray */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 2. Cross-Project Drop Buckets Tray */}
        <ProjectBucketDropTray
          currentProjectName={project.name}
          projects={allProjects}
          isDraggingTask={!!activeTaskId}
          activeTaskTitle={activeTask?.title}
        />

        {/* 3. Board or List View */}
        {boardView === "board" ? (
          /* Kanban Stage Columns (To Do, In Progress, Review, Done) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {TASK_STAGES.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                tasks={tasksByStage[stage.id]}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onUpdateAssignee={onUpdateAssignee}
                availableAssignees={project.members}
                onQuickAddTask={handleQuickAddTask}
              />
            ))}
          </div>
        ) : (
          /* High-density Sortable List View */
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-xs">
            <SortableContext
              items={filteredTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No tasks matching the selected filters.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onUpdateAssignee={onUpdateAssignee}
                    onUpdateStage={onUpdateStage}
                    availableAssignees={project.members}
                  />
                ))
              )}
            </SortableContext>
          </div>
        )}

        {/* Drag Overlay for smooth dragging preview */}
        <DragOverlay>
          {activeTask ? (
            boardView === "board" ? (
              <TaskBucketCard
                task={activeTask}
                onToggleTask={() => {}}
                isOverlay
              />
            ) : (
              <SortableTaskRow
                task={activeTask}
                onToggleTask={() => {}}
                isOverlay
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
