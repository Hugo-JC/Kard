"use client"

import React, { useState, useMemo, useSyncExternalStore } from "react"
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
  useDroppable,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Kanban, List, Plus, ArrowUpDown } from "lucide-react"
import { Project, TaskItem, Member, TaskStage, TASK_STAGES } from "@/lib/data"
import { TaskBucketCard } from "./TaskBucketCard"
import { SortableTaskRow } from "./SortableTaskRow"
import { ProjectBucketDropTray } from "./ProjectBucketDropTray"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ProjectSelectField,
  memberSelectOptions,
  type ProjectSelectOption,
} from "@/components/projects/ProjectSelectField"
import { cn } from "@/lib/utils"

interface ProjectTaskBoardProps {
  project: Project
  tasks: TaskItem[]
  allProjects?: Project[]
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
  onAddTask: (newTask: Omit<TaskItem, "id" | "number">) => void
  onDeleteTask?: (id: string) => void
  onUpdateAssignee?: (taskId: string, assignee: Member) => void
  onUpdateStage?: (taskId: string, stage: TaskStage) => void
  onReorderTasks?: (tasks: TaskItem[]) => void
  onMoveTask?: (taskId: string, targetStage?: TaskStage, targetProject?: string) => void
}

function StageColumn({
  stage,
  tasks,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onUpdateAssignee,
  availableAssignees,
  onQuickAddTask,
}: {
  stage: { id: TaskStage; label: string; accent: string; dot: string }
  tasks: TaskItem[]
  onToggleTask: (id: string) => void
  onSelectTask?: (task: TaskItem) => void
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
        "flex min-h-[420px] flex-col rounded-2xl p-3 transition-colors",
        isOver
          ? "bg-primary-subtle/50 ring-1 ring-primary/30"
          : "bg-muted/35"
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full shrink-0", stage.dot)} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-card-foreground">
            {stage.label}
          </h4>
          <span className="text-xs font-mono font-semibold text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onQuickAddTask(stage.id)}
          className="size-7"
          title={`Adicionar tarefa em ${stage.label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-2.5">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskBucketCard
              key={task.id}
              task={task}
              onToggleTask={onToggleTask}
              onSelectTask={onSelectTask}
              onDeleteTask={onDeleteTask}
              onUpdateAssignee={onUpdateAssignee}
              availableAssignees={availableAssignees}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="my-2 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 p-6 text-center">
            <span className="text-xs font-medium text-muted-foreground">
              Solte tarefas aqui
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onQuickAddTask(stage.id)}
              className="mt-2 h-7 text-xs font-semibold text-primary"
            >
              + Nova tarefa
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const PRIORITY_FILTER_OPTIONS: ProjectSelectOption[] = [
  { value: "ALL", label: "Todas prioridades", indicatorClassName: "bg-muted-foreground" },
  { value: "High", label: "Alta", indicatorClassName: "bg-danger" },
  { value: "Medium", label: "Média", indicatorClassName: "bg-warning" },
  { value: "Low", label: "Baixa", indicatorClassName: "bg-info" },
]

export function ProjectTaskBoard({
  project,
  tasks,
  allProjects = [],
  onToggleTask,
  onSelectTask,
  onAddTask,
  onDeleteTask,
  onUpdateAssignee,
  onUpdateStage,
  onReorderTasks,
  onMoveTask,
}: ProjectTaskBoardProps) {
  const [boardView, setBoardView] = useState<"board" | "list">("board")
  const [searchFilter, setSearchFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

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

  const assigneeFilterOptions: ProjectSelectOption[] = useMemo(
    () => [
      { value: "ALL", label: "Todos colaboradores", indicatorClassName: "bg-primary" },
      ...memberSelectOptions(project.members),
    ],
    [project.members]
  )

  const projectTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.project.toLowerCase() === project.name.toLowerCase()
    )
  }, [tasks, project.name])

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

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null
    return tasks.find((t) => t.id === activeTaskId) || null
  }, [activeTaskId, tasks])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (overId.startsWith("project-bucket-")) {
      const targetProjectName = overId.replace("project-bucket-", "")
      onMoveTask?.(activeId, undefined, targetProjectName)
      return
    }

    if (overId.startsWith("stage-")) {
      const targetStage = overId.replace("stage-", "") as TaskStage
      onMoveTask?.(activeId, targetStage, undefined)
      return
    }

    const sourceTask = tasks.find((t) => t.id === activeId)
    const targetTask = tasks.find((t) => t.id === overId)

    if (!sourceTask || !targetTask) return

    const sourceStage = sourceTask.stage || (sourceTask.completed ? "DONE" : "TODO")
    const targetStage = targetTask.stage || (targetTask.completed ? "DONE" : "TODO")

    if (sourceStage !== targetStage) {
      onMoveTask?.(activeId, targetStage, undefined)
    }

    if (activeId !== overId) {
      const oldIndex = tasks.findIndex((t) => t.id === activeId)
      const newIndex = tasks.findIndex((t) => t.id === overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(tasks, oldIndex, newIndex).map((t, idx) => ({
          ...t,
          number: String(idx + 1).padStart(2, "0"),
        }))
        onReorderTasks?.(reordered)
      }
    }
  }

  const handleQuickAddTask = (stageId: TaskStage) => {
    onAddTask({
      title: "Nova entrega",
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
      {/* Control Toolbar with shadcn Input, ProjectSelectField, and Tabs */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar tarefas..."
            className="h-9 w-full rounded-xl text-xs sm:w-48"
          />

          <ProjectSelectField
            ariaLabel="Filtrar por colaborador"
            value={assigneeFilter}
            options={assigneeFilterOptions}
            onValueChange={setAssigneeFilter}
            triggerClassName="h-9 min-h-9 w-44 rounded-xl text-xs"
          />

          <ProjectSelectField
            ariaLabel="Filtrar por prioridade"
            value={priorityFilter}
            options={PRIORITY_FILTER_OPTIONS}
            onValueChange={setPriorityFilter}
            triggerClassName="h-9 min-h-9 w-40 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
            <ArrowUpDown className="size-3.5 text-primary" />
            <span>Arraste para reordenar</span>
          </div>

          <Tabs
            value={boardView}
            onValueChange={(v) => setBoardView(v as "board" | "list")}
          >
            <TabsList>
              <TabsTrigger value="board" className="gap-1.5">
                <Kanban className="size-3.5" />
                <span>Buckets</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="size-3.5" />
                <span>Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isMounted && (
        <DndContext
          id="project-task-board-dnd"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ProjectBucketDropTray
            currentProjectName={project.name}
            projects={allProjects}
            isDraggingTask={!!activeTaskId}
            activeTaskTitle={activeTask?.title}
          />

          {boardView === "board" ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
              {TASK_STAGES.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  tasks={tasksByStage[stage.id]}
                  onToggleTask={onToggleTask}
                  onSelectTask={onSelectTask}
                  onDeleteTask={onDeleteTask}
                  onUpdateAssignee={onUpdateAssignee}
                  availableAssignees={project.members}
                  onQuickAddTask={handleQuickAddTask}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-3">
              <SortableContext
                items={filteredTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Nenhuma tarefa encontrada para este filtro.
                  </div>
                ) : (
                  filteredTasks.map((task, idx) => (
                    <SortableTaskRow
                      key={task.id}
                      task={{
                        ...task,
                        number: String(idx + 1).padStart(2, "0"),
                      }}
                      onToggleTask={onToggleTask}
                      onSelectTask={onSelectTask}
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
      )}
    </div>
  )
}
