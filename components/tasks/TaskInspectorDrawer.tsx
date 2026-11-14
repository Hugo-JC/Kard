"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  Check,
  Plus,
  Trash2,
  FileText,
  MessageSquare,
  Calendar,
  Flag,
  Layers,
  Eye,
  Pencil,
  Send,
  Bold,
  List,
  Code,
  Heading3,
  BookOpen,
  ExternalLink,
} from "lucide-react"
import {
  Member,
  Project,
  ProjectNote,
  TASK_STAGES,
  TaskChecklistItem,
  TaskComment,
  TaskItem,
  TaskStage,
} from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { ProjectLogoIcon } from "@/components/Logos"
import {
  ProjectSelectField,
  type ProjectSelectOption,
} from "@/components/projects/ProjectSelectField"
import { cn } from "@/lib/utils"

interface TaskInspectorDrawerProps {
  task: TaskItem | null
  projects: Project[]
  onClose: () => void
  onUpdateTask: (updatedTask: TaskItem) => void
  onToggleTask: (taskId: string) => void
  onOpenProjectNote?: (projectId: string, noteId: string) => void
}

const PRIORITY_OPTIONS: ProjectSelectOption[] = [
  { value: "High", label: "Alta", indicatorClassName: "bg-danger" },
  { value: "Medium", label: "Média", indicatorClassName: "bg-warning" },
  { value: "Low", label: "Baixa", indicatorClassName: "bg-info" },
]

const STAGE_OPTIONS: ProjectSelectOption[] = TASK_STAGES.map((s) => ({
  value: s.id,
  label: s.label,
  indicatorClassName: s.dot,
}))

interface TaskInspectorContentProps {
  task: TaskItem
  projects: Project[]
  onClose: () => void
  onUpdateTask: (updatedTask: TaskItem) => void
  onToggleTask: (taskId: string) => void
  onOpenProjectNote?: (projectId: string, noteId: string) => void
}

