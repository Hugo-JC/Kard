"use client"

import { useId, useState, type FormEvent } from "react"
import { addDays, format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react"
import type { Member, Project, TaskItem } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ProjectSelectField, memberSelectOptions } from "@/components/projects/ProjectSelectField"

interface TaskComposerProps {
  project: Project
  assignees: Member[]
  onAddTask: (task: Omit<TaskItem, "id" | "number">) => void
}

const priorityOptions = [
  {
    value: "High",
    label: "Alta",
    description: "Precisa de atenção primeiro",
    indicatorClassName: "bg-danger",
  },
  {
    value: "Medium",
    label: "Média",
    description: "Prioridade equilibrada",
    indicatorClassName: "bg-warning",
  },
  {
    value: "Low",
    label: "Baixa",
    description: "Pode entrar na próxima fila",
    indicatorClassName: "bg-info",
  },
]

const categoryOptions = [
  {
    value: "Entrega",
    label: "Entrega",
    description: "Resultado pronto para compartilhar",
    indicatorClassName: "bg-primary",
  },
  {
    value: "Design",
    label: "Design",
    description: "Pesquisa, protótipo ou interface",
    indicatorClassName: "bg-info",
  },
  {
    value: "Desenvolvimento",
    label: "Desenvolvimento",
    description: "Implementação e integrações",
    indicatorClassName: "bg-success",
  },
  {
    value: "Revisão",
    label: "Revisão",
    description: "Feedback e validação",
    indicatorClassName: "bg-warning",
  },
]

function toDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function TaskComposer({ project, assignees, onAddTask }: TaskComposerProps) {
  const [title, setTitle] = useState("")
  const [assigneeName, setAssigneeName] = useState(assignees[0]?.name ?? "")
  const [priority, setPriority] = useState<TaskItem["priority"]>("Medium")
  const [category, setCategory] = useState("Entrega")
  const [deadline, setDeadline] = useState("")
  const [deadlineOpen, setDeadlineOpen] = useState(false)
  const [createdTaskTitle, setCreatedTaskTitle] = useState("")
  const titleId = useId()
  const composerHeadingId = useId()
  const deadlineTriggerId = useId()
  const deadlineInputId = useId()
  const selectedAssignee =
    assignees.find((assignee) => assignee.name === assigneeName) ?? assignees[0]
  const today = toDateInputValue(new Date())
  const deadlineLabel = deadline
    ? format(parseISO(deadline), "d 'de' MMM", { locale: ptBR })
    : "Sem prazo"

  const resetFeedback = () => setCreatedTaskTitle("")

  const setRelativeDeadline = (daysFromToday: number) => {
    setDeadline(toDateInputValue(addDays(new Date(), daysFromToday)))
    setDeadlineOpen(false)
    resetFeedback()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedTitle = title.trim()

    if (!normalizedTitle || !selectedAssignee) return

    onAddTask({
      title: normalizedTitle,
      project: project.name,
      commentsCount: 0,
      subtasksCount: 0,
      completed: false,
      priority: priority as TaskItem["priority"],
      tags: [category],
      dueDate: deadline
        ? format(parseISO(deadline), "d 'de' MMM", { locale: ptBR })
        : undefined,
      assignee: selectedAssignee,
      stage: "TODO",
    })

    setTitle("")
    setCreatedTaskTitle(normalizedTitle)
  }

  return (
    <section
      aria-labelledby={composerHeadingId}
      className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs sm:p-5"
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 id={composerHeadingId} className="text-base font-bold text-card-foreground sm:text-lg">
                Nova tarefa
              </h3>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                Organize o próximo passo de {project.name} em poucos cliques.
              </p>
            </div>
          </div>
          <Badge variant="info" className="min-h-8 shrink-0 items-center gap-1.5 rounded-full px-3">
            <Zap aria-hidden="true" className="size-3.5" />
            Rápida
          </Badge>
        </div>

        <FieldGroup className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
          <Field className="col-span-2 min-w-0 sm:col-span-4">
            <FieldLabel htmlFor={titleId}>Título</FieldLabel>
            <Input
              id={titleId}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                resetFeedback()
              }}
              placeholder="Ex.: Revisar o fluxo de onboarding"
              className="h-12 rounded-xl border-border bg-background px-3.5 text-base placeholder:text-muted-foreground/70"
              required
            />
          </Field>

          <ProjectSelectField
            label="Responsável"
            value={selectedAssignee?.name ?? ""}
            options={memberSelectOptions(assignees)}
            onValueChange={(value) => {
              setAssigneeName(value)
              resetFeedback()
            }}
            placeholder="Selecione"
            contentClassName="min-w-56"
          />

          <ProjectSelectField
            label="Prioridade"
            value={priority}
            options={priorityOptions}
            onValueChange={(value) => {
              setPriority(value as TaskItem["priority"])
              resetFeedback()
            }}
            triggerClassName="font-semibold"
            contentClassName="min-w-56"
          />

          <ProjectSelectField
            label="Tipo"
            value={category}
            options={categoryOptions}
            onValueChange={(value) => {
              setCategory(value)
              resetFeedback()
            }}
            contentClassName="min-w-56"
          />

          <Field className="min-w-0">
            <FieldLabel htmlFor={deadlineTriggerId}>Prazo</FieldLabel>
            <Popover open={deadlineOpen} onOpenChange={setDeadlineOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id={deadlineTriggerId}
                    type="button"
                    variant="outline"
                    aria-label={`Selecionar prazo. Atual: ${deadlineLabel}`}
                    className="h-12 min-h-12 w-full justify-start gap-2.5 rounded-xl border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted/60"
                  >
                    <CalendarDays data-icon="inline-start" aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    <span className="truncate text-foreground">{deadlineLabel}</span>
                  </Button>
                }
              />
              <PopoverContent
                align="start"
                className="w-[min(21rem,calc(100vw-2rem))] gap-4 p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">Defina o prazo</p>
                  <p className="text-sm text-muted-foreground">Escolha uma data ou use um atalho.</p>
                </div>
                <Field>
                  <FieldLabel htmlFor={deadlineInputId}>Data</FieldLabel>
                  <Input
                    id={deadlineInputId}
                    type="date"
                    value={deadline}
                    min={today}
                    onChange={(event) => {
                      setDeadline(event.target.value)
                      setDeadlineOpen(false)
                      resetFeedback()
                    }}
                    className="h-11 rounded-xl bg-background"
                  />
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: "Hoje", days: 0 }, { label: "Amanhã", days: 1 }, { label: "Em 7 dias", days: 7 }].map((option) => (
                    <Button
                      key={option.label}
                      type="button"
                      variant="outline"
                      className="h-11 min-h-11 px-2 text-xs sm:text-sm"
                      onClick={() => setRelativeDeadline(option.days)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {deadline && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 min-h-11 w-full text-sm text-muted-foreground"
                    onClick={() => {
                      setDeadline("")
                      setDeadlineOpen(false)
                      resetFeedback()
                    }}
                  >
                    Remover prazo
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-6 min-w-0">
            {createdTaskTitle ? (
              <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm font-medium text-success-foreground">
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">Tarefa adicionada: {createdTaskTitle}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pressione <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-semibold text-foreground">Enter</kbd> para adicionar mais rápido.
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={!title.trim() || !selectedAssignee}
            className="h-12 w-full shrink-0 gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm sm:w-auto"
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            Adicionar tarefa
          </Button>
        </div>
      </form>
    </section>
  )
}
