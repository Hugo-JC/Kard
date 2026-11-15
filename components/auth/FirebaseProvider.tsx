"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import {
  clearWorkspaceAccessToken,
  connectGoogleWorkspaceScopes,
  getWorkspaceAccessToken,
  signInWithGoogleBasic,
  signOutFirebase,
  subscribeFirebaseAuth,
  subscribeWorkspaceToken,
  validateFirestoreConnection,
} from "@/lib/firebase"
import {
  checkPendingLocalMigration,
  ensureUserProfileDocs,
  markMigrationDoneForUid,
  migrateLocalWorkspaceToFirestore,
  type PendingMigrationSummary,
} from "@/lib/firestoreSync"
import { checkR2ServerStatus } from "@/lib/r2Client"
import { getWorkspaceSnapshot, updateWorkspaceStore } from "@/lib/storage"
import { LocalMigrationModal } from "@/components/auth/LocalMigrationModal"

interface FirebaseContextValue {
  user: User | null
  authReady: boolean
  isSigningIn: boolean
  workspaceAccessToken: string | null
  hasWorkspaceConnected: boolean
  isConnectingWorkspace: boolean
  r2Configured: boolean
  authError: string | null
  signInGoogle: () => Promise<void>
  connectWorkspace: () => Promise<string | null>
  disconnectWorkspace: () => void
  signOut: () => Promise<void>
  clearAuthError: () => void
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isConnectingWorkspace, setIsConnectingWorkspace] = useState(false)
  const [workspaceAccessToken, setWorkspaceAccessToken] = useState<string | null>(() =>
    getWorkspaceAccessToken()
  )
  const [r2Configured, setR2Configured] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [pendingMigration, setPendingMigration] = useState<PendingMigrationSummary | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)

  useEffect(() => {
    validateFirestoreConnection()
    checkR2ServerStatus().then(setR2Configured).catch(() => setR2Configured(false))

    const unsubToken = subscribeWorkspaceToken((token) => {
      setWorkspaceAccessToken(token)
    })

    const unsubAuth = subscribeFirebaseAuth(async (firebaseUser) => {
      setUser(firebaseUser)
      setAuthReady(true)

      if (firebaseUser) {
        try {
          const profileInfo = await ensureUserProfileDocs(firebaseUser)
          updateWorkspaceStore((prev) => ({
            ...prev,
            userTier: profileInfo.userTier,
            briefingCollapsed: profileInfo.briefingCollapsed,
            userStatus: profileInfo.userStatus,
            userStatusNote: profileInfo.userStatusNote,
          }))

          const summary = await checkPendingLocalMigration(
            firebaseUser.uid,
            getWorkspaceSnapshot()
          )
          if (summary) {
            setPendingMigration(summary)
          }
        } catch (err) {
          console.error("Failed to initialize user Firestore state:", err)
        }
      } else {
        setPendingMigration(null)
      }
    })

    return () => {
      unsubToken()
      unsubAuth()
    }
  }, [])

  const signInGoogle = async () => {
    setAuthError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogleBasic()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.includes("popup-closed")
            ? "Login cancelado antes de concluir."
            : err.message
          : "Falha ao autenticar com o Google."
      setAuthError(message)
    } finally {
      setIsSigningIn(false)
    }
  }

  const connectWorkspace = async (): Promise<string | null> => {
    setAuthError(null)
    setIsConnectingWorkspace(true)
    try {
      const { accessToken } = await connectGoogleWorkspaceScopes()
      setWorkspaceAccessToken(accessToken)
      return accessToken
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.includes("popup-closed")
            ? "Conexão com Google Workspace cancelada."
            : err.message
          : "Não foi possível conectar ao Google Calendar e Drive."
      setAuthError(message)
      return null
    } finally {
      setIsConnectingWorkspace(false)
    }
  }

  const disconnectWorkspace = () => {
    clearWorkspaceAccessToken()
  }

  const handleSignOut = async () => {
    setAuthError(null)
    await signOutFirebase()
    setPendingMigration(null)
  }

  const handleConfirmMigration = async () => {
    if (!user) return
    setIsMigrating(true)
    try {
      await migrateLocalWorkspaceToFirestore(user, getWorkspaceSnapshot())
      setPendingMigration(null)
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Erro ao migrar rascunho local para o Firestore."
      )
    } finally {
      setIsMigrating(false)
    }
  }

  const handleSkipMigration = () => {
    if (user) {
      markMigrationDoneForUid(user.uid)
    }
    updateWorkspaceStore((prev) => ({
      ...prev,
      projects: [],
      tasks: [],
      calendarEvents: [],
      automationRules: [],
      automationLogs: [],
    }))
    setPendingMigration(null)
  }

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isSigningIn,
        workspaceAccessToken,
        hasWorkspaceConnected: Boolean(workspaceAccessToken),
        isConnectingWorkspace,
        r2Configured,
        authError,
        signInGoogle,
        connectWorkspace,
        disconnectWorkspace,
        signOut: handleSignOut,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}

      <LocalMigrationModal
        open={Boolean(pendingMigration && user)}
        summary={pendingMigration}
        userEmail={user?.email || ""}
        isMigrating={isMigrating}
        onConfirm={handleConfirmMigration}
        onSkip={handleSkipMigration}
      />
    </FirebaseContext.Provider>
  )
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext)
  if (!ctx) {
    throw new Error("useFirebase must be used inside FirebaseProvider")
  }
  return ctx
}
