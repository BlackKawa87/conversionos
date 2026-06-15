# CONVERSIONOS — FOUNDATION ENGINE BLUEPRINT
**Engine:** 01 — Foundation Engine
**Versão:** 1.0
**Status:** ✅ APROVADO pelo ECC — Pronto para Technical Design
**Data:** 2026-06-15

---

## RESPONSABILIDADES

### Pertence à Foundation Engine

```
AUTENTICAÇÃO
  ├── Supabase Auth (Magic Link + Email/Senha)
  ├── Session management e refresh automático
  ├── Sistema de convites por email
  └── OAuth Google (Phase 2)

MULTI-TENANCY
  ├── Entidade Organization (billing unit)
  ├── Organization Members com roles
  ├── Isolamento por RLS (padrão aplicado a todo o sistema)
  └── Organization switcher

AUTORIZAÇÃO
  ├── RBAC — 4 papéis oficiais
  ├── Guards de rota (AuthGuard, RoleGuard, OnboardingGuard)
  └── usePermissions() hook

LAYOUT GLOBAL
  ├── AppShell
  ├── Sidebar de navegação principal
  └── OrgSwitcher

NAVEGAÇÃO
  ├── Todas as rotas públicas e protegidas
  ├── Redirect logic pós-login
  └── Estados de erro (404, Unauthorized)

DESIGN SYSTEM (primitivos)
  ├── CSS tokens (cores, tipografia, espaçamento)
  └── Componentes base: Button, Input, Badge, Card, Avatar,
      Modal, Toast, Tooltip, Skeleton, EmptyState, Dropdown, Select

OBSERVABILIDADE BASE
  ├── Structured logging em Edge Functions
  ├── Error tracking (Sentry)
  ├── Web Vitals no frontend
  └── Alertas de saúde

TABELAS DE FUNDAÇÃO
  ├── organizations
  ├── organization_members
  ├── invitations
  └── audit_logs
```

### NÃO pertence à Foundation Engine

Engines 02-15 são responsáveis por: projetos, funnels, tracking, analytics, revenue, sessions, friction, diagnosis, action plan, alerts, health, experiments, actions, reporting, go live.

---

## TENANCY MODEL

**Modelo oficial: Multi-tenant por row com RLS**

Todas as organizações compartilham o mesmo schema Postgres.
Isolamento garantido por Row Level Security com `organization_id` em todas as tabelas.

### Padrão RLS obrigatório (template para toda a plataforma)

```sql
-- Leitura: qualquer membro da org
CREATE POLICY "org_read" ON [table]
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Escrita: apenas owner/admin
CREATE POLICY "org_write" ON [table]
  FOR INSERT, UPDATE, DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
```

---

## WORKSPACE MODEL

**Hierarquia oficial: Organization → Project → Funnel**

```
Organization          ← entidade de billing
  ├── Members         ← usuários com roles
  └── Projects        ← um site/produto (Engine 02)
        └── Funnels   ← configurações de funil (Engine 02)
```

---

## AUTH MODEL

### Métodos

| Método | Status |
|---|---|
| Magic Link | Primário — Phase 1 |
| Email + Senha | Secundário — Phase 1 |
| Google OAuth | Phase 2 |

### Papéis oficiais

| Role | Descrição |
|---|---|
| **owner** | Criador da org. Billing. Delete org. Único por org. |
| **admin** | Convida/remove membros, cria/deleta projetos, rotaciona keys. |
| **analyst** | Lê todos os dados, cria action items. Não gerencia membros. |
| **viewer** | Read-only. |

### Matriz de permissões

| Ação | owner | admin | analyst | viewer |
|---|:---:|:---:|:---:|:---:|
| Billing | ✓ | | | |
| Deletar organização | ✓ | | | |
| Convidar membros | ✓ | ✓ | | |
| Remover membros | ✓ | ✓ | | |
| Alterar roles | ✓ | ✓ | | |
| Criar/deletar projetos | ✓ | ✓ | | |
| Configurar funnels | ✓ | ✓ | | |
| Rotacionar keys | ✓ | ✓ | | |
| Ver todos os dados | ✓ | ✓ | ✓ | ✓ |
| Criar action items | ✓ | ✓ | ✓ | |
| Exportar dados | ✓ | ✓ | ✓ | |

