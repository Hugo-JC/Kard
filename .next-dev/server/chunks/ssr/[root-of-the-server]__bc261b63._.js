module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/components/ThemeProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const STORAGE_KEY = "kard-theme";
function subscribe(callback) {
    window.addEventListener("storage", callback);
    window.addEventListener("kard-theme-change", callback);
    return ()=>{
        window.removeEventListener("storage", callback);
        window.removeEventListener("kard-theme-change", callback);
    };
}
function getSnapshot() {
    try {
        return localStorage.getItem(STORAGE_KEY) || "light";
    } catch  {
        return "light";
    }
}
function getServerSnapshot() {
    return "light";
}
function subscribeSystemDark(callback) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", callback);
    return ()=>mediaQuery.removeEventListener("change", callback);
}
function getSystemDarkSnapshot() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function getSystemDarkServerSnapshot() {
    return false;
}
function ThemeProvider({ children, defaultTheme = "light" }) {
    const storedTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, getSnapshot, getServerSnapshot);
    const theme = storedTheme || defaultTheme;
    const systemDark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeSystemDark, getSystemDarkSnapshot, getSystemDarkServerSnapshot);
    const resolvedTheme = theme === "dark" || theme === "system" && systemDark ? "dark" : "light";
    // Synchronize the DOM element class when resolvedTheme changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const root = document.documentElement;
        if (resolvedTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [
        resolvedTheme
    ]);
    const setTheme = (newTheme)=>{
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
            window.dispatchEvent(new Event("kard-theme-change"));
        } catch  {
        // ignore
        }
    };
    const toggleTheme = ()=>{
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            theme,
            resolvedTheme,
            setTheme,
            toggleTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ThemeProvider.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
function useTheme() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/firebase-applet-config.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"projectId\":\"gen-lang-client-0068061251\",\"appId\":\"1:534134493660:web:a1f8cf3fbcfffe94903f19\",\"apiKey\":\"AIzaSyDjwqpUUaY30Tb17Aw5Zxn-FmjSDlCArt4\",\"authDomain\":\"gen-lang-client-0068061251.firebaseapp.com\",\"firestoreDatabaseId\":\"ai-studio-kardtaskproducti-09ac3fae-a9c5-4692-b98e-dfd017dfb866\",\"storageBucket\":\"gen-lang-client-0068061251.firebasestorage.app\",\"messagingSenderId\":\"534134493660\",\"measurementId\":\"\",\"oAuthClientId\":\"534134493660-bq7dic896e12o0hv7e0e471a3fng87to.apps.googleusercontent.com\",\"recaptchaSiteKey\":\"\"}"));}),
"[project]/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OperationType",
    ()=>OperationType,
    "WORKSPACE_SCOPES",
    ()=>WORKSPACE_SCOPES,
    "auth",
    ()=>auth,
    "clearWorkspaceAccessToken",
    ()=>clearWorkspaceAccessToken,
    "connectGoogleWorkspaceScopes",
    ()=>connectGoogleWorkspaceScopes,
    "db",
    ()=>db,
    "getWorkspaceAccessToken",
    ()=>getWorkspaceAccessToken,
    "handleFirestoreError",
    ()=>handleFirestoreError,
    "signInWithGoogleBasic",
    ()=>signInWithGoogleBasic,
    "signOutFirebase",
    ()=>signOutFirebase,
    "subscribeFirebaseAuth",
    ()=>subscribeFirebaseAuth,
    "subscribeWorkspaceToken",
    ()=>subscribeWorkspaceToken,
    "validateFirestoreConnection",
    ()=>validateFirestoreConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$firebase$2d$applet$2d$config$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/firebase-applet-config.json (json)");
;
;
;
;
// Single Firebase App instance shared across Auth, Firestore, and Workspace OAuth
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])().length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApp"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(__TURBOPACK__imported__module__$5b$project$5d2f$firebase$2d$applet$2d$config$2e$json__$28$json$29$__["default"]);
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app);
const firestoreDatabaseId = __TURBOPACK__imported__module__$5b$project$5d2f$firebase$2d$applet$2d$config$2e$json__$28$json$29$__["default"].firestoreDatabaseId;
const db = firestoreDatabaseId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(app, firestoreDatabaseId) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(app);
// Mandatory server connection probe on client initialization
let hasProbedConnection = false;
async function validateFirestoreConnection() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
var OperationType = /*#__PURE__*/ function(OperationType) {
    OperationType["CREATE"] = "create";
    OperationType["UPDATE"] = "update";
    OperationType["DELETE"] = "delete";
    OperationType["LIST"] = "list";
    OperationType["GET"] = "get";
    OperationType["WRITE"] = "write";
    return OperationType;
}({});
function handleFirestoreError(error, operationType, path) {
    const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData?.map((provider)=>({
                    providerId: provider.providerId,
                    email: provider.email
                })) || []
        },
        operationType,
        path
    };
    console.error("Firestore Error: ", JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}
const WORKSPACE_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly"
];
// Strict in-memory cache ONLY for Google Workspace OAuth access token (never localStorage/sessionStorage)
let cachedWorkspaceAccessToken = null;
const tokenListeners = new Set();
function setCachedWorkspaceToken(token) {
    cachedWorkspaceAccessToken = token;
    tokenListeners.forEach((fn)=>fn(token));
}
function getWorkspaceAccessToken() {
    return cachedWorkspaceAccessToken;
}
function clearWorkspaceAccessToken() {
    setCachedWorkspaceToken(null);
}
function subscribeWorkspaceToken(listener) {
    tokenListeners.add(listener);
    return ()=>{
        tokenListeners.delete(listener);
    };
}
function subscribeFirebaseAuth(callback) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(auth, (user)=>{
        if (!user) {
            setCachedWorkspaceToken(null);
        }
        callback(user);
    });
}
async function signInWithGoogleBasic() {
    const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]();
    provider.setCustomParameters({
        prompt: "select_account"
    });
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithPopup"])(auth, provider);
    return result.user;
}
async function connectGoogleWorkspaceScopes() {
    const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]();
    WORKSPACE_SCOPES.forEach((scope)=>provider.addScope(scope));
    provider.setCustomParameters({
        prompt: "consent"
    });
    const result = auth.currentUser ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reauthenticateWithPopup"])(auth.currentUser, provider) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithPopup"])(auth, provider);
    const credential = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"].credentialFromResult(result);
    if (!credential?.accessToken) {
        throw new Error("Não foi possível obter o token de acesso do Google Workspace.");
    }
    setCachedWorkspaceToken(credential.accessToken);
    return {
        user: result.user,
        accessToken: credential.accessToken
    };
}
async function signOutFirebase() {
    setCachedWorkspaceToken(null);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])(auth);
}
}),
"[project]/lib/rbac.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROJECT_ROLE_DESCRIPTIONS",
    ()=>PROJECT_ROLE_DESCRIPTIONS,
    "PROJECT_ROLE_LABELS",
    ()=>PROJECT_ROLE_LABELS,
    "RBAC_PERMISSION_MATRIX",
    ()=>RBAC_PERMISSION_MATRIX,
    "canArchiveOrDeleteProject",
    ()=>canArchiveOrDeleteProject,
    "canDeleteProjectAsset",
    ()=>canDeleteProjectAsset,
    "canInviteRole",
    ()=>canInviteRole,
    "canManageProjectSettings",
    ()=>canManageProjectSettings,
    "canManageRoles",
    ()=>canManageRoles,
    "canPublishDeliverable",
    ()=>canPublishDeliverable,
    "canRemoveMember",
    ()=>canRemoveMember,
    "canUploadAssetScope",
    ()=>canUploadAssetScope,
    "getMemberProjectRole",
    ()=>getMemberProjectRole,
    "normalizeProjectRole",
    ()=>normalizeProjectRole,
    "resolveUserProjectRole",
    ()=>resolveUserProjectRole
]);
const PROJECT_ROLE_LABELS = {
    owner: "Owner do projeto",
    gestor: "Gestor",
    colaborador: "Colaborador"
};
const PROJECT_ROLE_DESCRIPTIONS = {
    owner: "Controle total: configurações, arquivamento/exclusão do projeto, atribuição de cargos, R2 completo e Portal do Cliente.",
    gestor: "Operação de entregas: convida colaboradores, publica entregáveis, envia capas/entregáveis no R2 e remove arquivos do projeto.",
    colaborador: "Execução diária: gerencia tarefas, notas Markdown, anexos internos no R2 e remove apenas os arquivos que enviou."
};
function normalizeProjectRole(raw) {
    if (!raw) return "colaborador";
    const lower = raw.toLowerCase();
    if (lower === "owner" || lower.includes("owner") || lower.includes("manager (you)")) {
        return "owner";
    }
    if (lower === "gestor" || lower.includes("gestor") || lower.includes("lead") || lower.includes("architect")) {
        return "gestor";
    }
    return "colaborador";
}
function resolveUserProjectRole(project, userUid, userEmail) {
    // Guest local-first mode defaults to owner so user can test all features offline
    if (!userUid) return "owner";
    if (project.ownerId && project.ownerId === userUid) return "owner";
    const member = project.members.find((m)=>m.uid && m.uid === userUid || userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase());
    if (!member) return "colaborador";
    return member.projectRole || normalizeProjectRole(member.role);
}
function getMemberProjectRole(member, projectOwnerId) {
    if (member.uid && projectOwnerId && member.uid === projectOwnerId) return "owner";
    if (member.projectRole) return member.projectRole;
    return normalizeProjectRole(member.role);
}
function canManageProjectSettings(role) {
    return role === "owner";
}
function canArchiveOrDeleteProject(role) {
    return role === "owner";
}
function canManageRoles(role) {
    return role === "owner";
}
function canInviteRole(actorRole, targetRole) {
    if (actorRole === "owner") return targetRole === "gestor" || targetRole === "colaborador";
    if (actorRole === "gestor") return targetRole === "colaborador";
    return false;
}
function canRemoveMember(actorRole, targetRole) {
    if (actorRole === "owner") return targetRole !== "owner";
    if (actorRole === "gestor") return targetRole === "colaborador";
    return false;
}
function canPublishDeliverable(role) {
    return role === "owner" || role === "gestor";
}
function canUploadAssetScope(role, scope) {
    if (role === "owner" || role === "gestor") return true;
    return scope === "internal";
}
function canDeleteProjectAsset(role, asset, currentUid) {
    if (role === "owner" || role === "gestor") return true;
    if (!currentUid) return true;
    return asset.uploadedBy === currentUid;
}
const RBAC_PERMISSION_MATRIX = [
    {
        capability: "Configurações, arquivar ou excluir projeto",
        owner: "Permitido",
        gestor: "Bloqueado",
        colaborador: "Bloqueado"
    },
    {
        capability: "Alterar cargos (Gestor ↔ Colaborador)",
        owner: "Permitido",
        gestor: "Bloqueado",
        colaborador: "Bloqueado"
    },
    {
        capability: "Convidar novos membros",
        owner: "Gestor e Colaborador",
        gestor: "Apenas Colaborador",
        colaborador: "Bloqueado"
    },
    {
        capability: "Upload R2: Capa e Entregáveis (deliverable)",
        owner: "Permitido",
        gestor: "Permitido",
        colaborador: "Bloqueado"
    },
    {
        capability: "Upload R2: Anexos internos de tarefa/projeto",
        owner: "Permitido",
        gestor: "Permitido",
        colaborador: "Permitido"
    },
    {
        capability: "Download seguro via URL pré-assinada R2",
        owner: "Todos os arquivos",
        gestor: "Todos os arquivos",
        colaborador: "Todos do projeto"
    },
    {
        capability: "Excluir objetos do R2 e metadados",
        owner: "Qualquer arquivo",
        gestor: "Arquivos do projeto",
        colaborador: "Somente os próprios"
    },
    {
        capability: "Publicar entregáveis no Portal do Cliente",
        owner: "Permitido",
        gestor: "Permitido",
        colaborador: "Somente leitura"
    },
    {
        capability: "Google Calendar & Google Drive (OAuth pessoal)",
        owner: "Ler/Criar & Vincular",
        gestor: "Ler/Criar & Vincular",
        colaborador: "Ler/Criar & Vincular"
    }
];
}),
"[project]/lib/firestoreSync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkPendingLocalMigration",
    ()=>checkPendingLocalMigration,
    "createCloudProject",
    ()=>createCloudProject,
    "deleteCloudAssetMetadata",
    ()=>deleteCloudAssetMetadata,
    "deleteCloudAutomationRule",
    ()=>deleteCloudAutomationRule,
    "deleteCloudTask",
    ()=>deleteCloudTask,
    "ensureUserProfileDocs",
    ()=>ensureUserProfileDocs,
    "isMigrationMarkedForUid",
    ()=>isMigrationMarkedForUid,
    "isProjectInCloud",
    ()=>isProjectInCloud,
    "markMigrationDoneForUid",
    ()=>markMigrationDoneForUid,
    "migrateLocalWorkspaceToFirestore",
    ()=>migrateLocalWorkspaceToFirestore,
    "resetCloudRegistry",
    ()=>resetCloudRegistry,
    "sanitizeDocId",
    ()=>sanitizeDocId,
    "saveCloudAssetMetadata",
    ()=>saveCloudAssetMetadata,
    "saveCloudAutomationRule",
    ()=>saveCloudAutomationRule,
    "saveCloudCalendarEvent",
    ()=>saveCloudCalendarEvent,
    "saveCloudDeliverable",
    ()=>saveCloudDeliverable,
    "saveCloudNote",
    ()=>saveCloudNote,
    "saveCloudTask",
    ()=>saveCloudTask,
    "subscribeUserCloudWorkspace",
    ()=>subscribeUserCloudWorkspace,
    "updateCloudMemberRole",
    ()=>updateCloudMemberRole,
    "updateCloudProjectFields",
    ()=>updateCloudProjectFields,
    "updateCloudUserPresence",
    ()=>updateCloudUserPresence,
    "updateCloudUserTier",
    ()=>updateCloudUserTier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rbac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rbac.ts [app-ssr] (ecmascript)");
