"use client"

import React from "react"
import { CloudUpload, FolderKanban, CheckSquare, Calendar, Zap, ShieldAlert } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PendingMigrationSummary } from "@/lib/firestoreSync"

interface LocalMigrationModalProps {
  open: boolean
  summary: PendingMigrationSummary | null
  userEmail: string
  isMigrating: boolean
  onConfirm: () => void
  onSkip: () => void
}

export function LocalMigrationModal({
  open,
  summary,
  userEmail,
  isMigrating,
  onConfirm,
  onSkip,
}: LocalMigrationModalProps) {
  if (!summary) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isMigrating) onSkip()
      }}
      className="max-w-lg p-6 sm:p-7"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3.5 pr-8">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
            <CloudUpload className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Migrar rascunho local para a nuvem
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Encontramos um workspace salvo localmente no navegador. Deseja sincronizar estes dados na sua conta{" "}
              <strong className="text-foreground">{userEmail}</strong> no Firebase Firestore?
            </p>
          </div>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-muted/35 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <FolderKanban className="size-3.5 text-primary" />
              <span>Projetos</span>
            </div>
            <p className="mt-1 font-mono text-lg font-extrabold tabular-nums text-foreground">
              {summary.projectsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/35 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <CheckSquare className="size-3.5 text-emerald-500" />
              <span>Tarefas</span>
            </div>
            <p className="mt-1 font-mono text-lg font-extrabold tabular-nums text-foreground">
              {summary.tasksCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/35 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Calendar className="size-3.5 text-amber-500" />
              <span>Eventos</span>
            </div>
            <p className="mt-1 font-mono text-lg font-extrabold tabular-nums text-foreground">
              {summary.eventsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/35 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Zap className="size-3.5 text-indigo-500" />
              <span>Regras</span>
            </div>
            <p className="mt-1 font-mono text-lg font-extrabold tabular-nums text-foreground">
              {summary.rulesCount}
            </p>
          </div>
        </div>

        {summary.willArchiveCount > 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-warning/40 bg-warning-subtle/60 p-3.5 text-xs">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
            <p className="leading-relaxed text-foreground">
              O plano <strong>Kard Free</strong> mantém até <strong>3 projetos ativos</strong>.{" "}
              {summary.willArchiveCount === 1
                ? "1 projeto excedente será arquivado automaticamente"
                : `${summary.willArchiveCount} projetos excedentes serão arquivados automaticamente`}{" "}
              na nuvem sem perder nenhuma tarefa ou nota.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 text-xs leading-relaxed text-muted-foreground">
          Você será definido como <strong className="text-foreground">Owner do projeto</strong> em todos os projetos migrados e poderá atribuir os cargos de <strong className="text-foreground">Gestor</strong> e <strong className="text-foreground">Colaborador</strong> à equipe.
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isMigrating}
            onClick={onSkip}
            className="h-10 rounded-xl text-xs font-semibold text-muted-foreground"
          >
            Iniciar workspace vazio
          </Button>
          <Button
            type="button"
            disabled={isMigrating}
            onClick={onConfirm}
            className="h-10 gap-2 rounded-xl px-5 text-xs font-semibold"
          >
            <CloudUpload className="size-4" />
            <span>
              {isMigrating
                ? "Sincronizando com Firestore..."
                : "Migrar rascunho para a nuvem"}
            </span>
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
