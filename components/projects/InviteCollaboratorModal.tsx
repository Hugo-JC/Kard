"use client"

import React, { useState } from "react"
import {
  X,
  Mail,
  UserPlus,
  Shield,
  Send,
  CheckCircle2,
  Users,
  Sparkles,
  Info,
} from "lucide-react"
import { Project, AVAILABLE_CONTRIBUTORS } from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface InviteCollaboratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onInviteCollaborator: (projectId: string, email: string, role: string) => void
}

const PRESET_ROLES = [
  "UI/UX Designer",
  "Frontend Engineer",
  "Fullstack Dev",
  "Backend Engineer",
  "Product Manager",
  "QA Specialist",
  "System Architect",
]

export function InviteCollaboratorModal({
  open,
  onOpenChange,
  project,
  onInviteCollaborator,
}: InviteCollaboratorModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("UI/UX Designer")
  const [sentSuccess, setSentSuccess] = useState(false)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    onInviteCollaborator(project.id, email.trim(), role)
    setSentSuccess(true)
    setTimeout(() => {
      setSentSuccess(false)
      setEmail("")
      onOpenChange(false)
    }, 1400)
  }

  // Quick fill from available contributors that aren't yet in this project
  const availableToInvite = AVAILABLE_CONTRIBUTORS.filter(
    (c) => !project.members.some((m) => m.name === c.name || m.email === c.email)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg my-auto rounded-[32px] bg-card border border-border shadow-2xl text-card-foreground p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-4 ring-emerald-500/15">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground">
              Convite Enviado com Sucesso! 🚀
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              O convite foi despachado para <strong>{email}</strong> e registrado na caixa de notificações com botões de <strong>Colaborar</strong> ou <strong>Negar</strong> (estilo GitHub).
            </p>
          </div>
        ) : (
          <>
            {/* Header with Project Badge */}
            <div className="flex items-center gap-3 pb-3 border-b border-border/80">
              <div className="size-11 rounded-2xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                {project.logo === "google" ? (
                  <GoogleLogo className="w-6 h-6" />
                ) : project.logo === "slack" ? (
                  <SlackLogo className="w-6 h-6" />
                ) : project.logo === "spotify" ? (
                  <SpotifyLogo className="w-6 h-6" />
                ) : project.logo === "linear" ? (
                  <LinearLogo className="w-6 h-6" />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-card-foreground">
                  Convidar Colaborador por E-mail
                </h3>
                <p className="text-xs text-muted-foreground">
                  Projeto: <strong className="text-foreground">{project.name}</strong> ({project.company})
                </p>
              </div>
            </div>

            {/* Explanation matching GitHub invitation flow */}
            <div className="rounded-2xl bg-primary-subtle/50 border border-primary/20 p-3.5 flex items-start gap-3 text-xs text-primary">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Ao enviar, o colaborador receberá uma solicitação na <strong>caixa de notificações</strong> com opções interativas de <strong>Colaborar</strong> ou <strong>Negar</strong> o pedido, exatamente como no GitHub.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  E-mail do Colaborador *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo: desenvolvedor@empresa.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-muted/30 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cargo / Função no Projeto
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-muted/30 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-card">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Suggestions from Team */}
              {availableToInvite.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Sugestões rápidas da equipe:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableToInvite.map((contributor) => (
                      <button
                        key={contributor.name}
                        type="button"
                        onClick={() => {
                          setEmail(contributor.email || `${contributor.name.toLowerCase().replace(/\s+/g, ".")}@kard.dev`)
                          if (contributor.role) setRole(contributor.role)
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border hover:border-primary text-[11px] font-medium text-foreground cursor-pointer transition-colors"
                      >
                        <Avatar src={contributor.avatar} fallback={contributor.name[0]} size="sm" className="w-4 h-4" />
                        <span>{contributor.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-10 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!email.trim()}
                  className="h-10 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-blue-700 shadow-sm gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Convite de Colaboração</span>
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
