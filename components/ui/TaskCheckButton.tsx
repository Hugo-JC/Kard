"use client"

import React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCheckButtonProps {
  checked: boolean
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void
  ariaLabel?: string
  variant?: "default" | "warning"
  shape?: "circle" | "rounded"
  size?: "sm" | "md"
  className?: string
}

export function TaskCheckButton({
  checked,
  onToggle,
  ariaLabel,
  variant = "default",
  shape = "circle",
  size = "md",
  className,
}: TaskCheckButtonProps) {
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-[7px]"
  const boxSizeClass = size === "sm" ? "size-4" : "size-5"

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel || (checked ? "Marcar como pendente" : "Marcar como concluída")}
      onClick={onToggle}
      className={cn(
        "group/check relative flex shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        size === "sm" ? "size-8" : "size-10 sm:size-8",
        className
      )}
    >
      {checked ? (
        <motion.span
          initial={{ scale: 0.78, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
          className={cn(
            "flex items-center justify-center border border-emerald-600 bg-emerald-600 text-white shadow-2xs dark:border-emerald-500 dark:bg-emerald-500",
            boxSizeClass,
            radiusClass
          )}
        >
          <Check className={cn(size === "sm" ? "size-2.5" : "size-3", "stroke-[2.8]")} />
        </motion.span>
      ) : (
        <span
          className={cn(
            "flex items-center justify-center border-[1.75px] bg-card/80 transition-all duration-150 ease-out",
            boxSizeClass,
            radiusClass,
            variant === "warning"
              ? "border-amber-400/90 dark:border-amber-500/75 group-hover/check:border-emerald-500 group-hover/check:bg-emerald-500/10"
              : "border-slate-300/90 dark:border-slate-600 group-hover/check:border-emerald-500/80 group-hover/check:bg-emerald-500/10"
          )}
        >
          <Check
            className={cn(
              size === "sm" ? "size-2.5" : "size-3",
              "stroke-[2.5] text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity duration-150 group-hover/check:opacity-55"
            )}
          />
        </span>
      )}
    </button>
  )
}
