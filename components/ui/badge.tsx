import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive:
          "border border-danger/25 bg-danger-subtle text-danger-foreground",
        outline: "border border-border bg-card text-foreground",
        success:
          "border border-success/25 bg-success-subtle text-success-foreground",
        warning:
          "border border-warning/25 bg-warning-subtle text-warning-foreground",
        info: "border border-info/25 bg-info-subtle text-info-foreground",
        subtleProgress:
          "bg-muted text-muted-foreground hover:bg-muted/80 uppercase font-medium tracking-wider",
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
