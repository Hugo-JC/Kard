"use client"

import React, { useState } from "react"
import { FileText, ExternalLink } from "lucide-react"
import type { ProjectDocument } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ChatMarkdownProps {
  content: string
  projectFiles?: ProjectDocument[]
  mentionNames?: string[]
  currentUserName?: string
  onFileClick?: (doc: ProjectDocument) => void
  className?: string
}

function SpoilerSpan({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setRevealed((prev) => !prev)}
      title={revealed ? "Clique para ocultar" : "Clique para revelar spoiler"}
      className={cn(
        "inline rounded px-1.5 py-0.5 text-[12px] transition-all cursor-pointer align-baseline",
        revealed
          ? "bg-muted/80 text-foreground"
          : "bg-zinc-800 text-transparent select-none hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      )}
    >
      {text}
    </button>
  )
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function extractChatMentions(
  text: string,
  currentUserName: string,
  projectFiles: ProjectDocument[]
): {
  mentionsMe: boolean
  mentionedFiles: ProjectDocument[]
} {
  const lower = text.toLowerCase()
  const firstName = currentUserName.trim().split(/\s+/)[0]?.toLowerCase() || ""
  const fullNameLower = currentUserName.trim().toLowerCase()

  const mentionsMe =
    /@(todos|everyone|here)\b/i.test(text) ||
    (fullNameLower.length > 1 && lower.includes(`@${fullNameLower}`)) ||
    (firstName.length > 2 && new RegExp(`@${escapeRegExp(firstName)}\\b`, "i").test(text))

  const mentionedFiles = projectFiles.filter((doc) =>
    lower.includes(`#${doc.name.toLowerCase()}`)
  )

  return { mentionsMe, mentionedFiles }
}

function renderInlineTokens(
  text: string,
  options: {
    projectFiles: ProjectDocument[]
    mentionNames: string[]
    currentUserName: string
    onFileClick?: (doc: ProjectDocument) => void
    keyPrefix: string
  }
): React.ReactNode[] {
  const { projectFiles, mentionNames, currentUserName, onFileClick, keyPrefix } = options
  const nodes: React.ReactNode[] = []

  // Sort known names & files longest-first so full names ("Courtney Henry") match before first names
  const sortedNames = [...new Set([...mentionNames, "todos", "everyone"])].sort(
    (a, b) => b.length - a.length
  )
  const sortedFiles = [...projectFiles].sort((a, b) => b.name.length - a.name.length)

  const namePattern =
    sortedNames.length > 0
      ? `@(?:${sortedNames.map(escapeRegExp).join("|")})(?![\\w-])`
      : `@[\\w.-]+`
  const filePattern =
    sortedFiles.length > 0
      ? `#(?:${sortedFiles.map((f) => escapeRegExp(f.name)).join("|")})(?=\\s|$|[.,!?;:)])`
      : `#[\\w.-]+\\.[a-zA-Z0-9]{2,6}`

  const tokenRegex = new RegExp(
    `(\\|\\|[^|]+\\|\\||\\\`[^\\\`]+\\\`|\\*\\*\\*[^*]+\\*\\*\\*|\\*\\*[^*]+\\*\\*|__[^_]+__|~~[^~]+~~|\\*[^*]+\\*|_[^_]+_|\\[[^\\]]+\\]\\(https?:\\/\\/[^\\s)]+\\)|${namePattern}|${filePattern})`,
    "gi"
  )

  let lastIndex = 0
  let match: RegExpExecArray | null
  let tokenIdx = 0

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const key = `${keyPrefix}-${tokenIdx++}`

    if (token.startsWith("||") && token.endsWith("||")) {
      nodes.push(<SpoilerSpan key={key} text={token.slice(2, -2)} />)
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded-md border border-border/70 bg-muted/80 px-1.5 py-0.5 font-mono text-[11.5px] text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith("***") && token.endsWith("***")) {
      nodes.push(
        <strong key={key} className="font-bold italic">
          {token.slice(3, -3)}
        </strong>
      )
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith("__") && token.endsWith("__")) {
      nodes.push(
        <span key={key} className="underline underline-offset-2">
          {token.slice(2, -2)}
        </span>
      )
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(
        <s key={key} className="opacity-70">
          {token.slice(2, -2)}
        </s>
      )
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const splitIdx = token.indexOf("](")
      const label = token.slice(1, splitIdx)
      const href = token.slice(splitIdx + 2, -1)
      nodes.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-primary underline underline-offset-2 hover:opacity-85"
        >
          <span>{label}</span>
          <ExternalLink className="size-3" />
        </a>
      )
    } else if (token.startsWith("@")) {
      const rawMention = token.slice(1).toLowerCase()
      const currentFirst = currentUserName.trim().split(/\s+/)[0]?.toLowerCase() || ""
      const isMeMention =
        rawMention === "todos" ||
        rawMention === "everyone" ||
        rawMention === currentUserName.trim().toLowerCase() ||
        (currentFirst.length > 2 && rawMention === currentFirst)

      nodes.push(
        <span
          key={key}
          className={cn(
            "inline-flex items-center rounded px-1 py-0.5 font-semibold transition-colors",
            isMeMention
              ? "bg-amber-500/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300"
              : "bg-primary/12 text-primary dark:bg-primary/20"
          )}
        >
          {token}
        </span>
      )
    } else if (token.startsWith("#")) {
      const rawFileName = token.slice(1).toLowerCase()
      const matchedDoc = projectFiles.find((f) => f.name.toLowerCase() === rawFileName)
      nodes.push(
        <button
          key={key}
          type="button"
          onClick={() => matchedDoc && onFileClick?.(matchedDoc)}
          title={
            matchedDoc
              ? `Abrir arquivo ${matchedDoc.name} (${matchedDoc.size})`
              : `Arquivo ${token}`
          }
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11.5px] font-semibold transition-colors align-baseline",
            matchedDoc
              ? "bg-sky-500/18 text-sky-700 hover:bg-sky-500/28 dark:bg-sky-400/20 dark:text-sky-300 cursor-pointer"
              : "bg-muted text-foreground"
          )}
        >
          <FileText className="size-3 shrink-0" />
          <span>{token}</span>
        </button>
      )
    } else {
      nodes.push(token)
    }

    lastIndex = tokenRegex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

