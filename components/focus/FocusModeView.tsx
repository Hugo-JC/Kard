"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Plus,
  Minimize2,
  CheckCircle2,
  ListTodo,
  FileText,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Brain,
  Sun,
  Moon,
} from "lucide-react"
import { TrackedTimer, TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectLogoIcon } from "@/components/Logos"
import { useTheme } from "@/components/ThemeProvider"

interface FocusModeViewProps {
  timers: TrackedTimer[]
  tasks: TaskItem[]
  onToggleTimer: (id: string) => void
  onResetTimer: (id: string) => void
  onToggleTask: (id: string) => void
  onClose: () => void
}

interface FocusSubtask {
  id: string
  text: string
  done: boolean
}

type FocusModeType = "stopwatch" | "pomodoro25" | "pomodoro50"
type AmbientSoundType = "none" | "binaural" | "whitenoise" | "rain"

export function FocusModeView({
  timers,
  tasks,
  onToggleTimer,
  onResetTimer,
  onToggleTask,
  onClose,
}: FocusModeViewProps) {
  const { toggleTheme } = useTheme()

  const runningTimer = timers.find((t) => t.isRunning)
  const defaultTimer = runningTimer || timers[0]
  const [selectedTimerId, setSelectedTimerId] = useState<string>(
    defaultTimer?.id || "timer-1"
  )

  const activeTimer =
    timers.find((t) => t.id === selectedTimerId) || defaultTimer

  const matchedTask = tasks.find(
    (t) =>
      t.title.toLowerCase() === activeTimer?.taskTitle.toLowerCase() ||
      t.project.toLowerCase() === activeTimer?.project.toLowerCase()
  )

  const [mode, setMode] = useState<FocusModeType>("stopwatch")
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState<number>(25 * 60)
  const [isTaskSwitcherOpen, setIsTaskSwitcherOpen] = useState(false)
  const [showWorkspaceTools, setShowWorkspaceTools] = useState(false)

  const [subtasks, setSubtasks] = useState<FocusSubtask[]>([
    { id: "sub-1", text: "Isolar requisitos principais e wireframes", done: true },
    { id: "sub-2", text: "Implementar layout limpo sem distrações", done: false },
    { id: "sub-3", text: "Validar atalhos e micro-interações", done: false },
  ])
  const [newSubtaskText, setNewSubtaskText] = useState("")

  const [focusNotes, setFocusNotes] = useState(
    "Anotações da sessão:\n- Concentração total na entrega atual\n- Sem alternância de abas até o término do bloco"
  )

  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none")
  const audioCtxRef = useRef<AudioContext | null>(null)
  const noiseNodeRef = useRef<AudioNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isTaskSwitcherOpen) {
          setIsTaskSwitcherOpen(false)
        } else {
          onClose()
        }
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsTaskSwitcherOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose, isTaskSwitcherOpen])

  useEffect(() => {
    if (mode === "stopwatch") return
    if (!activeTimer?.isRunning) return

    const interval = setInterval(() => {
      setPomodoroSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [mode, activeTimer?.isRunning])

  const playChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 1.2)
    } catch {
      // AudioContext unavailable
    }
  }

  useEffect(() => {
    if (ambientSound === "none") {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
      return
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioContextClass()
      audioCtxRef.current = ctx

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime)
      masterGain.connect(ctx.destination)
      gainNodeRef.current = masterGain

      if (ambientSound === "binaural") {
        const merger = ctx.createChannelMerger(2)
        const oscL = ctx.createOscillator()
        const oscR = ctx.createOscillator()
        oscL.type = "sine"
        oscL.frequency.setValueAtTime(200, ctx.currentTime)
        oscR.type = "sine"
        oscR.frequency.setValueAtTime(240, ctx.currentTime)

        const gainL = ctx.createGain()
        const gainR = ctx.createGain()
        gainL.gain.setValueAtTime(0.12, ctx.currentTime)
        gainR.gain.setValueAtTime(0.12, ctx.currentTime)

        oscL.connect(gainL)
        gainL.connect(merger, 0, 0)
        oscR.connect(gainR)
        gainR.connect(merger, 0, 1)

        merger.connect(masterGain)
        oscL.start()
        oscR.start()
        noiseNodeRef.current = merger
      } else {
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.969 * b2 + white * 0.153852
          b3 = 0.8665 * b3 + white * 0.3104856
          b4 = 0.55 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.016898
          output[i] =
            (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04
          b6 = white * 0.115926
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = "lowpass"
        filter.frequency.setValueAtTime(
          ambientSound === "rain" ? 800 : 1800,
          ctx.currentTime
        )

        whiteNoise.connect(filter)
        filter.connect(masterGain)
        whiteNoise.start()
        noiseNodeRef.current = whiteNoise
      }
    } catch {
      // Audio context error
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }
  }, [ambientSound])

  const formatSeconds = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600)
    const minutes = Math.floor((totalSecs % 3600) / 60)
    const seconds = totalSecs % 60
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`
  }

  const currentDisplayTime =
    mode === "stopwatch"
      ? formatSeconds(activeTimer ? activeTimer.secondsElapsed : 0)
      : formatSeconds(pomodoroSecondsLeft)

  const handleModeChange = (nextMode: string) => {
    const typed = nextMode as FocusModeType
    setMode(typed)
    if (typed === "pomodoro25") setPomodoroSecondsLeft(25 * 60)
    if (typed === "pomodoro50") setPomodoroSecondsLeft(50 * 60)
  }

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    )
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskText.trim()) return
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}`, text: newSubtaskText.trim(), done: false },
    ])
    setNewSubtaskText("")
  }

  const handleDeleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const isRunning = activeTimer?.isRunning || false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-y-auto"
    >
      {/* Top Bar: Calm, Minimal, Dual-Theme */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/kard_logo_light.svg"
            alt="Kard"
            width={108}
            height={36}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/kard_logo_dark.svg"
            alt="Kard"
            width={108}
            height={36}
            className="hidden h-8 w-auto dark:block"
          />
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
            Modo Foco
          </span>
        </div>

        {/* Center Task Switcher */}
        <div className="relative hidden md:block" ref={switcherRef}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTaskSwitcherOpen(!isTaskSwitcherOpen)}
            className="h-9 gap-2 rounded-xl bg-card px-3.5 text-xs font-medium"
          >
            <ProjectLogoIcon
              project={activeTimer?.project || "Google"}
              className="size-3.5 shrink-0"
            />
            <span className="font-semibold text-foreground">
              {activeTimer?.project}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="max-w-[200px] truncate text-muted-foreground">
              {activeTimer?.taskTitle}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>

          <AnimatePresence>
            {isTaskSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-border bg-card p-2 shadow-xl"
              >
                <p className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  Trocar tarefa em foco
                </p>
                <div className="space-y-1">
                  {timers.map((timer) => {
                    const isSelected = timer.id === activeTimer?.id
                    return (
                      <button
                        key={timer.id}
                        type="button"
                        onClick={() => {
                          setSelectedTimerId(timer.id)
                          setIsTaskSwitcherOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                          isSelected
                            ? "bg-primary-subtle text-primary font-semibold"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <ProjectLogoIcon
                            project={timer.project}
                            className="size-3.5 shrink-0"
                          />
                          <span className="truncate">{timer.taskTitle}</span>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {timer.project}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={ambientSound !== "none" ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              setAmbientSound((curr) =>
                curr === "none"
                  ? "binaural"
                  : curr === "binaural"
                  ? "rain"
                  : curr === "rain"
                  ? "whitenoise"
                  : "none"
              )
            }
            className="h-9 gap-1.5 rounded-xl bg-card px-3 text-xs font-medium"
            title="Alternar áudio de foco (40Hz / Chuva / Ruído Rosa)"
          >
            {ambientSound === "none" ? (
              <VolumeX className="size-3.5 text-muted-foreground" />
            ) : (
              <Volume2 className="size-3.5 text-primary" />
            )}
            <span className="hidden sm:inline">
              {ambientSound === "none"
                ? "Áudio off"
                : ambientSound === "binaural"
                ? "40Hz Gamma"
                : ambientSound === "rain"
                ? "Chuva"
                : "Ruído Rosa"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="size-9 rounded-xl bg-card"
            aria-label="Alternar tema claro/escuro"
          >
            <Sun className="hidden size-4 text-amber-400 dark:block" />
            <Moon className="block size-4 text-muted-foreground dark:hidden" />
          </Button>

          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-card px-3.5 text-xs font-semibold"
          >
            <Minimize2 className="size-3.5" />
            <span>Sair do Foco</span>
            <kbd className="hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </Button>
        </div>
      </header>

      {/* Main Focal Workspace: Single Active Task & Timer */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center text-center space-y-3">
          {/* Clean project identification: Logo + Name only */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ProjectLogoIcon
              project={activeTimer?.project || "Google"}
              className="size-4 shrink-0"
            />
            <span className="text-foreground">{activeTimer?.project || "Geral"}</span>
            {matchedTask?.priority && (
              <>
                <span>·</span>
                <span>Prioridade {matchedTask.priority}</span>
              </>
            )}
          </div>

          <h1 className="max-w-2xl text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {activeTimer?.taskTitle || "Sessão de Foco"}
          </h1>
        </div>

        {/* Mode Tabs (shadcn Tabs) */}
        <Tabs
          value={mode}
          onValueChange={handleModeChange}
          className="mb-6 items-center"
        >
          <TabsList>
            <TabsTrigger value="stopwatch" className="gap-1.5">
              <Clock className="size-3.5" />
              <span>Cronômetro</span>
            </TabsTrigger>
            <TabsTrigger value="pomodoro25" className="gap-1.5">
              <Brain className="size-3.5" />
              <span>Pomodoro 25m</span>
            </TabsTrigger>
            <TabsTrigger value="pomodoro50" className="gap-1.5">
              <Flame className="size-3.5" />
              <span>Sprint 50m</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Focal Timer Card */}
        <Card className="w-full max-w-xl p-8 sm:p-10 text-center">
          <div
            className={cn(
              "font-mono text-6xl font-black tabular-nums tracking-tight transition-colors duration-200 sm:text-8xl",
              isRunning ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {currentDisplayTime}
          </div>

          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {mode === "stopwatch"
              ? isRunning
                ? "Tempo em andamento"
                : "Cronômetro pausado"
              : isRunning
              ? "Tempo restante no bloco"
              : "Bloco pronto para iniciar"}
          </p>

          {/* Timer Controls */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (activeTimer) onResetTimer(activeTimer.id)
                if (mode !== "stopwatch") {
                  setPomodoroSecondsLeft(mode === "pomodoro25" ? 25 * 60 : 50 * 60)
                }
              }}
              className="size-12 rounded-2xl"
              title="Reiniciar tempo"
            >
              <RotateCcw className="size-4" />
            </Button>

            <Button
              type="button"
              variant={isRunning ? "secondary" : "default"}
              onClick={() => {
                if (activeTimer) onToggleTimer(activeTimer.id)
              }}
              className="h-12 min-w-40 gap-2 rounded-2xl px-6 text-sm font-bold shadow-xs"
            >
              {isRunning ? (
                <>
                  <Pause className="size-4 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Iniciar Foco</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (mode !== "stopwatch") {
                  setPomodoroSecondsLeft((prev) => prev + 5 * 60)
                }
              }}
              disabled={mode === "stopwatch"}
              className="size-12 rounded-2xl font-mono text-xs font-bold"
              title="Adicionar +5 minutos"
            >
              +5m
            </Button>
          </div>

          {/* Primary Task Completion Action */}
          {matchedTask && (
            <div className="mt-7 flex justify-center">
              <Button
                type="button"
                variant={matchedTask.completed ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  onToggleTask(matchedTask.id)
                  playChime()
                }}
                className={cn(
                  "h-9 gap-2 rounded-xl px-4 text-xs font-semibold",
                  matchedTask.completed && "text-success-foreground bg-success-subtle"
                )}
              >
                <CheckCircle2 className="size-4" />
                <span>
                  {matchedTask.completed
                    ? "Tarefa concluída"
                    : "Marcar tarefa como concluída"}
                </span>
              </Button>
            </div>
          )}
        </Card>

        {/* Quiet Optional Drawer for Subtasks & Scratchpad */}
        <div className="mt-8 w-full max-w-2xl">
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowWorkspaceTools((prev) => !prev)}
              className="gap-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ListTodo className="size-3.5" />
              <span>
                {showWorkspaceTools
                  ? "Ocultar notas e micro-passos"
                  : `Notas e micro-passos (${subtasks.filter((s) => s.done).length}/${subtasks.length})`}
              </span>
              {showWorkspaceTools ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showWorkspaceTools && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <ListTodo className="size-4 text-primary" />
                        <span>Micro-passos</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {subtasks.filter((s) => s.done).length}/{subtasks.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="group flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 transition-colors hover:bg-muted/70"
                        >
                          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-xs">
                            <Checkbox
                              checked={sub.done}
                              onCheckedChange={() => handleToggleSubtask(sub.id)}
                            />
                            <span
                              className={cn(
                                "truncate",
                                sub.done && "line-through text-muted-foreground"
                              )}
                            >
                              {sub.text}
                            </span>
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSubtask(sub.id)}
                            className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                            aria-label="Remover micro-passo"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddSubtask} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Adicionar micro-passo..."
                        value={newSubtaskText}
                        onChange={(e) => setNewSubtaskText(e.target.value)}
                        className="h-9 rounded-xl text-xs"
                      />
                      <Button type="submit" variant="outline" size="icon" className="size-9 shrink-0 rounded-xl">
                        <Plus className="size-3.5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <FileText className="size-4 text-primary" />
                        <span>Bloco de Notas</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Salvo localmente
                      </span>
                    </div>

                    <textarea
                      value={focusNotes}
                      onChange={(e) => setFocusNotes(e.target.value)}
                      placeholder="Anote ideias rápidas sem sair da sessão..."
                      className="min-h-[128px] flex-1 w-full resize-none rounded-2xl border border-border/80 bg-muted/30 p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  )
}
