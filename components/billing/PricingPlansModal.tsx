"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Check,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Award,
  Table,
  Minus,
} from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type SubscriptionPlanTier = "free" | "pro" | "business"

interface PricingPlansModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier?: SubscriptionPlanTier
  onUpgradeSuccess?: (tier: SubscriptionPlanTier) => void
}

export function PricingPlansModal({
  open,
  onOpenChange,
  currentTier = "free",
  onUpgradeSuccess,
}: PricingPlansModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual")
  const [couponCode, setCouponCode] = useState("FIRSTKARD50")
  const [couponApplied, setCouponApplied] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanTier>("pro")
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [showComparisonTable, setShowComparisonTable] = useState(false)

  const proMonthly = couponApplied ? 19.9 : 39.9
  const proAnnualMonthly = couponApplied ? 14.9 : 29.9
  const busMonthly = couponApplied ? 49.9 : 89.9
  const busAnnualMonthly = couponApplied ? 39.9 : 69.9

  const handleConfirmSubscription = () => {
    setIsCheckingOut(true)
    setTimeout(() => {
      setIsCheckingOut(false)
      setCheckoutSuccess(true)
      onUpgradeSuccess?.(selectedPlan)
    }, 900)
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setCheckoutSuccess(false)
    onOpenChange(nextOpen)
  }

  const formattedTotal =
    selectedPlan === "pro"
      ? billingCycle === "annual"
        ? "R$ 14,90/mês"
        : "R$ 19,90/mês"
      : selectedPlan === "business"
      ? billingCycle === "annual"
        ? "R$ 39,90/mês"
        : "R$ 49,90/mês"
      : "R$ 0/mês"

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
    >
      {checkoutSuccess ? (
        <div className="py-8 text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-subtle text-success-foreground">
            <Award className="size-8" />
          </div>

          <div className="mx-auto max-w-md space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Assinatura Kard {selectedPlan.toUpperCase()} ativada
            </h2>
            <p className="text-sm text-muted-foreground">
              Seu desconto de primeira compra foi aplicado e os recursos de colaboração ilimitada, Sprint Velocity, exportação de timesheets e automações já estão disponíveis.
            </p>
          </div>

          <Card className="mx-auto max-w-sm bg-muted/40 text-left shadow-none">
            <CardContent className="p-5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plano</span>
                <span className="font-semibold text-foreground">
                  Kard {selectedPlan.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ciclo</span>
                <span className="font-semibold text-foreground">
                  {billingCycle === "annual"
                    ? "Anual (2 meses grátis)"
                    : "Mensal flexível"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pagamento</span>
                <span className="font-semibold text-foreground">
                  {paymentMethod === "pix" ? "PIX Instantâneo" : "Cartão de Crédito"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-success-foreground">
                  Ativo
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => handleClose(false)}
            className="h-11 rounded-2xl px-8 font-semibold"
          >
            Voltar ao Workspace
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Clean Header */}
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="info">Primeira compra com até 50% OFF</Badge>
              <span>Cupom ativo:</span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {couponCode}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Planos simples para acompanhar o ritmo do seu time
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Comece gratuitamente com limites justos no Kard Free ou desbloqueie projetos ilimitados, analytics de sprint e automações no Pro e Business.
            </p>

            {/* Billing Cycle Switcher (shadcn Tabs) + Comparison Toggle */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Tabs
                value={billingCycle}
                onValueChange={(v) => setBillingCycle(v as "monthly" | "annual")}
              >
                <TabsList>
                  <TabsTrigger value="monthly">Mensal</TabsTrigger>
                  <TabsTrigger value="annual" className="gap-1.5">
                    <span>Anual</span>
                    <span className="text-[11px] font-semibold text-success-foreground">
                      2 meses grátis
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowComparisonTable(!showComparisonTable)}
                className="gap-1.5 text-xs font-semibold text-primary"
              >
                <Table className="size-3.5" />
                <span>
                  {showComparisonTable
                    ? "Ocultar comparativo"
                    : "Comparar recursos"}
                </span>
              </Button>
            </div>
          </div>

          {/* 3 Plan Cards */}
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            {/* Kard Free */}
            <Card
              onClick={() => setSelectedPlan("free")}
              className={cn(
                "flex cursor-pointer flex-col justify-between p-6 transition-all",
                selectedPlan === "free"
                  ? "border-primary ring-2 ring-primary/15"
                  : "hover:border-border"
              )}
            >
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">Kard Free</h3>
                  <p className="text-xs text-muted-foreground">
                    Uso individual e squads pequenos iniciando entregas.
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tabular-nums text-foreground">
                      R$ 0
                    </span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gratuito para sempre
                  </p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Incluído
                  </p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                      <span>Até 3 projetos ativos (arquivados não contam)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                      <span>Até 5 colaboradores por projeto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                      <span>Briefing Matinal, Cartões Markdown e Modo Offline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                      <span>Quadro Kanban e lista reordenável</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                      <span>Time Tracker e Modo Foco básico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                      <span>100 MB de armazenamento</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Limites do plano
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Minus className="mt-0.5 size-3.5 shrink-0" />
                      <span>Histórico de mensagens de 30 dias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Minus className="mt-0.5 size-3.5 shrink-0" />
                      <span>Sem exportação de timesheets CSV/PDF</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Minus className="mt-0.5 size-3.5 shrink-0" />
                      <span>Sem portal externo de clientes</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-xl text-xs font-semibold"
                  disabled={currentTier === "free"}
                >
                  {currentTier === "free" ? "Plano atual" : "Selecionar Free"}
                </Button>
              </div>
            </Card>

            {/* Kard Pro */}
            <Card
              onClick={() => setSelectedPlan("pro")}
              className={cn(
                "relative flex cursor-pointer flex-col justify-between p-6 transition-all",
                selectedPlan === "pro"
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-primary/40 hover:border-primary"
              )}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">Kard Pro</h3>
                    <p className="text-xs text-muted-foreground">
                      Para devs, designers e líderes de sprint.
                    </p>
                  </div>
                  <Badge variant="default">50% OFF</Badge>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tabular-nums text-foreground">
                      R${" "}
                      {(billingCycle === "annual"
                        ? proAnnualMonthly
                        : proMonthly
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground line-through tabular-nums">
                      R$ {billingCycle === "annual" ? "29,90" : "39,90"}
                    </span>
                    <span className="font-semibold text-success-foreground">
                      Desconto de 1ª compra
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {billingCycle === "annual"
                      ? "Cobrado anualmente (R$ 178,80)"
                      : "Cobrança mensal sem fidelidade"}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Vantagens estratégicas
                  </p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-start gap-2 font-medium">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Projetos e colaboradores ilimitados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Analytics de Sprint Velocity & Burndown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Exportação de Timesheets em PDF e CSV</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Modo Foco completo com Pomodoro e áudio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>50 GB de armazenamento e histórico perpétuo</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Escopo: 1 workspace principal com controle completo de sprints e faturamento.
                </p>
              </div>

              <div className="pt-6">
                <Button
                  type="button"
                  className="h-10 w-full rounded-xl text-xs font-semibold"
                >
                  {currentTier === "pro"
                    ? "Plano atual"
                    : "Selecionar Kard Pro"}
                </Button>
              </div>
            </Card>

            {/* Kard Business */}
            <Card
              onClick={() => setSelectedPlan("business")}
              className={cn(
                "flex cursor-pointer flex-col justify-between p-6 transition-all",
                selectedPlan === "business"
                  ? "border-primary ring-2 ring-primary/15"
                  : "hover:border-border"
              )}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Kard Business
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Para agências, startups e múltiplos squads.
                    </p>
                  </div>
                  <Badge variant="outline">40% OFF</Badge>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tabular-nums text-foreground">
                      R${" "}
                      {(billingCycle === "annual"
                        ? busAnnualMonthly
                        : busMonthly
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground line-through tabular-nums">
                      R$ {billingCycle === "annual" ? "69,90" : "89,90"}
                    </span>
                    <span className="font-semibold text-success-foreground">
                      40% OFF no 1º trimestre
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {billingCycle === "annual"
                      ? "Faturamento anual corporativo"
                      : "Cobrança mensal por equipe"}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recursos corporativos
                  </p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-start gap-2 font-medium">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Tudo do plano Kard Pro incluído</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Portal do Cliente com link seguro de entregas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Automações de workflow e triggers customizados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>Multi-workspaces e armazenamento ilimitado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>SSO / SAML e canal de suporte prioritário</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Sem limites operacionais para toda a organização.
                </p>
              </div>

              <div className="pt-6">
                <Button
                  type="button"
                  variant={selectedPlan === "business" ? "default" : "outline"}
                  className="h-10 w-full rounded-xl text-xs font-semibold"
                >
                  {currentTier === "business"
                    ? "Plano atual"
                    : "Selecionar Business"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Expandable Comparison Table */}
          <AnimatePresence>
            {showComparisonTable && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.16 }}
              >
                <Card>
                  <CardContent className="p-5 overflow-x-auto space-y-3">
                    <h4 className="text-sm font-bold text-foreground">
                      Comparativo de capacidades
                    </h4>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="py-2 pr-4">Recurso</th>
                          <th className="py-2 px-3">Free</th>
                          <th className="py-2 px-3 text-primary">Pro</th>
                          <th className="py-2 px-3">Business</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Projetos ativos
                          </td>
                          <td className="py-2.5 px-3">Até 3</td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            Ilimitados
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            Ilimitados
                          </td>
                        </tr>
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Colaboradores por e-mail
                          </td>
                          <td className="py-2.5 px-3">Até 5 por projeto</td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            Ilimitados
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            Ilimitados
                          </td>
                        </tr>
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Sprint Velocity & Burndown
                          </td>
                          <td className="py-2.5 px-3">
                            <Minus className="size-4 text-muted-foreground/50" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                        </tr>
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Exportação Timesheet CSV/PDF
                          </td>
                          <td className="py-2.5 px-3">
                            <Minus className="size-4 text-muted-foreground/50" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                        </tr>
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Briefing, Markdown & Offline
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                        </tr>
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Portal do Cliente & Automações
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">Prévia</td>
                          <td className="py-2.5 px-3">
                            <Minus className="size-4 text-muted-foreground/50" />
                          </td>
                          <td className="py-2.5 px-3">
                            <Check className="size-4 text-success-foreground" />
                          </td>
                        </tr>
                        <tr className="rounded-xl odd:bg-muted/30">
                          <td className="py-2.5 pl-2 pr-4 font-medium text-foreground">
                            Armazenamento
                          </td>
                          <td className="py-2.5 px-3">100 MB</td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            50 GB
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            Ilimitado
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clean Checkout Bar */}
          <div className="rounded-2xl bg-muted/40 p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <ShieldCheck className="size-4 shrink-0 text-success-foreground" />
                <span>
                  Garantia de 14 dias sem risco · Cancele quando quiser
                </span>
              </div>

              <Tabs
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as "pix" | "card")}
              >
                <TabsList>
                  <TabsTrigger value="pix" className="gap-1.5">
                    <QrCode className="size-3.5" />
                    <span>PIX</span>
                  </TabsTrigger>
                  <TabsTrigger value="card" className="gap-1.5">
                    <CreditCard className="size-3.5" />
                    <span>Cartão</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => {
                    const next = e.target.value.toUpperCase()
                    setCouponCode(next)
                    setCouponApplied(next === "FIRSTKARD50")
                  }}
                  aria-label="Cupom de desconto"
                  className="h-9 w-40 rounded-xl bg-card font-mono text-xs font-semibold uppercase"
                />
                {couponApplied ? (
                  <Badge variant="success">Cupom -50% aplicado</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Use FIRSTKARD50
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="block text-[11px] text-muted-foreground">
                    Total estimado
                  </span>
                  <span className="text-base font-extrabold tabular-nums text-foreground">
                    {formattedTotal}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={handleConfirmSubscription}
                  disabled={isCheckingOut || selectedPlan === "free"}
                  className="h-10 gap-1.5 rounded-xl px-5 text-xs font-semibold"
                >
                  {isCheckingOut ? (
                    <span>Ativando plano...</span>
                  ) : (
                    <>
                      <span>Assinar Kard {selectedPlan.toUpperCase()}</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
