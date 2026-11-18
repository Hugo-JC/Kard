# Security Specification — Kard RBAC & Cloud Integration

## 1. Core Data Invariants
1. **Master Gate Membership**: Every subcollection under `/projects/{projectId}` (`/tasks`, `/notes`, `/deliverables`, `/assets`, `/automations`, `/members`) derives access strictly from `projects/{projectId}/members/{request.auth.uid}` via `exists()` / `get()`.
2. **RBAC Role Hierarchy**:
   - `owner`: Full project settings, archive/delete, role assignment (`gestor` / `colaborador`), deliverable publishing, R2 `cover`/`deliverable`/`internal` uploads & deletions.
   - `gestor`: Can invite/add `colaborador`, publish deliverables, upload `cover`/`deliverable`/`internal` R2 assets, delete project assets, manage tasks/notes. Cannot delete project or assign/remove `owner` or other `gestor`.
   - `colaborador`: Can read/create/update tasks, notes, and `internal` R2 uploads. Can delete ONLY assets they uploaded (`uploadedBy == request.auth.uid`). Cannot upload `cover`/`deliverable`, modify project settings/roles, or archive projects.
3. **PII Split Isolation**: Emails, subscription tier, and migration flags live strictly under `/users/{userId}/private/info` readable/writable ONLY by `request.auth.uid == userId`.
4. **Verified Auth & Temporal Integrity**: All writes require `request.auth.token.email_verified == true` and `request.time` for `createdAt`/`updatedAt`.
5. **Immutable Ownership**: `ownerId`, `projectId`, `createdBy`, `uploadedBy`, `createdAt` cannot be modified after creation.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: `PERMISSION_DENIED`)
1. Unauthenticated read on `/projects/proj-1`.
2. Unverified email (`email_verified: false`) attempting `create` on `/projects/proj-1`.
3. Non-member reading `/projects/proj-1/assets/asset-1`.
4. `colaborador` updating `/projects/proj-1/members/uid-2` to `projectRole: "owner"` (privilege escalation).
5. `colaborador` creating a `ProjectAsset` with `scope: "deliverable"` or `scope: "cover"`.
6. `colaborador` deleting an asset uploaded by another UID.
7. `gestor` attempting to delete `/projects/proj-1` or change `ownerId`.
8. Shadow-field injection (`{ isVerified: true, adminOverride: true }`) on `/projects/proj-1` update.
9. Client spoofing `createdAt` with a past timestamp instead of `request.time`.
10. Document ID poisoning (`/projects/aaa...200chars...` failing `isValidId`).
11. Blanket `list` scraping of `/projects` without `ownerId == request.auth.uid`.
12. Cross-user PII read on `/users/{otherUid}/private/info`.
