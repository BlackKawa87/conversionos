# ENGINE 01 — FOUNDATION ENGINE — TECHNICAL DESIGN v2.0
**ConversionOS | ECC Unanimous Approved**

---

---

## DELIVERABLE 16 — INTERNATIONALIZATION ARCHITECTURE

**ECC Approved | English-First + i18n-First**

### Library

```
react-i18next + i18next-browser-languagedetector
```

### i18n Config (`src/i18n/config.ts`)

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Namespaces loaded eagerly in Foundation:
import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enProjects from './locales/en/projects.json'
import enOnboarding from './locales/en/onboarding.json'
import enSettings from './locales/en/settings.json'
import enErrors from './locales/en/errors.json'
import enValidation from './locales/en/validation.json'
// (pt and es mirrors)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: {...}, pt: {...}, es: {...} },
    fallbackLng: 'en',
    defaultNS: 'common',
    supportedLngs: ['en', 'pt', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'conversionos_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
```

### Language Detection Flow

```typescript
// hooks/useLanguage.ts
export function useLanguage() {
  const { i18n } = useTranslation()
  const { user } = useAuth()

  // On auth: sync DB preference → i18n
  useEffect(() => {
    if (user?.preferredLanguage && user.preferredLanguage !== i18n.language) {
      i18n.changeLanguage(user.preferredLanguage)
      localStorage.setItem('conversionos_lang', user.preferredLanguage)
    }
  }, [user?.preferredLanguage])

  const changeLanguage = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang)
    localStorage.setItem('conversionos_lang', lang)
    if (user) {
      // Fire and forget — non-blocking
      updateUserLanguage(lang)
    }
  }

  return { language: i18n.language as SupportedLanguage, changeLanguage }
}
```

### Usage in Components

```tsx
// ✓ Correct
import { useTranslation } from 'react-i18next'

export function CreateProjectButton() {
  const { t } = useTranslation('projects')
  return <Button>{t('create.cta')}</Button>
}

// ❌ Forbidden
export function CreateProjectButton() {
  return <Button>Create Project</Button>
}
```

### TypeScript Key Safety (`src/i18n/types.ts`)

```typescript
// Auto-generated from en/ locale files — run: npm run i18n:types
// Ensures t('nonexistent.key') fails at build time

import type enCommon from './locales/en/common.json'
import type enAuth from './locales/en/auth.json'
// ...

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof enCommon
      auth: typeof enAuth
      projects: typeof enProjects
      // ...
    }
  }
}
```

### AI Localization (usage in Engine 08+)

```typescript
// Every OpenAI call must include:
import { LANGUAGE_TO_PROMPT } from '@/types'