export function ChatMarkdown({
  content,
  projectFiles = [],
  mentionNames = [],
  currentUserName = "",
  onFileClick,
  className,
}: ChatMarkdownProps) {
  // Split fenced code blocks ```...```
  const segments = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className={cn("space-y-1 text-[13px] leading-relaxed text-card-foreground", className)}>
      {segments.map((segment, segIdx) => {
        if (!segment) return null

        if (segment.startsWith("```") && segment.endsWith("```")) {
          const inner = segment.slice(3, -3).replace(/^[a-zA-Z0-9_-]+\n/, "").trim()
          return (
            <pre
              key={`code-${segIdx}`}
              className="my-1.5 overflow-x-auto rounded-lg border border-border/80 bg-zinc-950/90 px-3 py-2 font-mono text-[11.5px] text-zinc-100"
            >
              <code>{inner}</code>
            </pre>
          )
        }

        // Check for multi-line block quote >>>
        const multiQuoteIdx = segment.indexOf(">>> ")
        if (multiQuoteIdx !== -1 && (multiQuoteIdx === 0 || segment[multiQuoteIdx - 1] === "\n")) {
          const before = segment.slice(0, multiQuoteIdx)
          const quoted = segment.slice(multiQuoteIdx + 4)
          return (
            <React.Fragment key={`mq-${segIdx}`}>
              {before && (
                <ChatMarkdown
                  content={before}
                  projectFiles={projectFiles}
                  mentionNames={mentionNames}
                  currentUserName={currentUserName}
                  onFileClick={onFileClick}
                />
              )}
              <blockquote className="my-1 border-l-[3px] border-muted-foreground/45 pl-3 text-muted-foreground whitespace-pre-wrap">
                {renderInlineTokens(quoted, {
                  projectFiles,
                  mentionNames,
                  currentUserName,
                  onFileClick,
                  keyPrefix: `mq-${segIdx}`,
                })}
              </blockquote>
            </React.Fragment>
          )
        }

        const lines = segment.split("\n")
        return lines.map((line, lineIdx) => {
          const keyPrefix = `l-${segIdx}-${lineIdx}`

          if (line.startsWith("### ")) {
            return (
              <h5 key={keyPrefix} className="pt-0.5 text-xs font-bold text-foreground">
                {renderInlineTokens(line.slice(4), {
                  projectFiles,
                  mentionNames,
                  currentUserName,
                  onFileClick,
                  keyPrefix,
                })}
              </h5>
            )
          }
          if (line.startsWith("## ")) {
            return (
              <h4 key={keyPrefix} className="pt-0.5 text-sm font-bold text-foreground">
                {renderInlineTokens(line.slice(3), {
                  projectFiles,
                  mentionNames,
                  currentUserName,
                  onFileClick,
                  keyPrefix,
                })}
              </h4>
            )
          }
          if (line.startsWith("# ")) {
            return (
              <h3 key={keyPrefix} className="pt-0.5 text-base font-extrabold text-foreground">
                {renderInlineTokens(line.slice(2), {
                  projectFiles,
                  mentionNames,
                  currentUserName,
                  onFileClick,
                  keyPrefix,
                })}
              </h3>
            )
          }
          if (line.startsWith("-# ")) {
            return (
              <p key={keyPrefix} className="text-[11px] text-muted-foreground">
                {renderInlineTokens(line.slice(3), {
                  projectFiles,
                  mentionNames,
                  currentUserName,
                  onFileClick,
                  keyPrefix,
                })}
              </p>
            )
          }
          if (line.startsWith("> ")) {
            return (
              <blockquote
                key={keyPrefix}
                className="border-l-[3px] border-muted-foreground/45 pl-2.5 text-muted-foreground"
              >
                {renderInlineTokens(line.slice(2), {
                  projectFiles,
                  mentionNames,
                  currentUserName,
                  onFileClick,
                  keyPrefix,
                })}
              </blockquote>
            )
          }
          if (!line.trim()) {
            return <div key={keyPrefix} className="h-1" />
          }

          return (
            <p key={keyPrefix} className="break-words">
              {renderInlineTokens(line, {
                projectFiles,
                mentionNames,
                currentUserName,
                onFileClick,
                keyPrefix,
              })}
            </p>
          )
        })
      })}
    </div>
  )
}
