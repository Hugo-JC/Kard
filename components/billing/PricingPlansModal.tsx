"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Star,
  Users,
  FolderKanban,
  Clock,
  Flame,
  Award,
  ChevronRight,
  Table,
  CheckCircle2,
  Minus,
  Lock,
  Globe,
  Bot,
  Sliders,
  FileSpreadsheet,
  Layers,
  HeartHandshake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

  if (!open) return null

  // Pricing calculation
  // Pro: R$ 39,90/mês. 1ª compra 50% OFF = R$ 19,90.
  // Pro Anual: R$ 29,90/mês. 1ª compra 50% OFF = R$ 14,90/mês.
  const proMonthly = couponApplied ? 19.90 : 39.90
  const proAnnualMonthly = couponApplied ? 14.90 : 29.90

  // Business: R$ 89,90/mês. 1ª compra 40% OFF = R$ 49,90.
  // Business Anual: R$ 69,90/mês. 1ª compra 40% OFF = R$ 39,90/mês.
  const busMonthly = couponApplied ? 49.90 : 89.90
  const busAnnualMonthly = couponApplied ? 39.90 : 69.90

  const handleConfirmSubscription = () => {
    setIsCheckingOut(true)
    setTimeout(() => {
      setIsCheckingOut(false)
      setCheckoutSuccess(true)
      onUpgradeSuccess?.(selectedPlan)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl my-auto rounded-[32px] bg-card border border-border shadow-2xl text-card-foreground overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Announcement Bar - Clean Linear aesthetic */}
        <div className="bg-muted/80 border-b border-border/70 text-card-foreground px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OFERTA DE BOAS-VINDAS: 50% DE DESCONTO NA 1ª COMPRA NO KARD PRO</span>
          <span className="bg-background px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border border-border text-primary">
            {couponCode}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setCheckoutSuccess(false)
            onOpenChange(false)
          }}
          className="absolute top-3.5 right-3.5 z-20 flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Fechar modal de planos"
        >
          <X className="w-4 h-4" />
        </button>

        {checkoutSuccess ? (
          /* Success Screen */
          <div className="p-8 sm:p-14 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/10">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">
                Parabéns! Você agora é Kard {selectedPlan.toUpperCase()}! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Seu desconto especial foi aplicado e todos os recursos de alta performance (Analytics de Sprint, Exportação de Timesheets, Colaboradores Ilimitados e Portais) estão liberados.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 max-w-sm mx-auto border border-border text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plano ativado:</span>
                <span className="font-bold text-foreground">Kard {selectedPlan.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ciclo:</span>
                <span className="font-semibold text-foreground">
                  {billingCycle === "annual" ? "Anual (2 meses grátis inclusos)" : "Mensal"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status da assinatura:</span>
                <span className="font-bold text-emerald-500">Ativa • Renovação automática</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setCheckoutSuccess(false)
                onOpenChange(false)
              }}
              className="bg-primary text-primary-foreground font-bold px-8 h-11 rounded-2xl shadow-md cursor-pointer hover:bg-blue-700"
            >
              Aproveitar Meu Kard {selectedPlan.toUpperCase()}
            </Button>
          </div>
        ) : (
          <div className="p-4 sm:p-7 space-y-6 max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Planos Transparentes com Vantagens & Limitações Justas</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
                Escolha o plano certo para o ritmo da sua equipe
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                O <strong>Kard Free</strong> é perfeito para começar sem pegadinhas. Faça upgrade para o <strong>Pro</strong> ou <strong>Business</strong> para desbloquear recursos estratégicos de colaboração e aceleração de sprints.
              </p>

              {/* Billing Cycle Switcher & Table Toggle */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center rounded-2xl bg-muted p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      billingCycle === "monthly"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      billingCycle === "annual"
                        ? "bg-card text-foreground shadow-xs font-extrabold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>Anual</span>
                    <span className="rounded-md bg-emerald-500 text-white px-1.5 py-0.2 text-[10px] font-extrabold uppercase">
                      2 Meses Grátis
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowComparisonTable(!showComparisonTable)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer px-2 py-1"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>{showComparisonTable ? "Ocultar tabela comparativa" : "Ver tabela comparativa completa"}</span>
                </button>
              </div>
            </div>

            {/* 3 Main Plan Cards with Vantagens and Limitações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {/* PLAN 1: Kard Free */}
              <div
                onClick={() => setSelectedPlan("free")}
                className={cn(
                  "relative flex flex-col justify-between p-5 rounded-3xl border transition-all cursor-pointer",
                  selectedPlan === "free"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                    : "border-border/80 bg-card hover:border-border"
                )}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-card-foreground">Kard Free</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Uso individual e squads pequenos iniciando projetos.
                    </p>
                  </div>

                  <div>
                    <span className="text-3xl font-extrabold text-card-foreground">R$ 0</span>
                    <span className="text-xs text-muted-foreground"> /mês</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Sem prazo de validade</p>
                  </div>

                  {/* Vantagens Free */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      ✓ Vantagens Inclusas:
                    </span>
                    <ul className="space-y-1.5 text-xs text-card-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Até 3 projetos ativos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Até 5 colaboradores por projeto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Quadro Kanban e lista reordenável</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Cronômetro Time Tracker básico</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Chat do projeto com status</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>100 MB de armazenamento</span>
                      </li>
                    </ul>
                  </div>

                  {/* Limitações Free (Justas e Transparentes) */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      ⚠ Limitações do Plano Free:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Minus className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span>Máximo de 3 projetos ativos (arquivados não contam)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Minus className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span>Histórico de mensagens e tarefas retido por 30 dias</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Minus className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span>Sem exportação de timesheets em CSV/PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Minus className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span>Sem portal para clientes ou automações</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-5">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold rounded-xl h-10"
                    disabled={currentTier === "free"}
                  >
                    {currentTier === "free" ? "Seu Plano Atual" : "Usar Free"}
                  </Button>
                </div>
              </div>

              {/* PLAN 2: Kard Pro (Flagship / 50% OFF) */}
              <div
                onClick={() => setSelectedPlan("pro")}
                className={cn(
                  "relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer shadow-lg",
                  selectedPlan === "pro"
                    ? "border-primary bg-card ring-4 ring-primary/20 shadow-primary/10"
                    : "border-primary/50 bg-card hover:border-primary"
                )}
              >
                {/* Popular Callout Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground px-3.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mais Popular • 50% OFF 1ª Compra</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-card-foreground">Kard Pro</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Para devs, designers e líderes de sprint.
                      </p>
                    </div>
                    <Badge variant="default" className="text-[10px] bg-emerald-500 hover:bg-emerald-600 font-bold">
                      Cupom Ativo
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-card-foreground">
                        R$ {billingCycle === "annual" ? proAnnualMonthly.toFixed(2).replace(".", ",") : proMonthly.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-muted-foreground">/mês</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {billingCycle === "annual" ? "29,90" : "39,90"}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Economize 50% no 1º mês
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {billingCycle === "annual" ? "Cobrado anualmente (R$ 178,80)" : "Cobrança mensal flexível"}
                    </p>
                  </div>

                  {/* Vantagens Pro */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      ⭐ Vantagens Estratégicas Pro:
                    </span>
                    <ul className="space-y-2 text-xs text-card-foreground">
                      <li className="flex items-start gap-2 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                        <span><strong>Projetos Ilimitados</strong> (sem limite de 3)</span>
                      </li>
                      <li className="flex items-start gap-2 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                        <span><strong>Colaboradores Ilimitados</strong> via e-mail</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>NOVO:</strong> Sprint Velocity & Gráfico Burndown</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>NOVO:</strong> Exportação de Timesheets em PDF & CSV</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>NOVO:</strong> Modo Foco com Pomodoro Integrado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>50 GB de armazenamento de arquivos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Histórico perpétuo de sprints e chat</span>
                      </li>
                    </ul>
                  </div>

                  {/* Limitações Pro */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      ℹ Escopo do Plano:
                    </span>
                    <p>
                      Indicado para 1 workspace principal. Para gerenciar múltiplos portais de clientes com domínios próprios, veja o Business.
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <Button
                    className="w-full text-xs font-bold rounded-xl h-11 bg-primary text-primary-foreground hover:bg-blue-700 shadow-md cursor-pointer"
                  >
                    Assinar Kard Pro com 50% OFF
                  </Button>
                </div>
              </div>

              {/* PLAN 3: Kard Business */}
              <div
                onClick={() => setSelectedPlan("business")}
                className={cn(
                  "relative flex flex-col justify-between p-5 rounded-3xl border transition-all cursor-pointer",
                  selectedPlan === "business"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                    : "border-border/80 bg-card hover:border-border"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-card-foreground">Kard Business</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Para agências, startups e múltiplos squads.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary">
                      Times & Agências
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-card-foreground">
                        R$ {billingCycle === "annual" ? busAnnualMonthly.toFixed(2).replace(".", ",") : busMonthly.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-muted-foreground">/mês</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {billingCycle === "annual" ? "69,90" : "89,90"}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        40% OFF 1º trimestre
                      </span>
                    </div>
                  </div>

                  {/* Vantagens Business */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      🚀 Vantagens Nível Empresa:
                    </span>
                    <ul className="space-y-2 text-xs text-card-foreground">
                      <li className="flex items-start gap-2 font-medium">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>Tudo do plano Pro</strong> incluído</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>NOVO: Portal do Cliente com Link Seguro</strong> (clientes veem entregas sem acessar conversas internas)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>NOVO: Automações de Workflow</strong> (triggers estilo Zapier/Linear)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Multi-workspaces centralizados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Armazenamento em nuvem Ilimitado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Single Sign-On (SSO / SAML / Google)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Canal VIP 24/7 no Slack/Discord</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Sem Limitações:
                    </span>
                    <p>Projetos, arquivos e membros 100% ilimitados para toda a organização.</p>
                  </div>
                </div>

                <div className="pt-5">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold rounded-xl h-10 cursor-pointer hover:bg-muted"
                  >
                    Escolher Business
                  </Button>
                </div>
              </div>
            </div>

            {/* Comparison Table (Conditionally Expanded) */}
            <AnimatePresence>
              {showComparisonTable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-border bg-card p-4 overflow-x-auto space-y-3"
                >
                  <h4 className="text-sm font-bold text-card-foreground">
                    Comparativo Detalhado de Funcionalidades
                  </h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase">
                        <th className="py-2.5 pr-4">Recurso / Capacidade</th>
                        <th className="py-2.5 px-3">Kard Free</th>
                        <th className="py-2.5 px-3 bg-primary/5 rounded-t-lg text-primary">Kard Pro</th>
                        <th className="py-2.5 px-3">Kard Business</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-muted-foreground">
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Projetos Ativos Simultâneos</td>
                        <td className="py-2.5 px-3">Até 3</td>
                        <td className="py-2.5 px-3 bg-primary/5 font-bold text-foreground">Ilimitados</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">Ilimitados</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Colaboradores por E-mail</td>
                        <td className="py-2.5 px-3">Até 5 por projeto</td>
                        <td className="py-2.5 px-3 bg-primary/5 font-bold text-emerald-600 dark:text-emerald-400">Ilimitados</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">Ilimitados</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Quadro Kanban & Drag-and-Drop</td>
                        <td className="py-2.5 px-3"><Check className="w-4 h-4 text-emerald-500" /></td>
                        <td className="py-2.5 px-3 bg-primary/5"><Check className="w-4 h-4 text-emerald-500" /></td>
                        <td className="py-2.5 px-3"><Check className="w-4 h-4 text-emerald-500" /></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Sprint Velocity & Burndown Chart</td>
                        <td className="py-2.5 px-3"><Minus className="w-4 h-4 text-muted-foreground/50" /></td>
                        <td className="py-2.5 px-3 bg-primary/5 font-bold text-foreground"><Check className="w-4 h-4 text-emerald-500" /></td>
                        <td className="py-2.5 px-3 font-bold text-foreground"><Check className="w-4 h-4 text-emerald-500" /></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Exportação Timesheet (CSV/PDF)</td>
                        <td className="py-2.5 px-3"><Minus className="w-4 h-4 text-muted-foreground/50" /></td>
                        <td className="py-2.5 px-3 bg-primary/5 font-bold text-foreground"><Check className="w-4 h-4 text-emerald-500" /></td>
                        <td className="py-2.5 px-3 font-bold text-foreground"><Check className="w-4 h-4 text-emerald-500" /></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Portal do Cliente com Link Seguro</td>
                        <td className="py-2.5 px-3"><Minus className="w-4 h-4 text-muted-foreground/50" /></td>
                        <td className="py-2.5 px-3 bg-primary/5"><Minus className="w-4 h-4 text-muted-foreground/50" /></td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400"><Check className="w-4 h-4 text-emerald-500" /></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Automações de Workflow (Triggers)</td>
                        <td className="py-2.5 px-3"><Minus className="w-4 h-4 text-muted-foreground/50" /></td>
                        <td className="py-2.5 px-3 bg-primary/5"><Minus className="w-4 h-4 text-muted-foreground/50" /></td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400"><Check className="w-4 h-4 text-emerald-500" /></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Espaço de Armazenamento</td>
                        <td className="py-2.5 px-3">100 MB</td>
                        <td className="py-2.5 px-3 bg-primary/5 font-bold text-foreground">50 GB</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">Ilimitado</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium text-foreground">Suporte Dedicado</td>
                        <td className="py-2.5 px-3">Comunidade</td>
                        <td className="py-2.5 px-3 bg-primary/5 font-bold text-foreground">Chat Prioritário</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">Canal VIP 24/7 Slack/Discord</td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Checkout Box with Instant Discount & Payment Options */}
            <div className="rounded-2xl bg-muted/30 p-4 sm:p-5 border border-border space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-foreground">
                    Garantia Incondicional de 14 Dias • Cancele a Qualquer Momento
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer",
                      paymentMethod === "pix"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                        : "bg-card border-border text-muted-foreground"
                    )}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer",
                      paymentMethod === "card"
                        ? "bg-primary/10 border-primary/40 text-primary shadow-2xs"
                        : "bg-card border-border text-muted-foreground"
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>
              </div>

              {/* Coupon and Summary Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Cupom 1ª Compra:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {couponCode} (Ativo -50%)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">Total com desconto:</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {selectedPlan === "pro"
                        ? billingCycle === "annual"
                          ? "R$ 14,90/mês"
                          : "R$ 19,90/mês"
                        : selectedPlan === "business"
                        ? billingCycle === "annual"
                          ? "R$ 39,90/mês"
                          : "R$ 49,90/mês"
                        : "Grátis"}
                    </span>
                  </div>

                  <Button
                    onClick={handleConfirmSubscription}
                    disabled={isCheckingOut || selectedPlan === "free"}
                    className="bg-primary hover:bg-blue-700 text-primary-foreground font-extrabold px-6 rounded-xl h-11 shadow-sm cursor-pointer"
                  >
                    {isCheckingOut ? (
                      <span>Ativando plano...</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Assinar Kard {selectedPlan.toUpperCase()}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Psychological Reassurance Footers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground text-center">
              <div className="p-2.5 rounded-xl bg-card border border-border/60">
                🔒 <strong>Pagamento Seguro</strong> via SSL
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/60">
                ⚡ <strong>Ativação Imediata</strong> do Workspace
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/60">
                🛡️ <strong>14 Dias de Teste</strong> sem risco
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/60">
                ❌ <strong>Cancele a qualquer hora</strong> sem multas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
