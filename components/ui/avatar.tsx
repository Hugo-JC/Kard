import * as React from "react"
import { cn } from "@/lib/utils"

import Image from "next/image"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function Avatar({
  src,
  alt = "User Avatar",
  fallback = "U",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false)

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-14 h-14 text-base",
  }

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 font-semibold text-slate-700 shadow-sm",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="56px"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="uppercase">{fallback}</span>
      )}
    </div>
  )
}