;
;
;
// Live registry of documents confirmed to exist in Firestore during the active session.
// Prevents blind updateDoc/deleteDoc calls on local/unmigrated demo docs and resolves
// async create -> update races via pendingProjectCreates.
const activeCloudProjectIds = new Set();
const activeCloudTaskKeys = new Set();
const activeCloudNoteKeys = new Set();
const activeCloudDeliverableKeys = new Set();
const activeCloudAutomationKeys = new Set();
const pendingProjectCreates = new Map();
function resetCloudRegistry() {
    activeCloudProjectIds.clear();
    activeCloudTaskKeys.clear();
    activeCloudNoteKeys.clear();
    activeCloudDeliverableKeys.clear();
    activeCloudAutomationKeys.clear();
    pendingProjectCreates.clear();
}
function isProjectInCloud(projectId) {
    return activeCloudProjectIds.has(sanitizeDocId(projectId));
}
function sanitizeDocId(raw) {
    const clean = raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
    return clean || `doc_${Date.now()}`;
}
function clampStr(val, max) {
    if (!val) return "";
    return val.slice(0, max);
}
function nonEmptyClampStr(val, fallback, max) {
    const trimmed = (val || "").trim();
    return (trimmed || fallback).slice(0, max);
}
function safeInt(val, min = 0, max = 100000) {
    const n = Number(val ?? 0);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.floor(n)));
}
function isValidFirestoreId(val) {
    return Boolean(val && /^[a-zA-Z0-9_-]{1,128}$/.test(val));
}
function sanitizeTags(tags) {
    return (tags || []).map((t)=>clampStr(t.trim(), 40)).filter((t)=>t.length > 0).slice(0, 10);
}
function sanitizeSafeCustomImage(url) {
    if (!url) return undefined;
    if (url.startsWith("data:")) return undefined;
    if (url.length > 1000) return undefined;
    return url;
}
async function commitChunkedBatches(ops) {
    const CHUNK_SIZE = 400;
    for(let i = 0; i < ops.length; i += CHUNK_SIZE){
        const chunk = ops.slice(i, i + CHUNK_SIZE);
        const batch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeBatch"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
        for (const op of chunk){
            if (op.merge) {
                batch.set(op.ref, op.data, {
                    merge: true
                });
            } else {
                batch.set(op.ref, op.data);
            }
        }
        await batch.commit();
    }
}
function migrationStorageKey(uid) {
    return `kard_migrated_uid_${uid}`;
}
function isMigrationMarkedForUid(uid) {
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
}
function markMigrationDoneForUid(uid) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
async function ensureUserProfileDocs(user) {
    const publicPath = `users/${user.uid}/public/profile`;
    const privatePath = `users/${user.uid}/private/info`;
    let resolvedStatus = "Online";
    let resolvedStatusNote = "";
    try {
        const publicRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "public", "profile");
        const publicSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(publicRef);
        const displayName = nonEmptyClampStr(user.displayName || user.email?.split("@")[0], "Usuário Kard", 120);
        if (!publicSnap.exists()) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(publicRef, {
                uid: user.uid,
                displayName,
                ...user.photoURL ? {
                    photoUrl: clampStr(user.photoURL, 1000)
                } : {},
                status: "Online",
                statusNote: "Conectado ao Kard",
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            resolvedStatus = "Online";
            resolvedStatusNote = "Conectado ao Kard";
        } else {
            const pubData = publicSnap.data();
            const rawStatus = pubData.status;
            resolvedStatus = rawStatus === "Online" || rawStatus === "In Meeting" || rawStatus === "Focused" || rawStatus === "Offline" ? rawStatus : "Online";
            resolvedStatusNote = typeof pubData.statusNote === "string" ? pubData.statusNote : "";
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(publicRef, {
                displayName,
                ...user.photoURL ? {
                    photoUrl: clampStr(user.photoURL, 1000)
                } : {},
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].WRITE, publicPath);
    }
    try {
        const privateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "private", "info");
        const privateSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(privateRef);
        if (!privateSnap.exists()) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(privateRef, {
                uid: user.uid,
                email: nonEmptyClampStr(user.email || undefined, "usuario@kard.dev", 254),
                userTier: "free",
                activeProjectsCount: 0,
                briefingCollapsed: false,
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            return {
                userTier: "free",
                briefingCollapsed: false,
                userStatus: resolvedStatus,
                userStatusNote: resolvedStatusNote
            };
        }
        const data = privateSnap.data();
        return {
            userTier: data.userTier || "free",
            briefingCollapsed: Boolean(data.briefingCollapsed),
            userStatus: resolvedStatus,
            userStatusNote: resolvedStatusNote,
            migratedLocalAt: data.migratedLocalAt
        };
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].GET, privatePath);
    }
}
async function checkPendingLocalMigration(uid, localSnapshot) {
    if (isMigrationMarkedForUid(uid)) return null;
    const membershipsPath = `users/${uid}/memberships`;
    try {
        const snap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", uid, "memberships"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("uid", "==", uid)));
        if (!snap.empty) {
            markMigrationDoneForUid(uid);
            return null;
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, membershipsPath);
    }
    const activeProjects = localSnapshot.projects.filter((p)=>!p.isArchived);
    const willArchiveCount = localSnapshot.userTier === "free" && activeProjects.length > 3 ? activeProjects.length - 3 : 0;
    return {
        projectsCount: localSnapshot.projects.length,
        tasksCount: localSnapshot.tasks.length,
        eventsCount: localSnapshot.calendarEvents.length,
        rulesCount: localSnapshot.automationRules.length,
        willArchiveCount
    };
}
function formatFileSizeBytes(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
}
function buildProjectBatchOps(user, project, projectTasks, options) {
    const projectId = sanitizeDocId(project.id);
    const ownerName = nonEmptyClampStr(user.displayName || user.email?.split("@")[0], "Owner", 120);
    const ownerAvatar = clampStr(user.photoURL || "/avatars/angelina.jpg", 512);
    const ownerEmail = clampStr(user.email || "", 254);
    const isArchived = options?.forceArchived ?? Boolean(project.isArchived);
    const ops = [];
    const taskIds = [];
    const noteIds = [];
    const delivIds = [];
    const safeTags = sanitizeTags(project.tags);
    const safeCustomImage = sanitizeSafeCustomImage(project.customImage);
    ops.push({
        ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId),
        data: {
            id: projectId,
            ownerId: user.uid,
            name: nonEmptyClampStr(project.name, "Projeto", 120),
            company: nonEmptyClampStr(project.company, "Cliente", 120),
            logo: project.logo || "custom",
            status: project.status || "IN PROGRESS",
            priority: project.priority || "MEDIUM PRIORITY",
            completedTasks: safeInt(project.completedTasks, 0, 100000),
            totalTasks: safeInt(project.totalTasks, 0, 100000),
            ...project.progressColor ? {
                progressColor: clampStr(project.progressColor, 32)
            } : {},
            ...project.progressTrack ? {
                progressTrack: clampStr(project.progressTrack, 32)
            } : {},
            ...project.accentColor ? {
                accentColor: clampStr(project.accentColor, 32)
            } : {},
            tags: safeTags,
            isStarred: Boolean(project.isStarred),
            isArchived,
            ...project.dueDate ? {
                dueDate: clampStr(project.dueDate, 64)
            } : {},
            ...project.sprintStage ? {
                sprintStage: clampStr(project.sprintStage, 64)
            } : {},
            attachmentsCount: safeInt(project.attachmentsCount, 0, 100000),
            ...project.budget ? {
                budget: clampStr(project.budget, 64)
            } : {},
            ...project.description ? {
                description: clampStr(project.description, 2000)
            } : {},
            ...project.coverAssetKey ? {
                coverAssetKey: clampStr(project.coverAssetKey, 512)
            } : {},
            ...safeCustomImage ? {
                customImage: safeCustomImage
            } : {},
            portalEnabled: project.portalEnabled ?? true,
            ...project.portalShareCode ? {
                portalShareCode: clampStr(project.portalShareCode, 128)
            } : {},
            extraMembersCount: safeInt(project.extraMembersCount, 0, 1000),
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        }
    });
    // Authoritative Owner membership doc in subcollection
    ops.push({
        ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "members", user.uid),
        data: {
            uid: user.uid,
            projectId,
            name: ownerName,
            email: ownerEmail,
            avatar: ownerAvatar,
            projectRole: "owner",
            jobTitle: "Owner do projeto",
            status: "Online",
            statusNote: "Criador do workspace",
            addedBy: user.uid,
            joinedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        }
    });
    // User membership pointer for O(1) listing
    ops.push({
        ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "memberships", projectId),
        data: {
            uid: user.uid,
            projectId,
            projectName: nonEmptyClampStr(project.name, "Projeto", 120),
            projectRole: "owner",
            joinedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        }
    });
    // Project tasks
    for (const task of projectTasks){
        const taskId = sanitizeDocId(task.id);
        taskIds.push(taskId);
        ops.push({
            ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "tasks", taskId),
            data: {
                id: taskId,
                projectId,
                ownerId: user.uid,
                number: clampStr(task.number || "01", 16),
                title: nonEmptyClampStr(task.title, "Tarefa", 240),
                project: nonEmptyClampStr(project.name, "Projeto", 120),
                commentsCount: safeInt(task.comments?.length ?? task.commentsCount, 0, 10000),
                subtasksCount: safeInt(task.checklist?.length ?? task.subtasksCount, 0, 1000),
                completed: Boolean(task.completed),
                priority: task.priority || "Medium",
                stage: task.stage || (task.completed ? "DONE" : "TODO"),
                tags: sanitizeTags(task.tags),
                ...task.dueDate ? {
                    dueDate: clampStr(task.dueDate, 64)
                } : {},
                ...task.dueKind ? {
                    dueKind: task.dueKind
                } : {},
                ...task.assignee?.name ? {
                    assigneeName: clampStr(task.assignee.name, 120)
                } : {},
                ...isValidFirestoreId(task.assignee?.uid) ? {
                    assigneeUid: task.assignee.uid
                } : {},
                ...task.descriptionMarkdown ? {
                    descriptionMarkdown: clampStr(task.descriptionMarkdown, 20000)
                } : {},
                checklist: (task.checklist || []).slice(0, 50),
                comments: (task.comments || []).slice(0, 200),
                ...task.linkedNoteId ? {
                    linkedNoteId: clampStr(task.linkedNoteId, 128)
                } : {},
                createdBy: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            }
        });
    }
    // Project Markdown notes
    for (const note of project.notes || []){
        const noteId = sanitizeDocId(note.id);
        noteIds.push(noteId);
        ops.push({
            ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "notes", noteId),
            data: {
                id: noteId,
                projectId,
                ownerId: user.uid,
                title: nonEmptyClampStr(note.title, "Nota do projeto", 200),
                contentMarkdown: clampStr(note.contentMarkdown, 50000),
                author: nonEmptyClampStr(note.author, ownerName, 120),
                authorUid: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            }
        });
    }
    // Client Portal deliverables
    for (const deliv of project.deliverables || []){
        const delivId = sanitizeDocId(deliv.id);
        delivIds.push(delivId);
        ops.push({
            ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "deliverables", delivId),
            data: {
                id: delivId,
                projectId,
                ownerId: user.uid,
                title: nonEmptyClampStr(deliv.title, "Entregável", 200),
                description: clampStr(deliv.description, 2000),
                milestone: nonEmptyClampStr(deliv.milestone, "Marco", 100),
                status: deliv.status || "pending_review",
                ...deliv.clientFeedback ? {
                    clientFeedback: clampStr(deliv.clientFeedback, 2000)
                } : {},
                publishedBy: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            }
        });
    }
    return {
        projectId,
        ops,
        taskIds,
        noteIds,
        delivIds
    };
}
async function migrateLocalWorkspaceToFirestore(user, localSnapshot) {
    const ops = [];
    const ownerEmail = nonEmptyClampStr(user.email || undefined, "usuario@kard.dev", 254);
    let activeSeen = 0;
    const maxActiveFree = localSnapshot.userTier === "free" ? 3 : 999;
    const createdProjIds = [];
    const createdTaskKeys = [];
    const createdNoteKeys = [];
    const createdDelivKeys = [];
    const createdRuleKeys = [];
    for (const project of localSnapshot.projects){
        let isArchived = Boolean(project.isArchived);
        if (!isArchived) {
            activeSeen += 1;
            if (activeSeen > maxActiveFree) {
                isArchived = true;
            }
        }
        const projectTasks = localSnapshot.tasks.filter((t)=>t.project.toLowerCase() === project.name.toLowerCase());
        const built = buildProjectBatchOps(user, project, projectTasks, {
            forceArchived: isArchived
        });
        ops.push(...built.ops);
        createdProjIds.push(built.projectId);
        built.taskIds.forEach((tid)=>createdTaskKeys.push(`${built.projectId}:${tid}`));
        built.noteIds.forEach((nid)=>createdNoteKeys.push(`${built.projectId}:${nid}`));
        built.delivIds.forEach((did)=>createdDelivKeys.push(`${built.projectId}:${did}`));
    }
    // Automation rules attached to primary migrated project (if any)
    const primaryProject = localSnapshot.projects[0];
    if (primaryProject) {
        const primaryId = sanitizeDocId(primaryProject.id);
        for (const rule of localSnapshot.automationRules){
            const ruleId = sanitizeDocId(rule.id);
            createdRuleKeys.push(`${primaryId}:${ruleId}`);
            ops.push({
                ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", primaryId, "automations", ruleId),
                data: {
                    id: ruleId,
                    projectId: primaryId,
                    ownerId: user.uid,
                    naturalText: nonEmptyClampStr(rule.naturalText, "Regra de automação", 500),
                    triggerType: rule.triggerType,
                    ...rule.triggerValue ? {
                        triggerValue: clampStr(rule.triggerValue, 120)
                    } : {},
                    ...rule.triggerLabel ? {
                        triggerLabel: clampStr(rule.triggerLabel, 200)
                    } : {},
                    actionType: rule.actionType,
                    ...rule.actionValue ? {
                        actionValue: clampStr(rule.actionValue, 120)
                    } : {},
                    ...rule.actionLabel ? {
                        actionLabel: clampStr(rule.actionLabel, 200)
                    } : {},
                    enabled: Boolean(rule.enabled),
                    runsCount: safeInt(rule.runsCount, 0, 1000000),
                    createdBy: user.uid,
                    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
                }
            });
        }
    }
    // Calendar events
    for (const ev of localSnapshot.calendarEvents){
        const evId = sanitizeDocId(ev.id);
        ops.push({
            ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "calendarEvents", evId),
            data: {
                id: evId,
                userId: user.uid,
                day: Math.min(31, Math.max(1, safeInt(ev.day, 1, 31))),
                month: Math.min(11, Math.max(0, safeInt(ev.month, 0, 11))),
                year: Math.min(2100, Math.max(2000, safeInt(ev.year, 2000, 2100))),
                dots: (ev.dots || [
                    "#3B82F6"
                ]).slice(0, 5),
                title: nonEmptyClampStr(ev.title, "Evento", 240),
                source: ev.source === "google_calendar" ? "google_calendar" : "local",
                ...ev.googleEventId ? {
                    googleEventId: clampStr(ev.googleEventId, 256)
                } : {},
                ...ev.startIso ? {
                    startIso: clampStr(ev.startIso, 64)
                } : {},
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            }
        });
    }
    const migratedAtIso = new Date().toISOString();
    ops.push({
        ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "private", "info"),
        data: {
            uid: user.uid,
            email: ownerEmail,
            userTier: localSnapshot.userTier || "free",
            activeProjectsCount: Math.min(activeSeen, maxActiveFree),
            briefingCollapsed: Boolean(localSnapshot.briefingCollapsed),
            migratedLocalAt: migratedAtIso,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        },
        merge: true
    });
    try {
        await commitChunkedBatches(ops);
        createdProjIds.forEach((id)=>activeCloudProjectIds.add(id));
        createdTaskKeys.forEach((k)=>activeCloudTaskKeys.add(k));
        createdNoteKeys.forEach((k)=>activeCloudNoteKeys.add(k));
        createdDelivKeys.forEach((k)=>activeCloudDeliverableKeys.add(k));
        createdRuleKeys.forEach((k)=>activeCloudAutomationKeys.add(k));
        markMigrationDoneForUid(user.uid);
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].WRITE, `migration/${user.uid}`);
    }
}
function subscribeUserCloudWorkspace(user, callbacks) {
    resetCloudRegistry();
    const projectMap = new Map();
    const membersMap = new Map();
    const notesMap = new Map();
    const deliverablesMap = new Map();
    const assetsMap = new Map();
    const tasksMap = new Map();
    const automationsMap = new Map();
    const projectUnsubs = new Map();
    let hasLoadedMemberships = false;
    const emitAll = ()=>{
        const mergedProjects = Array.from(projectMap.values()).map((proj)=>({
                ...proj,
                members: membersMap.get(proj.id) || proj.members || [],
                notes: notesMap.get(proj.id) || proj.notes || [],
                deliverables: deliverablesMap.get(proj.id) || proj.deliverables || [],
                documents: assetsMap.get(proj.id) || proj.documents || []
            }));
        const migrationHandled = isMigrationMarkedForUid(user.uid);
        if (mergedProjects.length > 0 || hasLoadedMemberships && migrationHandled) {
            callbacks.onProjectsLoaded(mergedProjects);
        }
        const mergedTasks = Array.from(tasksMap.values()).flat().map((task)=>{
            if (!task.assignee) return task;
            const proj = Array.from(projectMap.values()).find((p)=>p.name.toLowerCase() === task.project.toLowerCase());
            const members = proj ? membersMap.get(proj.id) || [] : [];
            const matched = members.find((m)=>task.assignee?.uid && m.uid === task.assignee.uid || m.name.toLowerCase() === task.assignee?.name.toLowerCase());
            if (!matched) return task;
            return {
                ...task,
                assignee: {
                    ...task.assignee,
                    avatar: matched.avatar,
                    status: matched.status
                }
            };
        });
        if (mergedTasks.length > 0 || mergedProjects.length > 0 || hasLoadedMemberships && migrationHandled) {
            callbacks.onTasksLoaded(mergedTasks);
        }
        const mergedRules = Array.from(automationsMap.values()).flat();
        if (mergedRules.length > 0 || hasLoadedMemberships && migrationHandled) {
            callbacks.onAutomationsLoaded(mergedRules);
        }
    };
    const clearProjectKeys = (projectId)=>{
        activeCloudProjectIds.delete(projectId);
        for (const k of Array.from(activeCloudTaskKeys)){
            if (k.startsWith(`${projectId}:`)) activeCloudTaskKeys.delete(k);
        }
        for (const k of Array.from(activeCloudNoteKeys)){
            if (k.startsWith(`${projectId}:`)) activeCloudNoteKeys.delete(k);
        }
        for (const k of Array.from(activeCloudDeliverableKeys)){
            if (k.startsWith(`${projectId}:`)) activeCloudDeliverableKeys.delete(k);
        }
        for (const k of Array.from(activeCloudAutomationKeys)){
            if (k.startsWith(`${projectId}:`)) activeCloudAutomationKeys.delete(k);
        }
    };
    const attachProjectListeners = (projectId)=>{
        if (projectUnsubs.has(projectId)) return;
        const unsubProj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId), (snap)=>{
            if (!snap.exists()) {
                projectMap.delete(projectId);
                activeCloudProjectIds.delete(projectId);
            } else {
                const d = snap.data();
                activeCloudProjectIds.add(projectId);
                projectMap.set(projectId, {
                    id: d.id || projectId,
                    ownerId: d.ownerId,
                    name: d.name,
                    company: d.company,
                    logo: d.logo || "custom",
                    status: d.status || "IN PROGRESS",
                    priority: d.priority || "MEDIUM PRIORITY",
                    completedTasks: d.completedTasks ?? 0,
                    totalTasks: d.totalTasks ?? 0,
                    progressColor: d.progressColor || "#3B82F6",
                    progressTrack: d.progressTrack || "#E5E9F2",
                    accentColor: d.accentColor || "#3B82F6",
                    tags: Array.isArray(d.tags) ? d.tags : [],
                    isStarred: Boolean(d.isStarred),
                    isArchived: Boolean(d.isArchived),
                    dueDate: d.dueDate || "TBD",
                    sprintStage: d.sprintStage,
                    attachmentsCount: d.attachmentsCount ?? 0,
                    budget: d.budget,
                    description: d.description,
                    coverAssetKey: d.coverAssetKey,
                    customImage: d.customImage,
                    portalEnabled: d.portalEnabled ?? true,
                    portalShareCode: d.portalShareCode,
                    members: membersMap.get(projectId) || [],
                    extraMembersCount: d.extraMembersCount ?? 0
                });
            }
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].GET, `projects/${projectId}`);
        });
        const unsubMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "members"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("projectId", "==", projectId)), (snap)=>{
            const list = snap.docs.map((docSnap)=>{
                const d = docSnap.data();
                return {
                    uid: d.uid,
                    name: d.name,
                    avatar: d.avatar || "/avatars/angelina.jpg",
                    projectRole: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rbac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeProjectRole"])(d.projectRole),
                    role: d.jobTitle || d.projectRole,
                    email: d.email,
                    status: d.status || "Online",
                    statusNote: d.statusNote
                };
            });
            membersMap.set(projectId, list);
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `projects/${projectId}/members`);
        });
        const unsubTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "tasks"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("projectId", "==", projectId)), (snap)=>{
            for (const k of Array.from(activeCloudTaskKeys)){
                if (k.startsWith(`${projectId}:`)) activeCloudTaskKeys.delete(k);
            }
            const list = snap.docs.map((docSnap)=>{
                const d = docSnap.data();
                const tid = d.id || docSnap.id;
                activeCloudTaskKeys.add(`${projectId}:${tid}`);
                return {
                    id: tid,
                    number: d.number || "01",
                    title: d.title,
                    project: d.project,
                    commentsCount: d.commentsCount ?? (Array.isArray(d.comments) ? d.comments.length : 0),
                    subtasksCount: d.subtasksCount ?? (Array.isArray(d.checklist) ? d.checklist.length : 0),
                    completed: Boolean(d.completed),
                    priority: d.priority || "Medium",
                    stage: d.stage || "TODO",
                    tags: Array.isArray(d.tags) ? d.tags : [],
                    dueDate: d.dueDate,
                    dueKind: d.dueKind,
                    assignee: d.assigneeName ? {
                        name: d.assigneeName,
                        avatar: "/avatars/courtney.jpg",
                        uid: d.assigneeUid
                    } : undefined,
                    descriptionMarkdown: d.descriptionMarkdown,
                    checklist: Array.isArray(d.checklist) ? d.checklist : [],
                    comments: Array.isArray(d.comments) ? d.comments : [],
                    linkedNoteId: d.linkedNoteId
                };
            });
            tasksMap.set(projectId, list);
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `projects/${projectId}/tasks`);
        });
        const unsubNotes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "notes"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("projectId", "==", projectId)), (snap)=>{
            for (const k of Array.from(activeCloudNoteKeys)){
                if (k.startsWith(`${projectId}:`)) activeCloudNoteKeys.delete(k);
            }
            const list = snap.docs.map((docSnap)=>{
                const d = docSnap.data();
                const nid = d.id || docSnap.id;
                activeCloudNoteKeys.add(`${projectId}:${nid}`);
                return {
                    id: nid,
                    title: d.title,
                    contentMarkdown: d.contentMarkdown || "",
                    author: d.author || "Equipe",
                    updatedAt: "Sincronizado"
                };
            });
            notesMap.set(projectId, list);
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `projects/${projectId}/notes`);
        });
        const unsubDeliverables = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "deliverables"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("projectId", "==", projectId)), (snap)=>{
            for (const k of Array.from(activeCloudDeliverableKeys)){
                if (k.startsWith(`${projectId}:`)) activeCloudDeliverableKeys.delete(k);
            }
            const list = snap.docs.map((docSnap)=>{
                const d = docSnap.data();
                const did = d.id || docSnap.id;
                activeCloudDeliverableKeys.add(`${projectId}:${did}`);
                return {
                    id: did,
                    title: d.title,
                    description: d.description || "",
                    milestone: d.milestone || "Marco",
                    status: d.status || "pending_review",
                    clientFeedback: d.clientFeedback,
                    updatedAt: "Sincronizado"
                };
            });
            deliverablesMap.set(projectId, list);
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `projects/${projectId}/deliverables`);
        });
        const unsubAssets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "assets"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("projectId", "==", projectId)), (snap)=>{
            const list = snap.docs.map((docSnap)=>{
                const d = docSnap.data();
                const ext = d.fileName?.split(".").pop()?.toUpperCase() || "FILE";
                return {
                    id: d.id || docSnap.id,
                    name: d.fileName,
                    size: formatFileSizeBytes(Number(d.sizeBytes || 0)),
                    sizeBytes: Number(d.sizeBytes || 0),
                    date: "Nuvem",
                    type: d.source === "google_drive" ? "DRIVE" : ext,
                    mimeType: d.mimeType,
                    source: d.source,
                    scope: d.scope,
                    r2Key: d.r2Key,
                    driveFileId: d.driveFileId,
                    driveExternalUrl: d.driveExternalUrl,
                    uploadedBy: d.uploadedBy,
                    uploadedByName: d.uploadedByName
                };
            });
            assetsMap.set(projectId, list);
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `projects/${projectId}/assets`);
        });
        const unsubAutomations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", projectId, "automations"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("projectId", "==", projectId)), (snap)=>{
            for (const k of Array.from(activeCloudAutomationKeys)){
                if (k.startsWith(`${projectId}:`)) activeCloudAutomationKeys.delete(k);
            }
            const list = snap.docs.map((docSnap)=>{
                const d = docSnap.data();
                const rid = d.id || docSnap.id;
                activeCloudAutomationKeys.add(`${projectId}:${rid}`);
                return {
                    id: rid,
                    naturalText: d.naturalText,
                    triggerType: d.triggerType,
                    triggerValue: d.triggerValue,
                    triggerLabel: d.triggerLabel || d.triggerType,
                    actionType: d.actionType,
                    actionValue: d.actionValue,
                    actionLabel: d.actionLabel || d.actionType,
                    enabled: Boolean(d.enabled),
                    runsCount: d.runsCount ?? 0,
                    createdAt: "Nuvem"
                };
            });
            automationsMap.set(projectId, list);
            emitAll();
        }, (err)=>{
            callbacks.onError?.(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `projects/${projectId}/automations`);
        });
        projectUnsubs.set(projectId, ()=>{
            unsubProj();
            unsubMembers();
            unsubTasks();
            unsubNotes();
            unsubDeliverables();
            unsubAssets();
            unsubAutomations();
        });
    };
    const unsubMemberships = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "memberships"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("uid", "==", user.uid)), (snap)=>{
        hasLoadedMemberships = true;
        const currentIds = new Set();
        snap.docs.forEach((docSnap)=>{
            const pid = docSnap.id;
            currentIds.add(pid);
            attachProjectListeners(pid);
        });
        for (const [pid, unsub] of projectUnsubs.entries()){
            if (!currentIds.has(pid)) {
                unsub();
                projectUnsubs.delete(pid);
                projectMap.delete(pid);
                membersMap.delete(pid);
                tasksMap.delete(pid);
                notesMap.delete(pid);
                deliverablesMap.delete(pid);
                assetsMap.delete(pid);
                automationsMap.delete(pid);
                clearProjectKeys(pid);
            }
        }
        emitAll();
    }, (err)=>{
        callbacks.onError?.(err);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `users/${user.uid}/memberships`);
    });
    const unsubEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "calendarEvents"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])("userId", "==", user.uid)), (snap)=>{
        const evs = snap.docs.map((docSnap)=>{
            const d = docSnap.data();
            return {
                id: d.id || docSnap.id,
                day: d.day,
                month: d.month,
                year: d.year,
                dots: Array.isArray(d.dots) ? d.dots : [
                    "#3B82F6"
                ],
                title: d.title,
                source: d.source || "local",
                googleEventId: d.googleEventId,
                startIso: d.startIso
            };
        });
        if (evs.length > 0 || isMigrationMarkedForUid(user.uid)) {
            callbacks.onCalendarEventsLoaded(evs);
        }
    }, (err)=>{
        callbacks.onError?.(err);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].LIST, `users/${user.uid}/calendarEvents`);
    });
    return ()=>{
        unsubMemberships();
        unsubEvents();
        for (const unsub of projectUnsubs.values()){
            unsub();
        }
        projectUnsubs.clear();
        resetCloudRegistry();
    };
}
async function createCloudProject(user, project, initialTasks = []) {
    const built = buildProjectBatchOps(user, project, initialTasks);
    const commitPromise = (async ()=>{
        try {
            await commitChunkedBatches(built.ops);
            activeCloudProjectIds.add(built.projectId);
            built.taskIds.forEach((tid)=>activeCloudTaskKeys.add(`${built.projectId}:${tid}`));
            built.noteIds.forEach((nid)=>activeCloudNoteKeys.add(`${built.projectId}:${nid}`));
            built.delivIds.forEach((did)=>activeCloudDeliverableKeys.add(`${built.projectId}:${did}`));
        } catch (error) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE, `projects/${built.projectId}`);
        } finally{
            pendingProjectCreates.delete(built.projectId);
        }
    })();
    pendingProjectCreates.set(built.projectId, commitPromise);
    await commitPromise;
}
async function updateCloudProjectFields(projectId, patch, promotionContext) {
    const safeId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeId);
    if (pending) {
        await pending;
    }
    if (!activeCloudProjectIds.has(safeId)) {
        if (promotionContext?.user && isMigrationMarkedForUid(promotionContext.user.uid)) {
            await createCloudProject(promotionContext.user, promotionContext.fullProject, promotionContext.projectTasks || []);
        }
        return;
    }
    const payload = {
        updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
    };
    if (patch.name !== undefined) payload.name = nonEmptyClampStr(patch.name, "Projeto", 120);
    if (patch.company !== undefined) payload.company = nonEmptyClampStr(patch.company, "Cliente", 120);
    if (patch.logo !== undefined) payload.logo = patch.logo;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.priority !== undefined) payload.priority = patch.priority;
    if (patch.completedTasks !== undefined) {
        payload.completedTasks = safeInt(patch.completedTasks, 0, 100000);
    }
    if (patch.totalTasks !== undefined) {
        payload.totalTasks = safeInt(patch.totalTasks, 0, 100000);
    }
    if (patch.accentColor !== undefined) payload.accentColor = clampStr(patch.accentColor, 32);
    if (patch.progressColor !== undefined) payload.progressColor = clampStr(patch.progressColor, 32);
    if (patch.progressTrack !== undefined) payload.progressTrack = clampStr(patch.progressTrack, 32);
    if (patch.tags !== undefined) payload.tags = sanitizeTags(patch.tags);
    if (patch.isStarred !== undefined) payload.isStarred = Boolean(patch.isStarred);
    if (patch.isArchived !== undefined) payload.isArchived = Boolean(patch.isArchived);
    if (patch.dueDate !== undefined) payload.dueDate = clampStr(patch.dueDate, 64);
    if (patch.sprintStage !== undefined) payload.sprintStage = clampStr(patch.sprintStage, 64);
    if (patch.attachmentsCount !== undefined) {
        payload.attachmentsCount = safeInt(patch.attachmentsCount, 0, 100000);
    }
    if (patch.budget !== undefined) payload.budget = clampStr(patch.budget, 64);
    if (patch.description !== undefined) payload.description = clampStr(patch.description, 2000);
    if (patch.coverAssetKey !== undefined) payload.coverAssetKey = clampStr(patch.coverAssetKey, 512);
    if (patch.customImage !== undefined) {
        const safeImg = sanitizeSafeCustomImage(patch.customImage);
        if (safeImg) payload.customImage = safeImg;
    }
    if (patch.portalEnabled !== undefined) payload.portalEnabled = Boolean(patch.portalEnabled);
    if (patch.portalShareCode !== undefined) {
        payload.portalShareCode = clampStr(patch.portalShareCode, 128);
    }
    if (patch.extraMembersCount !== undefined) {
        payload.extraMembersCount = safeInt(patch.extraMembersCount, 0, 1000);
    }
    // Do not perform an empty metadata write if no root Firestore field actually changed
    if (Object.keys(payload).length <= 1) return;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeId), payload);
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `projects/${safeId}`);
    }
}
async function updateCloudMemberRole(projectId, memberUid, newRole, jobTitle) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) await pending;
    if (!activeCloudProjectIds.has(safeProjectId)) return;
    const safeMemberUid = sanitizeDocId(memberUid);
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "members", safeMemberUid), {
            projectRole: newRole,
            ...jobTitle ? {
                jobTitle: clampStr(jobTitle, 120)
            } : {},
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `projects/${safeProjectId}/members/${safeMemberUid}`);
    }
}
async function saveCloudAssetMetadata(user, projectId, ownerId, docData) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) await pending;
    if (!activeCloudProjectIds.has(safeProjectId)) return;
    const safeAssetId = sanitizeDocId(docData.id);
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "assets", safeAssetId), {
            id: safeAssetId,
            projectId: safeProjectId,
            ownerId: sanitizeDocId(ownerId),
            source: docData.source,
            scope: docData.scope,
            ...docData.r2Key ? {
                r2Key: clampStr(docData.r2Key, 512)
            } : {},
            ...docData.driveFileId ? {
                driveFileId: clampStr(docData.driveFileId, 256)
            } : {},
            ...docData.driveExternalUrl ? {
                driveExternalUrl: clampStr(docData.driveExternalUrl, 1000)
            } : {},
            fileName: nonEmptyClampStr(docData.fileName, "arquivo", 255),
            mimeType: nonEmptyClampStr(docData.mimeType, "application/octet-stream", 150),
            sizeBytes: safeInt(docData.sizeBytes, 0, 52428800),
            ...docData.linkedTaskId ? {
                linkedTaskId: sanitizeDocId(docData.linkedTaskId)
            } : {},
            uploadedBy: user.uid,
            uploadedByName: nonEmptyClampStr(user.displayName || user.email || undefined, "Membro", 120),
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE, `projects/${safeProjectId}/assets/${safeAssetId}`);
    }
}
async function deleteCloudAssetMetadata(projectId, assetId) {
    const safeProjectId = sanitizeDocId(projectId);
    if (!activeCloudProjectIds.has(safeProjectId)) return;
    const safeAssetId = sanitizeDocId(assetId);
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "assets", safeAssetId));
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].DELETE, `projects/${safeProjectId}/assets/${safeAssetId}`);
    }
}
async function saveCloudCalendarEvent(user, event) {
    const safeId = sanitizeDocId(event.id);
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "calendarEvents", safeId), {
            id: safeId,
            userId: user.uid,
            day: Math.min(31, Math.max(1, safeInt(event.day, 1, 31))),
            month: Math.min(11, Math.max(0, safeInt(event.month, 0, 11))),
            year: Math.min(2100, Math.max(2000, safeInt(event.year, 2000, 2100))),
            dots: (event.dots || [
                "#3B82F6"
            ]).slice(0, 5),
            title: nonEmptyClampStr(event.title, "Evento", 240),
            source: event.source === "google_calendar" ? "google_calendar" : "local",
            ...event.googleEventId ? {
                googleEventId: clampStr(event.googleEventId, 256)
            } : {},
            ...event.startIso ? {
                startIso: clampStr(event.startIso, 64)
            } : {},
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE, `users/${user.uid}/calendarEvents/${safeId}`);
    }
}
async function updateCloudUserTier(user, tier) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "private", "info"), {
            userTier: tier,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `users/${user.uid}/private/info`);
    }
}
async function updateCloudUserPresence(user, projects, status, statusNote) {
    const safeNote = clampStr(statusNote.trim(), 200);
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "users", user.uid, "public", "profile"), {
            status,
            statusNote: safeNote,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `users/${user.uid}/public/profile`);
    }
    await Promise.all(projects.filter((proj)=>{
        const safeId = sanitizeDocId(proj.id);
        if (!activeCloudProjectIds.has(safeId)) return false;
        return proj.members.some((m)=>m.uid === user.uid || user.email && m.email?.toLowerCase() === user.email.toLowerCase());
    }).map(async (proj)=>{
        const safeProjectId = sanitizeDocId(proj.id);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "members", user.uid), {
                status,
                statusNote: safeNote,
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        } catch  {
        // Ignore non-cloud local projects or pending member docs
        }
    }));
}
async function saveCloudTask(user, projectId, ownerId, task, isNew) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) {
        await pending;
    }
    if (!activeCloudProjectIds.has(safeProjectId)) {
        return;
    }
    const safeTaskId = sanitizeDocId(task.id);
    const taskKey = `${safeProjectId}:${safeTaskId}`;
    const taskRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "tasks", safeTaskId);
    // If caller wanted to update, but document does not exist in Firestore yet, promote to create
    const shouldCreate = isNew || !activeCloudTaskKeys.has(taskKey);
    try {
        if (shouldCreate) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(taskRef, {
                id: safeTaskId,
                projectId: safeProjectId,
                ownerId: sanitizeDocId(ownerId),
                number: clampStr(task.number || "01", 16),
                title: nonEmptyClampStr(task.title, "Tarefa", 240),
                project: nonEmptyClampStr(task.project, "Projeto", 120),
                commentsCount: safeInt(task.comments?.length ?? task.commentsCount, 0, 10000),
                subtasksCount: safeInt(task.checklist?.length ?? task.subtasksCount, 0, 1000),
                completed: Boolean(task.completed),
                priority: task.priority || "Medium",
                stage: task.stage || (task.completed ? "DONE" : "TODO"),
                tags: sanitizeTags(task.tags),
                ...task.dueDate ? {
                    dueDate: clampStr(task.dueDate, 64)
                } : {},
                ...task.dueKind ? {
                    dueKind: task.dueKind
                } : {},
                ...task.assignee?.name ? {
                    assigneeName: clampStr(task.assignee.name, 120)
                } : {},
                ...isValidFirestoreId(task.assignee?.uid) ? {
                    assigneeUid: task.assignee.uid
                } : {},
                ...task.descriptionMarkdown ? {
                    descriptionMarkdown: clampStr(task.descriptionMarkdown, 20000)
                } : {},
                checklist: (task.checklist || []).slice(0, 50),
                comments: (task.comments || []).slice(0, 200),
                ...task.linkedNoteId ? {
                    linkedNoteId: clampStr(task.linkedNoteId, 128)
                } : {},
                createdBy: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            activeCloudTaskKeys.add(taskKey);
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(taskRef, {
                number: clampStr(task.number || "01", 16),
                title: nonEmptyClampStr(task.title, "Tarefa", 240),
                completed: Boolean(task.completed),
                priority: task.priority || "Medium",
                stage: task.stage || (task.completed ? "DONE" : "TODO"),
                tags: sanitizeTags(task.tags),
                dueDate: task.dueDate ? clampStr(task.dueDate, 64) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteField"])(),
                dueKind: task.dueKind ? task.dueKind : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteField"])(),
                assigneeName: task.assignee?.name ? clampStr(task.assignee.name, 120) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteField"])(),
                assigneeUid: isValidFirestoreId(task.assignee?.uid) ? task.assignee.uid : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteField"])(),
                ...task.descriptionMarkdown !== undefined ? {
                    descriptionMarkdown: clampStr(task.descriptionMarkdown, 20000)
                } : {},
                checklist: (task.checklist || []).slice(0, 50),
                comments: (task.comments || []).slice(0, 200),
                commentsCount: safeInt(task.comments?.length ?? task.commentsCount, 0, 10000),
                subtasksCount: safeInt(task.checklist?.length ?? task.subtasksCount, 0, 1000),
                linkedNoteId: task.linkedNoteId ? clampStr(task.linkedNoteId, 128) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteField"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, shouldCreate ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `projects/${safeProjectId}/tasks/${safeTaskId}`);
    }
}
async function deleteCloudTask(projectId, taskId) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) await pending;
    const safeTaskId = sanitizeDocId(taskId);
    const taskKey = `${safeProjectId}:${safeTaskId}`;
    if (!activeCloudProjectIds.has(safeProjectId) || !activeCloudTaskKeys.has(taskKey)) {
        return;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "tasks", safeTaskId));
        activeCloudTaskKeys.delete(taskKey);
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].DELETE, `projects/${safeProjectId}/tasks/${safeTaskId}`);
    }
}
async function saveCloudNote(user, projectId, ownerId, note, isNew) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) await pending;
    if (!activeCloudProjectIds.has(safeProjectId)) return;
    const safeNoteId = sanitizeDocId(note.id);
    const noteKey = `${safeProjectId}:${safeNoteId}`;
    const noteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "notes", safeNoteId);
    const shouldCreate = isNew || !activeCloudNoteKeys.has(noteKey);
    try {
        if (shouldCreate) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(noteRef, {
                id: safeNoteId,
                projectId: safeProjectId,
                ownerId: sanitizeDocId(ownerId),
                title: nonEmptyClampStr(note.title, "Nova nota", 200),
                contentMarkdown: clampStr(note.contentMarkdown, 50000),
                author: nonEmptyClampStr(note.author || user.displayName || undefined, "Equipe", 120),
                authorUid: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            activeCloudNoteKeys.add(noteKey);
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(noteRef, {
                title: nonEmptyClampStr(note.title, "Nova nota", 200),
                contentMarkdown: clampStr(note.contentMarkdown, 50000),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, shouldCreate ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `projects/${safeProjectId}/notes/${safeNoteId}`);
    }
}
async function saveCloudDeliverable(user, projectId, ownerId, deliverable, isNew) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) await pending;
    if (!activeCloudProjectIds.has(safeProjectId)) return;
    const safeDelivId = sanitizeDocId(deliverable.id);
    const delivKey = `${safeProjectId}:${safeDelivId}`;
    const delivRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "deliverables", safeDelivId);
    const shouldCreate = isNew || !activeCloudDeliverableKeys.has(delivKey);
    try {
        if (shouldCreate) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(delivRef, {
                id: safeDelivId,
                projectId: safeProjectId,
                ownerId: sanitizeDocId(ownerId),
                title: nonEmptyClampStr(deliverable.title, "Entregável", 200),
                description: clampStr(deliverable.description, 2000),
                milestone: nonEmptyClampStr(deliverable.milestone, "Marco", 100),
                status: deliverable.status || "pending_review",
                ...deliverable.clientFeedback ? {
                    clientFeedback: clampStr(deliverable.clientFeedback, 2000)
                } : {},
                publishedBy: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            activeCloudDeliverableKeys.add(delivKey);
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(delivRef, {
                title: nonEmptyClampStr(deliverable.title, "Entregável", 200),
                description: clampStr(deliverable.description, 2000),
                milestone: nonEmptyClampStr(deliverable.milestone, "Marco", 100),
                status: deliverable.status || "pending_review",
                ...deliverable.clientFeedback ? {
                    clientFeedback: clampStr(deliverable.clientFeedback, 2000)
                } : {},
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, shouldCreate ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `projects/${safeProjectId}/deliverables/${safeDelivId}`);
    }
}
async function saveCloudAutomationRule(user, projectId, ownerId, rule, isNew) {
    const safeProjectId = sanitizeDocId(projectId);
    const pending = pendingProjectCreates.get(safeProjectId);
    if (pending) await pending;
    if (!activeCloudProjectIds.has(safeProjectId)) return;
    const safeRuleId = sanitizeDocId(rule.id);
    const ruleKey = `${safeProjectId}:${safeRuleId}`;
    const ruleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "automations", safeRuleId);
    const shouldCreate = isNew || !activeCloudAutomationKeys.has(ruleKey);
    try {
        if (shouldCreate) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(ruleRef, {
                id: safeRuleId,
                projectId: safeProjectId,
                ownerId: sanitizeDocId(ownerId),
                naturalText: nonEmptyClampStr(rule.naturalText, "Regra de automação", 500),
                triggerType: rule.triggerType,
                ...rule.triggerValue ? {
                    triggerValue: clampStr(rule.triggerValue, 120)
                } : {},
                ...rule.triggerLabel ? {
                    triggerLabel: clampStr(rule.triggerLabel, 200)
                } : {},
                actionType: rule.actionType,
                ...rule.actionValue ? {
                    actionValue: clampStr(rule.actionValue, 120)
                } : {},
                ...rule.actionLabel ? {
                    actionLabel: clampStr(rule.actionLabel, 200)
                } : {},
                enabled: Boolean(rule.enabled),
                runsCount: safeInt(rule.runsCount, 0, 1000000),
                createdBy: user.uid,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            activeCloudAutomationKeys.add(ruleKey);
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(ruleRef, {
                enabled: Boolean(rule.enabled),
                runsCount: safeInt(rule.runsCount, 0, 1000000),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, shouldCreate ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `projects/${safeProjectId}/automations/${safeRuleId}`);
    }
}
async function deleteCloudAutomationRule(projectId, ruleId) {
    const safeProjectId = sanitizeDocId(projectId);
    const safeRuleId = sanitizeDocId(ruleId);
    const ruleKey = `${safeProjectId}:${safeRuleId}`;
    if (!activeCloudProjectIds.has(safeProjectId) || !activeCloudAutomationKeys.has(ruleKey)) {
        return;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], "projects", safeProjectId, "automations", safeRuleId));
        activeCloudAutomationKeys.delete(ruleKey);
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].DELETE, `projects/${safeProjectId}/automations/${safeRuleId}`);
    }
}
}),
"[project]/lib/r2Client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkR2ServerStatus",
    ()=>checkR2ServerStatus,
    "deleteR2Object",
    ()=>deleteR2Object,
    "getR2SignedDownloadUrl",
    ()=>getR2SignedDownloadUrl,
    "uploadFileToR2",
    ()=>uploadFileToR2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-ssr] (ecmascript)");
