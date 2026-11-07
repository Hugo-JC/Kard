"use client"

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "kard-theme"

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener("kard-theme-change", callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener("kard-theme-change", callback)
  }
}

function getSnapshot(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || "light"
  } catch {
    return "light"
  }
}

function getServerSnapshot(): Theme {
  return "light"
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Determine resolvedTheme
  const isDark = theme === "dark"
  const resolvedTheme: "light" | "dark" = isDark ? "dark" : "light"

  // Synchronize the DOM element class when theme changes
  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const applyClass = () => {
      const activeDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches)

      if (activeDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    applyClass()

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyClass)
      return () => mediaQuery.removeEventListener("change", applyClass)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
      window.dispatchEvent(new Event("kard-theme-change"))
    } catch {
      // ignore
    }
  }

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
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