const systemPrompt = `
You are a CRO specialist analyzing conversion funnel data.
CRITICAL: Respond exclusively in ${LANGUAGE_TO_PROMPT[userLanguage]}.
Do not translate. Generate the content directly in this language.
`
```

### QA Test Scenarios — i18n

```
1. language_switch_renders_correct_language          → UI changes instantly
2. language_switch_persists_in_localstorage          → reload keeps language
3. language_switch_persists_in_database              → after reload + reauth
4. auth_restores_db_language_over_localstorage       → DB wins over local
5. unsupported_browser_lang_falls_back_to_en         → 'ja' → 'en'
6. unauthenticated_uses_browser_language             → navigator.language
7. invite_email_uses_invitee_language                → not sender's language
8. ai_diagnosis_in_correct_language                  → pt user → pt response
```

---

## ECC FINAL VERDICT

**Status: UNANIMOUS APPROVED**

Caveats obrigatórios antes da Implementation:
1. `POST /api/audit-log` deve ter rate limiting de 60 req/min
2. Todas as pages em `React.lazy()` desde Block 01
3. `DiagnosisCard`: apenas interface TypeScript na Foundation — zero implementação
4. `docs/QA_FOUNDATION_CHECKLIST.md` gerado como artefato separado assinável no Block 09

---

## DELIVERABLE 1 — FOLDER STRUCTURE

```
/Loop Automatico/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── vercel.json
├── .env.local
├── .env.example
├── .gitignore
├── docs/
│   ├── CONVERSIONOS_MASTER_GOVERNANCE.md
│   ├── ENGINE_01_FOUNDATION_BLUEPRINT.md
│   ├── ENGINE_01_FOUNDATION_TECHNICAL_DESIGN.md
│   └── QA_FOUNDATION_CHECKLIST.md   ← Block 09
├── supabase/
│   └── migrations/
│       └── 001_foundation.sql
└── src/
    ├── app/
    │   └── App.tsx               # Root: providers + router
    ├── routes/
    │   ├── index.tsx             # Declarative route definitions
    │   ├── PublicRoute.tsx       # Redirects auth → /projects
    │   ├── ProtectedRoute.tsx    # Redirects anon → /login
    │   ├── OnboardingGuard.tsx   # Only accessible without org
    │   └── RoleGuard.tsx         # Verifies minimum role
    ├── providers/
    │   ├── AuthProvider.tsx      # auth.users session + UserProfile
    │   ├── OrgProvider.tsx       # Active org + role + can()
    │   ├── ToastProvider.tsx     # Global toast stack
    │   └── QueryProvider.tsx     # TanStack QueryClient config
    ├── features/
    │   ├── foundation/
    │   │   └── index.ts          # Re-exports AppShell, Sidebar, Topbar
    │   ├── auth/
    │   │   ├── components/       # MagicLinkForm, AuthCallbackHandler
    │   │   ├── hooks/            # useAuth()
    │   │   └── api/              # signIn, signOut, getSession
    │   ├── organizations/
    │   │   ├── components/       # OrgForm, InviteModal, MemberRow, MemberList
    │   │   ├── hooks/            # useOrg(), useMembers()
    │   │   └── api/              # createOrg, getOrg, inviteUser, acceptInvite
    │   └── projects/
    │       ├── components/       # ProjectCard, ProjectForm
    │       ├── hooks/            # useProjects()
    │       └── api/              # getProjects, createProject, updateProject, deleteProject
    ├── pages/
    │   ├── Login.tsx
    │   ├── AuthCallback.tsx
    │   ├── Onboarding.tsx
    │   ├── NewOrganization.tsx
    │   ├── Settings.tsx
    │   ├── SettingsTeam.tsx
    │   ├── SettingsBillingPlaceholder.tsx
    │   ├── Projects.tsx
    │   ├── NewProject.tsx
    │   ├── ProjectDetail.tsx
    │   ├── NotFound.tsx
    │   └── Unauthorized.tsx
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   ├── Table.tsx
    │   │   ├── Modal.tsx         # @radix-ui/react-dialog
    │   │   ├── Toast.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── Tooltip.tsx       # @radix-ui/react-tooltip
    │   │   └── index.ts          # barrel export
    │   └── layout/
    │       ├── AppShell.tsx
    │       ├── Sidebar.tsx
    │       ├── Topbar.tsx
    │       └── PublicLayout.tsx
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts         # anon key — browser only
    │   │   └── server.ts         # service role — Edge Functions ONLY
    │   └── logger.ts
    ├── types/
    │   └── index.ts
    ├── i18n/
    │   ├── config.ts             # i18next initialization + language detection
    │   ├── types.ts              # TypeScript key typing (build-time verification)
    │   └── locales/
    │       ├── en/
    │       │   ├── common.json
    │       │   ├── auth.json
    │       │   ├── dashboard.json
    │       │   ├── projects.json
    │       │   ├── diagnosis.json
    │       │   ├── alerts.json
    │       │   ├── settings.json
    │       │   ├── onboarding.json
    │       │   ├── action-plan.json
    │       │   ├── validation.json
    │       │   └── errors.json
    │       ├── pt/
    │       │   └── (same structure)
    │       └── es/
    │           └── (same structure)
    ├── hooks/
    │   └── (shared hooks not tied to a feature)
    └── tests/
        ├── rls/
        └── setup.ts
