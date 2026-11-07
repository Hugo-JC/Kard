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
    <div className="rounded-[28px] bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Message
          </h3>
          <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
            View all
          </span>
        </div>

        {/* Message Contact List */}
        <div className="space-y-3.5">
          {messages.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMessage(item)}
              className="group flex items-center gap-3.5 rounded-2xl p-2 -mx-2 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {/* Avatar with subtle ring & online indicator */}
              <div className="relative shrink-0">
                <Avatar
                  src={item.avatar}
                  alt={item.user}
                  fallback={item.user[0]}
                  size="md"
                  className="ring-2 ring-slate-100 group-hover:scale-105 transition-transform"
                />
                {item.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {item.user}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer subtle quick reply */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>4 active team threads</span>
        <span className="text-slate-500 font-medium">Click to chat</span>
      </div>
    </div>
  )
}
