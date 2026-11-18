"use client"

import React, { useMemo, useRef, useState } from "react"
import {
  Send,
  Reply,
  Copy,
  Check,
  SmilePlus,
  X,
  FileText,
  AtSign,
  Hash,
  Rows3,
  AlignJustify,
  Settings2,
  MoreHorizontal,
} from "lucide-react"
import {
  Member,
  MemberStatus,
  MEMBER_STATUS_CONFIG,
  ProjectChatMessage,
  ProjectDocument,
  ProjectRole,
} from "@/lib/data"
import { ChatMarkdown, extractChatMentions } from "@/components/chat/ChatMarkdown"
import { MemberAvatarWithStatus, MemberStatusBadge } from "@/components/ui/MemberStatusBadge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatMessageStreamProps {
  channelName: string
  accentColor?: string
  messages: ProjectChatMessage[]
  members: Member[]
  projectFiles: ProjectDocument[]
  currentUserName: string
  currentUserAvatar: string
  currentUserStatus: MemberStatus
  currentUserStatusNote?: string
  onSendMessage: (payload: {
    text: string
    replyTo?: ProjectChatMessage["replyTo"]
  }) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  onOpenFile?: (doc: ProjectDocument) => void
  onOpenSettings?: () => void
  compactHeight?: boolean
}

const QUICK_REACTIONS = ["👍", "✅", "🔥", "🚀"]

function getRoleAuthorColor(roleText?: string, projectRole?: ProjectRole): string {
  if (projectRole === "owner" || roleText?.toLowerCase().includes("owner")) {
    return "text-amber-600 dark:text-amber-400"
  }
  if (
    projectRole === "gestor" ||
    roleText?.toLowerCase().includes("lead") ||
    roleText?.toLowerCase().includes("gestor") ||
    roleText?.toLowerCase().includes("manager")
  ) {
    return "text-primary"
  }
  return "text-emerald-600 dark:text-emerald-400"
}

