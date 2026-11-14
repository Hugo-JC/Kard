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

function subscribeSystemDark(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getSystemDarkSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function getSystemDarkServerSnapshot(): boolean {
  return false
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const storedTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const theme = storedTheme || defaultTheme
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot
  )

  const resolvedTheme: "light" | "dark" =
    theme === "dark" || (theme === "system" && systemDark) ? "dark" : "light"

  // Synchronize the DOM element class when resolvedTheme changes
  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [resolvedTheme])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
      window.dispatchEvent(new Event("kard-theme-change"))
    } catch {
      // ignore
    }
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
