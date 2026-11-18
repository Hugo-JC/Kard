import type { Member, Project, ProjectAssetScope, ProjectDocument, ProjectRole } from "@/lib/data"

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  owner: "Owner do projeto",
  gestor: "Gestor",
  colaborador: "Colaborador",
}

export const PROJECT_ROLE_DESCRIPTIONS: Record<ProjectRole, string> = {
  owner:
    "Controle total: configurações, arquivamento/exclusão do projeto, atribuição de cargos, R2 completo e Portal do Cliente.",
  gestor:
    "Operação de entregas: convida colaboradores, publica entregáveis, envia capas/entregáveis no R2 e remove arquivos do projeto.",
  colaborador:
    "Execução diária: gerencia tarefas, notas Markdown, anexos internos no R2 e remove apenas os arquivos que enviou.",
}

export function normalizeProjectRole(raw?: string | null): ProjectRole {
  if (!raw) return "colaborador"
  const lower = raw.toLowerCase()
  if (lower === "owner" || lower.includes("owner") || lower.includes("manager (you)")) {
    return "owner"
  }
  if (lower === "gestor" || lower.includes("gestor") || lower.includes("lead") || lower.includes("architect")) {
    return "gestor"
  }
  return "colaborador"
}

export function resolveUserProjectRole(
  project: Project,
  userUid?: string | null,
  userEmail?: string | null
): ProjectRole {
  // Guest local-first mode defaults to owner so user can test all features offline
  if (!userUid) return "owner"
  if (project.ownerId && project.ownerId === userUid) return "owner"

  const member = project.members.find(
    (m) =>
      (m.uid && m.uid === userUid) ||
      (userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase())
  )
  if (!member) return "colaborador"
  return member.projectRole || normalizeProjectRole(member.role)
}

export function getMemberProjectRole(member: Member, projectOwnerId?: string): ProjectRole {
  if (member.uid && projectOwnerId && member.uid === projectOwnerId) return "owner"
  if (member.projectRole) return member.projectRole
  return normalizeProjectRole(member.role)
}

export function canManageProjectSettings(role: ProjectRole): boolean {
  return role === "owner"
}

export function canArchiveOrDeleteProject(role: ProjectRole): boolean {
  return role === "owner"
}

export function canManageRoles(role: ProjectRole): boolean {
  return role === "owner"
}

export function canInviteRole(actorRole: ProjectRole, targetRole: ProjectRole): boolean {
  if (actorRole === "owner") return targetRole === "gestor" || targetRole === "colaborador"
  if (actorRole === "gestor") return targetRole === "colaborador"
  return false
}

export function canRemoveMember(actorRole: ProjectRole, targetRole: ProjectRole): boolean {
  if (actorRole === "owner") return targetRole !== "owner"
  if (actorRole === "gestor") return targetRole === "colaborador"
  return false
}

export function canPublishDeliverable(role: ProjectRole): boolean {
  return role === "owner" || role === "gestor"
}

export function canUploadAssetScope(role: ProjectRole, scope: ProjectAssetScope): boolean {
  if (role === "owner" || role === "gestor") return true
  return scope === "internal"
}

export function canDeleteProjectAsset(
  role: ProjectRole,
  asset: Pick<ProjectDocument, "uploadedBy">,
  currentUid?: string | null
): boolean {
  if (role === "owner" || role === "gestor") return true
  if (!currentUid) return true
  return asset.uploadedBy === currentUid
}

export const RBAC_PERMISSION_MATRIX: {
  capability: string
  owner: string
  gestor: string
  colaborador: string
}[] = [
  {
    capability: "Configurações, arquivar ou excluir projeto",
    owner: "Permitido",
    gestor: "Bloqueado",
    colaborador: "Bloqueado",
  },
  {
    capability: "Alterar cargos (Gestor ↔ Colaborador)",
    owner: "Permitido",
    gestor: "Bloqueado",
    colaborador: "Bloqueado",
  },
  {
    capability: "Convidar novos membros",
    owner: "Gestor e Colaborador",
    gestor: "Apenas Colaborador",
    colaborador: "Bloqueado",
  },
  {
    capability: "Upload R2: Capa e Entregáveis (deliverable)",
    owner: "Permitido",
    gestor: "Permitido",
    colaborador: "Bloqueado",
  },
  {
    capability: "Upload R2: Anexos internos de tarefa/projeto",
    owner: "Permitido",
    gestor: "Permitido",
    colaborador: "Permitido",
  },
  {
    capability: "Download seguro via URL pré-assinada R2",
    owner: "Todos os arquivos",
    gestor: "Todos os arquivos",
    colaborador: "Todos do projeto",
  },
  {
    capability: "Excluir objetos do R2 e metadados",
    owner: "Qualquer arquivo",
    gestor: "Arquivos do projeto",
    colaborador: "Somente os próprios",
  },
  {
    capability: "Publicar entregáveis no Portal do Cliente",
    owner: "Permitido",
    gestor: "Permitido",
    colaborador: "Somente leitura",
  },
  {
    capability: "Google Calendar & Google Drive (OAuth pessoal)",
    owner: "Ler/Criar & Vincular",
    gestor: "Ler/Criar & Vincular",
    colaborador: "Ler/Criar & Vincular",
  },
]
