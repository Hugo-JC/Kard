"use client"

import React, { useMemo, useState } from "react"
import { motion } from "motion/react"
import {
  Zap,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"
import { AutomationLog, AutomationRule } from "@/lib/data"
import {
  AUTOMATION_TEMPLATES,
  parseNaturalAutomationRule,
} from "@/lib/automations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AutomationsPanelProps {
  rules: AutomationRule[]
  logs: AutomationLog[]
  onAddRule: (rule: Omit<AutomationRule, "id" | "runsCount" | "createdAt">) => void
  onToggleRule: (ruleId: string) => void
  onDeleteRule: (ruleId: string) => void
}

export function AutomationsPanel({
  rules,
  logs,
  onAddRule,
  onToggleRule,
  onDeleteRule,
}: AutomationsPanelProps) {
  const [ruleText, setRuleText] = useState("")

  const preview = useMemo(() => parseNaturalAutomationRule(ruleText), [ruleText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleText.trim() || !preview.matched) return

    onAddRule({
      naturalText: ruleText.trim(),
      triggerType: preview.triggerType,
      triggerValue: preview.triggerValue,
      triggerLabel: preview.triggerLabel,
      actionType: preview.actionType,
      actionValue: preview.actionValue,
      actionLabel: preview.actionLabel,
      enabled: true,
    })
    setRuleText("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Automações em Texto Natural
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escreva regras simples em português para automatizar estágios, prioridades e notificações localmente — funciona até offline.
          </p>
        </div>

        <div className="text-xs font-mono font-semibold tabular-nums text-muted-foreground">
          {rules.filter((r) => r.enabled).length} ativas · {rules.length} total
        </div>
      </div>

      {/* Natural Language Rule Composer */}
      <Card className="rounded-3xl">
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label
              htmlFor="natural-rule-input"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Zap className="size-4 text-primary" />
              <span>Nova regra automática</span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="natural-rule-input"
                value={ruleText}
                onChange={(e) => setRuleText(e.target.value)}
                placeholder='Ex.: "Quando tarefa for para Done, marcar como concluída e notificar equipe"'
                className="h-11 flex-1 rounded-xl text-sm"
              />
              <Button
                type="submit"
                disabled={!preview.matched}
                className="h-11 gap-1.5 rounded-xl px-5 text-xs font-semibold"
              >
                <Plus className="size-4" />
                <span>Criar regra</span>
              </Button>
            </div>
          </form>

          {/* Live Deterministic Parse Preview */}
          {ruleText.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">Gatilho:</span>
                <span className="font-bold text-foreground">
                  {preview.triggerLabel}
                </span>
                <ArrowRight className="size-3.5 text-primary" />
                <span className="font-semibold text-muted-foreground">Ação:</span>
                <span className="font-bold text-foreground">
                  {preview.actionLabel}
                </span>
              </div>
              <p
                className={cn(
                  "text-xs",
                  preview.matched
                    ? "text-success-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {preview.hint}
              </p>
            </motion.div>
          )}

          {/* Quick Templates */}
          <div className="space-y-2 pt-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Modelos prontos (1 clique)
            </span>
            <div className="flex flex-wrap gap-2">
              {AUTOMATION_TEMPLATES.map((tpl) => (
                <Button
                  key={tpl.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRuleText(tpl.naturalText)}
                  className="h-8 rounded-xl text-xs font-medium"
                >
                  {tpl.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Rules & Execution Log Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Left: Configured Rules */}
        <div className="space-y-3 lg:col-span-7">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Regras configuradas ({rules.length})
          </h2>

          {rules.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-8 text-center text-xs text-muted-foreground">
                Nenhuma automação configurada. Escolha um modelo acima para começar.
              </CardContent>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id} className="rounded-2xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {rule.naturalText}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{rule.triggerLabel}</span>
                        <span>·</span>
                        <span className="font-medium text-foreground">
                          {rule.actionLabel}
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          {rule.runsCount} execuções
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant={rule.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => onToggleRule(rule.id)}
                        className="h-8 rounded-xl px-3 text-xs font-semibold"
                      >
                        {rule.enabled ? "Ativa" : "Pausada"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteRule(rule.id)}
                        aria-label="Remover regra"
                        className="size-8 text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: Execution History */}
        <div className="space-y-3 lg:col-span-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Histórico de execuções recentes
          </h2>

          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border/70 p-4">
              {logs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Nenhuma regra foi disparada ainda nesta sessão.
                </p>
              ) : (
                logs.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground truncate">
                        <CheckCircle2 className="size-3.5 shrink-0 text-success-foreground" />
                        <span className="truncate">{entry.targetLabel}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                        <Clock className="size-3" />
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.outcome}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
