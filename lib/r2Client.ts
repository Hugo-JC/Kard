import type { ProjectAssetScope } from "@/lib/data"
import { auth } from "@/lib/firebase"

export interface R2PresignedUploadResponse {
  url: string
  r2Key: string
  assetId: string
  scope: ProjectAssetScope
  role: "owner" | "gestor" | "colaborador"
  expiresIn: number
}

export interface R2UploadResult {
  assetId: string
  r2Key: string
  scope: ProjectAssetScope
  fileName: string
  mimeType: string
  sizeBytes: number
}

export async function checkR2ServerStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/r2/status", { cache: "no-store" })
    if (!res.ok) return false
    const data = (await res.json()) as { configured?: boolean }
    return Boolean(data.configured)
  } catch {
    return false
  }
}

export async function uploadFileToR2(
  projectId: string,
  file: File,
  scope: ProjectAssetScope,
  onProgress?: (percent: number) => void
): Promise<R2UploadResult> {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Faça login com o Google para enviar arquivos para o Cloudflare R2.")
  }

  const idToken = await user.getIdToken()
  const mimeType = file.type || "application/octet-stream"

  const presignRes = await fetch("/api/r2/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      action: "upload",
      projectId,
      scope,
      fileName: file.name,
      mimeType,
      sizeBytes: file.size,
    }),
  })

  const presignPayload = (await presignRes.json()) as Partial<R2PresignedUploadResponse> & {
    error?: string
    message?: string
  }

  if (!presignRes.ok || !presignPayload.url || !presignPayload.r2Key || !presignPayload.assetId) {
    throw new Error(
      presignPayload.message || presignPayload.error || "Falha ao autorizar upload no R2."
    )
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", presignPayload.url!, true)
    xhr.setRequestHeader("Content-Type", mimeType)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
      } else {
        reject(new Error(`Falha no upload direto para o Cloudflare R2 (HTTP ${xhr.status}).`))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Erro de rede ao enviar arquivo para o Cloudflare R2."))
    }

    xhr.send(file)
  })

  return {
    assetId: presignPayload.assetId,
    r2Key: presignPayload.r2Key,
    scope,
    fileName: file.name,
    mimeType,
    sizeBytes: file.size,
  }
}

export async function getR2SignedDownloadUrl(
  projectId: string,
  r2Key: string
): Promise<string> {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Autenticação necessária para baixar arquivos privados do R2.")
  }

  const idToken = await user.getIdToken()
  const res = await fetch("/api/r2/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      action: "download",
      projectId,
      r2Key,
    }),
  })

  const payload = (await res.json()) as {
    url?: string
    error?: string
    message?: string
  }

  if (!res.ok || !payload.url) {
    throw new Error(payload.message || payload.error || "Não foi possível gerar link de download R2.")
  }

  return payload.url
}

export async function deleteR2Object(
  projectId: string,
  assetId: string,
  r2Key?: string
): Promise<void> {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Autenticação necessária para excluir arquivos.")
  }

  const idToken = await user.getIdToken()
  const res = await fetch("/api/r2/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      projectId,
      assetId,
      r2Key,
    }),
  })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as {
      error?: string
      message?: string
    }
    throw new Error(payload.message || payload.error || "Permissão negada ao excluir arquivo no R2.")
  }
}
