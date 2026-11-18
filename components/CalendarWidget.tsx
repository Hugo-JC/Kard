"use client"

import React, { useState } from "react"
import { CalendarPlus, ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react"
import { CalendarEvent, INITIAL_CALENDAR_EVENTS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFirebase } from "@/components/auth/FirebaseProvider"
import { CalendarEventConfirmModal } from "@/components/workspace/CalendarEventConfirmModal"
import { cn } from "@/lib/utils"

interface CalendarWidgetProps {
  events?: CalendarEvent[]
  onAddEvent?: (event: Omit<CalendarEvent, "id">) => void
  onSyncGoogleCalendar?: () => void
  isSyncingGoogleCalendar?: boolean
}

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

export function CalendarWidget({
  events: externalEvents,
  onAddEvent,
  onSyncGoogleCalendar,
  isSyncingGoogleCalendar = false,
}: CalendarWidgetProps = {}) {
  const {
    hasWorkspaceConnected,
    isConnectingWorkspace,
    workspaceAccessToken,
    connectWorkspace,
  } = useFirebase()

  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate())

  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(
    INITIAL_CALENDAR_EVENTS
  )
  const events = externalEvents ?? localEvents
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [isGoogleConfirmOpen, setIsGoogleConfirmOpen] = useState(false)

  const prevMonth = () => {
    setIsAddingEvent(false)
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    setIsAddingEvent(false)
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDay(today.getDate())
    setIsAddingEvent(false)
  }

  // Deterministic UTC calendar calculations
  const firstDayOfWeek = (new Date(
    Date.UTC(currentYear, currentMonth, 1)
  ).getUTCDay() + 6) % 7
  const daysInCurrentMonth = new Date(
    Date.UTC(currentYear, currentMonth + 1, 0)
  ).getUTCDate()
  const daysInPrevMonth = new Date(
    Date.UTC(currentYear, currentMonth, 0)
  ).getUTCDate()

  const calendarCells: { day: number; isCurrentMonth: boolean }[] = []

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    })
  }

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
    })
  }

  const targetCellCount = calendarCells.length > 35 ? 42 : 35
  const remainingCells = targetCellCount - calendarCells.length
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
    })
  }

  const selectedDayEvents = events.filter(
    (e) =>
      e.day === selectedDay &&
      e.month === currentMonth &&
      e.year === currentYear
  )

  const selectedDateIso = `${currentYear}-${String(currentMonth + 1).padStart(
    2,
    "0"
  )}-${String(selectedDay).padStart(2, "0")}`

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return
    const payload: Omit<CalendarEvent, "id"> = {
      day: selectedDay,
      month: currentMonth,
      year: currentYear,
      dots: ["#3B82F6"],
      title: newEventTitle.trim(),
      source: "local",
    }
    if (onAddEvent) {
      onAddEvent(payload)
    } else {
      setLocalEvents((prev) => [
        ...prev,
        { ...payload, id: `ev-${Date.now()}` },
      ])
    }
    setNewEventTitle("")
    setIsAddingEvent(false)
  }

  return (
    <section
      aria-label="Calendário"
      className="@container flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6"
    >
      <div>
        {/* Month & Organic Navigation Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <h3 className="text-base font-bold tracking-tight text-card-foreground sm:text-lg">
              {MONTH_NAMES[currentMonth]}{" "}
              <span className="font-mono tabular-nums">{currentYear}</span>
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-6 rounded-lg px-2 text-[11px] font-medium text-muted-foreground hover:text-primary"
            >
              Hoje
            </Button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={prevMonth}
              aria-label="Mês anterior"
              className="size-9 rounded-xl border-border/70 bg-muted/35 hover:bg-muted sm:size-8"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={nextMonth}
              aria-label="Próximo mês"
              className="size-9 rounded-xl border-border/70 bg-muted/35 hover:bg-muted sm:size-8"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Google Calendar Sync Row */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-muted/25 px-3 py-2 text-[11px]">
          {hasWorkspaceConnected ? (
            <>
              <span className="font-semibold text-success-foreground truncate">
                Conta Google ligada
              </span>
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  setCurrentMonth(today.getMonth())
                  setCurrentYear(today.getFullYear())
                  setSelectedDay(today.getDate())
                  onSyncGoogleCalendar?.()
                }}
                disabled={isSyncingGoogleCalendar}
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
              >
                <RefreshCw
                  className={cn(
                    "size-3",
                    isSyncingGoogleCalendar && "animate-spin"
                  )}
                />
                <span>Atualizar</span>
              </button>
            </>
          ) : (
            <>
              <span className="truncate text-muted-foreground">
                Agenda externa desconectada
              </span>
              <button
                type="button"
                disabled={isConnectingWorkspace}
                onClick={async () => {
                  const token = await connectWorkspace()
                  if (token) {
                    const today = new Date()
                    setCurrentMonth(today.getMonth())
                    setCurrentYear(today.getFullYear())
                    setSelectedDay(today.getDate())
                    onSyncGoogleCalendar?.()
                  }
                }}
                className="shrink-0 font-semibold text-primary hover:underline cursor-pointer"
              >
                {isConnectingWorkspace ? "Conectando..." : "Conectar Google"}
              </button>
            </>
          )}
        </div>

        {/* Days of week header */}
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground/80">
          {WEEKDAY_LABELS.map((dayName) => (
            <span key={dayName} className="py-1">
              {dayName}
            </span>
          ))}
        </div>

        {/* Responsive Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs @md:gap-1.5">
          {calendarCells.map((cell, idx) => {
            const isSelected = cell.isCurrentMonth && cell.day === selectedDay
            const dayEvents = cell.isCurrentMonth
              ? events.filter(
                  (e) =>
                    e.day === cell.day &&
                    e.month === currentMonth &&
                    e.year === currentYear
                )
              : []

            const formattedDayNumber = String(cell.day).padStart(2, "0")
            const eventDots = dayEvents.flatMap((e) => e.dots).slice(0, 3)

            return (
              <div key={idx} className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  disabled={!cell.isCurrentMonth}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      setSelectedDay(cell.day)
                      setIsAddingEvent(false)
                    }
                  }}
                  aria-label={
                    cell.isCurrentMonth
                      ? `${formattedDayNumber} de ${MONTH_NAMES[currentMonth]} de ${currentYear}`
                      : undefined
                  }
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex aspect-square w-full max-w-10 flex-col items-center justify-center rounded-xl text-[13px] transition-[background-color,color,transform,box-shadow] duration-150 @md:max-w-12",
                    isSelected
                      ? "bg-primary font-bold text-primary-foreground shadow-xs cursor-pointer"
                      : cell.isCurrentMonth
                      ? "font-medium text-card-foreground hover:bg-muted/75 cursor-pointer active:scale-95"
                      : "font-normal text-muted-foreground/35 cursor-default"
                  )}
                >
                  <span className="tabular-nums leading-none">
                    {formattedDayNumber}
                  </span>

                  {/* Subtle organic event dots inside cell bottom */}
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-1 items-center gap-0.5"
                  >
                    {eventDots.map((dotColor, dotIdx) => (
                      <span
                        key={dotIdx}
                        className="size-1 rounded-full shrink-0"
                        style={{
                          backgroundColor: isSelected
                            ? "rgba(255,255,255,0.85)"
                            : dotColor,
                        }}
                      />
                    ))}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Agenda Summary */}
      <div className="mt-4 space-y-2.5 border-t border-border/70 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
            Dia {String(selectedDay).padStart(2, "0")} {MONTH_NAMES[currentMonth]}
          </span>

          {!isAddingEvent && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingEvent(true)}
              className="h-7 gap-1 rounded-lg px-2 text-[11px] font-semibold text-primary hover:text-primary"
            >
              <Plus className="size-3" />
              <span>Novo evento</span>
            </Button>
          )}
        </div>

        {selectedDayEvents.length > 0 ? (
          <div className="space-y-1.5">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: ev.dots[0] || "#3B82F6" }}
                  />
                  <span className="truncate font-medium text-card-foreground">
                    {ev.title}
                  </span>
                </div>
                {ev.source === "google_calendar" && (
                  <span className="shrink-0 font-mono text-[10px] font-semibold text-success-foreground">
                    Google
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : !isAddingEvent ? (
          <p className="text-xs text-muted-foreground">
            Sem compromissos neste dia.
          </p>
        ) : null}

        {isAddingEvent && (
          <form onSubmit={handleSubmitEvent} className="space-y-2 pt-0.5">
            <Input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder={`Evento em ${String(selectedDay).padStart(2, "0")} ${MONTH_NAMES[currentMonth]}...`}
              autoFocus
              className="h-9 rounded-xl bg-muted/35 text-xs"
            />
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGoogleConfirmOpen(true)}
                className="h-8 gap-1 rounded-lg px-2.5 text-[11px] font-semibold"
              >
                <CalendarPlus className="size-3 text-primary" />
                <span>Google Calendar</span>
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingEvent(false)
                    setNewEventTitle("")
                  }}
                  className="h-8 rounded-lg px-2.5 text-xs text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 rounded-lg px-3 text-xs font-semibold"
                >
                  Salvar local
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      <CalendarEventConfirmModal
        open={isGoogleConfirmOpen}
        onOpenChange={setIsGoogleConfirmOpen}
        initialSummary={newEventTitle.trim() || `Reunião Kard (${String(selectedDay).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")})`}
        initialDate={selectedDateIso}
        hasWorkspaceConnected={hasWorkspaceConnected}
        onConnectWorkspace={connectWorkspace}
        workspaceAccessToken={workspaceAccessToken}
        onEventCreated={(created) => {
          const parsedDate = new Date(`${created.date}T12:00:00`)
          const payload: Omit<CalendarEvent, "id"> = {
            day: parsedDate.getDate(),
            month: parsedDate.getMonth(),
            year: parsedDate.getFullYear(),
            dots: ["#10B981"],
            title: created.summary,
            source: "google_calendar",
            googleEventId: created.id,
          }
          if (onAddEvent) {
            onAddEvent(payload)
          } else {
            setLocalEvents((prev) => [
              ...prev,
              { ...payload, id: `gcal-${created.id}` },
            ])
          }
          setNewEventTitle("")
          setIsAddingEvent(false)
          onSyncGoogleCalendar?.()
        }}
      />
    </section>
  )
}
