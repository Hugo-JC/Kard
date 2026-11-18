"use client"

import React, { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskItem, Project } from "@/lib/data"

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Omit<TaskItem, "id" | "number">) => void
  projects?: Project[]
}

export function NewTaskModal({
  open,
  onOpenChange,
  onAddTask,
  projects = [],
}: NewTaskModalProps) {
  const projectOptions = projects
    .filter((project) => !project.isArchived)
    .map((project) => project.name)

  const [title, setTitle] = useState("")
  const [project, setProject] = useState("")
  const [priority, setPriority] = useState<TaskItem["priority"]>("Medium")
  const [tag, setTag] = useState("")
  const [dueDate, setDueDate] = useState("")

  const effectiveProject = projectOptions.includes(project)
    ? project
    : projectOptions[0] || ""

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !effectiveProject) return

    onAddTask({
      title: title.trim(),
      project: effectiveProject,
      priority,
      commentsCount: 0,
      subtasksCount: 0,
      completed: false,
      tags: tag.trim() ? [tag.trim()] : [],
      dueDate: dueDate.trim(),
    })

    setTitle("")
    setTag("")
    setDueDate("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nova tarefa"
      description="Regista uma tarefa e associa-a a um projeto existente."
    >
      <form onSubmit={handleSubmit} className="mt-2 space-y-4">
        <div>
          <label htmlFor="new-task-title" className="mb-1.5 block text-xs font-semibold text-card-foreground">
            Nome da tarefa
          </label>
          <Input
            id="new-task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="O que precisa de ser feito?"
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="new-task-project" className="mb-1.5 block text-xs font-semibold text-card-foreground">
              Projeto
            </label>
            <select
              id="new-task-project"
              value={effectiveProject}
              onChange={(event) => setProject(event.target.value)}
              disabled={projectOptions.length === 0}
              required
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {projectOptions.length === 0 ? (
                <option value="">Cria primeiro um projeto</option>
              ) : (
                projectOptions.map((projectName) => (
                  <option key={projectName} value={projectName} className="bg-card text-card-foreground">
                    {projectName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="new-task-priority" className="mb-1.5 block text-xs font-semibold text-card-foreground">
              Prioridade
            </label>
            <select
              id="new-task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskItem["priority"])}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="High" className="bg-card text-card-foreground">Alta</option>
              <option value="Medium" className="bg-card text-card-foreground">Média</option>
              <option value="Low" className="bg-card text-card-foreground">Baixa</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="new-task-tag" className="mb-1.5 block text-xs font-semibold text-card-foreground">
              Etiqueta (opcional)
            </label>
            <Input
              id="new-task-tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="Ex.: Design, Desenvolvimento"
            />
          </div>

          <div>
            <label htmlFor="new-task-due-date" className="mb-1.5 block text-xs font-semibold text-card-foreground">
              Data limite (opcional)
            </label>
            <Input
              id="new-task-due-date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              placeholder="Ex.: 25 nov 2026"
            />
          </div>
        </div>

        {projectOptions.length === 0 && (
          <p className="rounded-xl border border-warning/30 bg-warning-subtle/50 px-3 py-2.5 text-xs leading-relaxed text-warning-foreground" role="status">
            Ainda não existem projetos ativos. Cria um projeto antes de adicionares tarefas.
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!title.trim() || !effectiveProject} className="font-semibold">
            Criar tarefa
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
