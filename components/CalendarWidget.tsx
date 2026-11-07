"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  day: number
  month: number // 0-indexed
  year: number
  dots: string[] // colors e.g. ['#F59E0B']
  title: string
}

export function CalendarWidget() {
  // Initial date matching the screenshot Jan 2021, but fully navigable!
  const [currentMonth, setCurrentMonth] = useState(0) // Jan (0-indexed)
  const [currentYear, setCurrentYear] = useState(2021)
  const [selectedDay, setSelectedDay] = useState<number>(5)

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  // Sample events with indicator dots matching the screenshot
  const events: CalendarEvent[] = [
    { day: 3, month: 0, year: 2021, dots: ["#F97316"], title: "Sprint Planning with Google team" },
    { day: 5, month: 0, year: 2021, dots: ["#3B82F6"], title: "Design Review & Wireframe kickoff" },
    { day: 19, month: 0, year: 2021, dots: ["#F59E0B", "#3B82F6"], title: "Slack Beta Release & Assets check" },
    { day: 20, month: 0, year: 2021, dots: ["#EF4444"], title: "Google iOS Due Date" },
    { day: 15, month: 6, year: 2021, dots: ["#EF4444"], title: "Slack Milestone Due Date" },
  ]

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Pure deterministic calendar calculations (UTC based, timezone-safe)
  const firstDayOfWeek = new Date(Date.UTC(currentYear, currentMonth, 1)).getUTCDay()
  const daysInCurrentMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate()
  const daysInPrevMonth = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate()

  // Generate calendar days
  const calendarCells = []

  // Overflow days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    })
  }

  // Days of current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
    })
  }

  // Fill up to 35 or 42 cells with next month days
  const remainingCells = 35 - calendarCells.length
  if (remainingCells > 0) {
    for (let d = 1; d <= remainingCells; d++) {
      calendarCells.push({
        day: d,
        isCurrentMonth: false,
      })
    }
  }

  const activeEvent = events.find(
    (e) => e.day === selectedDay && e.month === currentMonth && e.year === currentYear
  )

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6">
      <div>
        {/* Month & Navigation Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-blue-700 sm:size-8"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={nextMonth}
              className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-blue-700 sm:size-8"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center mb-3 text-[11px] font-bold text-muted-foreground/80 tracking-wider">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
          {calendarCells.map((cell, idx) => {
            const isSelected = cell.isCurrentMonth && cell.day === selectedDay
            const matchedEvent = cell.isCurrentMonth
              ? events.find(
                  (e) =>
                    e.day === cell.day &&
                    e.month === currentMonth &&
                    e.year === currentYear
                )
              : null

            const formattedDayNumber = String(cell.day).padStart(2, "0")

            return (
              <div key={idx} className="flex flex-col items-center justify-center py-1">
                <button
                  onClick={() => {
                    if (cell.isCurrentMonth) setSelectedDay(cell.day)
                  }}
                  className={cn(
                    "relative flex h-10 w-full max-w-10 items-center justify-center rounded-xl text-[13px] font-semibold transition-all cursor-pointer", 
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-bold scale-105"
                      : cell.isCurrentMonth
                      ? "text-card-foreground hover:bg-muted"
                      : "text-muted-foreground/40 font-normal hover:text-muted-foreground"
                  )}
                >
                  <span className="tabular-nums">{formattedDayNumber}</span>
                </button>

                {/* Event indicator dots */}
                <div className="flex items-center gap-1 mt-0.5 h-1.5">
                  {matchedEvent?.dots.map((dotColor, dotIdx) => (
                    <span
                      key={dotIdx}
                      className="h-1 w-1 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Event Summary */}
      <div className="mt-4 pt-3 border-t border-border/80">
        {activeEvent ? (
          <div className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: activeEvent.dots[0] }}
            />
            <span className="font-semibold text-card-foreground truncate">
              {activeEvent.title}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Selected: {selectedDay} {monthNames[currentMonth]}</span>
            <span className="font-medium text-primary hover:underline cursor-pointer">
              + Add Event
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
