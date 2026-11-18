"use client"

import React from "react"
import { Check, Clock3, Layers3, Sparkles, Users } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type SubscriptionPlanTier = "free" | "pro" | "business"

interface PricingPlansModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier?: SubscriptionPlanTier
  /**
   * Kept for compatibility with existing callers. Plan activation is deliberately
   * unavailable until prices, entitlements and payment providers are approved
   * and connected to a real server-side checkout.
   */
  onUpgradeSuccess?: (tier: SubscriptionPlanTier) => void
}

const plans = [
  {
    id: "free" as const,
    name: "Kard Free",
    eyebrow: "Começar",
    description: "O essencial para organizar trabalho e projetos.",
    icon: Layers3,
    features: [
      "Organização de projetos e tarefas",
      "Vistas de trabalho disponíveis no produto",
      "Calendário e controlo de tempo",
      "Briefing matinal e Modo Foco",
    ],
  },
  {
    id: "pro" as const,
    name: "Kard Pro",
    eyebrow: "Individual e profissional",
    description: "Mais capacidade e ferramentas avançadas para crescer.",
    icon: Sparkles,
    features: [
      "Capacidades avançadas em preparação",
      "Mais opções de análise e produtividade",
      "Fluxos de trabalho personalizáveis",
    ],
  },
  {
    id: "business" as const,
    name: "Kard Business",
    eyebrow: "Equipas e organizações",
    description: "Administração e colaboração para equipas em escala.",
    icon: Users,
    features: [
      "Gestão avançada de equipas",
      "Permissões e administração alargadas",
      "Integrações e controlos organizacionais",
    ],
  },
]

export function PricingPlansModal({
  open,
  onOpenChange,
  currentTier = "free",
}: PricingPlansModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Planos Kard"
      description="Um plano adequado à forma como trabalhas, sem surpresas."
      className="max-w-5xl p-4 sm:p-7"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Os planos pagos estão em preparação</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              O modelo Freemium está definido. Os preços, limites finais, condições comerciais e pagamentos ainda estão a ser validados. Não será cobrado qualquer valor nesta fase.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrent = currentTier === plan.id
            const isAvailable = plan.id === "free"
            return (
              <Card
                key={plan.id}
                className={cn(
                  "flex h-full flex-col rounded-2xl p-4 sm:p-5",
                  isCurrent && "border-primary/50 bg-primary/[0.035] ring-1 ring-primary/15"
                )}
              >
                <CardContent className="flex h-full flex-1 flex-col p-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("flex size-9 items-center justify-center rounded-xl", isCurrent ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-4" />
                    </span>
                    {isCurrent ? (
                      <Badge variant="success">Plano atual</Badge>
                    ) : isAvailable ? (
                      <Badge variant="outline">Disponível</Badge>
                    ) : (
                      <Badge variant="secondary">Em preparação</Badge>
                    )}
                  </div>

                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{plan.eyebrow}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">{plan.description}</p>

                  <div className="mt-4 border-y border-border/70 py-3">
                    <p className="text-xl font-semibold tracking-tight text-foreground">
                      {isAvailable ? "Gratuito" : "Preço a definir"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {isAvailable ? "Sem pagamento nesta fase" : "Condições comerciais em validação"}
                    </p>
                  </div>

                  <ul className="mt-4 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 rounded-xl bg-muted/45 px-3 py-2.5 text-[11px] text-muted-foreground">
                    {isCurrent
                      ? "Este é o plano associado à tua sessão atual."
                      : isAvailable
                      ? "Podes continuar a utilizar as funcionalidades gratuitas disponíveis."
                      : "A ativação ficará disponível quando os detalhes e o checkout real estiverem prontos."}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Os cartões acima apresentam a direção dos planos, não constituem uma oferta comercial nem uma promessa de funcionalidades ou limites ainda não aprovados.
        </p>
      </div>
    </Dialog>
  )
}