### Fluxo de convite

```
Admin/Owner → preenche email + role
  → cria invitations { token: UUID, expires_at: +7 dias }
  → Resend envia email → /invite/{token}
  → Convidado clica → cria conta OU login
  → Valida: token existe + não expirou + não usado + email bate
  → Cria organization_members { role }
  → Marca invitation.used_at = now()
  → Audit log: member.invited + member.joined
```

**Segurança:** token UUID v4, single-use, expira em 7 dias, email deve bater com a conta.

---

## NAVIGATION MODEL

### Sidebar

```
[Logo ConversionOS]
▼ [OrgSwitcher]
─────────────────
  Dashboard          /app
  Projetos           /app/projetos
  Diagnóstico        /app/diagnostico    [🔒 sem dados]
  Plano de Ação      /app/plano-de-acao  [🔒 sem diagnóstico]
  Experimentos       /app/experimentos   [🔒 Phase 3]
─────────────────
  Configurações      /app/configuracoes
─────────────────
[Avatar] Nome        → perfil / sair
```

### Rotas completas

```
PÚBLICAS:
  /                  → redirect auth? /app : /login
  /login             → tela de login
  /login/magic       → magic link callback Supabase
  /signup            → criação de conta
  /invite/:token     → aceitação de convite
  /404               → not found
  /unauthorized      → sem permissão

PROTEGIDAS:
  /app               → redirect /app/projetos (ou /app/onboarding se novo)
  /app/projetos
  /app/projetos/:id
  /app/projetos/:id/configurar
  /app/diagnostico
  /app/diagnostico/:id
  /app/plano-de-acao
  /app/experimentos
  /app/configuracoes/organizacao
  /app/configuracoes/membros
  /app/configuracoes/billing
  /app/configuracoes/chaves
  /app/configuracoes/perfil

ONBOARDING (shell Foundation, lógica Engine 15):
  /app/onboarding
  /app/onboarding/instalar
  /app/onboarding/validar
  /app/onboarding/funil
  /app/onboarding/concluido
```

### Guards

```
AuthGuard:         sem sessão → /login?next={path}
RoleGuard(role):   role insuficiente → /unauthorized
OnboardingGuard:   sem projetos → /app/onboarding
```

---

## DESIGN SYSTEM

### Tokens de cor

```css
:root {
  --color-bg-base:       #09090B;
  --color-bg-surface:    #111114;
  --color-bg-elevated:   #18181C;
  --color-bg-hover:      #222227;
  --color-border:        #2A2A31;
  --color-border-subtle: #1E1E24;

  --color-accent:      #00D084;
  --color-accent-dim:  #00D08418;
  --color-danger:      #EF4444;
  --color-danger-dim:  #EF444418;
  --color-warning:     #F59E0B;
  --color-warning-dim: #F59E0B18;
  --color-info:        #3B82F6;
  --color-info-dim:    #3B82F618;
  --color-success:     #22C55E;
  --color-success-dim: #22C55E18;

  --color-text-primary:   #F4F4F5;
  --color-text-secondary: #A1A1AA;
  --color-text-muted:     #71717A;
  --color-text-disabled:  #52525B;
}
```

### Tipografia

```css
:root {
  --font-display: "Instrument Serif", Georgia, serif;
  --font-body:    "Inter", system-ui, sans-serif;
  --font-mono:    "DM Mono", "Fira Code", monospace;

  --text-xs: 11px;  --text-sm: 13px;   --text-base: 14px;
  --text-md: 15px;  --text-lg: 17px;   --text-xl: 20px;
  --text-2xl: 24px; --text-3xl: 30px;  --text-4xl: 38px;
}
```

### Espaçamento (base 4px)

```css
:root {
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --space-16: 64px;
}
```

### Raios e sombras

```css
:root {
  --radius-sm: 4px;  --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
}
```

### Componentes primitivos (Foundation owns)

