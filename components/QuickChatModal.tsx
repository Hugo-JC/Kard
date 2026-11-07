"use client"

import React, { useState } from "react"
import { Send, CheckCircle2 } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import { ChatMessage } from "@/lib/data"
import { Input } from "@/components/ui/input"

interface QuickChatModalProps {
  message: ChatMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ChatItem {
  id: string
  sender: "them" | "me"
  text: string
  time: string
}

export function QuickChatModal({
  message,
  open,
  onOpenChange,
}: QuickChatModalProps) {
  const [extraMessages, setExtraMessages] = useState<ChatItem[]>([])
  const [replyText, setReplyText] = useState("")

  if (!message) return null

  const chatLog: ChatItem[] = [
    { id: "initial", sender: "them", text: message.text, time: message.time },
    ...extraMessages,
  ]

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const newReply = replyText.trim()
    setReplyText("")

    setExtraMessages((prev) => [
      ...prev,
      { id: `me-${Date.now()}`, sender: "me", text: newReply, time: "Just now" },
    ])

    // Simulated friendly instant response
    setTimeout(() => {
      setExtraMessages((prev) => [
        ...prev,
        {
          id: `them-${Date.now()}`,
          sender: "them",
          text: `Thanks Angelina! I'm reviewing the updates right now. Looks great!`,
          time: "Just now",
        },
      ])
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md p-0 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 bg-slate-50/80 p-5 border-b border-slate-100">
        <Avatar src={message.avatar} alt={message.user} fallback={message.user[0]} size="md" />
        <div>
          <h4 className="text-sm font-bold text-slate-900">{message.user}</h4>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active now · {message.role}</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-5 space-y-3 max-h-80 overflow-y-auto bg-white min-h-[220px]">
        {chatLog.map((chat, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              chat.sender === "me" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-xs font-medium leading-relaxed ${
                chat.sender === "me"
                  ? "bg-[#0D6EFD] text-white rounded-tr-xs"
                  : "bg-slate-100 text-slate-800 rounded-tl-xs"
              }`}
            >
              {chat.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {chat.time}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <Input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Reply to ${message.user}...`}
          className="bg-white text-xs h-10"
          autoFocus
        />
        <button
          type="submit"
          disabled={!replyText.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D6EFD] text-white hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4 translate-x-0.5" />
        </button>
      </form>
    </Dialog>
  )
}
