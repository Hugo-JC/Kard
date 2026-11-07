import * as React from "react"
import { cn } from "@/lib/utils"

type FieldGroupProps = React.ComponentProps<"div">

interface FieldProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
}

function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      data-slot="field-group"
      className={cn("grid gap-4", className)}
      {...props}
    />
  )
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      role="group"
      className={cn(
        "flex min-w-0 gap-2",
        orientation === "horizontal" ? "flex-row items-center" : "flex-col",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-semibold leading-none text-foreground",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Field, FieldDescription, FieldGroup, FieldLabel }