export function ChatMessageStream({
  channelName,
  accentColor = "#3B82F6",
  messages,
  members,
  projectFiles,
  currentUserName,
  currentUserStatus,
  currentUserStatusNote,
  onSendMessage,
  onToggleReaction,
  onOpenFile,
  onOpenSettings,
  compactHeight = false,
}: ChatMessageStreamProps) {
  const [viewMode, setViewMode] = useState<"cozy" | "compact">("cozy")
  const [inputText, setInputText] = useState("")
  const [replyTarget, setReplyTarget] = useState<ProjectChatMessage | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTouchMsgId, setActiveTouchMsgId] = useState<string | null>(null)
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const memberNames = useMemo(() => {
    const names = members.map((m) => m.name)
    if (currentUserName && !names.includes(currentUserName)) {
      names.push(currentUserName)
    }
    return names
  }, [members, currentUserName])

  // Detect active @mention or #file trigger right before the end of inputText
  const autocompleteState = useMemo(() => {
    const atMatch = inputText.match(/(?:^|\s)@([^\s@#]*)$/)
    if (atMatch) {
      const query = atMatch[1].toLowerCase()
      const memberOptions = [
        ...members.map((m) => ({
          kind: "user" as const,
          id: m.uid || m.email || m.name,
          label: m.name,
          subtitle: MEMBER_STATUS_CONFIG[m.status || "Offline"].label,
          status: (m.status || "Offline") as MemberStatus,
          insertValue: `@${m.name} `,
        })),
        {
          kind: "user" as const,
          id: "everyone",
          label: "todos",
          subtitle: "Mencionar toda a equipe do projeto",
          status: "Online" as MemberStatus,
          insertValue: "@todos ",
        },
      ].filter((opt) => opt.label.toLowerCase().includes(query))

      return {
        type: "mention" as const,
        replaceFrom: inputText.length - atMatch[1].length - 1,
        items: memberOptions.slice(0, 6),
      }
    }

    const hashMatch = inputText.match(/(?:^|\s)#([^\s@#]*)$/)
    if (hashMatch) {
      const query = hashMatch[1].toLowerCase()
      const fileOptions = projectFiles
        .map((doc) => ({
          kind: "file" as const,
          id: doc.id,
          label: doc.name,
          subtitle: `${doc.type} · ${doc.size}`,
          scope: doc.scope,
          insertValue: `#${doc.name} `,
        }))
        .filter((opt) => opt.label.toLowerCase().includes(query))

      return {
        type: "file" as const,
        replaceFrom: inputText.length - hashMatch[1].length - 1,
        items: fileOptions.slice(0, 6),
      }
    }

    return null
  }, [inputText, members, projectFiles])

  const applyAutocomplete = (insertValue: string) => {
    if (!autocompleteState) return
    const nextText = inputText.slice(0, autocompleteState.replaceFrom) + insertValue
    setInputText(nextText)
    setActiveAutocompleteIndex(0)
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    onSendMessage({
      text: inputText.trim(),
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            user: replyTarget.user,
            avatar: replyTarget.avatar,
            text: replyTarget.text,
          }
        : undefined,
    })
    setInputText("")
    setReplyTarget(null)
  }

  const handleCopyMessage = (msgId: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
      setCopiedId(msgId)
      setTimeout(() => setCopiedId((prev) => (prev === msgId ? null : prev)), 1500)
    }
  }

  const onlineCount = members.filter((m) =>
    m.name === currentUserName ? currentUserStatus === "Online" : m.status === "Online"
  ).length
  const meetingCount = members.filter((m) =>
    m.name === currentUserName ? currentUserStatus === "In Meeting" : m.status === "In Meeting"
  ).length
  const focusedCount = members.filter((m) =>
    m.name === currentUserName ? currentUserStatus === "Focused" : m.status === "Focused"
  ).length

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border overflow-hidden flex flex-col",
        compactHeight
          ? "h-[min(65dvh,480px)] sm:h-[480px]"
          : "h-[min(72dvh,560px)] sm:h-[600px]"
      )}
    >
      {/* Channel Header */}
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-card-foreground">
              #{channelName}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold tabular-nums">{members.length} membros</span>
              <span>·</span>
              <span className="font-semibold text-success-foreground tabular-nums">
                {onlineCount} Online
              </span>
              {meetingCount > 0 && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-warning-foreground tabular-nums">
                    {meetingCount} Em reunião
                  </span>
                </>
              )}
              {focusedCount > 0 && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-primary tabular-nums">
                    {focusedCount} Em foco
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cozy / Compact layout switcher */}
          <div
            className="inline-flex items-center rounded-xl border border-border/80 bg-background/70 p-0.5 text-[11px]"
            role="group"
            aria-label="Modo de exibição do chat"
          >
            <button
              type="button"
              onClick={() => setViewMode("cozy")}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition-colors cursor-pointer",
                viewMode === "cozy"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Modo Aconchegante (com avatares e agrupamento)"
            >
              <Rows3 className="size-3" />
              <span className="hidden sm:inline">Aconchegante</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition-colors cursor-pointer",
                viewMode === "compact"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Modo Compacto (em linha, sem avatares)"
            >
              <AlignJustify className="size-3" />
              <span className="hidden sm:inline">Compacto</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center -space-x-1.5">
            {members.slice(0, 5).map((m, idx) => {
              const effStatus = m.name === currentUserName ? currentUserStatus : m.status || "Offline"
              return (
                <MemberAvatarWithStatus
                  key={m.uid || m.email || idx}
                  avatar={m.avatar}
                  name={m.name}
                  status={effStatus}
                  size="sm"
                  className="w-6 h-6 border-2 border-card"
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto py-3">
        {messages.map((msg, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : null
          const isGrouped =
            viewMode === "cozy" &&
            Boolean(prev) &&
            prev?.user === msg.user &&
            !msg.replyTo

          const memberInfo = members.find(
            (m) => m.name.toLowerCase() === msg.user.toLowerCase()
          )
          const isAuthorMe =
            Boolean(msg.isMe) || msg.user.toLowerCase() === currentUserName.toLowerCase()
          const currentMsgStatus: MemberStatus = isAuthorMe
            ? currentUserStatus
            : memberInfo?.status || msg.userStatus || "Online"

          const { mentionsMe, mentionedFiles } = extractChatMentions(
            msg.text,
            currentUserName,
            projectFiles
          )
          const hasFileMention = mentionedFiles.length > 0

          const rowHighlightClass = mentionsMe
            ? "bg-amber-500/[0.11] hover:bg-amber-500/[0.16] border-l-[3px] border-l-amber-500"
            : hasFileMention
            ? "bg-sky-500/[0.09] hover:bg-sky-500/[0.14] border-l-[3px] border-l-sky-500"
            : "border-l-[3px] border-l-transparent hover:bg-muted/45"

          const authorColorClass = getRoleAuthorColor(msg.role, memberInfo?.projectRole)

          return (
            <div
              key={msg.id}
              className={cn(
                "group relative px-4 transition-colors",
                isGrouped ? "py-0.5" : viewMode === "compact" ? "py-1" : "mt-2.5 pt-1 pb-0.5",
                rowHighlightClass
              )}
            >
              {/* Mobile Touch Quick Action Trigger */}
              <button
                type="button"
                onClick={() =>
                  setActiveTouchMsgId((prev) => (prev === msg.id ? null : msg.id))
                }
                aria-label="Ações da mensagem"
                className="absolute right-2.5 top-1 z-10 flex size-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:bg-muted hover:text-foreground sm:hidden cursor-pointer"
              >
                <MoreHorizontal className="size-3.5" />
              </button>

              {/* Floating Hover / Touch Quick Action Bar */}
              <div
                className={cn(
                  "absolute -top-3 right-10 sm:right-4 z-10 items-center gap-0.5 rounded-xl border border-border bg-card/95 p-0.5 shadow-md backdrop-blur-xs",
                  activeTouchMsgId === msg.id
                    ? "flex pointer-events-auto"
                    : "pointer-events-none hidden sm:group-hover:pointer-events-auto sm:group-hover:flex"
                )}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onToggleReaction(msg.id, emoji)
                      setActiveTouchMsgId(null)
                    }}
                    className="flex size-7 items-center justify-center rounded-lg text-xs hover:bg-muted transition-colors cursor-pointer"
                    title={`Reagir com ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <span className="mx-0.5 h-4 w-px bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    setReplyTarget(msg)
                    setActiveTouchMsgId(null)
                    inputRef.current?.focus()
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  title="Responder mensagem"
                >
                  <Reply className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyMessage(msg.id, msg.text)
                    setActiveTouchMsgId(null)
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  title="Copiar texto"
                >
                  {copiedId === msg.id ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>

              {/* Reply Preview Header with curved elbow line */}
              {msg.replyTo && viewMode === "cozy" && (
                <div className="mb-1 flex items-center gap-2 pl-5 text-[11px] text-muted-foreground">
                  <div className="h-3 w-5 shrink-0 rounded-tl-md border-l-2 border-t-2 border-muted-foreground/35 translate-y-1" />
                  <Avatar
                    src={msg.replyTo.avatar || "/avatars/angelina.jpg"}
                    fallback={msg.replyTo.user[0]}
                    size="sm"
                    className="size-4 shrink-0"
                  />
                  <span className="font-semibold text-foreground/85 shrink-0">
                    {msg.replyTo.user}
                  </span>
                  <span className="truncate opacity-80">{msg.replyTo.text}</span>
                </div>
              )}

              {viewMode === "compact" ? (
                /* COMPACT MODE: No avatars, inline timestamp + author + message */
                <div className="flex items-baseline gap-1.5 sm:gap-2 pl-1 pr-7 sm:pr-0 text-[13px] leading-relaxed">
                  <span className="w-12 sm:w-16 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/75">
                    {msg.time.replace("Hoje às ", "")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={cn("mr-1.5 font-bold", authorColorClass)}>
                      {msg.user}
                    </span>
                    <ChatMarkdown
                      content={msg.text}
                      projectFiles={projectFiles}
                      mentionNames={memberNames}
                      currentUserName={currentUserName}
                      onFileClick={onOpenFile}
                      className="inline [&>p]:inline"
                    />
                    {(mentionsMe || hasFileMention) && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                        {mentionsMe && (
                          <span className="text-amber-600 dark:text-amber-400">
                            Você foi mencionado
                          </span>
                        )}
                        {hasFileMention && (
                          <span className="text-sky-600 dark:text-sky-400">
                            Arquivo do projeto referenciado ({mentionedFiles.map((f) => f.name).join(", ")})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* COZY MODE: 40x40 Avatar on left, name + role color + timestamp, borderless content below */
                <div className="flex items-start gap-2.5 sm:gap-3.5 pr-7 sm:pr-0">
                  {isGrouped ? (
                    <div className="w-10 shrink-0 pt-0.5 text-right opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {msg.time.replace("Hoje às ", "")}
                      </span>
                    </div>
                  ) : (
                    <MemberAvatarWithStatus
                      avatar={msg.avatar}
                      name={msg.user}
                      status={currentMsgStatus}
                      size="lg"
                      className="mt-0.5"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    {!isGrouped && (
                      <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
                        <span className={cn("text-[13.5px] font-bold", authorColorClass)}>
                          {msg.user}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {msg.role}
                        </span>
                        <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground/75">
                          {msg.time}
                        </span>
                        {mentionsMe && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            · Você foi mencionado
                          </span>
                        )}
                        {hasFileMention && (
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                            · Arquivo vinculado
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message text directly on background (no chat bubble) */}
                    <ChatMarkdown
                      content={msg.text}
                      projectFiles={projectFiles}
                      mentionNames={memberNames}
                      currentUserName={currentUserName}
                      onFileClick={onOpenFile}
                    />

                    {/* Context Embed Card */}
                    {msg.embed && (
                      <div
                        className="mt-2 max-w-md rounded-xl border border-border/80 bg-muted/45 p-3 dark:bg-zinc-900/75"
                        style={{
                          borderLeftWidth: "4px",
                          borderLeftColor: msg.embed.color || accentColor,
                        }}
                      >
                        <p className="text-xs font-bold text-foreground">
                          {msg.embed.title}
                        </p>
                        {msg.embed.description && (
                          <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
                            {msg.embed.description}
                          </p>
                        )}
                        {msg.embed.fields && msg.embed.fields.length > 0 && (
                          <div className="mt-2.5 grid grid-cols-2 gap-2">
                            {msg.embed.fields.map((field) => (
                              <div key={field.name}>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {field.name}
                                </p>
                                <p className="text-xs font-semibold tabular-nums text-foreground">
                                  {field.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.embed.footer && (
                          <p className="mt-2.5 border-t border-border/50 pt-1.5 text-[10px] text-muted-foreground">
                            {msg.embed.footer}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reaction Pills */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {msg.reactions.map((reaction) => (
                          <button
                            key={reaction.emoji}
                            type="button"
                            onClick={() => onToggleReaction(msg.id, reaction.emoji)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold tabular-nums transition-colors cursor-pointer",
                              reaction.reactedByMe
                                ? "border-primary/50 bg-primary/12 text-primary"
                                : "border-border/80 bg-muted/45 text-muted-foreground hover:border-border hover:text-foreground"
                            )}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => onToggleReaction(msg.id, "👍")}
                          className="inline-flex size-6 items-center justify-center rounded-lg border border-transparent text-muted-foreground opacity-0 transition-opacity hover:border-border hover:bg-muted group-hover:opacity-100 cursor-pointer"
                          title="Adicionar reação"
                        >
                          <SmilePlus className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Global Status Read-Only Strip (Configured in Settings) */}
      <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-muted-foreground font-medium">
            Seu status global:
          </span>
          <MemberStatusBadge status={currentUserStatus} size="sm" />
          {currentUserStatusNote && (
            <span className="truncate text-[11px] text-muted-foreground">
              · {currentUserStatusNote}
            </span>
          )}
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            <Settings2 className="size-3" />
            <span>Definir nas Configurações</span>
          </button>
        )}
      </div>

      {/* Reply Banner */}
      {replyTarget && (
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/35 px-4 py-1.5 text-xs">
          <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <Reply className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">
              Respondendo a <strong className="text-foreground">{replyTarget.user}</strong>:{" "}
              {replyTarget.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyTarget(null)}
            className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Cancelar resposta"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Composer with @user & #file Autocomplete */}
      <div className="relative border-t border-border/70 bg-card p-3">
        {autocompleteState && autocompleteState.items.length > 0 && (
          <div className="absolute bottom-full left-3 right-3 z-20 mb-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {autocompleteState.type === "mention" ? (
                  <>
                    <AtSign className="size-3 text-amber-500" />
                    <span>Mencionar membro da equipe</span>
                  </>
                ) : (
                  <>
                    <Hash className="size-3 text-sky-500" />
                    <span>Referenciar arquivo do projeto</span>
                  </>
                )}
              </span>
              <span>Tab ou clique para inserir</span>
            </div>

            <div className="max-h-48 overflow-y-auto p-1">
              {autocompleteState.items.map((item, i) => {
                const isActive = i === activeAutocompleteIndex % autocompleteState.items.length
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyAutocomplete(item.insertValue)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                      isActive ? "bg-muted text-foreground" : "hover:bg-muted/60"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {item.kind === "user" ? (
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            MEMBER_STATUS_CONFIG[item.status]?.dot || "bg-zinc-400"
                          )}
                        />
                      ) : (
                        <FileText className="size-3.5 shrink-0 text-sky-500" />
                      )}
                      <span className="truncate font-semibold text-foreground">
                        {item.kind === "user" ? `@${item.label}` : `#${item.label}`}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setInputText((prev) => (prev.endsWith(" ") || !prev ? `${prev}@` : `${prev} @`))
                  inputRef.current?.focus()
                }}
                title="Mencionar membro (@)"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-amber-600 transition-colors cursor-pointer"
              >
                <AtSign className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText((prev) => (prev.endsWith(" ") || !prev ? `${prev}#` : `${prev} #`))
                  inputRef.current?.focus()
                }}
                title="Mencionar arquivo do projeto (#)"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-sky-600 transition-colors cursor-pointer"
              >
                <Hash className="size-4" />
              </button>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                setActiveAutocompleteIndex(0)
              }}
              onKeyDown={(e) => {
                if (!autocompleteState || autocompleteState.items.length === 0) return
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setActiveAutocompleteIndex(
                    (prev) => (prev + 1) % autocompleteState.items.length
                  )
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setActiveAutocompleteIndex(
                    (prev) =>
                      (prev - 1 + autocompleteState.items.length) %
                      autocompleteState.items.length
                  )
                } else if (e.key === "Tab") {
                  e.preventDefault()
                  const selected =
                    autocompleteState.items[
                      activeAutocompleteIndex % autocompleteState.items.length
                    ]
                  if (selected) applyAutocomplete(selected.insertValue)
                }
              }}
              placeholder={`Conversar em #${channelName}...`}
              className="flex-1 min-w-0 h-10 rounded-xl border border-input bg-background px-3 sm:px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim()}
              aria-label="Enviar mensagem"
              className="h-10 px-3 sm:px-4 gap-1.5 rounded-xl shrink-0"
            >
              <span className="hidden sm:inline">Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

          <p className="hidden sm:block px-1 text-[10.5px] text-muted-foreground/85">
            Suporta <code className="font-mono">**negrito**</code>,{" "}
            <code className="font-mono">*itálico*</code>,{" "}
            <code className="font-mono">__sublinhado__</code>,{" "}
            <code className="font-mono">||spoiler||</code>,{" "}
            <code className="font-mono">&gt; citação</code>,{" "}
            <code className="font-mono">@usuario</code> e{" "}
            <code className="font-mono">#arquivo</code>
          </p>
        </form>
      </div>
    </div>
  )
}
