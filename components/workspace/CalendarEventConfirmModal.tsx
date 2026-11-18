"use client"

import React, { useState } from "react"
import { CalendarPlus, Check, Clock, AlertCircle } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"

interface CalendarEventConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSummary: string
  initialDescription?: string
  initialDate?: string // YYYY-MM-DD
  initialTime?: string // HH:MM
  hasWorkspaceConnected: boolean
  onConnectWorkspace: () => Promise<string | null>
  workspaceAccessToken: string | null
  onEventCreated?: (created: {
    id: string
    summary: string
    date: string
    htmlLink?: string
  }) => void
}

function getDefaultTodayIso(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function CalendarEventConfirmModal({
  open,
  onOpenChange,
  initialSummary,
  initialDescription = "",
  initialDate,
  initialTime = "10:00",
  hasWorkspaceConnected,
  onConnectWorkspace,
  workspaceAccessToken,
  onEventCreated,
}: CalendarEventConfirmModalProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [description, setDescription] = useState(initialDescription)
  const [date, setDate] = useState(initialDate || getDefaultTodayIso())
  const [startTime, setStartTime] = useState(initialTime)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summary.trim()) return

    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      let token = workspaceAccessToken
      if (!token) {
        token = await onConnectWorkspace()
      }
      if (!token) {
        setIsSubmitting(false)
        return
      }

      const [hh, mm] = startTime.split(":").map((n) => parseInt(n, 10) || 0)
      const startObj = new Date(`${date}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`)
      const endObj = new Date(startObj.getTime() + durationMinutes * 60 * 1000)

      const res = await fetch("/api/workspace/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          summary: summary.trim(),
          description: description.trim() || "Evento agendado via Kard",
          startDateTime: startObj.toISOString(),
          endDateTime: endObj.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
        }),
      })

      const data = (await res.json()) as {
        id?: string
        summary?: string
        htmlLink?: string
        error?: { message?: string } | string
      }

      if (!res.ok) {
        const msg =
          typeof data.error === "object"
            ? data.error?.message
            : typeof data.error === "string"
            ? data.error
            : "Erro ao criar evento no Google Calendar."
        throw new Error(msg || "Erro ao criar evento no Google Calendar.")
      }

      setCreatedLink(data.htmlLink || null)
      onEventCreated?.({
        id: data.id || `gcal-${Date.now()}`,
        summary: data.summary || summary.trim(),
        date,
        htmlLink: data.htmlLink,
      })

      setTimeout(() => {
        setCreatedLink(null)
        onOpenChange(false)
      }, 900)
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Falha de comunicação com a API do Google Calendar."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg p-6 sm:p-7">
      {createdLink !== null ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-subtle text-success-foreground">
            <Check className="size-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Evento criado no Google Calendar
          </h3>
          <p className="text-xs text-muted-foreground">
            Sincronizado com o seu calendário principal do Google Workspace.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Confirmar criação no Google Calendar
              </h3>
              <p className="text-xs text-muted-foreground">
                Destino: <strong className="text-foreground">Calendário principal Google</strong> · Revisão explícita antes de gravar.
              </p>
            </div>
          </div>

          {!hasWorkspaceConnected && (
            <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
              Ao confirmar, será solicitada autorização única do Google Workspace para criar o evento no seu calendário.
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger-subtle p-3 text-xs text-danger-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleConfirm} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="gcal-summary">Título do evento</FieldLabel>
              <Input
                id="gcal-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                className="h-10 rounded-xl text-sm"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="gcal-date">Data</FieldLabel>
                <Input
                  id="gcal-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="gcal-time">Início</FieldLabel>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="gcal-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="h-10 rounded-xl pl-8 font-mono text-xs"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="gcal-duration">Duração (min)</FieldLabel>
                <Input
                  id="gcal-duration"
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
                  className="h-10 rounded-xl font-mono text-xs tabular-nums"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="gcal-desc">Descrição (opcional)</FieldLabel>
              <textarea
                id="gcal-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas da reunião, pauta ou link do projeto..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !summary.trim()}
                className="h-10 gap-1.5 rounded-xl px-5 text-xs font-semibold"
              >
                <CalendarPlus className="size-4" />
                <span>
                  {isSubmitting ? "Criando evento..." : "Confirmar e criar evento"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </Dialog>
  )
}
