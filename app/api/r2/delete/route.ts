import { NextRequest, NextResponse } from "next/server"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import {
  getAuthoritativeProjectRole,
  getProjectAssetUploader,
  verifyFirebaseBearerToken,
} from "@/lib/server/firebaseVerify"
import { getR2S3Client, isR2Configured } from "@/lib/server/r2Client"

interface DeleteBody {
  projectId: string
  assetId: string
  r2Key?: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyFirebaseBearerToken(req.headers.get("authorization"))
    const body = (await req.json()) as DeleteBody

    if (
      !body?.projectId ||
      !body?.assetId ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(body.projectId) ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(body.assetId)
    ) {
      return NextResponse.json(
        { error: "INVALID_PARAMS", message: "Identificadores de projeto ou arquivo inválidos." },
        { status: 400 }
      )
    }

    const role = await getAuthoritativeProjectRole(user.idToken, body.projectId, user.uid)
    if (!role) {
      return NextResponse.json(
        { error: "FORBIDDEN_NOT_MEMBER", message: "Acesso negado ao projeto." },
        { status: 403 }
      )
    }

    const assetMeta = await getProjectAssetUploader(user.idToken, body.projectId, body.assetId)
    if (role === "colaborador" && assetMeta?.uploadedBy && assetMeta.uploadedBy !== user.uid) {
      return NextResponse.json(
        {
          error: "FORBIDDEN_NOT_UPLOADER",
          message: "Colaboradores só podem excluir arquivos que eles mesmos enviaram.",
        },
        { status: 403 }
      )
    }

    const targetKey = assetMeta?.r2Key || body.r2Key
    if (targetKey) {
      const expectedPrefix = `projects/${body.projectId}/`
      if (!targetKey.startsWith(expectedPrefix) || targetKey.includes("..")) {
        return NextResponse.json(
          { error: "INVALID_OBJECT_KEY", message: "Chave R2 inválida para este projeto." },
          { status: 403 }
        )
      }

      if (isR2Configured()) {
        const { client, bucketName } = getR2S3Client()
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: targetKey,
          })
        )
      }
    }

    return NextResponse.json({ deleted: true, role })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao remover objeto R2."
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}
