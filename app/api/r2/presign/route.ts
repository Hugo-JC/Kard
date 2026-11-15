import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { ProjectAssetScope } from "@/lib/data"
import { canUploadAssetScope } from "@/lib/rbac"
import {
  getAuthoritativeProjectRole,
  verifyFirebaseBearerToken,
} from "@/lib/server/firebaseVerify"
import {
  buildR2ObjectKey,
  getMaxSizeBytesForScope,
  getR2MissingVars,
  getR2S3Client,
  isAllowedMimeType,
  isR2Configured,
} from "@/lib/server/r2Client"

interface PresignBody {
  action: "upload" | "download"
  projectId: string
  scope?: ProjectAssetScope
  fileName?: string
  mimeType?: string
  sizeBytes?: number
  r2Key?: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyFirebaseBearerToken(req.headers.get("authorization"))
    const body = (await req.json()) as PresignBody

    if (!body || !body.projectId || !/^[a-zA-Z0-9_-]{1,128}$/.test(body.projectId)) {
      return NextResponse.json(
        { error: "INVALID_PROJECT_ID", message: "Identificador do projeto inválido." },
        { status: 400 }
      )
    }

    const role = await getAuthoritativeProjectRole(user.idToken, body.projectId, user.uid)
    if (!role) {
      return NextResponse.json(
        {
          error: "FORBIDDEN_NOT_MEMBER",
          message: "Você não possui vínculo ativo neste projeto no Firestore.",
        },
        { status: 403 }
      )
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error: "R2_NOT_CONFIGURED",
          message:
            "Credenciais do Cloudflare R2 ainda não configuradas no ambiente do servidor.",
          missingVars: getR2MissingVars(),
        },
        { status: 503 }
      )
    }

    const { client, bucketName } = getR2S3Client()

    if (body.action === "upload") {
      const scope: ProjectAssetScope = body.scope || "internal"
      if (scope !== "internal" && scope !== "deliverable" && scope !== "cover") {
        return NextResponse.json(
          { error: "INVALID_SCOPE", message: "Escopo de arquivo inválido." },
          { status: 400 }
        )
      }

      if (!canUploadAssetScope(role, scope)) {
        return NextResponse.json(
          {
            error: "FORBIDDEN_ROLE_SCOPE",
            message: `O cargo "${role}" não tem permissão para enviar arquivos com escopo "${scope}".`,
          },
          { status: 403 }
        )
      }

      const fileName = (body.fileName || "").trim()
      const mimeType = (body.mimeType || "application/octet-stream").trim()
      const sizeBytes = Number(body.sizeBytes || 0)

      if (!fileName || fileName.length > 255) {
        return NextResponse.json(
          { error: "INVALID_FILE_NAME", message: "Nome de arquivo inválido." },
          { status: 400 }
        )
      }

      if (!isAllowedMimeType(mimeType)) {
        return NextResponse.json(
          { error: "UNSUPPORTED_MIME_TYPE", message: "Tipo de arquivo não permitido." },
          { status: 400 }
        )
      }

      const maxBytes = getMaxSizeBytesForScope(scope)
      if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > maxBytes) {
        return NextResponse.json(
          {
            error: "FILE_TOO_LARGE",
            message: `Tamanho máximo permitido para este escopo é ${Math.round(
              maxBytes / (1024 * 1024)
            )} MB.`,
          },
          { status: 400 }
        )
      }

      const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const r2Key = buildR2ObjectKey(body.projectId, scope, assetId, fileName)

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
        ContentType: mimeType,
      })

      const expiresIn = 60
      const url = await getSignedUrl(client, command, { expiresIn })

      return NextResponse.json({
        url,
        r2Key,
        assetId,
        scope,
        role,
        expiresIn,
      })
    }

    if (body.action === "download") {
      const r2Key = (body.r2Key || "").trim()
      const expectedPrefix = `projects/${body.projectId}/`
      if (!r2Key.startsWith(expectedPrefix) || r2Key.includes("..")) {
        return NextResponse.json(
          { error: "INVALID_OBJECT_KEY", message: "Chave de objeto fora do projeto autorizado." },
          { status: 403 }
        )
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
      })

      const expiresIn = 300
      const url = await getSignedUrl(client, command, { expiresIn })

      return NextResponse.json({
        url,
        r2Key,
        role,
        expiresIn,
      })
    }

    return NextResponse.json(
      { error: "INVALID_ACTION", message: "Ação deve ser 'upload' ou 'download'." },
      { status: 400 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao assinar URL R2."
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}
