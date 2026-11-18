import { createRemoteJWKSet, jwtVerify } from "jose"
import firebaseConfig from "../../firebase-applet-config.json"
import type { ProjectRole } from "@/lib/data"

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
)

export interface VerifiedFirebaseUser {
  uid: string
  email: string
  emailVerified: boolean
  idToken: string
}

export async function verifyFirebaseBearerToken(
  authHeader: string | null
): Promise<VerifiedFirebaseUser> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED_MISSING_TOKEN")
  }
  const idToken = authHeader.slice("Bearer ".length).trim()
  if (!idToken) {
    throw new Error("UNAUTHORIZED_EMPTY_TOKEN")
  }

  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${firebaseConfig.projectId}`,
    audience: firebaseConfig.projectId,
  })

  const uid = typeof payload.sub === "string" ? payload.sub : ""
  const email = typeof payload.email === "string" ? payload.email : ""
  const emailVerified = payload.email_verified === true

  if (!uid || !/^[a-zA-Z0-9_-]{1,128}$/.test(uid)) {
    throw new Error("UNAUTHORIZED_INVALID_UID")
  }
  if (!emailVerified) {
    throw new Error("FORBIDDEN_EMAIL_NOT_VERIFIED")
  }

  return { uid, email, emailVerified, idToken }
}

interface FirestoreDocResponse {
  fields?: Record<
    string,
    {
      stringValue?: string
      integerValue?: string
      booleanValue?: boolean
    }
  >
}

function getFirestoreDocUrl(docPath: string): string {
  const firestoreDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId
  const dbId = encodeURIComponent(firestoreDatabaseId || "(default)")
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    firebaseConfig.projectId
  )}/databases/${dbId}/documents/${docPath}`
}

async function fetchFirestoreDoc(
  idToken: string,
  docPath: string
): Promise<FirestoreDocResponse | null> {
  const res = await fetch(getFirestoreDocUrl(docPath), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    cache: "no-store",
  })

  if (res.status === 404) return null
  if (res.status === 403 || res.status === 401) {
    throw new Error("FORBIDDEN_FIRESTORE_ACCESS")
  }
  if (!res.ok) {
    throw new Error(`FIRESTORE_LOOKUP_FAILED_${res.status}`)
  }

  return (await res.json()) as FirestoreDocResponse
}

export async function getAuthoritativeProjectRole(
  idToken: string,
  projectId: string,
  uid: string
): Promise<ProjectRole | null> {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(projectId)) {
    return null
  }

  // 1. Authoritative member document under projects/{projectId}/members/{uid}
  const memberDoc = await fetchFirestoreDoc(
    idToken,
    `projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(uid)}`
  )

  const roleVal = memberDoc?.fields?.projectRole?.stringValue
  if (roleVal === "owner" || roleVal === "gestor" || roleVal === "colaborador") {
    return roleVal
  }

  // 2. Fallback check against project document ownerId
  const projectDoc = await fetchFirestoreDoc(
    idToken,
    `projects/${encodeURIComponent(projectId)}`
  )
  if (projectDoc?.fields?.ownerId?.stringValue === uid) {
    return "owner"
  }

  return null
}

export async function getProjectAssetUploader(
  idToken: string,
  projectId: string,
  assetId: string
): Promise<{ uploadedBy: string | null; r2Key: string | null } | null> {
  if (
    !/^[a-zA-Z0-9_-]{1,128}$/.test(projectId) ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(assetId)
  ) {
    return null
  }

  const assetDoc = await fetchFirestoreDoc(
    idToken,
    `projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}`
  )
  if (!assetDoc?.fields) return null

  return {
    uploadedBy: assetDoc.fields.uploadedBy?.stringValue || null,
    r2Key: assetDoc.fields.r2Key?.stringValue || null,
  }
}