| Componente | Variantes |
|---|---|
| Button | primary, secondary, ghost, danger, link |
| Input | text, email, password, search |
| Badge | critical, warning, info, success, neutral |
| Card | default, hoverable, interactive |
| Avatar | initials, image (sm/md/lg) |
| Modal | default, confirm |
| Toast | success, error, info, warning |
| Tooltip | default |
| Skeleton | text, block, circle |
| EmptyState | default |
| Dropdown | default |
| Select | default |
| Separator | horizontal, vertical |

**NÃO implementar aqui:** DiagnosisCard, FunnelChart, MetricCard analytics, ActionItemCard, ExperimentCard, AlertBanner, HealthScore.

---

## OBSERVABILIDADE

### Formato de log obrigatório (Edge Functions)

```json
{
  "level": "info|warn|error",
  "timestamp": "ISO8601",
  "service": "conversionos-api",
  "function": "nome-da-função",
  "trace_id": "uuid",
  "org_id": "uuid",
  "method": "POST",
  "path": "/api/...",
  "status": 200,
  "duration_ms": 87,
  "message": "..."
}
```

### Alertas obrigatórios (Phase 1)

| Condição | Canal | Urgência |
|---|---|---|
| Error rate > 5/min | Slack #alerts | Alta |
| Auth failures > 10/min/IP | Slack #security | Crítica |
| Edge Function timeout | Slack #alerts | Alta |
| DB connection pool esgotado | Slack #alerts | Crítica |

---

## SECURITY

### Schema SQL das tabelas Foundation

```sql
CREATE TABLE organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  plan          text NOT NULL DEFAULT 'starter',
  billing_email text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('owner', 'admin', 'analyst', 'viewer')),
  invited_by      uuid REFERENCES auth.users(id),
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE invitations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           text NOT NULL,
  role            text NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer')),
  token           uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  expires_at      timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  used_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  actor_id        uuid REFERENCES auth.users(id),
  action          text NOT NULL,
  resource_type   text,
  resource_id     uuid,
  ip_address      inet,
  user_agent      text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Índices críticos (PRIMEIRO objeto da migration 001)

```sql
-- O índice mais crítico de toda a plataforma.
-- Toda política RLS de toda engine faz lookup aqui.
-- Deve existir antes de qualquer dado ser inserido.
CREATE INDEX idx_org_members_user_org
  ON organization_members(user_id, organization_id);

CREATE INDEX idx_org_members_org
  ON organization_members(organization_id);

CREATE INDEX idx_invitations_token
  ON invitations(token) WHERE used_at IS NULL;

CREATE INDEX idx_audit_logs_org_created
  ON audit_logs(organization_id, created_at DESC);
