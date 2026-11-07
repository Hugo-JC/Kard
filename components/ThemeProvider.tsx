"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "kard-theme",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      return stored || defaultTheme
    } catch {
      return defaultTheme
    }
  })
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  // Apply theme class to documentElement
  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = () => {
      let activeTheme: "light" | "dark" = "light"

      if (theme === "system") {
        activeTheme = mediaQuery.matches ? "dark" : "light"
      } else {
        activeTheme = theme
      }

      setResolvedTheme(activeTheme)

      if (activeTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    applyTheme()

    const listener = () => {
      if (theme === "system") {
        applyTheme()
      }
    }

    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch {
      // ignore
    }
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
