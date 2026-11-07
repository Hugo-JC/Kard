import { useId, type ReactNode } from "react"
import type { Member } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ProjectSelectOption {
  value: string
  label: string
  description?: string
  icon?: ReactNode
  indicatorClassName?: string
}

interface ProjectSelectFieldProps {
  value: string
  options: ProjectSelectOption[]
  onValueChange: (value: string) => void
  label?: string
  description?: string
  placeholder?: string
  ariaLabel?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
}

const memberTones = [
  "bg-primary-subtle text-primary",
  "bg-info-subtle text-info-foreground",
  "bg-success-subtle text-success-foreground",
  "bg-warning-subtle text-warning-foreground",
]

export function memberSelectOptions(members: Member[]): ProjectSelectOption[] {
  return members.map((member, index) => {
    const initials = member.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()

    return {
      value: member.name,
      label: member.name,
      description: member.role,
      icon: (
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
            memberTones[index % memberTones.length]
          )}
        >
          {initials}
        </span>
      ),
    }
  })
}

function OptionAdornment({ option }: { option: ProjectSelectOption }) {
  if (option.icon) return <span className="shrink-0">{option.icon}</span>

  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        option.indicatorClassName || "bg-muted-foreground/40"
      )}
    />
  )
}

export function ProjectSelectField({
  value,
  options,
  onValueChange,
  label,
  description,
  placeholder = "Selecione uma opção",
  ariaLabel,
  className,
  triggerClassName,
  contentClassName,
  disabled,
}: ProjectSelectFieldProps) {
  const generatedId = useId()
  const selectedOption = options.find((option) => option.value === value)
  const trigger = (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onValueChange(nextValue)
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={generatedId}
        aria-label={label ? undefined : ariaLabel || placeholder}
        className={cn(
          "h-11 min-h-11 w-full min-w-0 rounded-xl border-border bg-background px-3 text-sm",
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selectedOption ? (
            <span className="flex min-w-0 items-center gap-2">
              <OptionAdornment option={selectedOption} />
              <span className="truncate">{selectedOption.label}</span>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        className={cn("max-h-72 min-w-48", contentClassName)}
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-11 cursor-pointer py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <OptionAdornment option={option} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  if (!label) {
    return <div className={cn("min-w-0", className)}>{trigger}</div>
  }

  return (
    <Field className={cn("min-w-0", className)}>
      <FieldLabel htmlFor={generatedId}>{label}</FieldLabel>
      {trigger}
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}