;
async function checkR2ServerStatus() {
    try {
        const res = await fetch("/api/r2/status", {
            cache: "no-store"
        });
        if (!res.ok) return false;
        const data = await res.json();
        return Boolean(data.configured);
    } catch  {
        return false;
    }
}
async function uploadFileToR2(projectId, file, scope, onProgress) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) {
        throw new Error("Faça login com o Google para enviar arquivos para o Cloudflare R2.");
    }
    const idToken = await user.getIdToken();
    const mimeType = file.type || "application/octet-stream";
    const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
            action: "upload",
            projectId,
            scope,
            fileName: file.name,
            mimeType,
            sizeBytes: file.size
        })
    });
    const presignPayload = await presignRes.json();
    if (!presignRes.ok || !presignPayload.url || !presignPayload.r2Key || !presignPayload.assetId) {
        throw new Error(presignPayload.message || presignPayload.error || "Falha ao autorizar upload no R2.");
    }
    await new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignPayload.url, true);
        xhr.setRequestHeader("Content-Type", mimeType);
        xhr.upload.onprogress = (event)=>{
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round(event.loaded / event.total * 100));
            }
        };
        xhr.onload = ()=>{
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress?.(100);
                resolve();
            } else {
                reject(new Error(`Falha no upload direto para o Cloudflare R2 (HTTP ${xhr.status}).`));
            }
        };
        xhr.onerror = ()=>{
            reject(new Error("Erro de rede ao enviar arquivo para o Cloudflare R2."));
        };
        xhr.send(file);
    });
    return {
        assetId: presignPayload.assetId,
        r2Key: presignPayload.r2Key,
        scope,
        fileName: file.name,
        mimeType,
        sizeBytes: file.size
    };
}
async function getR2SignedDownloadUrl(projectId, r2Key) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) {
        throw new Error("Autenticação necessária para baixar arquivos privados do R2.");
    }
    const idToken = await user.getIdToken();
    const res = await fetch("/api/r2/presign", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
            action: "download",
            projectId,
            r2Key
        })
    });
    const payload = await res.json();
    if (!res.ok || !payload.url) {
        throw new Error(payload.message || payload.error || "Não foi possível gerar link de download R2.");
    }
    return payload.url;
}
async function deleteR2Object(projectId, assetId, r2Key) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) {
        throw new Error("Autenticação necessária para excluir arquivos.");
    }
    const idToken = await user.getIdToken();
    const res = await fetch("/api/r2/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
            projectId,
            assetId,
            r2Key
        })
    });
    if (!res.ok) {
        const payload = await res.json().catch(()=>({}));
        throw new Error(payload.message || payload.error || "Permissão negada ao excluir arquivo no R2.");
    }
}
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AVAILABLE_CONTRIBUTORS",
    ()=>AVAILABLE_CONTRIBUTORS,
    "INITIAL_AUTOMATION_LOGS",
    ()=>INITIAL_AUTOMATION_LOGS,
    "INITIAL_AUTOMATION_RULES",
    ()=>INITIAL_AUTOMATION_RULES,
    "INITIAL_CALENDAR_EVENTS",
    ()=>INITIAL_CALENDAR_EVENTS,
    "INITIAL_MESSAGES",
    ()=>INITIAL_MESSAGES,
    "INITIAL_NOTIFICATIONS",
    ()=>INITIAL_NOTIFICATIONS,
    "INITIAL_PROJECTS",
    ()=>INITIAL_PROJECTS,
    "INITIAL_TASKS",
    ()=>INITIAL_TASKS,
    "INITIAL_TIMERS",
    ()=>INITIAL_TIMERS,
    "MEMBER_STATUS_CONFIG",
    ()=>MEMBER_STATUS_CONFIG,
    "TASK_STAGES",
    ()=>TASK_STAGES
]);
const MEMBER_STATUS_CONFIG = {
    Online: {
        color: 'text-emerald-500 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/25',
        dot: 'bg-emerald-500',
        label: 'Online'
    },
    'In Meeting': {
        color: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/25',
        dot: 'bg-amber-500',
        label: 'Em reunião'
    },
    Focused: {
        color: 'text-purple-500 dark:text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/25',
        dot: 'bg-purple-500',
        label: 'Em foco'
    },
    Offline: {
        color: 'text-zinc-500 dark:text-zinc-400',
        bg: 'bg-zinc-500/10 border-zinc-500/25',
        dot: 'bg-zinc-400 dark:bg-zinc-500',
        label: 'Offline'
    }
};
const TASK_STAGES = [
    {
        id: 'TODO',
        label: 'To Do',
        accent: 'border-zinc-300 dark:border-zinc-700',
        dot: 'bg-zinc-400'
    },
    {
        id: 'IN PROGRESS',
        label: 'In Progress',
        accent: 'border-blue-400/40 dark:border-blue-500/30',
        dot: 'bg-blue-500'
    },
    {
        id: 'REVIEW',
        label: 'In Review',
        accent: 'border-amber-400/40 dark:border-amber-500/30',
        dot: 'bg-amber-500'
    },
    {
        id: 'DONE',
        label: 'Done',
        accent: 'border-emerald-400/40 dark:border-emerald-500/30',
        dot: 'bg-emerald-500'
    }
];
const AVAILABLE_CONTRIBUTORS = [
    {
        name: 'Angelina Smith',
        avatar: '/avatars/angelina.jpg',
        role: 'Project Manager (You)',
        email: 'angelina@kard.dev',
        status: 'Online',
        statusNote: 'Reviewing sprint deliverables'
    },
    {
        name: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'UI/UX Design Lead',
        email: 'courtney@kard.dev',
        status: 'Online',
        statusNote: 'Refining Dark Mode components'
    },
    {
        name: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        role: 'Lead Fullstack Dev',
        email: 'john.doe@kard.dev',
        status: 'Focused',
        statusNote: 'Deep work on API endpoints'
    },
    {
        name: 'Jerome Bell',
        avatar: '/avatars/jerome.jpg',
        role: 'System Architect',
        email: 'jerome@kard.dev',
        status: 'In Meeting',
        statusNote: 'Architecture sync with client'
    },
    {
        name: 'Arlene McCoy',
        avatar: '/avatars/arlene.jpg',
        role: 'Brand & QA Specialist',
        email: 'arlene@kard.dev',
        status: 'Offline',
        statusNote: 'Back tomorrow at 9 AM'
    }
];
const INITIAL_PROJECTS = [
    {
        id: 'google-proj',
        name: 'Google',
        company: 'Google inc.',
        logo: 'google',
        status: 'IN PROGRESS',
        priority: 'HIGH PRIORITY',
        completedTasks: 25,
        totalTasks: 50,
        progressColor: '#3B49DF',
        progressTrack: '#E5E9F2',
        accentColor: '#3B49DF',
        tags: [
            'IOS APP',
            'UI/UX'
        ],
        isStarred: false,
        isArchived: false,
        dueDate: '20 JUNE',
        sprintStage: 'Sprint 3 / 6',
        attachmentsCount: 12,
        budget: '$54,000',
        description: 'Core iOS client wireframes, micro-interactions design system, and multi-service Google Workspace integrations.',
        pendingInvitations: [
            {
                id: 'inv-google-1',
                projectId: 'google-proj',
                projectName: 'Google',
                email: 'alex.mobile@google.com',
                role: 'Mobile Specialist',
                sentAt: 'Hoje às 11:20',
                status: 'pending',
                invitedBy: 'Angelina Smith'
            }
        ],
        members: [
            {
                name: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UI Lead',
                email: 'courtney@kard.dev',
                status: 'Online',
                statusNote: 'Design token updates'
            },
            {
                name: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                role: 'Dev Lead',
                email: 'john.doe@kard.dev',
                status: 'Focused',
                statusNote: 'GraphQL resolver optim'
            },
            {
                name: 'Jerome Bell',
                avatar: '/avatars/jerome.jpg',
                role: 'Architect',
                email: 'jerome@kard.dev',
                status: 'In Meeting',
                statusNote: 'Client sync'
            },
            {
                name: 'Arlene McCoy',
                avatar: '/avatars/arlene.jpg',
                role: 'Brand QA',
                email: 'arlene@kard.dev',
                status: 'Offline'
            }
        ],
        extraMembersCount: 5,
        chatMessages: [
            {
                id: 'gc-1',
                user: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UI Lead',
                userStatus: 'Online',
                text: 'Atualizei os tokens semânticos de **Dark Mode** e publiquei no arquivo #Google_Design_System_v2.4.fig.\n> Contraste ajustado para `WCAG AA` nos cartões Bento.',
                time: 'Hoje às 10:15',
                reactions: [
                    {
                        emoji: '🔥',
                        count: 3,
                        reactedByMe: true
                    },
                    {
                        emoji: '✅',
                        count: 2
                    }
                ]
            },
            {
                id: 'gc-1b',
                user: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UI Lead',
                userStatus: 'Online',
                text: '-# Dica: clique no anexo acima para inspecionar a revisão da Sprint 3.',
                time: 'Hoje às 10:16'
            },
            {
                id: 'gc-2',
                user: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                role: 'Dev Lead',
                userStatus: 'Focused',
                replyTo: {
                    id: 'gc-1',
                    user: 'Courtney Henry',
                    avatar: '/avatars/courtney.jpg',
                    text: 'Atualizei os tokens semânticos de Dark Mode e publiquei no arquivo #Google_Design_System_v2.4.fig.'
                },
                text: '@Angelina Smith endpoints de sincronização validados conforme #iOS_Client_API_Specs.pdf (`60fps` garantido).',
                time: 'Hoje às 10:42',
                embed: {
                    title: 'Milestone · Contact Sync API v3',
                    description: 'Verificação automática concluída antes da entrega de 20 de Junho.',
                    color: '#10B981',
                    fields: [
                        {
                            name: 'Latência P95',
                            value: '42 ms'
                        },
                        {
                            name: 'Cobertura',
                            value: '94% testes'
                        }
                    ],
                    footer: 'Kard Sprint Tracker'
                },
                reactions: [
                    {
                        emoji: '👍',
                        count: 4,
                        reactedByMe: false
                    }
                ]
            },
            {
                id: 'gc-3',
                user: 'Angelina Smith',
                avatar: '/avatars/angelina.jpg',
                role: 'Owner do projeto',
                userStatus: 'Online',
                text: 'Excelente @Courtney Henry e @John Doe! Estamos no ritmo perfeito para a entrega — detalhes finais em ||build 3.4.0-rc2||.',
                time: 'Hoje às 11:05',
                isMe: true,
                reactions: [
                    {
                        emoji: '🚀',
                        count: 2,
                        reactedByMe: true
                    }
                ]
            }
        ],
        documents: [
            {
                id: 'doc-1',
                name: 'Google_Design_System_v2.4.fig',
                size: '24.8 MB',
                date: 'Yesterday',
                type: 'FIGMA'
            },
            {
                id: 'doc-2',
                name: 'iOS_Client_API_Specs.pdf',
                size: '3.6 MB',
                date: '2 days ago',
                type: 'PDF'
            },
            {
                id: 'doc-3',
                name: 'Sprint_3_Deliverables_Checklist.xlsx',
                size: '1.2 MB',
                date: '3 days ago',
                type: 'SHEET'
            }
        ],
        portalEnabled: true,
        portalShareCode: 'google-ios-s3',
        notes: [
            {
                id: 'note-google-1',
                title: 'Especificação de Arquitetura iOS & Tokens',
                author: 'Courtney Henry',
                updatedAt: 'Hoje, 09:40',
                contentMarkdown: '## Escopo da Sprint 3\n\nPadronização dos componentes iOS com suporte completo ao tema **Obsidian Dark**.\n\n### Critérios de Aceite\n- Contraste mínimo WCAG AA em todos os botões primários\n- Navegação por gestos validada com `60fps`\n- Integração com `Google Contacts API v3`'
            },
            {
                id: 'note-google-2',
                title: 'Ata da Sync com Cliente (Quinta)',
                author: 'Angelina Smith',
                updatedAt: 'Ontem, 17:15',
                contentMarkdown: '### Pontos alinhados\n1. Cliente aprovou o fluxo simplificado de onboarding em 2 passos.\n2. Próxima entrega para validação no Portal: **Protótipo do Wireframe iOS**.'
            }
        ],
        deliverables: [
            {
                id: 'deliv-google-1',
                title: 'Wireframes Core iOS & Fluxo de Contatos',
                description: 'Telas de navegação principal, busca global e cartões de contato responsivos para iPhone 15/16.',
                milestone: 'Sprint 3 / 6',
                status: 'pending_review',
                updatedAt: 'Hoje, 10:15'
            },
            {
                id: 'deliv-google-2',
                title: 'Sistema de Design Tokens (Claro & Escuro)',
                description: 'Paleta semântica, tipografia Plus Jakarta Sans e espaçamento Bento validado.',
                milestone: 'Sprint 2 / 6',
                status: 'approved',
                clientFeedback: 'Aprovado! Excelente legibilidade no modo escuro.',
                updatedAt: '14 Jun'
            }
        ]
    },
    {
        id: 'slack-proj',
        name: 'Slack',
        company: 'Slack corporation',
        logo: 'slack',
        status: 'COMPLETED',
        priority: 'MEDIUM PRIORITY',
        completedTasks: 20,
        totalTasks: 30,
        progressColor: '#EC4899',
        progressTrack: '#FCE7F3',
        accentColor: '#EC4899',
        tags: [
            'IOS APP',
            'ANDROID'
        ],
        isStarred: true,
        isArchived: false,
        dueDate: '15 JULY',
        sprintStage: 'Phase 2 QA',
        attachmentsCount: 8,
        budget: '$38,500',
        description: 'Multi-platform mobile asset delivery and brand refresh implementation for team communication channels.',
        members: [
            {
                name: 'Arlene McCoy',
                avatar: '/avatars/arlene.jpg',
                role: 'Brand Specialist',
                status: 'Offline'
            },
            {
                name: 'Jerome Bell',
                avatar: '/avatars/jerome.jpg',
                role: 'Product Lead',
                status: 'In Meeting'
            },
            {
                name: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'Product Designer',
                status: 'Online'
            },
            {
                name: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                role: 'Fullstack Dev',
                status: 'Focused'
            }
        ],
        extraMembersCount: 5,
        chatMessages: [
            {
                id: 'sc-1',
                user: 'Arlene McCoy',
                avatar: '/avatars/arlene.jpg',
                role: 'Brand Specialist',
                userStatus: 'Offline',
                text: 'All brand guidelines and custom reaction SVGs have been vetted for production.',
                time: 'Yesterday'
            },
            {
                id: 'sc-2',
                user: 'Jerome Bell',
                avatar: '/avatars/jerome.jpg',
                role: 'Product Lead',
                userStatus: 'In Meeting',
                text: 'Sprint retrospective scheduled for tomorrow afternoon.',
                time: '3 hours ago'
            }
        ],
        documents: [
            {
                id: 'doc-4',
                name: 'Slack_Brand_Kit_2026.zip',
                size: '48.1 MB',
                date: '4 days ago',
                type: 'ZIP'
            },
            {
                id: 'doc-5',
                name: 'Reaction_Iconography_Bundle.svg',
                size: '2.8 MB',
                date: '5 days ago',
                type: 'SVG'
            }
        ],
        portalEnabled: true,
        portalShareCode: 'slack-brand-q2',
        notes: [
            {
                id: 'note-slack-1',
                title: 'Diretrizes de Marca & Reações Customizadas',
                author: 'Arlene McCoy',
                updatedAt: 'Ontem',
                contentMarkdown: '## Guia de Identidade\n\n- Manter área de respiro mínima de `16px` ao redor do logotipo.\n- Exportar todos os ícones em SVG otimizado sem preenchimento fixo.'
            }
        ],
        deliverables: [
            {
                id: 'deliv-slack-1',
                title: 'Kit Completo de Marca & Ícones SVG',
                description: 'Pacote final de logotipos, variações monocromáticas e pacote de reações para iOS e Android.',
                milestone: 'Phase 2 QA',
                status: 'pending_review',
                updatedAt: 'Ontem, 16:00'
            }
        ]
    },
    {
        id: 'spotify-proj',
        name: 'Spotify Mobile',
        company: 'Spotify AB',
        logo: 'spotify',
        status: 'IN PROGRESS',
        priority: 'HIGH PRIORITY',
        completedTasks: 18,
        totalTasks: 24,
        progressColor: '#10B981',
        progressTrack: '#E6F8EE',
        accentColor: '#10B981',
        tags: [
            'AUDIO API',
            'WEB'
        ],
        isStarred: true,
        isArchived: false,
        dueDate: '10 AUGUST',
        sprintStage: 'Sprint 4 / 4',
        attachmentsCount: 15,
        budget: '$62,000',
        description: 'Real-time player controls, playlist sync engine, and native iOS lockscreen widget integration.',
        members: [
            {
                name: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                role: 'Senior Dev',
                status: 'Focused',
                statusNote: 'Audio SDK low-latency buffer'
            },
            {
                name: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UX Designer',
                status: 'Online'
            },
            {
                name: 'Jerome Bell',
                avatar: '/avatars/jerome.jpg',
                role: 'Tech Lead',
                status: 'In Meeting'
            }
        ],
        extraMembersCount: 3,
        chatMessages: [
            {
                id: 'sp-1',
                user: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                role: 'Senior Dev',
                userStatus: 'Focused',
                text: 'Audio streaming buffer latency is down to 42ms on the staging server.',
                time: '09:30 AM'
            },
            {
                id: 'sp-2',
                user: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UX Designer',
                userStatus: 'Online',
                text: 'Lockscreen media control widget animations are approved.',
                time: '11:15 AM'
            }
        ],
        documents: [
            {
                id: 'doc-6',
                name: 'Spotify_Lockscreen_Mockups.fig',
                size: '18.4 MB',
                date: 'Yesterday',
                type: 'FIGMA'
            },
            {
                id: 'doc-7',
                name: 'Audio_SDK_Benchmarks.pdf',
                size: '5.2 MB',
                date: '3 days ago',
                type: 'PDF'
            }
        ],
        portalEnabled: true,
        portalShareCode: 'spotify-mobile-s4',
        notes: [
            {
                id: 'note-spotify-1',
                title: 'Benchmarks do Buffer de Áudio (42ms)',
                author: 'John Doe',
                updatedAt: 'Hoje, 09:30',
                contentMarkdown: '## Latência de Streaming\n\nO novo buffer reduziu o atraso de troca de faixa de `110ms` para **`42ms`** em redes 4G.'
            }
        ],
        deliverables: [
            {
                id: 'deliv-spotify-1',
                title: 'Widget de Tela de Bloqueio iOS',
                description: 'Controles nativos de reprodução, progresso em tempo real e transições suaves.',
                milestone: 'Sprint 4 / 4',
                status: 'approved',
                clientFeedback: 'Widget ficou muito fluido no teste em TestFlight.',
                updatedAt: 'Hoje, 11:20'
            }
        ]
    },
    {
        id: 'linear-proj',
        name: 'Linear Sync',
        company: 'Linear Systems Inc.',
        logo: 'linear',
        status: 'ON HOLD',
        priority: 'LOW PRIORITY',
        completedTasks: 8,
        totalTasks: 16,
        progressColor: '#8B5CF6',
        progressTrack: '#F5F3FF',
        accentColor: '#8B5CF6',
        tags: [
            'GRAPHQL',
            'WORKFLOW'
        ],
        isStarred: false,
        isArchived: true,
        dueDate: '30 SEPTEMBER',
        sprintStage: 'Design Audit',
        attachmentsCount: 5,
        budget: '$22,000',
        description: 'Bi-directional issue syncing, webhook triage triggers, and automated keyboard shortcut mapping.',
        members: [
            {
                name: 'Arlene McCoy',
                avatar: '/avatars/arlene.jpg',
                role: 'Brand QA',
                status: 'Offline'
            },
            {
                name: 'Jerome Bell',
                avatar: '/avatars/jerome.jpg',
                role: 'Tech Lead',
                status: 'In Meeting'
            }
        ],
        extraMembersCount: 2,
        chatMessages: [
            {
                id: 'lp-1',
                user: 'Jerome Bell',
                avatar: '/avatars/jerome.jpg',
                role: 'Tech Lead',
                userStatus: 'In Meeting',
                text: 'Awaiting webhook approval from the security compliance team before continuing.',
                time: '2 days ago'
            }
        ],
        documents: [
            {
                id: 'doc-8',
                name: 'GraphQL_Schema_Mapping.json',
                size: '420 KB',
                date: 'Last week',
                type: 'CODE'
            }
        ]
    },
    {
        id: 'uber-archive-proj',
        name: 'Uber Fleet Mobile',
        company: 'Uber Technologies',
        logo: 'custom',
        status: 'COMPLETED',
        priority: 'LOW PRIORITY',
        completedTasks: 35,
        totalTasks: 35,
        progressColor: '#10B981',
        progressTrack: '#E6F8EE',
        accentColor: '#10B981',
        tags: [
            'MAPS',
            'TELEMETRY'
        ],
        isStarred: false,
        isArchived: true,
        dueDate: '15 MARCH',
        sprintStage: 'Shipped v1.0',
        attachmentsCount: 10,
        budget: '$85,000',
        description: 'Autonomous dispatch console and driver route optimization delivered in Q1.',
        members: [
            {
                name: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                role: 'Lead Dev',
                status: 'Focused'
            },
            {
                name: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UI Lead',
                status: 'Online'
            }
        ],
        extraMembersCount: 4,
        chatMessages: [
            {
                id: 'ub-1',
                user: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                role: 'UI Lead',
                userStatus: 'Online',
                text: 'Final release notes approved and sent to client.',
                time: '15 Mar'
            }
        ],
        documents: [
            {
                id: 'doc-9',
                name: 'Final_Handover_Bundle.zip',
                size: '120 MB',
                date: '15 Mar',
                type: 'ZIP'
            }
        ]
    }
];
const INITIAL_TASKS = [
    {
        id: 't-1',
        number: '01',
        title: 'Create Wireframe',
        project: 'Google',
        commentsCount: 2,
        subtasksCount: 3,
        completed: false,
        priority: 'High',
        tags: [
            'UI/UX'
        ],
        dueDate: 'Hoje',
        dueKind: 'today',
        assignee: {
            name: 'Courtney Henry',
            avatar: '/avatars/courtney.jpg',
            role: 'UI Lead',
            status: 'Online'
        },
        stage: 'IN PROGRESS',
        linkedNoteId: 'note-google-1',
        descriptionMarkdown: '### Objetivo do Wireframe\nEstruturar os fluxos principais da versão **iOS v2.4**, priorizando leitura rápida e ações com uma mão.\n\n- Validar hierarquia de cartões\n- Garantir estados de erro e vazio claros\n- Vincular tokens de espaçamento do `Design System`',
        checklist: [
            {
                id: 'chk-1-1',
                text: 'Mapear fluxo de onboarding em 2 telas',
                completed: true
            },
            {
                id: 'chk-1-2',
                text: 'Prototipar lista de contatos offline-first',
                completed: true
            },
            {
                id: 'chk-1-3',
                text: 'Revisar contraste Dark Mode com Courtney',
                completed: false
            }
        ],
        comments: [
            {
                id: 'c-1-1',
                author: 'Courtney Henry',
                avatar: '/avatars/courtney.jpg',
                text: 'Subi a versão v2 no Figma com os espaçamentos revisados.',
                time: '10:15'
            },
            {
                id: 'c-1-2',
                author: 'Angelina Smith',
                avatar: '/avatars/angelina.jpg',
                text: 'Perfeito! Vamos validar o último item antes de enviar ao Portal do Cliente.',
                time: '10:42'
            }
        ]
    },
    {
        id: 't-2',
        number: '02',
        title: 'Slack Logo Design',
        project: 'Slack',
        commentsCount: 3,
        subtasksCount: 3,
        completed: false,
        priority: 'Medium',
        tags: [
            'Branding'
        ],
        dueDate: 'Ontem',
        dueKind: 'overdue',
        assignee: {
            name: 'Arlene McCoy',
            avatar: '/avatars/arlene.jpg',
            role: 'Brand Specialist',
            status: 'Offline'
        },
        stage: 'IN PROGRESS',
        linkedNoteId: 'note-slack-1',
        descriptionMarkdown: 'Refinamento final do pacote de ícones e logotipo adaptável para cabeçalhos compactos.\n\n> **Atenção:** exportar versão monocromática para impressão e modo escuro.',
        checklist: [
            {
                id: 'chk-2-1',
                text: 'Exportar SVG otimizado em 24px e 48px',
                completed: true
            },
            {
                id: 'chk-2-2',
                text: 'Testar redução mínima no favicon',
                completed: false
            },
            {
                id: 'chk-2-3',
                text: 'Publicar pacote no Portal do Cliente',
                completed: false
            }
        ],
        comments: [
            {
                id: 'c-2-1',
                author: 'Arlene McCoy',
                avatar: '/avatars/arlene.jpg',
                text: 'Faltam apenas os testes de redução no iOS.',
                time: 'Ontem'
            }
        ]
    },
    {
        id: 't-3',
        number: '03',
        title: 'Dashboard Design',
        project: 'Google',
        commentsCount: 2,
        subtasksCount: 3,
        completed: false,
        priority: 'High',
        tags: [
            'UI/UX',
            'Web'
        ],
        dueDate: 'Hoje',
        dueKind: 'today',
        assignee: {
            name: 'Courtney Henry',
            avatar: '/avatars/courtney.jpg',
            role: 'UI Lead',
            status: 'Online'
        },
        stage: 'TODO',
        descriptionMarkdown: 'Definir grade Bento de 12 colunas com foco em **simplicidade visual** e zero ruído de cartões empilhados.',
        checklist: [
            {
                id: 'chk-3-1',
                text: 'Definir pontos de quebra responsivos',
                completed: true
            },
            {
                id: 'chk-3-2',
                text: 'Aplicar numerais tabulares nos contadores',
                completed: false
            },
            {
                id: 'chk-3-3',
                text: 'Validar foco de teclado nos botões',
                completed: false
            }
        ],
        comments: [
            {
                id: 'c-3-1',
                author: 'John Doe',
                avatar: '/avatars/johndoe.jpg',
                text: 'Estrutura de grid pronta para integração.',
                time: '09:10'
            }
        ]
    },
    {
        id: 't-4',
        number: '04',
        title: 'Create Wireframe',
        project: 'Slack',
        commentsCount: 1,
        subtasksCount: 0,
        completed: true,
        priority: 'Medium',
        tags: [
            'Wireframe'
        ],
        dueDate: '10 June',
        dueKind: 'upcoming',
        assignee: {
            name: 'John Doe',
            avatar: '/avatars/johndoe.jpg',
            role: 'Fullstack Dev',
            status: 'Focused'
        },
        stage: 'DONE',
        descriptionMarkdown: 'Wireframe inicial aprovado pela liderança técnica.',
        checklist: [],
        comments: []
    },
    {
        id: 't-5',
        number: '05',
        title: 'Slack Logo Design',
        project: 'Slack',
        commentsCount: 0,
        subtasksCount: 1,
        completed: true,
        priority: 'Low',
        tags: [
            'Asset'
        ],
        dueDate: '12 June',
        dueKind: 'upcoming',
        assignee: {
            name: 'Arlene McCoy',
            avatar: '/avatars/arlene.jpg',
            role: 'Brand Specialist',
            status: 'Offline'
        },
        stage: 'DONE',
        checklist: [
            {
                id: 'chk-5-1',
                text: 'Validar licença tipográfica',
                completed: true
            }
        ]
    },
    {
        id: 't-6',
        number: '06',
        title: 'App Icon Design',
        project: 'Google',
        commentsCount: 1,
        subtasksCount: 0,
        completed: false,
        priority: 'Medium',
        tags: [
            'Iconography'
        ],
        dueDate: '25 June',
        dueKind: 'upcoming',
        assignee: {
            name: 'Jerome Bell',
            avatar: '/avatars/jerome.jpg',
            role: 'Architect',
            status: 'In Meeting'
        },
        stage: 'REVIEW',
        descriptionMarkdown: 'Revisão final do ícone adaptativo para App Store e TestFlight.'
    },
    {
        id: 't-7',
        number: '07',
        title: 'Audio Stream Buffer Optimization',
        project: 'Spotify Mobile',
        commentsCount: 2,
        subtasksCount: 2,
        completed: false,
        priority: 'High',
        tags: [
            'Audio API',
            'Backend'
        ],
        dueDate: 'Hoje',
        dueKind: 'today',
        assignee: {
            name: 'John Doe',
            avatar: '/avatars/johndoe.jpg',
            role: 'Senior Dev',
            status: 'Focused'
        },
        stage: 'IN PROGRESS',
        linkedNoteId: 'note-spotify-1',
        descriptionMarkdown: 'Reduzir latência do buffer de áudio para abaixo de `45ms` mantendo consumo mínimo de bateria em segundo plano.',
        checklist: [
            {
                id: 'chk-7-1',
                text: 'Benchmark em rede 4G simulada',
                completed: true
            },
            {
                id: 'chk-7-2',
                text: 'Publicar build para QA',
                completed: false
            }
        ]
    },
    {
        id: 't-8',
        number: '08',
        title: 'Bi-directional Webhook Gateway',
        project: 'Linear Sync',
        commentsCount: 1,
        subtasksCount: 2,
        completed: false,
        priority: 'Medium',
        tags: [
            'GraphQL',
            'Webhooks'
        ],
        dueDate: '15 August',
        dueKind: 'upcoming',
        assignee: {
            name: 'Jerome Bell',
            avatar: '/avatars/jerome.jpg',
            role: 'Tech Lead',
            status: 'In Meeting'
        },
        stage: 'TODO',
        descriptionMarkdown: 'Mapeamento bidirecional de eventos GraphQL com assinatura HMAC-SHA256.',
        checklist: [
            {
                id: 'chk-8-1',
                text: 'Validar payload de atualização de status',
                completed: false
            },
            {
                id: 'chk-8-2',
                text: 'Adicionar fila de retentativa exponencial',
                completed: false
            }
        ]
    }
];
const INITIAL_TIMERS = [
    {
        id: 'timer-1',
        project: 'Google',
        taskTitle: 'Create Wireframe',
        secondsElapsed: 25 * 60 + 20,
        isRunning: true
    },
    {
        id: 'timer-2',
        project: 'Slack',
        taskTitle: 'Slack Logo Design',
        secondsElapsed: 30 * 60,
        isRunning: false
    },
    {
        id: 'timer-3',
        project: 'Slack',
        taskTitle: 'Dashboard Design',
        secondsElapsed: 30 * 60,
        isRunning: false
    },
    {
        id: 'timer-4',
        project: 'Slack',
        taskTitle: 'Create Wireframe',
        secondsElapsed: 30 * 60,
        isRunning: false
    }
];
const INITIAL_MESSAGES = [
    {
        id: 'msg-1',
        user: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        role: 'Lead Frontend Dev',
        text: 'Hi Angelina! How are you?',
        time: '10:42 AM',
        unread: true,
        online: true
    },
    {
        id: 'msg-2',
        user: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'Product Designer',
        text: 'Do you need that design?',
        time: '09:15 AM',
        unread: false,
        online: true
    },
    {
        id: 'msg-3',
        user: 'Jerome Bell',
        avatar: '/avatars/jerome.jpg',
        role: 'Tech Lead',
        text: 'What is the price of hourly...',
        time: 'Yesterday',
        unread: false,
        online: false
    },
    {
        id: 'msg-4',
        user: 'Arlene McCoy',
        avatar: '/avatars/arlene.jpg',
        role: 'Brand Specialist',
        text: 'Awesome!!',
        time: '2 days ago',
        unread: false,
        online: true
    }
];
const INITIAL_NOTIFICATIONS = [
    {
        id: 'notif-invite-1',
        title: 'Convite para Colaborar no Projeto',
        description: 'Courtney Henry convidou você para colaborar no projeto Spotify Mobile como Lead Interaction Designer.',
        time: '2m atrás',
        read: false,
        type: 'invitation',
        invitationData: {
            projectId: 'spotify-proj',
            projectName: 'Spotify Mobile',
            projectLogo: 'spotify',
            email: 'angelina@kard.dev',
            role: 'Lead Interaction Designer',
            invitedBy: 'Courtney Henry',
            status: 'pending'
        }
    },
    {
        id: 'notif-1',
        title: 'Google Project Milestone',
        description: '25 of 50 tasks have been completed by the design team.',
        time: '12m ago',
        read: false,
        type: 'task'
    },
    {
        id: 'notif-2',
        title: 'New comment from Courtney',
        description: 'Left feedback on "Slack Logo Design" iteration 3.',
        time: '1 hour ago',
        read: false,
        type: 'comment'
    },
    {
        id: 'notif-3',
        title: 'Menção de @Angelina em Google',
        description: 'Courtney Henry mencionou você: "@Angelina validar wireframe antes da entrega no Portal".',
        time: '25m atrás',
        read: false,
        type: 'mention'
    },
    {
        id: 'notif-4',
        title: 'Upcoming Due Date',
        description: 'Google Wireframe deliverables due on 20 June.',
        time: '3 hours ago',
        read: true,
        type: 'deadline'
    }
];
const INITIAL_CALENDAR_EVENTS = [
    {
        id: 'ev-1',
        day: 3,
        month: 0,
        year: 2021,
        dots: [
            '#F97316'
        ],
        title: 'Sprint Planning with Google team'
    },
    {
        id: 'ev-2',
        day: 5,
        month: 0,
        year: 2021,
        dots: [
            '#3B82F6'
        ],
        title: 'Design Review & Wireframe kickoff',
        isToday: true
    },
    {
        id: 'ev-3',
        day: 19,
        month: 0,
        year: 2021,
        dots: [
            '#F59E0B',
            '#3B82F6'
        ],
        title: 'Slack Beta Release & Assets check'
    },
    {
        id: 'ev-4',
        day: 20,
        month: 0,
        year: 2021,
        dots: [
            '#EF4444'
        ],
        title: 'Google iOS Due Date'
    },
    {
        id: 'ev-5',
        day: 15,
        month: 6,
        year: 2021,
        dots: [
            '#EF4444'
        ],
        title: 'Slack Milestone Due Date'
    }
];
const INITIAL_AUTOMATION_RULES = [
    {
        id: 'rule-1',
        naturalText: 'Quando tarefa for para Done, marcar como concluída e notificar equipe',
        triggerType: 'stage_change',
        triggerValue: 'DONE',
        triggerLabel: 'Estágio muda para Done',
        actionType: 'mark_completed',
        actionValue: 'notify',
        actionLabel: 'Concluir tarefa e notificar equipe',
        enabled: true,
        runsCount: 4,
        createdAt: 'Hoje, 08:30'
    },
    {
        id: 'rule-2',
        naturalText: 'Ao aprovar entrega no Portal do Cliente, notificar gerente do projeto',
        triggerType: 'portal_approved',
        triggerValue: 'approved',
        triggerLabel: 'Entrega aprovada no Portal',
        actionType: 'notify_team',
        actionValue: 'manager',
        actionLabel: 'Enviar alerta na Central de Notificações',
        enabled: true,
        runsCount: 2,
        createdAt: 'Ontem'
    },
    {
        id: 'rule-3',
        naturalText: 'Quando prioridade for Alta, mover automaticamente para In Progress',
        triggerType: 'priority_high',
        triggerValue: 'High',
        triggerLabel: 'Prioridade definida como Alta',
        actionType: 'move_stage',
        actionValue: 'IN PROGRESS',
        actionLabel: 'Mover para In Progress',
        enabled: false,
        runsCount: 1,
        createdAt: '12 Jun'
    }
];
const INITIAL_AUTOMATION_LOGS = [
    {
        id: 'alog-1',
        ruleId: 'rule-2',
        ruleText: 'Ao aprovar entrega no Portal do Cliente, notificar gerente do projeto',
        targetLabel: 'Widget de Tela de Bloqueio iOS',
        outcome: 'Notificação enviada para Angelina Smith',
        timestamp: 'Hoje, 11:20'
    },
    {
        id: 'alog-2',
        ruleId: 'rule-1',
        ruleText: 'Quando tarefa for para Done, marcar como concluída e notificar equipe',
        targetLabel: 'Create Wireframe (Slack)',
        outcome: 'Marcada como concluída e registrada',
        timestamp: 'Ontem, 18:05'
    }
];
}),
"[project]/lib/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_WORKSPACE_SNAPSHOT",
    ()=>DEFAULT_WORKSPACE_SNAPSHOT,
    "KARD_STORAGE_KEY",
    ()=>KARD_STORAGE_KEY,
    "clearWorkspaceStorage",
    ()=>clearWorkspaceStorage,
    "getOnlineSnapshot",
    ()=>getOnlineSnapshot,
    "getServerOnlineSnapshot",
    ()=>getServerOnlineSnapshot,
    "getServerWorkspaceSnapshot",
    ()=>getServerWorkspaceSnapshot,
    "getWorkspaceSnapshot",
    ()=>getWorkspaceSnapshot,
    "hydrateWorkspaceFromStorage",
    ()=>hydrateWorkspaceFromStorage,
    "loadWorkspaceFromStorage",
    ()=>loadWorkspaceFromStorage,
    "resetWorkspaceStore",
    ()=>resetWorkspaceStore,
    "saveWorkspaceToStorage",
    ()=>saveWorkspaceToStorage,
    "subscribeNetworkStatus",
    ()=>subscribeNetworkStatus,
    "subscribeWorkspace",
    ()=>subscribeWorkspace,
    "updateWorkspaceStore",
    ()=>updateWorkspaceStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data.ts [app-ssr] (ecmascript)");
