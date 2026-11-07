"use client"

import React from "react"
import { Avatar } from "@/components/ui/avatar"
import { ChatMessage } from "@/lib/data"
import { cn } from "@/lib/utils"

interface MessageWidgetProps {
  messages: ChatMessage[]
  onSelectMessage: (msg: ChatMessage) => void
}

export function MessageWidget({ messages, onSelectMessage }: MessageWidgetProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] sm:p-6">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-card-foreground tracking-tight">
            Message
          </h3>
          <span className="text-xs font-semibold text-primary hover:underline cursor-pointer">
            View all
          </span>
        </div>

        {/* Message Contact List */}
        <div className="flex flex-col gap-3.5">
          {messages.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMessage(item)}
              className="group flex min-h-11 w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-muted/70 sm:gap-3.5 sm:-mx-2 sm:w-auto"
            >
              {/* Avatar with subtle ring & online indicator */}
              <div className="relative shrink-0">
                <Avatar
                  src={item.avatar}
                  alt={item.user}
                  fallback={item.user[0]}
                  size="md"
                  className="ring-2 ring-card group-hover:scale-105 transition-transform"
                />
                {item.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-card-foreground group-hover:text-primary transition-colors truncate">
                    {item.user}
                  </h4>
                  <span className="text-xs text-muted-foreground/80 font-medium shrink-0 ml-2">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer subtle quick reply */}
      <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
        <span>4 active team threads</span>
        <span className="text-muted-foreground font-medium">Click to chat</span>
      </div>
    </div>
  )
}