```

### Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `src/app/` | React entry. Mounts providers + router. No own UI. |
| `src/routes/` | Route definitions and guards. All redirect logic lives here. |
| `src/providers/` | React Context providers. Each is independent and testable. |
| `src/features/` | Functional domains. Each feature owns its components, hooks, and API calls. |
| `src/pages/` | Feature composition into pages. No business logic — only orchestration. |
| `src/components/ui/` | Design system. Domain-agnostic. Never imports from `features/`. |
| `src/components/layout/` | AppShell, Sidebar, Topbar. Reads OrgContext but ignores specific features. |
| `src/lib/` | External clients (Supabase, logger). No React dependencies. |
| `src/types/` | Shared TypeScript contracts. Imported by all, imports nothing. |
| `src/i18n/` | i18next config, TypeScript key typing, and all locale JSON files. |
| `src/hooks/` | Shared utility hooks across features (e.g. `useDebounce`, `useLanguage`). |
| `src/tests/` | RLS tests, mocks, test environment setup. |

---

## DELIVERABLE 2 — ROUTES

### Public Routes
| Path | Component | Notes |
|---|---|---|
| `/login` | `Login.tsx` | Entry point. Magic link. |
| `/` | Redirect | → `/login` or `/projects` based on session |
| `/auth/callback` | `AuthCallback.tsx` | Supabase OAuth/magic link callback |
| `/invite/:token` | `InviteAccept.tsx` | Public, token-gated, requires auth to accept |

### Protected Routes
| Path | Component | Guard |
|---|---|---|
| `/onboarding` | `Onboarding.tsx` | `OnboardingGuard` (only without org) |
| `/organizations/new` | `NewOrganization.tsx` | `ProtectedRoute` |
| `/projects` | `Projects.tsx` | `ProtectedRoute` |
| `/projects/new` | `NewProject.tsx` | `RoleGuard minRole=admin` |
| `/projects/:projectId` | `ProjectDetail.tsx` | `ProtectedRoute` |
| `/settings` | `Settings.tsx` | `ProtectedRoute` |
| `/settings/team` | `SettingsTeam.tsx` | `RoleGuard minRole=admin` |
| `/settings/billing-placeholder` | `SettingsBillingPlaceholder.tsx` | `RoleGuard minRole=owner` |

### Error Routes
| Path | Component |
|---|---|
| `/unauthorized` | `Unauthorized.tsx` |
| `*` | Redirect → `NotFound.tsx` |

### Out of Scope (future engines)
- `/funnels/*` → Engine 03
- `/analytics/*` → Engine 04
- `/diagnosis/*` → Engine 08
- `/action-plan/*` → Engine 09

---

## DELIVERABLE 3 — GUARD CONTRACTS

```typescript
// routes/PublicRoute.tsx
// Use: /login, /auth/callback
// Loading: renders <Spinner />
// No session: renders children
// Session + org: redirects to redirectTo (default: /projects)
// Session + no org: redirects /onboarding
interface PublicRouteProps {
  redirectTo?: string
  children: ReactNode
}

// routes/ProtectedRoute.tsx
// Use: any authenticated route
// Loading: <Spinner />
// No session: redirect /login (preserves returnUrl)
// Session + no org: redirect /onboarding
// Session + org: renders children
interface ProtectedRouteProps {
  children: ReactNode
}

// routes/OnboardingGuard.tsx
// Use: /onboarding, /organizations/new
// Loading: <Spinner />
// No session: redirect /login
// Session + HAS org: redirect /projects
// Session + no org: renders children
interface OnboardingGuardProps {
  children: ReactNode
}

// routes/RoleGuard.tsx
// Use: routes requiring minimum role
// Loading: <Spinner />
// No session: redirect /login
// Insufficient role: redirect /unauthorized
// Sufficient role: renders children
// Hierarchy: owner(4) > admin(3) > analyst(2) > viewer(1)
type AllowedRole = 'owner' | 'admin' | 'analyst' | 'viewer'
interface RoleGuardProps {
  minRole: AllowedRole
  children: ReactNode
}
```

---

## DELIVERABLE 4 — TYPESCRIPT MODELS

```typescript
// src/types/index.ts

export type UserRole = 'owner' | 'admin' | 'analyst' | 'viewer'
export type OrgPlan = 'free' | 'pro' | 'agency' | 'enterprise'
export type ProjectStatus = 'setup' | 'active' | 'paused' | 'archived'
export type InvitationRole = Exclude<UserRole, 'owner'>
export type SupportedLanguage = 'en' | 'pt' | 'es'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'pt', 'es']

export const LANGUAGE_TO_PROMPT: Record<SupportedLanguage, string> = {
  en: 'English',
  pt: 'Brazilian Portuguese (pt-BR)',
  es: 'Latin American Spanish',
}

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: '🇺🇸 English',
  pt: '🇧🇷 Português',
  es: '🇪🇸 Español',
}

export type AuditAction =
  | 'org.created' | 'org.updated' | 'org.deleted'
  | 'member.invited' | 'member.joined' | 'member.removed' | 'member.role_changed'
  | 'project.created' | 'project.updated' | 'project.deleted'
  | 'invitation.revoked' | 'auth.login' | 'auth.logout'

export type Permission =
  | 'billing.view' | 'billing.manage'
  | 'org.update' | 'org.delete'
  | 'members.invite' | 'members.remove' | 'members.role_change'
  | 'projects.create' | 'projects.update' | 'projects.delete' | 'projects.view'
  | 'invitations.revoke'

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  preferredLanguage: SupportedLanguage   // default: 'en'
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: OrgPlan
  billingEmail: string | null
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: UserRole
  invitedBy: string | null
  joinedAt: string
  user?: UserProfile
}

export interface Project {
  id: string
  organizationId: string
  name: string
  domain: string | null
  trackerKey: string
  status: ProjectStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Invite {
  id: string
  organizationId: string
  email: string
  role: InvitationRole
  token: string
  inviteeLanguage: SupportedLanguage   // language for invitation email
  createdBy: string
  expiresAt: string
  usedAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  organizationId: string
  actorId: string
  action: AuditAction
  resourceType: string
  resourceId: string | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AppSession {
  user: UserProfile
  organization: Organization
  member: OrganizationMember
  role: UserRole
  isOwner: boolean
  isAdmin: boolean
  isAnalyst: boolean
  isViewer: boolean
  can: (permission: Permission) => boolean
}

export interface RoutePermission {
  path: string
  minRole: UserRole
  requiresOrg: boolean
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggerEvent {
  level: LogLevel
  event: string
  message: string
  timestamp: string
  userId?: string
  orgId?: string
  projectId?: string
  path?: string
  durationMs?: number
  metadata?: Record<string, unknown>
  error?: string
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'billing.view', 'billing.manage',
    'org.update', 'org.delete',
    'members.invite', 'members.remove', 'members.role_change',
    'projects.create', 'projects.update', 'projects.delete', 'projects.view',
    'invitations.revoke',
  ],
  admin: [
    'billing.view', 'org.update',
    'members.invite', 'members.remove', 'members.role_change',
    'projects.create', 'projects.update', 'projects.delete', 'projects.view',
    'invitations.revoke',
  ],
  analyst: ['projects.view', 'projects.update'],
  viewer:  ['projects.view'],
}
```

---

## DELIVERABLE 5 — MIGRATION SQL FOUNDATION

See `supabase/migrations/001_foundation.sql` for full SQL.

Execution order: tables → indexes → helper functions → RLS → triggers → verification.

Key decisions:
- Helper functions in `public` schema (auth schema is read-only in Supabase SQL Editor)
- `idx_org_members_user_org` is the first critical index (required before functions compile)
- 6 tables: user_profiles, organizations, organization_members, projects, invitations, audit_logs
- All tables have RLS enabled
- `handle_new_user()` uses SECURITY DEFINER to write user_profiles before session exists

---

## DELIVERABLE 6 — RLS MATRIX

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `user_profiles` | own row | trigger only | own row | cascade |
| `organizations` | any member | service role | admin/owner | service role |
| `organization_members` | same org members | admin | admin | admin |
| `projects` | any member | admin | admin | owner only |
| `invitations` | admin | admin | admin (revoke) | cascade |
| `audit_logs` | admin | any member | never | cascade |

### Test Scenarios
1. Viewer reads own org projects → PASS
2. Viewer reads another org's projects → 0 rows
3. Analyst INSERT into projects → RLS violation
4. Admin INSERT into projects → PASS
5. Owner DELETE project → PASS
6. Admin DELETE project → 0 rows affected
7. Unauthenticated reads organizations → 0 rows
8. Invite token not leaked to member of other org → 0 rows

---

## DELIVERABLE 7 — API CONTRACTS

### GET /api/me
```
Auth: Bearer required
Returns: { user: UserProfile, organization: Organization, member: OrganizationMember }
Errors: 401
```

### POST /api/organizations
```
Auth: Bearer required
Body: { name: string, slug: string }
Returns: { organization: Organization, member: OrganizationMember }
Errors: 409 slug conflict, 422 validation
Side effects: creates org + sets caller as owner
Audit: org.created
```

### GET /api/organizations/current
```
Auth: Bearer required
Returns: { organization: Organization, members: OrganizationMember[], projects: Project[] }
Errors: 401, 404
```

### POST /api/invitations
```
Auth: Bearer + admin role
Body: { email: string, role: InvitationRole }
Returns: { invitation: Invite }
Errors: 403, 409 already member, 422
Side effects: Resend email
Audit: member.invited
```

### POST /api/invitations/accept
```
Auth: Bearer (must be authenticated to accept)
Body: { token: string, fullName?: string }
Returns: { member: OrganizationMember }
Errors: 404 invalid token, 410 expired/revoked, 409 already member
Audit: member.joined
```

### GET /api/projects
```
Auth: Bearer required
Returns: { projects: Project[] }
Errors: 401, 404
```

### POST /api/projects
```
Auth: Bearer + admin role
Body: { name: string, domain?: string }
Returns: { project: Project }
Errors: 403, 422
Side effects: generates tracker_key
Audit: project.created
```

### PATCH /api/projects/:id
```
Auth: Bearer + admin role
Body: Partial<Pick<Project, 'name' | 'domain' | 'status'>>
Returns: { project: Project }
Errors: 403, 404, 422
Audit: project.updated
```

### DELETE /api/projects/:id
```
Auth: Bearer + owner role
Returns: { success: true }
Errors: 403, 404
Audit: project.deleted
```

### POST /api/audit-log
```
Auth: Bearer required (any role)
Body: { action: AuditAction, resourceType: string, resourceId?: string, metadata?: object }
Returns: { id: string }
Errors: 401, 422
Rate limit: 60 req/min per user (mandatory — Security caveat)
Notes: For client-side events the server cannot capture (navigation, views).
       Does NOT replace server-side audit logging.
```

---

## DELIVERABLE 8 — SUPABASE CLIENT STRATEGY

```typescript
// src/lib/supabase/client.ts — BROWSER ONLY
// Uses ANON KEY — respects RLS
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// src/lib/supabase/server.ts — EDGE FUNCTIONS ONLY
// Service role bypasses RLS — handle with care
// NEVER import in frontend (VITE cannot access process.env)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

| Key | Where to use | Never use in |
|---|---|---|
| `VITE_SUPABASE_ANON_KEY` | Frontend, browser | Server, Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions, migrations | Frontend, bundle, git |

---

## DELIVERABLE 9 — STATE MANAGEMENT

**Decision: React Context + TanStack Query. No Zustand in Foundation.**

| Layer | Technology | Manages |
|---|---|---|
| Auth session | `AuthProvider` (Context) | session, user, loading, signIn, signOut |
| Active org | `OrgProvider` (Context) | organization, member, role, can() |
| Toast | `ToastProvider` (Context) | toasts[], showToast, removeToast |
| Members list | TanStack Query `useMembers()` | Async list, 60s cache |
| Projects list | TanStack Query `useProjects()` | Async list, 30s cache |

Zustand deferred to Engine 04+ where analytics state has multiple interdependent slices (filters, selections, drill-down). Adding it to Foundation would be over-engineering.

```typescript
// providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false }
  }
})
```

---

## DELIVERABLE 10 — UI COMPONENTS FOUNDATION

All components use CSS custom properties (design tokens). Never import from `features/`. No business logic.

| Component | Responsibility | Key Props |
|---|---|---|
| `AppShell` | Auth guard wrapper + layout | `children` |
| `Sidebar` | Fixed 240px navigation | `orgName, projects, activePath` |
| `Topbar` | Top bar with user menu + language switcher | `user, organization` |
| `LanguageSwitcher` | Flag + language name dropdown. Updates localStorage + DB. | `currentLanguage, onChange` |
| `PageHeader` | Page title + action slot | `title, description?, action?` |
| `MetricCard` | Numeric metric card | `label, value, trend?, accent?` |
| `DiagnosisCard` | Data→insight→hypothesis→action display | `metric, insight, hypothesis, action, urgency` — **INTERFACE ONLY — implemented in Engine 08** |
| `EmptyState` | Empty content placeholder | `title, description?, action?, icon?` |
| `LoadingState` | Loading placeholder | `message?` |
| `ErrorState` | Error display with retry | `message, retry?` |
| `Button` | Action trigger | `variant, size?, loading?, disabled?, icon?, children` |
| `Input` | Text input | `label?, error?, hint?` + HTMLInputAttributes |
| `Select` | Dropdown selection | `label?, error?, options, value, onChange` |
| `Badge` | Status label | `variant: default\|success\|warning\|error\|info` |
| `Card` | Content container | `children, padding?, hover?, onClick?` |
| `Table` | Data table | `columns, rows, loading?, empty?` |
| `Modal` | Overlay dialog (@radix-ui/react-dialog) | `open, onClose, title, description?, children, size?` |
| `Toast` | Notification item | `id, message, type, onRemove` |

---

## DELIVERABLE 11 — DESIGN TOKENS

```css
:root {
  --bg-page: #0a0a0a; --bg-card: #111111;
  --bg-elevated: #1a1a1a; --bg-overlay: #222222;
  --border: #2a2a2a; --border-focus: #444444; --border-accent: rgba(0,208,132,0.3);
  --text-primary: #e8e8e8; --text-secondary: #aaaaaa;
  --text-muted: #888888; --text-faint: #555555;
  --accent: #00d084; --accent-hover: #00b872; --accent-muted: rgba(0,208,132,0.12);
  --error: #ef4444; --warning: #f59e0b; --info: #3b82f6; --success: #00d084;
  --urgency-high: #ef4444; --urgency-medium: #f59e0b; --urgency-low: #00d084;
  --font-display: "Instrument Serif", serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "DM Mono", monospace;
  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem; --text-2xl: 1.5rem; --text-3xl: 1.875rem;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --radius-xl: 16px; --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.6);
  --z-sidebar: 100; --z-topbar: 200; --z-modal: 300; --z-toast: 400; --z-tooltip: 500;
  --sidebar-width: 240px; --topbar-height: 56px; --content-max: 1280px;
}
```

---

## DELIVERABLE 12 — OBSERVABILITY DESIGN

```typescript
// src/lib/logger.ts
// Production: structured JSON → stdout (Vercel captures)
// Dev: colored console
// PII: email masked (c***@domain.com), IPs never logged client-side

export const log = (event: Omit<LoggerEvent, 'timestamp'>) => {
  const entry: LoggerEvent = { ...event, timestamp: new Date().toISOString() }
  if (import.meta.env.PROD) {
    console.log(JSON.stringify(entry))
  } else {
    console[event.level](`[${event.event}]`, entry)
  }
}
```

### Minimum Instrumented Events

| Event | Location |
|---|---|
| `auth.magic_link_sent` | Login.tsx |
| `auth.callback_success` | AuthCallback.tsx |
| `auth.callback_error` | AuthCallback.tsx |
| `auth.logout` | AppShell.tsx |
| `org.created` | NewOrganization.tsx |
| `org.onboarding_started` | Onboarding.tsx |
| `invite.sent` | SettingsTeam.tsx |
| `invite.accepted` | InviteAccept.tsx |
| `project.created` | NewProject.tsx |
| `route.unauthorized` | RoleGuard.tsx |
| `api.error` | All Edge Functions |
| `permission.denied` | RoleGuard, can() |

### Critical Errors (alert immediately)
- RLS violation in production
- Service role key exposed in client bundle
- `handle_new_user` trigger failure

### Sentry Integration
- DSN via `VITE_SENTRY_DSN`
- Init in `src/app/App.tsx`
- Scrub PII: `email`, `full_name`, `ip_address` from breadcrumbs
- Tag every event with `orgId` + `role`

---

## DELIVERABLE 13 — QA TEST PLAN

### Automated RLS Tests
1. viewer_cannot_read_other_org_projects → 0 rows
2. analyst_cannot_create_project → INSERT rejected
3. admin_can_create_project → PASS
4. owner_can_delete_project → PASS
5. admin_cannot_delete_project → 0 rows affected
6. unauthenticated_reads_zero_rows → 0 rows (organizations)
7. invite_token_not_leaked → 0 rows for member of other org

### API Contract Tests
All 9 endpoints: happy path + 401 + 403 per endpoint.
Invite: expired token → 410, used token → 409.

### Route Guard Tests
- Anon → /projects → redirect /login
- Auth without org → /projects → redirect /onboarding
- Auth with org → /onboarding → redirect /projects
- Analyst → /projects/new → redirect /unauthorized
- Viewer → /settings/team → redirect /unauthorized

### Lighthouse CI
Performance ≥ 90, Accessibility ≥ 95, LCP < 1500ms, CLS < 0.1

### Manual QA
- Magic link: send → email → click → callback → redirect
- Onboarding: new user → create org → land on /projects
- Invite: send → email → accept → member appears in /settings/team
- Session persistence: reload → stays logged in
- Sign out → /login → protected routes blocked

---

## DELIVERABLE 14 — PERFORMANCE TARGETS

| Metric | Target | Measurement |
|---|---|---|
| LCP (Login page) | < 1500ms | Lighthouse CI |
| CLS | < 0.1 | Lighthouse CI |
| Bundle Foundation (gzipped) | < 80KB | `vite build --report` |
| `/api/me` P95 | < 200ms | Vercel Analytics |
| Org data fetch P95 | < 200ms | TanStack Query devtools |
| Route transition | < 100ms | Navigation Timing API |
| Time to first insight (onboarding) | < 5 min | Manual QA |

---

## DELIVERABLE 15 — IMPLEMENTATION PLAN

| Block | Objective | Expected Files | Acceptance Criteria | Risks |
|---|---|---|---|---|
| **01** | Project scaffold + i18n base | `package.json`, `vite.config.ts`, `tsconfig.json`, `vercel.json`, `src/app/App.tsx`, `src/types/index.ts`, `src/i18n/config.ts`, `src/i18n/types.ts`, `src/i18n/locales/en/*.json` (stubs) | `npm run dev` and `npm run build` pass. `t('common.save')` renders without error. | Dependency conflicts |
| **02** | Design system | `src/index.css` (tokens), all 17 UI components + `LanguageSwitcher`, 4 layout components | All components render. No hardcoded strings. `useTranslation` used in every component. | Radix UI version conflict |
| **03** | Supabase migration | `supabase/migrations/001_foundation.sql` | 6 tables + index + RLS + triggers verified | *In progress* |
| **04** | Auth | `src/lib/supabase/client.ts`, `src/providers/AuthProvider.tsx`, `src/features/auth/`, `src/pages/Login.tsx`, `src/pages/AuthCallback.tsx`, `src/routes/PublicRoute.tsx` | Magic link works end-to-end | Magic link spam without rate limit |
| **05** | Organization | `src/providers/OrgProvider.tsx`, `src/features/organizations/`, `src/pages/Onboarding.tsx`, `src/pages/NewOrganization.tsx`, `/api/organizations`, `/api/invitations`, `src/routes/OnboardingGuard.tsx` | Create org + invite member works | Slug collision race condition |
| **06** | Projects | `src/features/projects/`, `src/pages/Projects.tsx`, `src/pages/NewProject.tsx`, `src/pages/ProjectDetail.tsx`, `/api/projects` | Full CRUD works by role | tracker_key must NEVER appear in frontend state |
| **07** | Route guards + nav | `src/routes/ProtectedRoute.tsx`, `src/routes/RoleGuard.tsx`, `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Topbar.tsx`, all Settings pages, `/unauthorized` | All 5 guard scenarios pass | Flash of unauthorized content |
| **08** | Observability | `src/lib/logger.ts`, Sentry init in App.tsx, all 12 minimum events instrumented | Logs appear in Vercel, Sentry captures errors | PII leaking in logs |
| **09** | QA | RLS tests in `src/tests/rls/`, Lighthouse CI, `docs/QA_FOUNDATION_CHECKLIST.md` | 100% of 7 RLS scenarios pass. Lighthouse ≥ 90. | False positive with service role |

### Required Dependencies (Block 01)
- `@supabase/supabase-js` ^2
- `@tanstack/react-query` ^5
- `@radix-ui/react-dialog` ^1
- `@radix-ui/react-tooltip` ^1
- `@sentry/react` ^8
- `react-router-dom` ^7
- `lucide-react`
