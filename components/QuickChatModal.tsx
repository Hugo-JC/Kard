"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, AtSign, Hash } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import {
  ChatMessage,
  MemberStatus,
  MEMBER_STATUS_CONFIG,
  ProjectDocument,
} from "@/lib/data"
import { ChatMarkdown, extractChatMentions } from "@/components/chat/ChatMarkdown"
import { MemberAvatarWithStatus, MemberStatusBadge } from "@/components/ui/MemberStatusBadge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuickChatModalProps {
  message: ChatMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserName?: string
  currentUserAvatar?: string
  userStatus?: MemberStatus
  projectFiles?: ProjectDocument[]
}

interface ChatItem {
  id: string
  sender: "them" | "me"
  authorName: string
  authorAvatar: string
  authorStatus: MemberStatus
  text: string
  time: string
}

export function QuickChatModal({
  message,
  open,
  onOpenChange,
  currentUserName = "Angelina Smith",
  currentUserAvatar = "/avatars/angelina.jpg",
  userStatus = "Online",
  projectFiles = [],
}: QuickChatModalProps) {
  const [extraMessagesById, setExtraMessagesById] = useState<Record<string, ChatItem[]>>({})
  const [replyText, setReplyText] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!message) return null

  const activeMessageId = message.id
  const extraMessages = extraMessagesById[activeMessageId] || []
  const themStatus: MemberStatus = message.online ? "Online" : "Offline"
  const chatLog: ChatItem[] = [
    {
      id: `initial-${activeMessageId}`,
      sender: "them",
      authorName: message.user,
      authorAvatar: message.avatar,
      authorStatus: themStatus,
      text: message.text,
      time: message.time,
    },
    ...extraMessages,
  ]

  const firstName = currentUserName.trim().split(/\s+/)[0] || "Você"

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const newReply = replyText.trim()
    setReplyText("")

    const nowLabel = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    setExtraMessagesById((prev) => ({
      ...prev,
      [activeMessageId]: [
        ...(prev[activeMessageId] || []),
        {
          id: `me-${Date.now()}`,
          sender: "me",
          authorName: currentUserName,
          authorAvatar: currentUserAvatar,
          authorStatus: userStatus,
          text: newReply,
          time: `Hoje às ${nowLabel}`,
        },
      ],
    }))

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const replyNow = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      setExtraMessagesById((prev) => ({
        ...prev,
        [activeMessageId]: [
          ...(prev[activeMessageId] || []),
          {
            id: `them-${Date.now()}`,
            sender: "them",
            authorName: message.user,
            authorAvatar: message.avatar,
            authorStatus: themStatus,
            text: `Perfeito @${firstName}! Recebi sua mensagem e já estou revisando.`,
            time: `Hoje às ${replyNow}`,
          },
        ],
      }))
    }, 1000)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-lg p-0 overflow-hidden bg-card text-card-foreground border-border"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-2 bg-muted/40 pl-4 pr-12 py-3.5 sm:pl-5 sm:pr-14 sm:py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatarWithStatus
            avatar={message.avatar}
            name={message.user}
            status={themStatus}
            size="md"
          />
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-card-foreground">
              {message.user}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  MEMBER_STATUS_CONFIG[themStatus].dot
                )}
              />
              <span className="truncate">
                {MEMBER_STATUS_CONFIG[themStatus].label} · {message.role}
              </span>
            </div>
          </div>
        </div>

        <MemberStatusBadge status={userStatus} size="sm" className="shrink-0" />
      </div>

      {/* Borderless Stream Area */}
      <div className="py-3 max-h-[55dvh] sm:max-h-80 overflow-y-auto bg-card min-h-[200px] sm:min-h-[220px]">
        {chatLog.map((chat, idx) => {
          const prev = idx > 0 ? chatLog[idx - 1] : null
          const isGrouped = Boolean(prev && prev.authorName === chat.authorName)
          const { mentionsMe, mentionedFiles } = extractChatMentions(
            chat.text,
            currentUserName,
            projectFiles
          )
          const hasFile = mentionedFiles.length > 0

          return (
            <div
              key={chat.id}
              className={cn(
                "group px-5 transition-colors border-l-[3px]",
                isGrouped ? "py-0.5" : "mt-2 py-1",
                mentionsMe
                  ? "bg-amber-500/[0.11] border-l-amber-500"
                  : hasFile
                  ? "bg-sky-500/[0.09] border-l-sky-500"
                  : "border-l-transparent hover:bg-muted/40"
              )}
            >
              <div className="flex items-start gap-3">
                {isGrouped ? (
                  <div className="w-8 shrink-0 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {chat.time.replace("Hoje às ", "")}
                    </span>
                  </div>
                ) : (
                  <MemberAvatarWithStatus
                    avatar={chat.authorAvatar}
                    name={chat.authorName}
                    status={chat.authorStatus}
                    size="md"
                    className="mt-0.5"
                  />
                )}

                <div className="min-w-0 flex-1">
                  {!isGrouped && (
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          chat.sender === "me" ? "text-primary" : "text-foreground"
                        )}
                      >
                        {chat.authorName}
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {chat.time}
                      </span>
                    </div>
                  )}

                  <ChatMarkdown
                    content={chat.text}
                    projectFiles={projectFiles}
                    mentionNames={[message.user, currentUserName]}
                    currentUserName={currentUserName}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSend}
        className="p-3.5 bg-muted/30 border-t border-border flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() =>
            setReplyText((prev) => (prev.endsWith(" ") || !prev ? `${prev}@${message.user} ` : `${prev} @${message.user} `))
          }
          title="Mencionar contato (@)"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-amber-600 cursor-pointer"
        >
          <AtSign className="size-4" />
        </button>
        {projectFiles.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setReplyText((prev) =>
                prev.endsWith(" ") || !prev
                  ? `${prev}#${projectFiles[0].name} `
                  : `${prev} #${projectFiles[0].name} `
              )
            }
            title="Referenciar arquivo (#)"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-sky-600 cursor-pointer"
          >
            <Hash className="size-4" />
          </button>
        )}
        <Input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Responder para ${message.user}...`}
          className="bg-card text-xs h-9 border-border flex-1 min-w-0"
          autoFocus
        />
        <button
          type="submit"
          disabled={!replyText.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4 translate-x-0.5" />
        </button>
      </form>
    </Dialog>
  )
}
