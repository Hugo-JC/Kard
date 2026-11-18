"use client"

import React, { useState, useRef, useEffect } from "react"
import { Mail, Send, CheckCircle2 } from "lucide-react"
import { Project, AVAILABLE_CONTRIBUTORS, ProjectRole } from "@/lib/data"
import { canInviteRole, PROJECT_ROLE_LABELS } from "@/lib/rbac"
import { ProjectLogoIcon } from "@/components/Logos"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Avatar } from "@/components/ui/avatar"
import {
  ProjectSelectField,
  type ProjectSelectOption,
} from "@/components/projects/ProjectSelectField"

interface InviteCollaboratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  actorRole?: ProjectRole
  onInviteCollaborator: (
    projectId: string,
    email: string,
    role: string,
    projectRole?: ProjectRole
  ) => void
}

const ROLE_OPTIONS: ProjectSelectOption[] = [
  { value: "UI/UX Designer", label: "UI/UX Designer", indicatorClassName: "bg-primary" },
  { value: "Frontend Engineer", label: "Frontend Engineer", indicatorClassName: "bg-info" },
  { value: "Fullstack Dev", label: "Fullstack Dev", indicatorClassName: "bg-success" },
  { value: "Backend Engineer", label: "Backend Engineer", indicatorClassName: "bg-warning" },
  { value: "Product Manager", label: "Product Manager", indicatorClassName: "bg-primary" },
  { value: "QA Specialist", label: "QA Specialist", indicatorClassName: "bg-muted-foreground" },
  { value: "System Architect", label: "System Architect", indicatorClassName: "bg-danger" },
]

export function InviteCollaboratorModal({
  open,
  onOpenChange,
  project,
  actorRole = "owner",
  onInviteCollaborator,
}: InviteCollaboratorModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("UI/UX Designer")
  const [projectRole, setProjectRole] = useState<ProjectRole>("colaborador")
  const [sentSuccess, setSentSuccess] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rbacOptions: ProjectSelectOption[] = [
    ...(canInviteRole(actorRole, "gestor")
      ? [
          {
            value: "gestor",
            label: `${PROJECT_ROLE_LABELS.gestor} (Entrega & R2 Entregáveis)`,
            indicatorClassName: "bg-primary",
          },
        ]
      : []),
    {
      value: "colaborador",
      label: `${PROJECT_ROLE_LABELS.colaborador} (Execução & R2 Interno)`,
      indicatorClassName: "bg-success",
    },
  ]

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setSentSuccess(false)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const effectiveRole = canInviteRole(actorRole, projectRole)
      ? projectRole
      : "colaborador"
    onInviteCollaborator(project.id, email.trim(), role, effectiveRole)
    setSentSuccess(true)
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setSentSuccess(false)
      setEmail("")
      onOpenChange(false)
    }, 1200)
  }

  const availableToInvite = AVAILABLE_CONTRIBUTORS.filter(
    (c) => !project.members.some((m) => m.name === c.name || m.email === c.email)
  )

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      className="max-w-lg p-6 sm:p-7"
    >
      {sentSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-subtle text-success-foreground">
            <CheckCircle2 className="size-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Convite enviado
          </h3>
          <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted-foreground">
            A solicitação para <strong className="text-foreground">{email}</strong> ({PROJECT_ROLE_LABELS[projectRole]}) foi enviada para a caixa de notificações.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3 pr-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted/60">
              <ProjectLogoIcon project={project.name} className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Convidar colaborador
              </h3>
              <p className="text-xs text-muted-foreground">
                {project.name} · Cargo sincronizado entre Firestore e Cloudflare R2.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="invite-email">E-mail do colaborador</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  className="pl-10 rounded-xl"
                />
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProjectSelectField
                label="Cargo RBAC (Firestore & R2)"
                value={canInviteRole(actorRole, projectRole) ? projectRole : "colaborador"}
                options={rbacOptions}
                onValueChange={(val) => setProjectRole(val as ProjectRole)}
              />

              <ProjectSelectField
                label="Especialidade"
                value={role}
                options={ROLE_OPTIONS}
                onValueChange={setRole}
              />
            </div>

            {availableToInvite.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Sugestões da equipe
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableToInvite.map((contributor) => (
                    <Button
                      key={contributor.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail(
                          contributor.email ||
                            `${contributor.name.toLowerCase().replace(/\s+/g, ".")}@kard.dev`
                        )
                        if (contributor.role) setRole(contributor.role)
                      }}
                      className="h-8 gap-1.5 rounded-xl px-2.5 text-xs font-medium"
                    >
                      <Avatar
                        src={contributor.avatar}
                        fallback={contributor.name[0]}
                        size="sm"
                        className="size-4"
                      />
                      <span>{contributor.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!email.trim()}
                className="h-10 gap-1.5 rounded-xl px-5 text-xs font-semibold"
              >
                <Send className="size-3.5" />
                <span>Enviar convite</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </Dialog>
  )
}
