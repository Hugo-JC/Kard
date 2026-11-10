"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Brain,
  ShieldAlert,
} from "lucide-react"
import { TrackedTimer, TaskItem } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProjectLogoIcon } from "@/components/Logos"

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
  // Determine active timer
  const runningTimer = timers.find((t) => t.isRunning)
  const defaultTimer = runningTimer || timers[0]
  const [selectedTimerId, setSelectedTimerId] = useState<string>(
    defaultTimer?.id || "timer-1"
  )

  const activeTimer =
    timers.find((t) => t.id === selectedTimerId) || defaultTimer

  // Match corresponding task if any
  const matchedTask = tasks.find(
    (t) =>
      t.title.toLowerCase() === activeTimer?.taskTitle.toLowerCase() ||
      t.project.toLowerCase() === activeTimer?.project.toLowerCase()
  )

  // Timer mode state
  const [mode, setMode] = useState<FocusModeType>("stopwatch")
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState<number>(25 * 60)
  const [isTaskSwitcherOpen, setIsTaskSwitcherOpen] = useState(false)

  // Focus Checklist State
  const [subtasks, setSubtasks] = useState<FocusSubtask[]>([
    { id: "sub-1", text: "Isolar requisitos principais e wireframes", done: true },
    { id: "sub-2", text: "Implementar layout de alta densidade sem distrações", done: false },
    { id: "sub-3", text: "Testar atalhos de teclado e micro-interações", done: false },
  ])
  const [newSubtaskText, setNewSubtaskText] = useState("")

  // Focus Notes / Scratchpad
  const [focusNotes, setFocusNotes] = useState(
    "Anotações da sessão:\n- Concentração total na entrega atual\n- Sem alternância de abas até o término do bloco"
  )

  // Ambient Sound State (synthesized via Web Audio API)
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none")
  const audioCtxRef = useRef<AudioContext | null>(null)
  const noiseNodeRef = useRef<AudioNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Keyboard shortcut listener (Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Pomodoro countdown effect
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
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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

  // Handle ambient sound synthesis
  useEffect(() => {
    if (ambientSound === "none") {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
      return
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
      } else if (ambientSound === "whitenoise" || ambientSound === "rain") {
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          b3 = 0.86650 * b3 + white * 0.3104856
          b4 = 0.55000 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.0168980
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04
          b6 = white * 0.115926
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = "lowpass"
        filter.frequency.setValueAtTime(ambientSound === "rain" ? 800 : 1800, ctx.currentTime)

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
      return {
        main: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
        unit: "h:m:s",
      }
    }
    return {
      main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      unit: "m:s",
    }
  }

  const currentDisplayTime =
    mode === "stopwatch"
      ? formatSeconds(activeTimer ? activeTimer.secondsElapsed : 0)
      : formatSeconds(pomodoroSecondsLeft)

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    )
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskText.trim()) return
    const newSub: FocusSubtask = {
      id: `sub-${Date.now()}`,
      text: newSubtaskText.trim(),
      done: false,
    }
    setSubtasks((prev) => [...prev, newSub])
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
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto"
    >
      {/* 1. TOP HEADER: Clean Zen Bar with plenty of breathing room */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black tracking-tight text-white text-base sm:text-lg">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs font-black shadow-2xs">
              K
            </span>
            <span>KARD</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", isRunning ? "block" : "hidden")} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>MODO FOCO ATIVO</span>
          </div>
        </div>

        {/* Center: Quick Active Task Switcher */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setIsTaskSwitcherOpen(!isTaskSwitcherOpen)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-1.5 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <ProjectLogoIcon project={activeTimer?.project || "Google"} className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-white">{activeTimer?.project}:</span>
            <span className="max-w-[200px] truncate">{activeTimer?.taskTitle}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {isTaskSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 divide-y divide-slate-800"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mudar Tarefa Ativa
                </div>
                <div className="space-y-1 pt-1.5">
                  {timers.map((timer) => (
                    <button
                      key={timer.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimerId(timer.id)
                        setIsTaskSwitcherOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer",
                        timer.id === activeTimer?.id
                          ? "bg-primary text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ProjectLogoIcon project={timer.project} className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{timer.taskTitle}</span>
                      </div>
                      <span className="text-[10px] opacity-70 ml-2 font-mono shrink-0">
                        {timer.project}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Ambient Sound Controls & Exit */}
        <div className="flex items-center gap-2.5">
          {/* Ambient Sound Switcher */}
          <Button
            type="button"
            variant="outline"
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
            className={cn(
              "h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white",
              ambientSound !== "none" && "border-primary/50 text-primary bg-primary/10"
            )}
            title="Alternar áudio de foco (Binaural 40Hz / Chuva / Ruído Rosa)"
          >
            {ambientSound === "none" ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
            )}
            <span className="text-[11px] hidden sm:inline">
              {ambientSound === "none"
                ? "Áudio off"
                : ambientSound === "binaural"
                ? "40Hz Gamma"
                : ambientSound === "rain"
                ? "Chuva Suave"
                : "Ruído Rosa"}
            </span>
          </Button>

          {/* Exit Focus Mode Button */}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-semibold"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Sair do Foco</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono">
              ESC
            </kbd>
          </Button>
        </div>
      </header>

      {/* 2. MAIN ZEN WORKSPACE: Centered Task & Huge Chronometer */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 max-w-4xl mx-auto w-full">
        {/* Active Task Badge & Title */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-2xs">
            <ProjectLogoIcon project={activeTimer?.project || "Google"} className="w-3.5 h-3.5 shrink-0" />
            <span>{activeTimer?.project || "Geral"}</span>
            {matchedTask?.priority && (
              <>
                <span className="text-slate-700">·</span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                    matchedTask.priority === "High"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  )}
                >
                  {matchedTask.priority}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            {activeTimer?.taskTitle || "Sessão de Foco Livre"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400">
            Elimine distrações, foque em um único objetivo por vez até o bloco terminar.
          </p>
        </div>

        {/* Mode Selector Tabs using shadcn Buttons */}
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-8">
          <Button
            type="button"
            variant={mode === "stopwatch" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("stopwatch")}
            className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Cronômetro</span>
          </Button>

          <Button
            type="button"
            variant={mode === "pomodoro25" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setMode("pomodoro25")
              setPomodoroSecondsLeft(25 * 60)
            }}
            className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Pomodoro (25m)</span>
          </Button>

          <Button
            type="button"
            variant={mode === "pomodoro50" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setMode("pomodoro50")
              setPomodoroSecondsLeft(50 * 60)
            }}
            className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sprint (50m)</span>
          </Button>
        </div>

        {/* GIANT CHRONOMETER / COUNTDOWN (Pure Monospace, Zero Slop) */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div
            className={cn(
              "font-mono font-black tabular-nums tracking-tighter text-7xl sm:text-8xl md:text-9xl transition-colors duration-200",
              isRunning ? "text-white" : "text-slate-400"
            )}
          >
            {currentDisplayTime.main}
          </div>

          <div className="text-xs uppercase font-mono tracking-widest text-slate-500 mt-2">
            {mode === "stopwatch" ? "Tempo decorrido" : "Tempo restante no bloco"}
          </div>

          {/* Controls Bar using shadcn Buttons */}
          <div className="flex items-center gap-3.5 mt-8">
            {/* Reset */}
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
              className="size-12 rounded-2xl bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              title="Reiniciar tempo"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            {/* Play/Pause Button (Giant Main CTA) */}
            <Button
              type="button"
              variant="default"
              onClick={() => {
                if (activeTimer) onToggleTimer(activeTimer.id)
              }}
              className={cn(
                "h-14 w-36 sm:w-44 rounded-2xl text-base font-bold shadow-md gap-2 transition-all cursor-pointer",
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  : "bg-primary hover:bg-blue-600 text-white"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  <span>Iniciar</span>
                </>
              )}
            </Button>

            {/* Add +5 min */}
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
              className={cn(
                "size-12 rounded-2xl bg-slate-900 border-slate-800 text-xs font-bold font-mono text-slate-300 hover:bg-slate-800 hover:text-white",
                mode === "stopwatch" && "opacity-30 cursor-not-allowed"
              )}
              title="Adicionar +5 minutos"
            >
              +5m
            </Button>
          </div>
        </div>

        {/* 3. SUBTASKS & SCRATCHPAD ACCORDION / BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
          {/* Subtasks Checklist */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <ListTodo className="w-4 h-4 text-primary" />
                <span>Micro-passos da Sessão</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {subtasks.filter((s) => s.done).length}/{subtasks.length} concluídos
              </span>
            </div>

            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/50 transition-colors group"
                >
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={sub.done}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-0 focus:ring-offset-0 size-4"
                    />
                    <span
                      className={cn(
                        "truncate",
                        sub.done && "line-through text-slate-500"
                      )}
                    >
                      {sub.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="+ Adicionar sub-tarefa rápida..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8 bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs px-2.5 cursor-pointer border-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Quick Scratchpad / Session Notes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Bloco de Notas da Sessão</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auto-salvo
              </span>
            </div>

            <textarea
              value={focusNotes}
              onChange={(e) => setFocusNotes(e.target.value)}
              placeholder="Despeje pensamentos rápidos, ideias ou comandos aqui sem sair do foco..."
              className="mt-3 flex-1 w-full min-h-[100px] resize-none rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-700 font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* 4. Complete Task Action using shadcn Button */}
        {matchedTask && (
          <div className="mt-8 flex items-center justify-center">
            <Button
              type="button"
              variant={matchedTask.completed ? "default" : "outline"}
              onClick={() => {
                onToggleTask(matchedTask.id)
                playChime()
              }}
              className={cn(
                "h-10 px-5 rounded-2xl text-xs font-bold gap-2 cursor-pointer shadow-2xs",
                matchedTask.completed
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
              )}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {matchedTask.completed
                  ? "Tarefa Concluída ✓"
                  : "Marcar Tarefa como Concluída"}
              </span>
            </Button>
          </div>
        )}
      </main>

      {/* 5. MINIMAL FOOTER: Ambient stats & zen status */}
      <footer className="flex items-center justify-between px-6 py-3 border-t border-slate-900 bg-slate-950 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
          <span>Notificações bloqueadas durante o Modo Foco</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Hoje: <strong className="text-slate-300 font-mono">1h 45m focado</strong></span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:flex items-center gap-1 text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            4 dias seguidos
          </span>
        </div>
      </footer>
    </motion.div>
  )
}