function TaskInspectorContent({
  task,
  projects,
  onClose,
  onUpdateTask,
  onToggleTask,
  onOpenProjectNote,
}: TaskInspectorContentProps) {
  const [titleDraft, setTitleDraft] = useState(task.title)
  const [markdownDraft, setMarkdownDraft] = useState(task.descriptionMarkdown || "")
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(!task.descriptionMarkdown)
  const [newChecklistText, setNewChecklistText] = useState("")
  const [newCommentText, setNewCommentText] = useState("")
  const [dueDraft, setDueDraft] = useState(task.dueDate || "")

  const linkedProject = projects.find(
    (p) => p.name.toLowerCase() === task.project.toLowerCase()
  )
  const projectNotes: ProjectNote[] = linkedProject?.notes || []
  const linkedNote = projectNotes.find((n) => n.id === task.linkedNoteId)
  const checklist: TaskChecklistItem[] = task.checklist || []
  const comments: TaskComment[] = task.comments || []

  const completedChecklistCount = checklist.filter((item) => item.completed).length
  const checklistPercent =
    checklist.length > 0
      ? Math.round((completedChecklistCount / checklist.length) * 100)
      : 0

  const projectMembers: Member[] = linkedProject?.members || []
  const assigneeOptions: ProjectSelectOption[] = [
    { value: "__none__", label: "Sem responsável", indicatorClassName: "bg-muted-foreground" },
    ...projectMembers.map((m) => ({
      value: m.name,
      label: m.name,
      indicatorClassName:
        m.status === "Online"
          ? "bg-emerald-500"
          : m.status === "In Meeting"
          ? "bg-amber-500"
          : m.status === "Focused"
          ? "bg-primary"
          : "bg-muted-foreground",
    })),
  ]

  const noteOptions: ProjectSelectOption[] = [
    { value: "__none__", label: "Nenhuma nota vinculada" },
    ...projectNotes.map((n) => ({
      value: n.id,
      label: n.title,
    })),
  ]

  const commitTitle = () => {
    const trimmed = titleDraft.trim()
    if (!trimmed || trimmed === task.title) return
    onUpdateTask({ ...task, title: trimmed })
  }

  const commitDue = () => {
    const trimmed = dueDraft.trim()
    if (trimmed === (task.dueDate || "")) return
    const lower = trimmed.toLowerCase()
    const dueKind =
      lower === "hoje" || lower === "today"
        ? "today"
        : lower === "ontem" || lower === "yesterday"
        ? "overdue"
        : "upcoming"
    onUpdateTask({ ...task, dueDate: trimmed || undefined, dueKind })
  }

  const commitMarkdown = () => {
    onUpdateTask({ ...task, descriptionMarkdown: markdownDraft })
    setIsEditingMarkdown(false)
  }

  const appendMarkdownSnippet = (snippet: string) => {
    setMarkdownDraft((prev) => (prev ? `${prev}\n${snippet}` : snippet))
    setIsEditingMarkdown(true)
  }

  const handleToggleChecklistItem = (itemId: string) => {
    const updated = checklist.map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    )
    onUpdateTask({
      ...task,
      checklist: updated,
      subtasksCount: updated.length,
    })
  }

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChecklistText.trim()) return
    const nextItem: TaskChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    }
    const updated = [...checklist, nextItem]
    onUpdateTask({
      ...task,
      checklist: updated,
      subtasksCount: updated.length,
    })
    setNewChecklistText("")
  }

  const handleDeleteChecklistItem = (itemId: string) => {
    const updated = checklist.filter((c) => c.id !== itemId)
    onUpdateTask({
      ...task,
      checklist: updated,
      subtasksCount: updated.length,
    })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    const nextComment: TaskComment = {
      id: `cmt-${Date.now()}`,
      author: "Angelina Smith",
      avatar: "/avatars/angelina.jpg",
      text: newCommentText.trim(),
      time: "Agora",
    }
    const updated = [...comments, nextComment]
    onUpdateTask({
      ...task,
      comments: updated,
      commentsCount: updated.length,
    })
    setNewCommentText("")
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.button
        type="button"
        aria-label="Fechar detalhes da tarefa"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] cursor-pointer"
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes da tarefa ${task.title}`}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 32 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border bg-card text-card-foreground shadow-2xl"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5 min-w-0 text-xs text-muted-foreground">
            <span className="font-mono font-bold tabular-nums text-foreground">
              #{task.number}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground truncate">
              <ProjectLogoIcon project={task.project} className="size-3.5 shrink-0" />
              <span className="truncate">{task.project}</span>
            </span>
            {task.dueDate && (
              <>
                <span>·</span>
                <span className="font-mono tabular-nums">{task.dueDate}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant={task.completed ? "secondary" : "outline"}
              size="sm"
              onClick={() => onToggleTask(task.id)}
              className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Check
                className={cn(
                  "size-3.5",
                  task.completed ? "text-success-foreground" : "text-muted-foreground"
                )}
              />
              <span>{task.completed ? "Concluída" : "Concluir"}</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fechar painel"
              className="size-8 rounded-xl"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur()
                }
              }}
              aria-label="Título da tarefa"
              className={cn(
                "w-full bg-transparent text-xl font-extrabold tracking-tight text-foreground focus:outline-none border-b border-transparent focus:border-primary pb-1 transition-colors",
                task.completed && "line-through text-muted-foreground"
              )}
            />

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {task.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span>·</span>}
                    <span className="font-medium">{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Structured Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/25 p-4">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Layers className="size-3.5" />
                Estágio
              </span>
              <ProjectSelectField
                ariaLabel="Estágio da tarefa"
                value={task.stage || (task.completed ? "DONE" : "TODO")}
                options={STAGE_OPTIONS}
                onValueChange={(value) => {
                  const nextStage = value as TaskStage
                  onUpdateTask({
                    ...task,
                    stage: nextStage,
                    completed: nextStage === "DONE",
                  })
                }}
                triggerClassName="h-9 min-h-9 w-full rounded-xl text-xs bg-card"
              />
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Flag className="size-3.5" />
                Prioridade
              </span>
              <ProjectSelectField
                ariaLabel="Prioridade da tarefa"
                value={task.priority}
                options={PRIORITY_OPTIONS}
                onValueChange={(value) =>
                  onUpdateTask({
                    ...task,
                    priority: value as TaskItem["priority"],
                  })
                }
                triggerClassName="h-9 min-h-9 w-full rounded-xl text-xs bg-card"
              />
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Responsável
              </span>
              <ProjectSelectField
                ariaLabel="Responsável pela tarefa"
                value={task.assignee?.name || "__none__"}
                options={assigneeOptions}
                onValueChange={(value) => {
                  const member = projectMembers.find((m) => m.name === value)
                  onUpdateTask({ ...task, assignee: member })
                }}
                triggerClassName="h-9 min-h-9 w-full rounded-xl text-xs bg-card"
              />
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="size-3.5" />
                Prazo (use Hoje / Ontem / Data)
              </span>
              <Input
                value={dueDraft}
                onChange={(e) => setDueDraft(e.target.value)}
                onBlur={commitDue}
                placeholder="Ex.: Hoje, 25 Jun"
                className="h-9 rounded-xl bg-card text-xs font-mono"
              />
            </div>
          </div>

          {/* Markdown Description */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Descrição em Markdown
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                {isEditingMarkdown ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingMarkdown(false)}
                      className="h-7 gap-1 rounded-lg px-2 text-xs"
                    >
                      <Eye className="size-3.5" />
                      <span>Visualizar</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={commitMarkdown}
                      className="h-7 rounded-lg px-3 text-xs font-semibold"
                    >
                      Salvar
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingMarkdown(true)}
                    className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
                  >
                    <Pencil className="size-3" />
                    <span>Editar Markdown</span>
                  </Button>
                )}
              </div>
            </div>

            {isEditingMarkdown ? (
              <div className="space-y-2 rounded-2xl border border-border bg-muted/20 p-3">
                <div className="flex flex-wrap items-center gap-1 border-b border-border/70 pb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendMarkdownSnippet("### Subtítulo")}
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <Heading3 className="size-3.5" />
                    <span>Título</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendMarkdownSnippet("**texto em destaque**")}
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <Bold className="size-3.5" />
                    <span>Negrito</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendMarkdownSnippet("- Novo critério de entrega")}
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <List className="size-3.5" />
                    <span>Lista</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendMarkdownSnippet("`endpoint_v2`")}
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <Code className="size-3.5" />
                    <span>Código</span>
                  </Button>
                </div>

                <textarea
                  value={markdownDraft}
                  onChange={(e) => setMarkdownDraft(e.target.value)}
                  rows={6}
                  placeholder="Escreva especificações, links, blocos de código ou critérios em Markdown..."
                  className="w-full resize-y bg-transparent text-xs font-mono leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            ) : (
              <div
                onClick={() => setIsEditingMarkdown(true)}
                className="cursor-text rounded-2xl border border-border/80 bg-muted/15 p-4 transition-colors hover:border-border"
              >
                {task.descriptionMarkdown ? (
                  <MarkdownRenderer content={task.descriptionMarkdown} />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Clique para adicionar contexto, critérios de aceite ou links em Markdown.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Coupled Project Note */}
          {projectNotes.length > 0 && (
            <section className="space-y-2.5 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Nota do Projeto Acoplada
                  </h4>
                </div>

                {linkedNote && linkedProject && onOpenProjectNote && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenProjectNote(linkedProject.id, linkedNote.id)}
                    className="h-7 gap-1 text-xs font-semibold text-primary"
                  >
                    <span>Abrir no projeto</span>
                    <ExternalLink className="size-3" />
                  </Button>
                )}
              </div>

              <ProjectSelectField
                ariaLabel="Vincular nota do projeto"
                value={task.linkedNoteId || "__none__"}
                options={noteOptions}
                onValueChange={(value) =>
                  onUpdateTask({
                    ...task,
                    linkedNoteId: value === "__none__" ? undefined : value,
                  })
                }
                triggerClassName="h-9 min-h-9 w-full rounded-xl text-xs bg-card"
              />

              {linkedNote && (
                <div className="rounded-xl border border-border/70 bg-card p-3 text-xs">
                  <p className="font-semibold text-foreground mb-1">{linkedNote.title}</p>
                  <MarkdownRenderer
                    content={linkedNote.contentMarkdown}
                    className="text-xs [&_p]:text-xs [&_li]:text-xs"
                  />
                </div>
              )}
            </section>
          )}

          {/* Interactive Checklist */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Checklist de Subtarefas
              </h4>
              <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                {completedChecklistCount}/{checklist.length} · {checklistPercent}%
              </span>
            </div>

            {checklist.length > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-card px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="flex flex-1 items-center gap-2.5 text-left cursor-pointer"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                        item.completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      )}
                    >
                      {item.completed && <Check className="size-3 stroke-[3]" />}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        item.completed
                          ? "line-through text-muted-foreground"
                          : "text-card-foreground"
                      )}
                    >
                      {item.text}
                    </span>
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    aria-label="Remover subtarefa"
                    className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2">
              <Input
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Adicionar item ao checklist..."
                className="h-9 flex-1 rounded-xl text-xs"
              />
              <Button type="submit" variant="outline" size="sm" className="h-9 gap-1 rounded-xl text-xs font-semibold">
                <Plus className="size-3.5" />
                <span>Adicionar</span>
              </Button>
            </form>
          </section>

          {/* Comments Feed */}
          <section className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Comentários ({comments.length})
              </h4>
            </div>

            <div className="space-y-2.5">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum comentário registrado nesta tarefa ainda.
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-3"
                  >
                    <Avatar src={c.avatar} fallback={c.author[0]} size="sm" />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-foreground">{c.author}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-mono text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-card-foreground">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <Input
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Escreva um comentário ou atualização..."
                className="h-9 flex-1 rounded-xl text-xs"
              />
              <Button type="submit" size="sm" className="h-9 gap-1.5 rounded-xl text-xs font-semibold">
                <Send className="size-3.5" />
                <span>Enviar</span>
              </Button>
            </form>
          </section>
        </div>
      </motion.aside>
    </div>
  )
}

export function TaskInspectorDrawer({
  task,
  projects,
  onClose,
  onUpdateTask,
  onToggleTask,
  onOpenProjectNote,
}: TaskInspectorDrawerProps) {
  return (
    <AnimatePresence>
      {task && (
        <TaskInspectorContent
          key={task.id}
          task={task}
          projects={projects}
          onClose={onClose}
          onUpdateTask={onUpdateTask}
          onToggleTask={onToggleTask}
          onOpenProjectNote={onOpenProjectNote}
        />
      )}
    </AnimatePresence>
  )
}