```

### Eventos de audit obrigatórios

```
member.invited · member.joined · member.removed · member.role_changed
org.created · org.updated · org.deleted
auth.login · auth.logout · auth.failed
```

---

## PERFORMANCE

### Targets

| Métrica | Target |
|---|---|
| LCP | < 1.5s |
| CLS | < 0.1 |
| Auth check (client-side) | < 5ms |
| Sidebar render | < 100ms |
| Bundle Foundation | < 80kb gzipped |
| Bundle inicial total | < 200kb gzipped |
| Org data fetch pós-login | < 200ms P95 |

### Decisões arquiteturais de performance

1. **Index primeiro** — `idx_org_members_user_org` é o primeiro objeto da migration 001
2. **Auth não bloqueia render** — verificação de sessão é client-side (localStorage)
3. **Org data em Context** — carregado uma vez, invalidado só em mudanças de membership/role
4. **Bundle splitting** — Foundation < 80kb; engines em chunks separados com lazy loading
5. **Prefetch on hover** — 200ms hover na sidebar → prefetch do chunk da página

---

## QA CHECKLIST

Nenhum deploy em produção sem todos os itens verificados:

### Autenticação
- [ ] Magic link enviado em < 30s
- [ ] Magic link: funciona 1×, falha na 2×
- [ ] Magic link: erro claro após expiração
- [ ] Logout limpa toda session data
- [ ] ?next= redireciona corretamente após login

### Convites
- [ ] Email enviado ao endereço correto
- [ ] Token single-use confirmado
- [ ] Token expira após 7 dias
- [ ] Email diferente do convite → erro claro
- [ ] Convidar membro existente → erro claro

### Multi-tenant isolation (obrigatório em CI)
- [ ] Usuário org A não lê projetos da org B
- [ ] Usuário org A não lê eventos da org B
- [ ] Usuário org A não lê diagnósticos da org B
- [ ] Removido da org → acesso revogado imediatamente

### Roles e permissões
- [ ] Viewer não acessa /configuracoes/membros
- [ ] Analyst não remove membros
- [ ] Admin não acessa /configuracoes/billing
- [ ] Role change refletido imediatamente sem re-login

### Navegação
- [ ] Rota protegida sem auth → /login
- [ ] Role insuficiente → /unauthorized
- [ ] Sidebar colapsa em viewport < 1024px
- [ ] OrgSwitcher invalida dados da org anterior

### Design System
- [ ] Dark theme sem flash de branco no load
- [ ] Botões: hover, focus, active, disabled
- [ ] Formulários: error state com mensagem clara
- [ ] Loading: skeleton (não spinner genérico)
- [ ] Modal: fecha com ESC e click fora
- [ ] Modal: focus trap ativo

### Observabilidade
- [ ] Auth events nos logs estruturados
- [ ] Erros capturados no Sentry (sem PII)
- [ ] Audit log: member.invited, member.joined, org.created

### Performance
- [ ] LCP < 1.5s (Lighthouse em produção)
- [ ] Bundle Foundation < 80kb gzipped
- [ ] Lazy loading de chunks funcionando
- [ ] EXPLAIN ANALYZE do idx_org_members_user_org rodando em CI

---

## ESTRUTURA DE ARQUIVOS

```
src/
  contexts/
    AuthContext.tsx · OrgContext.tsx
  hooks/
    useAuth.ts · useOrg.ts · usePermissions.ts
  components/
    ui/
      Button.tsx · Input.tsx · Badge.tsx · Card.tsx · Avatar.tsx
      Modal.tsx · Toast.tsx · Tooltip.tsx · Skeleton.tsx
      EmptyState.tsx · Dropdown.tsx · Select.tsx · Separator.tsx
    layout/
      AppShell.tsx · Sidebar.tsx · OrgSwitcher.tsx
  pages/
    auth/
      Login.tsx · MagicLinkSent.tsx · AcceptInvite.tsx
    settings/
      Organization.tsx · Members.tsx · Billing.tsx · Keys.tsx · Profile.tsx
    error/
      NotFound.tsx · Unauthorized.tsx
  router/
    index.tsx · guards.tsx
  lib/
    supabase.ts · sentry.ts
  styles/
    tokens.css · reset.css

api/
  invitations/
    accept.ts

supabase/
  migrations/
    001_foundation.sql

.github/
  workflows/
    ci.yml · deploy.yml
```

---

## ECC VERDICT

| Especialista | Veredicto |
|---|---|
| Product Architect | ✅ Aprovado |
| Solution Architect | ✅ Aprovado com ressalvas |
| Frontend Architect | ✅ Aprovado |
| UX Specialist | ✅ Aprovado com ressalvas |
| Security Specialist | ✅ Aprovado |
| DevOps Architect | ✅ Aprovado com ressalvas |
| QA Lead | ✅ Aprovado |
| Performance Engineer | ✅ Aprovado com ressalvas |

**VEREDICTO FINAL: ✅ APROVADO — Pronto para Technical Design**

### Ressalvas incorporadas na implementação

1. `idx_org_members_user_org` deve ser o **primeiro objeto** da migration 001
2. CI com testes de RLS deve existir **antes do primeiro deploy em produção**
3. Magic link deve ter botão "reenviar" para mitigar gargalo mobile
4. EXPLAIN ANALYZE do índice crítico deve rodar em CI

---

## DOCUMENT HISTORY

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 2026-06-15 | Architecture Review completo — aprovado pelo ECC |

---

**PRÓXIMO PASSO:** Technical Design — contratos de API, interfaces TypeScript, migration SQL completa.
