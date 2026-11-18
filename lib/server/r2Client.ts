import { S3Client } from "@aws-sdk/client-s3"
import type { ProjectAssetScope } from "@/lib/data"

export interface R2EnvConfig {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
}

export function getR2MissingVars(): string[] {
  const missing: string[] = []
  if (!process.env.R2_ACCOUNT_ID) missing.push("R2_ACCOUNT_ID")
  if (!process.env.R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID")
  if (!process.env.R2_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY")
  if (!process.env.R2_BUCKET_NAME) missing.push("R2_BUCKET_NAME")
  return missing
}

export function isR2Configured(): boolean {
  return getR2MissingVars().length === 0
}

export function getR2Config(): R2EnvConfig {
  const missing = getR2MissingVars()
  if (missing.length > 0) {
    throw new Error(`R2_NOT_CONFIGURED:${missing.join(",")}`)
  }
  return {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
  }
}

let cachedR2Client: S3Client | null = null

export function getR2S3Client(): { client: S3Client; bucketName: string } {
  const cfg = getR2Config()
  if (!cachedR2Client) {
    cachedR2Client = new S3Client({
      region: "auto",
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    })
  }
  return { client: cachedR2Client, bucketName: cfg.bucketName }
}

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "application/pdf",
  "text/",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.",
  "application/vnd.ms-",
  "application/octet-stream",
]

export function isAllowedMimeType(mimeType: string): boolean {
  const normalized = mimeType.toLowerCase().trim()
  if (!normalized || normalized.length > 150) return false
  return ALLOWED_MIME_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

export function getMaxSizeBytesForScope(scope: ProjectAssetScope): number {
  if (scope === "cover") return 5 * 1024 * 1024 // 5 MB
  return 25 * 1024 * 1024 // 25 MB
}

export function sanitizeFileName(rawName: string): string {
  const cleaned = rawName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return (cleaned || "arquivo").slice(0, 120)
}

export function buildR2ObjectKey(
  projectId: string,
  scope: ProjectAssetScope,
  assetId: string,
  fileName: string
): string {
  const safeName = sanitizeFileName(fileName)
  return `projects/${projectId}/${scope}/${assetId}-${safeName}`
}
