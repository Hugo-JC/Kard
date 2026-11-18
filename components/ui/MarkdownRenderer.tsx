"use client"

import React from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "markdown-body text-sm leading-relaxed text-card-foreground space-y-2.5",
        "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mt-3 [&_h1]:mb-1.5",
        "[&_h2]:text-base [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-3 [&_h2]:mb-1.5",
        "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2.5 [&_h3]:mb-1",
        "[&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed",
        "[&_strong]:font-semibold [&_strong]:text-card-foreground",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-muted-foreground",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:text-muted-foreground",
        "[&_li]:text-sm [&_li]:leading-relaxed",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground",
        "[&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/60 [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:border-b [&_th]:border-border [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border-b [&_td]:border-border/60 [&_td]:py-1.5",
        className
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  )
}
