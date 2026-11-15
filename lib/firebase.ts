import { getApp, getApps, initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { doc, getDocFromServer, getFirestore } from "firebase/firestore"
import firebaseConfig from "../firebase-applet-config.json"

// Single Firebase App instance shared across Auth, Firestore, and Workspace OAuth
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
const firestoreDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app)

// Mandatory server connection probe on client initialization
let hasProbedConnection = false
export async function validateFirestoreConnection(): Promise<void> {
  if (typeof window === "undefined" || hasProbedConnection) return
  hasProbedConnection = true
  try {
    await getDocFromServer(doc(db, "test", "connection"))
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.")
    }
  }
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string
  operationType: OperationType
  path: string | null
  authInfo: {
    userId?: string | null
    email?: string | null
    emailVerified?: boolean | null
    isAnonymous?: boolean | null
    tenantId?: string | null
    providerInfo?: {
      providerId?: string | null
      email?: string | null
    }[]
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  }
  console.error("Firestore Error: ", JSON.stringify(errInfo))
  throw new Error(JSON.stringify(errInfo))
}

// Google Workspace scopes provisioned via OAuth setup
export const WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
] as const

// Strict in-memory cache ONLY for Google Workspace OAuth access token (never localStorage/sessionStorage)
let cachedWorkspaceAccessToken: string | null = null
const tokenListeners = new Set<(token: string | null) => void>()

function setCachedWorkspaceToken(token: string | null): void {
  cachedWorkspaceAccessToken = token
  tokenListeners.forEach((fn) => fn(token))
}

export function getWorkspaceAccessToken(): string | null {
  return cachedWorkspaceAccessToken
}

export function clearWorkspaceAccessToken(): void {
  setCachedWorkspaceToken(null)
}

export function subscribeWorkspaceToken(listener: (token: string | null) => void): () => void {
  tokenListeners.add(listener)
  return () => {
    tokenListeners.delete(listener)
  }
}

export function subscribeFirebaseAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      setCachedWorkspaceToken(null)
    }
    callback(user)
  })
}

export async function signInWithGoogleBasic(): Promise<User> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function connectGoogleWorkspaceScopes(): Promise<{
  user: User
  accessToken: string
}> {
  const provider = new GoogleAuthProvider()
  WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope))
  provider.setCustomParameters({ prompt: "consent" })

  const result = auth.currentUser
    ? await reauthenticateWithPopup(auth.currentUser, provider)
    : await signInWithPopup(auth, provider)

  const credential = GoogleAuthProvider.credentialFromResult(result)
  if (!credential?.accessToken) {
    throw new Error("Não foi possível obter o token de acesso do Google Workspace.")
  }

  setCachedWorkspaceToken(credential.accessToken)
  return { user: result.user, accessToken: credential.accessToken }
}

export async function signOutFirebase(): Promise<void> {
  setCachedWorkspaceToken(null)
  await signOut(auth)
}
