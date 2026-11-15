"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Search, Link2, ExternalLink, FileText, RefreshCw, AlertCircle } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProjectAssetScope } from "@/lib/data"

export interface DriveFileItem {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  iconLink?: string
  size?: string
  modifiedTime?: string
}

interface DriveLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  allowedScope: ProjectAssetScope
  workspaceAccessToken: string | null
  onConnectWorkspace: () => Promise<string | null>
  onSelectDriveFile: (file: DriveFileItem, scope: ProjectAssetScope) => void
}

function formatDriveBytes(sizeStr?: string): string {
  const bytes = Number(sizeStr || 0)
  if (!bytes) return "Drive"
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

export function DriveLinkModal({
  open,
  onOpenChange,
  projectName,
  allowedScope,
  workspaceAccessToken,
  onConnectWorkspace,
  onSelectDriveFile,
}: DriveLinkModalProps) {
  const [query, setQuery] = useState("")
  const [files, setFiles] = useState<DriveFileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchDriveFiles = useCallback(
    async (token: string, searchText: string) => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const params = new URLSearchParams()
        if (searchText.trim()) params.set("q", searchText.trim())
        const res = await fetch(`/api/workspace/drive?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        const data = (await res.json()) as {
          files?: DriveFileItem[]
          error?: { message?: string } | string
        }
        if (!res.ok) {
          const msg =
            typeof data.error === "object"
              ? data.error?.message
              : typeof data.error === "string"
              ? data.error
              : "Falha ao listar arquivos do Google Drive."
          throw new Error(msg)
        }
        setFiles(Array.isArray(data.files) ? data.files : [])
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Erro ao acessar o Google Drive.")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!open || !workspaceAccessToken) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (!cancelled) {
        void fetchDriveFiles(workspaceAccessToken, "")
      }
    })
    return () => {
      cancelled = true
    }
  }, [open, workspaceAccessToken, fetchDriveFiles])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    let token = workspaceAccessToken
    if (!token) {
      token = await onConnectWorkspace()
    }
    if (!token) return
    await fetchDriveFiles(token, query)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl p-6 sm:p-7">
      <div className="space-y-5">
        <div className="flex items-start gap-3 pr-8">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
            <Link2 className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Vincular arquivo do Google Drive
            </h3>
            <p className="text-xs text-muted-foreground">
              Projeto: <strong className="text-foreground">{projectName}</strong> · Apenas referência segura (sem duplicar arquivos no Cloudflare R2).
            </p>
          </div>
        </div>

        {!workspaceAccessToken ? (
          <div className="rounded-2xl border border-border bg-muted/35 p-6 text-center space-y-3">
            <p className="text-sm font-bold text-foreground">
              Conecte o Google Drive para listar seus documentos
            </p>
            <p className="mx-auto max-w-sm text-xs text-muted-foreground leading-relaxed">
              O token OAuth permanece exclusivamente na memória do navegador durante esta sessão.
            </p>
            <Button
              type="button"
              onClick={async () => {
                const token = await onConnectWorkspace()
                if (token) {
                  await fetchDriveFiles(token, query)
                }
              }}
              className="h-10 rounded-xl px-5 text-xs font-semibold"
            >
              Conectar Google Drive
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome no seu Google Drive..."
                  className="h-10 rounded-xl pl-9 text-xs"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={loading}
                className="h-10 gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Buscar</span>
              </Button>
            </form>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger-subtle p-3 text-xs text-danger-foreground">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  Carregando arquivos recentes do Google Drive...
                </div>
              ) : files.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
                  Nenhum arquivo encontrado com esse filtro.
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-primary">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {file.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {formatDriveBytes(file.size)} · Google Drive
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Abrir no Google Drive"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          onSelectDriveFile(file, allowedScope)
                          onOpenChange(false)
                        }}
                        className="h-8 rounded-xl px-3 text-xs font-semibold"
                      >
                        Vincular
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}