;
const KARD_STORAGE_KEY = "kard_workspace_local_v1";
const DEFAULT_WORKSPACE_SNAPSHOT = {
    projects: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_PROJECTS"],
    tasks: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_TASKS"],
    timers: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_TIMERS"],
    messages: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_MESSAGES"],
    notifications: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_NOTIFICATIONS"],
    calendarEvents: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_CALENDAR_EVENTS"],
    automationRules: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_AUTOMATION_RULES"],
    automationLogs: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_AUTOMATION_LOGS"],
    userTier: "free",
    briefingCollapsed: false,
    userStatus: "Online",
    userStatusNote: "",
    lastSavedAt: null
};
function loadWorkspaceFromStorage() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function saveWorkspaceToStorage(payload) {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function clearWorkspaceStorage() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
// External store for hydration-safe & React-19-compliant local-first synchronization
let workspaceSnapshot = DEFAULT_WORKSPACE_SNAPSHOT;
const workspaceListeners = new Set();
function emitWorkspaceChange() {
    workspaceListeners.forEach((listener)=>listener());
}
function mergePersistedSnapshot(saved) {
    return {
        projects: saved.projects,
        tasks: saved.tasks,
        timers: Array.isArray(saved.timers) ? saved.timers : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_TIMERS"],
        messages: Array.isArray(saved.messages) ? saved.messages : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_MESSAGES"],
        notifications: Array.isArray(saved.notifications) ? saved.notifications : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_NOTIFICATIONS"],
        calendarEvents: Array.isArray(saved.calendarEvents) ? saved.calendarEvents : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_CALENDAR_EVENTS"],
        automationRules: Array.isArray(saved.automationRules) ? saved.automationRules : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_AUTOMATION_RULES"],
        automationLogs: Array.isArray(saved.automationLogs) ? saved.automationLogs : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_AUTOMATION_LOGS"],
        userTier: saved.userTier || "free",
        briefingCollapsed: typeof saved.briefingCollapsed === "boolean" ? saved.briefingCollapsed : false,
        userStatus: saved.userStatus || "Online",
        userStatusNote: typeof saved.userStatusNote === "string" ? saved.userStatusNote : "",
        lastSavedAt: saved.savedAt || null
    };
}
function subscribeWorkspace(listener) {
    workspaceListeners.add(listener);
    if ("TURBOPACK compile-time truthy", 1) {
        return ()=>{
            workspaceListeners.delete(listener);
        };
    }
    //TURBOPACK unreachable
    ;
    const onStorage = undefined;
}
function getWorkspaceSnapshot() {
    return workspaceSnapshot;
}
function getServerWorkspaceSnapshot() {
    return DEFAULT_WORKSPACE_SNAPSHOT;
}
function hydrateWorkspaceFromStorage() {
    const saved = loadWorkspaceFromStorage();
    if (!saved) return;
    workspaceSnapshot = mergePersistedSnapshot(saved);
    emitWorkspaceChange();
}
function updateWorkspaceStore(updater) {
    const next = updater(workspaceSnapshot);
    const savedAt = saveWorkspaceToStorage({
        projects: next.projects,
        tasks: next.tasks,
        timers: next.timers,
        messages: next.messages,
        notifications: next.notifications,
        calendarEvents: next.calendarEvents,
        automationRules: next.automationRules,
        automationLogs: next.automationLogs,
        userTier: next.userTier,
        briefingCollapsed: next.briefingCollapsed,
        userStatus: next.userStatus,
        userStatusNote: next.userStatusNote
    });
    workspaceSnapshot = {
        ...next,
        lastSavedAt: savedAt ?? next.lastSavedAt
    };
    emitWorkspaceChange();
}
function resetWorkspaceStore() {
    clearWorkspaceStorage();
    workspaceSnapshot = DEFAULT_WORKSPACE_SNAPSHOT;
    emitWorkspaceChange();
}
function subscribeNetworkStatus(listener) {
    if ("TURBOPACK compile-time truthy", 1) {
        return ()=>{};
    }
    //TURBOPACK unreachable
    ;
}
function getOnlineSnapshot() {
    if ("TURBOPACK compile-time truthy", 1) return true;
    //TURBOPACK unreachable
    ;
}
function getServerOnlineSnapshot() {
    return true;
}
}),
"[project]/components/auth/FirebaseProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FirebaseProvider",
    ()=>FirebaseProvider,
    "useFirebase",
    ()=>useFirebase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firestoreSync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firestoreSync.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$r2Client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/r2Client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-ssr] (ecmascript)");
