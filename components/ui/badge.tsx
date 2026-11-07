import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50",
        secondary:
          "bg-slate-100 text-slate-800",
        destructive:
          "border border-red-400/40 text-red-500 bg-red-50/50",
        outline:
          "border border-slate-200 text-slate-700 bg-white",
        success:
          "border border-emerald-500/30 text-emerald-600 bg-emerald-50/60",
        warning:
          "border border-amber-500/30 text-amber-600 bg-amber-50/60",
        info:
          "bg-blue-50 text-blue-600 border border-blue-200/50",
        subtleProgress:
          "bg-slate-100 text-slate-600 hover:bg-slate-200/80 uppercase font-medium tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
