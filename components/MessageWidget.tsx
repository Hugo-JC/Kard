"use client"

import React from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/lib/data"

interface MessageWidgetProps {
  messages: ChatMessage[]
  onSelectMessage: (msg: ChatMessage) => void
}

export function MessageWidget({ messages, onSelectMessage }: MessageWidgetProps) {
  const priorityThread = messages.find((m) => m.unread) || messages[0]

  return (
    <section
      aria-label="Mensagens da equipe"
      className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6"
    >
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-bold tracking-tight text-card-foreground">
            Mensagens
          </h3>
          {priorityThread && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectMessage(priorityThread)}
              className="h-7 rounded-lg px-2 text-xs font-semibold text-primary hover:text-primary"
            >
              Abrir chat
            </Button>
          )}
        </div>

        {/* Message Contact List */}
        <div className="flex flex-col gap-2">
          {messages.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMessage(item)}
              className="group flex min-h-11 w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-muted/60 cursor-pointer sm:-mx-2 sm:w-[calc(100%+1rem)] sm:gap-3.5"
            >
              {/* Avatar with subtle ring & online indicator */}
              <div className="relative shrink-0">
                <Avatar
                  src={item.avatar}
                  alt={item.user}
                  fallback={item.user[0]}
                  size="md"
                  className="ring-2 ring-card transition-transform group-hover:scale-105"
                />
                {item.online && (
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-card" />
                )}
              </div>

              {/* Message Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="truncate text-xs font-bold text-card-foreground transition-colors group-hover:text-primary sm:text-sm">
                    {item.user}
                  </h4>
                  <span className="shrink-0 font-mono text-[11px] font-medium tabular-nums text-muted-foreground/80">
                    {item.time}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer subtle quick reply */}
      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3.5 text-xs text-muted-foreground">
        <span className="tabular-nums">{messages.length} conversas ativas</span>
        <span className="font-medium">Clique para responder</span>
      </div>
    </section>
  )
}
