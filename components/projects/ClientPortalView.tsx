"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Eye,
  MessageSquareWarning,
  Plus,
  ShieldCheck,
  Sparkles,
  Send,
  Lock,
} from "lucide-react"
import { ClientDeliverable, Project } from "@/lib/data"
import { GoogleLogo, SlackLogo, SpotifyLogo, LinearLogo } from "@/components/Logos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubscriptionPlanTier } from "@/components/billing/PricingPlansModal"
import { cn } from "@/lib/utils"

interface ClientPortalViewProps {
  project: Project
  currentTier: SubscriptionPlanTier
  onOpenPricingModal?: () => void
  onUpdateDeliverableStatus: (
    projectId: string,
    deliverableId: string,
    status: ClientDeliverable["status"],
    feedback?: string
  ) => void
  onAddDeliverable: (
    projectId: string,
    deliverable: Omit<ClientDeliverable, "id" | "updatedAt">
  ) => void
}

export function ClientPortalView({
  project,
  currentTier,
  onOpenPricingModal,
  onUpdateDeliverableStatus,
  onAddDeliverable,
}: ClientPortalViewProps) {
  const [isClientPreviewMode, setIsClientPreviewMode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [feedbackDraft, setFeedbackDraft] = useState("")

  // Manager new deliverable form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newMilestone, setNewMilestone] = useState(project.sprintStage || "Sprint Atual")
  const [newDescription, setNewDescription] = useState("")

  const deliverables = project.deliverables || []
  const percent =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0

  const approvedCount = deliverables.filter((d) => d.status === "approved").length
  const shareCode =
    project.portalShareCode ||
    project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const shareUrl = `https://kard.app/portal/${shareCode}`

  const handleCopyShareLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {})
    }
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 1800)
  }

  const handleCreateDeliverable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAddDeliverable(project.id, {
      title: newTitle.trim(),
      description:
        newDescription.trim() || "Entrega pronta para validação do cliente.",
      milestone: newMilestone.trim() || "Marco Atual",
      status: "pending_review",
    })
    setNewTitle("")
    setNewDescription("")
    setShowAddForm(false)
  }

  return (
    <div className="space-y-5">
      {/* Manager Control Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Portal do Cliente · Aprovação de Entregas
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Compartilhe o progresso em tempo real sem exigir login do cliente nem expor o chat interno.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={isClientPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsClientPreviewMode(!isClientPreviewMode)}
            className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Eye className="size-3.5" />
            <span>
              {isClientPreviewMode
                ? "Sair da visão do cliente"
                : "Pré-visualizar como cliente"}
            </span>
          </Button>

          {!isClientPreviewMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>Nova entrega</span>
            </Button>
          )}
        </div>
      </div>

      {/* Free Plan Advisory Banner (non-blocking for preview testing, clear on sharing) */}
      {currentTier === "free" && !isClientPreviewMode && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-xs">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                Modo Pré-visualização (Plano Kard Free)
              </p>
              <p className="text-muted-foreground">
                Você pode simular aprovações abaixo. Links externos públicos para clientes estão disponíveis no Kard Business.
              </p>
            </div>
          </div>
          {onOpenPricingModal && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenPricingModal}
              className="h-8 shrink-0 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Sparkles className="size-3.5" />
              <span>Ver planos</span>
            </Button>
          )}
        </div>
      )}

      {/* Shareable Portal URL Row */}
      {!isClientPreviewMode && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground shrink-0">
              Link do Portal:
            </span>
            <span className="truncate font-mono text-foreground">{shareUrl}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyShareLink}
            className="h-8 shrink-0 gap-1.5 rounded-xl bg-card text-xs font-semibold"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 text-success-foreground" />
                <span>Link copiado</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copiar link seguro</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Manager New Deliverable Composer */}
      {showAddForm && !isClientPreviewMode && (
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-5">
            <form onSubmit={handleCreateDeliverable} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Publicar entrega no Portal do Cliente
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nome da entrega (ex.: Protótipo Checkout v2)"
                  className="h-9 rounded-xl text-xs"
                  required
                />
                <Input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Marco / Sprint (ex.: Sprint 3 / 6)"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder="Resumo do que o cliente deve validar..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="rounded-xl text-xs font-semibold">
                  Adicionar ao Portal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Client-Facing White-Label Surface */}
      <motion.div
        layout
        transition={{ duration: 0.18 }}
        className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6"
      >
        {/* Client Branded Header */}
        <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/30">
              {project.customImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={project.customImage}
                  alt={project.name}
                  className="size-full rounded-2xl object-cover"
                />
              ) : project.logo === "google" ? (
                <GoogleLogo className="size-7" />
              ) : project.logo === "slack" ? (
                <SlackLogo className="size-7" />
              ) : project.logo === "spotify" ? (
                <SpotifyLogo className="size-7" />
              ) : project.logo === "linear" ? (
                <LinearLogo className="size-7" />
              ) : (
                <span className="text-lg font-extrabold text-primary">
                  {project.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Portal de Entregas · {project.company}
              </p>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                {project.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="block text-[11px] text-muted-foreground">
                Progresso geral
              </span>
              <span className="font-mono text-base font-extrabold tabular-nums text-foreground">
                {percent}% ({project.completedTasks}/{project.totalTasks})
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-muted-foreground">
                Prazo previsto
              </span>
              <span className="font-mono text-base font-extrabold tabular-nums text-foreground">
                {project.dueDate}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-muted-foreground">
                Entregas aprovadas
              </span>
              <span className="font-mono text-base font-extrabold tabular-nums text-success-foreground">
                {approvedCount}/{deliverables.length}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Track */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Andamento do escopo contratado</span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {project.sprintStage || "Sprint Atual"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Deliverables Approval List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Entregas para validação ({deliverables.length})
          </h4>

          {deliverables.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Nenhuma entrega publicada no Portal ainda
              </p>
              <p className="text-xs text-muted-foreground">
                Adicione entregas acima para que seu cliente acompanhe e aprove com um clique.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deliverables.map((item) => {
                const isReviewing = reviewingId === item.id
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-muted/15 p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {item.milestone}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            Atualizado {item.updatedAt}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-foreground">
                          {item.title}
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {item.status === "approved" ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Aprovada</span>
                          </Badge>
                        ) : item.status === "changes_requested" ? (
                          <Badge variant="warning" className="gap-1">
                            <MessageSquareWarning className="size-3" />
                            <span>Revisão solicitada</span>
                          </Badge>
                        ) : (
                          <Badge variant="info" className="gap-1">
                            <Clock className="size-3" />
                            <span>Aguardando aprovação</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    {item.clientFeedback && (
                      <div className="rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-xs">
                        <span className="font-semibold text-foreground">
                          Feedback do cliente:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {item.clientFeedback}
                        </span>
                      </div>
                    )}

                    {/* Approval Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={item.status === "approved" ? "secondary" : "default"}
                        onClick={() => {
                          setReviewingId(null)
                          onUpdateDeliverableStatus(
                            project.id,
                            item.id,
                            "approved",
                            item.clientFeedback || "Entrega aprovada pelo cliente no Portal."
                          )
                        }}
                        className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>
                          {item.status === "approved"
                            ? "Entrega aprovada"
                            : "Aprovar entrega"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReviewingId(isReviewing ? null : item.id)
                          setFeedbackDraft(item.clientFeedback || "")
                        }}
                        className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
                      >
                        <MessageSquareWarning className="size-3.5" />
                        <span>Solicitar revisão</span>
                      </Button>
                    </div>

                    {isReviewing && (
                      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                        <Input
                          value={feedbackDraft}
                          onChange={(e) => setFeedbackDraft(e.target.value)}
                          placeholder="Descreva os ajustes desejados nesta entrega..."
                          className="h-9 flex-1 rounded-xl bg-card text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            onUpdateDeliverableStatus(
                              project.id,
                              item.id,
                              "changes_requested",
                              feedbackDraft.trim() || "Cliente solicitou revisão de detalhes."
                            )
                            setReviewingId(null)
                            setFeedbackDraft("")
                          }}
                          className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                        >
                          <Send className="size-3.5" />
                          <span>Enviar feedback</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
