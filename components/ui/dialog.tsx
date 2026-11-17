"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:items-center sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className={cn(
              "relative z-10 my-auto w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl bg-card p-4 sm:p-6 shadow-2xl border border-border text-card-foreground",
              className
            )}
          >
            <button
              type="button"
              aria-label="Fechar janela"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 sm:right-5 sm:top-5 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {title && (
              <div className="mb-4 pr-8">
                <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{title}</h3>
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