;
"use client";
;
;
;
;
;
;
;
const LocalMigrationModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/components/auth/LocalMigrationModal.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const FirebaseContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function FirebaseProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [authReady, setAuthReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSigningIn, setIsSigningIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isConnectingWorkspace, setIsConnectingWorkspace] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [workspaceAccessToken, setWorkspaceAccessToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWorkspaceAccessToken"])());
    const [r2Configured, setR2Configured] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [authError, setAuthError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingMigration, setPendingMigration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isMigrating, setIsMigrating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateFirestoreConnection"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$r2Client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkR2ServerStatus"])().then(setR2Configured).catch(()=>setR2Configured(false));
        const unsubToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeWorkspaceToken"])((token)=>{
            setWorkspaceAccessToken(token);
        });
        const unsubAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeFirebaseAuth"])(async (firebaseUser)=>{
            setUser(firebaseUser);
            setAuthReady(true);
            if (firebaseUser) {
                try {
                    const profileInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firestoreSync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureUserProfileDocs"])(firebaseUser);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateWorkspaceStore"])((prev)=>({
                            ...prev,
                            userTier: profileInfo.userTier,
                            briefingCollapsed: profileInfo.briefingCollapsed,
                            userStatus: profileInfo.userStatus,
                            userStatusNote: profileInfo.userStatusNote
                        }));
                    const summary = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firestoreSync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkPendingLocalMigration"])(firebaseUser.uid, (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWorkspaceSnapshot"])());
                    if (summary) {
                        setPendingMigration(summary);
                    }
                } catch (err) {
                    console.error("Failed to initialize user Firestore state:", err);
                }
            } else {
                setPendingMigration(null);
            }
        });
        return ()=>{
            unsubToken();
            unsubAuth();
        };
    }, []);
    const signInGoogle = async ()=>{
        setAuthError(null);
        setIsSigningIn(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithGoogleBasic"])();
        } catch (err) {
            const message = err instanceof Error ? err.message.includes("popup-closed") ? "Login cancelado antes de concluir." : err.message : "Falha ao autenticar com o Google.";
            setAuthError(message);
        } finally{
            setIsSigningIn(false);
        }
    };
    const connectWorkspace = async ()=>{
        setAuthError(null);
        setIsConnectingWorkspace(true);
        try {
            const { accessToken } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectGoogleWorkspaceScopes"])();
            setWorkspaceAccessToken(accessToken);
            return accessToken;
        } catch (err) {
            const message = err instanceof Error ? err.message.includes("popup-closed") ? "Conexão com Google Workspace cancelada." : err.message : "Não foi possível conectar ao Google Calendar e Drive.";
            setAuthError(message);
            return null;
        } finally{
            setIsConnectingWorkspace(false);
        }
    };
    const disconnectWorkspace = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearWorkspaceAccessToken"])();
    };
    const handleSignOut = async ()=>{
        setAuthError(null);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOutFirebase"])();
        setPendingMigration(null);
    };
    const handleConfirmMigration = async ()=>{
        if (!user) return;
        setIsMigrating(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firestoreSync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["migrateLocalWorkspaceToFirestore"])(user, (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWorkspaceSnapshot"])());
            setPendingMigration(null);
        } catch (err) {
            setAuthError(err instanceof Error ? err.message : "Erro ao migrar rascunho local para o Firestore.");
        } finally{
            setIsMigrating(false);
        }
    };
    const handleSkipMigration = ()=>{
        if (user) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firestoreSync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["markMigrationDoneForUid"])(user.uid);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateWorkspaceStore"])((prev)=>({
                ...prev,
                projects: [],
                tasks: [],
                calendarEvents: [],
                automationRules: [],
                automationLogs: []
            }));
        setPendingMigration(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FirebaseContext.Provider, {
        value: {
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
            clearAuthError: ()=>setAuthError(null)
        },
        children: [
            children,
            pendingMigration && user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LocalMigrationModal, {
                open: true,
                summary: pendingMigration,
                userEmail: user.email || "",
                isMigrating: isMigrating,
                onConfirm: handleConfirmMigration,
                onSkip: handleSkipMigration
            }, void 0, false, {
                fileName: "[project]/components/auth/FirebaseProvider.tsx",
                lineNumber: 206,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth/FirebaseProvider.tsx",
        lineNumber: 186,
        columnNumber: 5
    }, this);
}
function useFirebase() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(FirebaseContext);
    if (!ctx) {
        throw new Error("useFirebase must be used inside FirebaseProvider");
    }
    return ctx;
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bc261b63._.js.map