# CONVERSIONOS — MASTER GOVERNANCE PROMPT
**Versão:** 2.0 — Incorpora Architecture Blueprint aprovado pelo ECC
**Status:** Documento oficial — base de todas as implementações
**ECC Mode:** Obrigatório em todas as fases

---

## PROJECT IDENTITY

**Nome:** ConversionOS
**Categoria:** Conversion Intelligence Platform

**Posicionamento:**
Sistema operacional de conversão para diagnosticar, priorizar e orientar a otimização de funis digitais.

O ConversionOS NÃO é apenas uma ferramenta de analytics.
O ConversionOS é uma plataforma de inteligência de conversão.

---

## CORE MISSION

A missão do ConversionOS é responder cinco perguntas:

1. Onde estou perdendo usuários?
2. Onde estou perdendo dinheiro?
3. Por que isso está acontecendo?
4. O que devo corrigir primeiro?
5. Qual o impacto esperado da correção?

Se o sistema não responder claramente essas cinco perguntas, ele está falhando em sua missão.

---

## PRODUCT PHILOSOPHY

O produto deve gerar valor mesmo sem:

- automações;
- integrações avançadas;
- alterações automáticas;
- acesso ao código do cliente.

O diagnóstico sozinho deve justificar a assinatura.
A automação é um acelerador — não é a proposta principal.

---

## STRATEGIC PRINCIPLE

Prioridade absoluta:

```
Diagnóstico → Hipóteses → Plano de ação → Automação
```

Nunca inverter essa ordem.

---

## WHAT CONVERSIONOS IS NOT

O ConversionOS não é Google Analytics, Mixpanel, Hotjar, Segment ou Amplitude.
Embora utilize conceitos dessas ferramentas, o objetivo não é mostrar gráficos.

O objetivo é gerar decisões.

Toda métrica deve responder: **"So what?"**
Se uma métrica não leva a uma ação, ela deve ser repensada ou removida.

---

## PRIMARY USERS (ICP)

| ICP | Objetivo principal |
|---|---|
| Media Buyers | Melhorar ROAS, encontrar gargalos |
| Infoprodutores | Aumentar conversão, reduzir abandono |
| Afiliados | Identificar campanhas vencedoras |
| Agências | Diagnosticar funis de clientes |
| Consultores CRO | Acelerar auditorias |
| Ecommerce Operators | Aumentar receita por visitante |

**ICP prioritário para lançamento:** Media Buyers + Infoprodutores
**ICP de maior LTV:** Agências

---

## CORE VALUE PROPOSITION

O ConversionOS mostra:

- onde o funil está vazando;
- quanto dinheiro está sendo perdido;
- por que o problema acontece;
- o que corrigir;
- o que testar;
- qual o impacto esperado.

---

## PRODUCT LAYERS

```
Layer 1 — Analytics      tracking, sessões, etapas, eventos, UTMs,
                          receita, dispositivos, campanhas, criativos

Layer 2 — Diagnosis      gargalos, fricções, hipóteses, anomalias, padrões

Layer 3 — Action Plan    recomendações, priorização, impacto, tarefas

Layer 4 — Actions        automações futuras, integrações suportadas,
                          otimizações assistidas
                          [NUNCA obrigatório para geração de valor]
```

---

## ENGINE ARCHITECTURE

O sistema é dividido em 15 Engines independentes.

| Engine | Nome | Prioridade |
|---|---|---|
| 01 | Foundation Engine | **P0** |
| 02 | Project Engine | **P0** |
| 03 | Tracking Engine | **P0** |
| 04 | Analytics Engine | **P0** |
| 15 | Go Live Engine | **P0** |
| 05 | Revenue Engine | P1 |
| 06 | Session Intelligence Engine | P1 |
| 07 | Friction Analysis Engine | P1 |
| 08 | Diagnosis Engine | P1 |
| 09 | Action Plan Engine | P1 |
| 10 | Alert Engine | P2 |
| 11 | Health Engine | P2 |
| 14 | Reporting Engine | P2 |
| 12 | Experiment Engine | P3 |
| 13 | Actions Framework | P4 |

**Nenhuma Engine pode ser construída diretamente.**

Toda Engine deve passar pelas etapas:

```
Architecture Review → Technical Design → Implementation →
QA Review → Security Review → Performance Review → Production Readiness Review
```

Somente após aprovação completa pode avançar.

---

## MANDATORY DEVELOPMENT PROCESS

Antes de qualquer implementação significativa, o ECC deve responder:

- Qual problema resolve?
- Existem formas mais simples?
- Como escala para 100 mil sessões?
- Como escala para 1 milhão de sessões?
- Qual custo futuro?
- Quais riscos existem?
- Qual impacto no banco?
- Qual impacto em performance?

---

## NON-NEGOTIABLE ARCHITECTURE DECISIONS

Estas decisões foram aprovadas pelo ECC após Architecture & Discovery completo.
Não podem ser revertidas sem nova revisão completa do conselho.

### 21. Arquitetura i18n-first obrigatória

O ConversionOS é construído com arquitetura i18n-first desde o primeiro componente.

**Proibido:**
```tsx
<h1>Create Project</h1>  // ❌ string hardcoded
<Button>Save</Button>    // ❌ string hardcoded
```

**Obrigatório:**
```tsx
<h1>{t('projects.create.title')}</h1>  // ✓
<Button>{t('common.save')}</Button>    // ✓
```

Nenhum texto visível ao usuário pode ser hardcoded em componente. Todo texto passa por `t('namespace.key')`.

Diagnósticos e recomendações da IA devem ser gerados diretamente no idioma do usuário — nunca gerados em inglês e traduzidos depois.

### 1. Ingestão assíncrona obrigatória

Eventos NUNCA são escritos de forma síncrona no banco de dados.
O endpoint de ingestão recebe o evento, valida, enfileira e responde 200 imediatamente.
A escrita no banco ocorre de forma assíncrona via queue (Upstash ou equivalente).

**Violação deste princípio coloca o tracker em risco sob qualquer carga.**

### 2. Dashboard nunca lê events raw

Todas as queries de dashboard leem exclusivamente de:
- materialized views;
- tabelas de agregação (ex: `daily_funnel_metrics`).

É proibido executar aggregações em tempo real sobre a tabela `events` para alimentar dashboards.

### 3. Tabela events particionada desde o primeiro deploy

A tabela `events` deve ser criada com `PARTITION BY RANGE (created_at)` desde o primeiro deploy, com partições mensais.

Adicionar particionamento retroativamente em tabela com dados é operação de risco crítico.
Não existe "adicionar depois". Implementar correto desde o início.

### 4. RLS em 100% das tabelas

Row Level Security é obrigatório em todas as tabelas sem exceção.
Nenhuma tabela pode ser criada sem RLS configurado e testado.

### 5. Tracker key write-only separado de API key

O tracker key (embutido no snippet público do cliente) é exclusivamente de escrita.
Ele só pode chamar o endpoint `/api/ingest`.
Nunca permite leitura de dados.

A API key (para o dashboard) é separada, autenticada e com escopo de leitura.
Service role keys nunca aparecem no frontend.

### 6. Rules engine antes de OpenAI

O motor de regras determinístico executa sempre antes de qualquer chamada à OpenAI.

A IA não identifica problemas — o motor de regras identifica.
A IA contextualiza e articula em linguagem natural o que o motor de regras já detectou.

### 7. Diagnósticos com TTL de cache

Diagnósticos têm tempo de vida definido (padrão: 4 horas).
O sistema não regenera um diagnóstico se não houver novos dados relevantes desde a última geração.

Regeneração desnecessária = custo de tokens desnecessário + risco de inconsistência.

### 8. Display obrigatório: dado → insight → hipótese → ação

Nenhum dado é exibido isolado.

```
PROIBIDO:   Drop-off: 72%

OBRIGATÓRIO:
  72% dos usuários abandonaram nesta etapa.
  Isso representa ~R$3.400 em receita potencial perdida nos últimos 7 dias.
  Principal hipótese: fricção no formulário mobile.
  Ação recomendada: reduzir campos e fixar CTA.
```

Todo dashboard deve responder: O que aconteceu? Por que aconteceu? O que fazer agora?

### 9. Go Live Engine é P0

O Go Live Engine (Engine 15) tem a mesma prioridade que o Tracking Engine.
Não é feature opcional ou de fase posterior.

Um produto que coleta dados corretamente mas não tem onboarding claro não gera valor.
Setup Wizard, validação de tracker e health check são partes centrais do produto v1.

### 10. Observabilidade desde o Phase 1

Logs estruturados, métricas de latência, alertas de falha e rastreabilidade devem existir desde o primeiro deploy em produção.

Não é possível operar um sistema de dados sem saber quando ele está falhando.

---

## PHASE 1 MANDATORY REQUIREMENTS

Os itens a seguir são requisitos obrigatórios do Phase 1.
Nenhum deploy de produção pode ocorrer sem todos eles implementados e aprovados pelo ECC.

### 11. Time to First Insight < 5 minutos

O usuário deve conseguir, em menos de 5 minutos após criar a conta:

1. Instalar o tracker (copy-paste do snippet)
2. Configurar as etapas do funil (wizard por URL pattern)
3. Ver os primeiros eventos chegando
4. Ver preview do que será o diagnóstico quando houver dados suficientes

Se qualquer etapa desse fluxo exigir mais de 2 minutos, é um problema de produto a ser resolvido antes do lançamento.

### 12. Setup Wizard como produto central

O Setup Wizard não é um tutorial.
É a primeira experiência do usuário com o produto e determina se ele percebe valor ou abandona.

Deve incluir:
- Geração e exibição do snippet de instalação
- Validação em tempo real de que o tracker está ativo (evento recebido)
- Configuração guiada das etapas do funil
- Health check do funil configurado
- Estado "aguardando dados" com indicador de progresso

### 13. Diagnosis Card como componente principal da UX

O Diagnosis Card é o coração visual do produto.

Deve ser o primeiro componente de UI desenhado, validado e aprovado antes de qualquer dashboard avançado.

Estrutura obrigatória do Diagnosis Card:

```
┌─────────────────────────────────────────────────────┐
│ [Ícone de severidade]  Título do problema           │
│                                                      │
│ [Dado bruto com contexto de magnitude]               │
│ [Impacto financeiro estimado]                        │
│                                                      │
│ Hipótese: [específica, contextual]                   │
│ Ação: [específica, executável]                       │
│ Impacto estimado: [mensurável]                       │
│                              [Criar Ação →]          │
└─────────────────────────────────────────────────────┘
```

---

## DATA FRESHNESS & AGGREGATION POLICY

### 16. Todo dado agregado deve exibir freshness

Nenhuma métrica pode ser exibida sem indicar quando foi atualizada pela última vez.

Formato obrigatório: *"dados atualizados há X minutos"* ou *"última atualização: HH:MM"*

SLA de frescor por tipo de dado:

| Dado | SLA padrão |
|---|---|
| Eventos brutos | Tempo real (< 30s) |
| Métricas de funil | A cada 15 minutos |
| Diagnósticos | A cada 1-4 horas |
| Relatórios | Diário |

### Aggregation jobs são sistemas críticos

Falha no job de aggregation = dashboard mostra dados desatualizados sem aviso.

Requisitos:
- Monitoramento de execução de cada job
- Alerta automático se job atrasar mais de 2× o intervalo esperado
- Logs de cada execução com duração e registros processados
- Idempotência: reexecutar um job não gera duplicatas

### Queries proibidas em dashboard

```sql
-- PROIBIDO: aggregation em tempo real sobre events
SELECT COUNT(*), AVG(time) FROM events WHERE project_id = ?

-- PROIBIDO: JOIN sem índice em tabelas de alto volume
SELECT e.*, s.* FROM events e JOIN sessions s ON e.session_id = s.id

-- PROIBIDO: ORDER BY em coluna sem índice em tabela particionada
SELECT * FROM events ORDER BY created_at DESC

-- OBRIGATÓRIO: sempre usar tabelas de agregação
SELECT * FROM daily_funnel_metrics WHERE project_id = ? AND date >= ?
```

### 15. Monitoramento de queries de dashboard

Toda query que alimenta um dashboard deve:
- Ter tempo de execução registrado
- Disparar alerta se tempo > threshold configurável (padrão: 500ms)
- Ser revisada se degradar mais de 20% em uma semana

---

## AI COST & DIAGNOSIS CACHE POLICY

### Papel correto da IA

| Motor de regras (determinístico) | IA (contextual) |
|---|---|
| Calcular drop-off rates | Gerar insight em linguagem natural |
| Detectar anomalias (Z-score) | Propor hipóteses específicas |
| Ranquear por priority score | Sugerir design de experimento |
| Disparar alertas | Escrever resumo executivo |
| Toda operação de escrita | Responder perguntas sobre dados |

**Nunca delegar para IA:**
- Ingestão ou processamento de eventos
- Cálculos de métricas (fonte da verdade são as tabelas)
- Alertas críticos
- Autenticação e autorização
- Billing

### 17. Todas as chamadas OpenAI devem ser logadas

Cada chamada à OpenAI deve gerar um registro com:

```
openai_usage_logs:
  - project_id
  - workspace_id
  - called_at
  - model_used
  - input_tokens
  - output_tokens
  - estimated_cost_usd
  - purpose         -- 'diagnosis' | 'hypothesis' | 'summary' | ...
  - cached          -- true se resultado foi servido do cache
```

Esse log é a base para billing de uso de IA por plano.

### Política de cache de diagnósticos

- TTL padrão: 4 horas
- Regenerar somente se: novos dados relevantes chegaram E TTL expirou
- Definição de "dados relevantes": volume de eventos acima de threshold configurável
- Diagnóstico em cache deve exibir: *"diagnóstico gerado há X horas"*

### Prevenção de alucinação

1. IA recebe apenas métricas calculadas — nunca eventos brutos
2. Prompt sempre delimita: "baseie-se exclusivamente nos dados fornecidos"
3. Todo output IA inclui `confidence_score` (0-100)
4. IA usa linguagem de hipótese: "a principal hipótese é..." — nunca afirmações causais
5. Cada diagnóstico exibe botão "Verificar esta hipótese" com drill-down nos dados

### Estratégia de custo de tokens

- gpt-4o-mini para classificação e triagem
- gpt-4o para diagnósticos completos e insights executivos
- Batch diário para maioria dos planos (1 chamada/projeto/dia)
- Diagnósticos sob demanda disponíveis como feature de plano superior
- Cache reduz custo estimado em ~70% em workloads típicos

### 18. Sistema de aprendizado com resultados

O sistema deve rastrear o resultado de recomendações implementadas:

```
experiment_outcomes:
  - hypothesis_id
  - action_item_id
  - implemented_at
  - measured_at
  - baseline_conversion_pct
  - result_conversion_pct
  - delta_pct
  - outcome: 'positive' | 'negative' | 'neutral' | 'inconclusive'
```

Quando uma hipótese é validada positivamente, o `confidence_score` de hipóteses similares futuras aumenta.
Quando negativa, diminui.
Esse mecanismo torna o sistema mais preciso com o tempo.

---

## SECURITY & RLS ENFORCEMENT POLICY

### 14. RLS obrigatório e testado em CI

RLS não é configuração — é requisito de segurança.

Regras:
- Toda tabela criada deve ter RLS ativado antes do primeiro merge
- Todo PR que cria tabela sem RLS é automaticamente reprovado em CI
- Teste de RLS: verificar que workspace A nunca consegue ler dados do workspace B

O pipeline de CI deve incluir testes específicos de isolamento multi-tenant:

```
test: workspace isolation
  - create workspace A with project and events
  - authenticate as workspace B user
  - assert: cannot read workspace A projects
  - assert: cannot read workspace A events
  - assert: cannot read workspace A diagnoses
  - assert: cannot write events to workspace A project
```

Esses testes devem rodar em todo PR que toque em tabelas, RLS policies ou APIs de leitura.

### Separação obrigatória de chaves

| Chave | Tipo | Escopo | Exposição |
|---|---|---|---|
| `tracker_key` | Write-only | Apenas `/api/ingest` | Pública (no snippet JS) |
| `api_key` | Read | Dashboard APIs autenticadas | Privada (dashboard) |
| `supabase_anon_key` | Limitada | Com RLS ativo | Frontend |
| `supabase_service_role_key` | Irrestrita | Nunca no frontend | Apenas Edge Functions |

### 19. Proteção do endpoint de ingestão público

O endpoint público `/api/ingest` deve ter:

- Rate limit por IP: 1.000 requests/minuto
- Rate limit por `tracker_key`: 10.000 eventos/hora
- Validação estrita de schema (rejeitar campos desconhecidos)
- CORS restrito ao domínio registrado no projeto
- Detecção de bot: user-agent inválido, velocidade impossível de eventos
- Detecção de spoofing: sequências de eventos impossíveis (purchase sem session)
- Sessions suspeitas são marcadas como `suspicious: true`, não deletadas (auditabilidade)
- Circuit breaker por projeto: suspender ingestão se volume anômalo detectado

### Audit log obrigatório

```sql
audit_logs (
  id uuid PRIMARY KEY,
  workspace_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,    -- 'project.delete', 'key.rotate', 'data.export'
  resource_type text,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL
)
```

Ações que devem sempre gerar audit log:
- Criação/exclusão de projetos
- Rotação de chaves
- Export de dados
- Acesso administrativo
- Alteração de permissões

---

## GO LIVE ENGINE POLICY

O Go Live Engine (Engine 15) tem prioridade P0 — igual ao Tracking Engine.

### Definição

O Go Live Engine é o sistema que garante que o cliente consegue instalar, validar e ativar o ConversionOS no seu funil sem auxílio externo.

### Componentes obrigatórios do Go Live Engine

**1. Setup Wizard**
- Geração do snippet de instalação personalizado
- Instruções para instalação (HTML, GTM, Shopify, WordPress)
- Validação em tempo real do tracker (event recebido = ✓)
- Configuração guiada das etapas do funil por URL pattern

**2. Tracker Health Check**
- Verificação contínua de que eventos estão chegando
- Alerta se nenhum evento recebido em > 1 hora (em horário comercial)
- Diagnóstico de problemas comuns (CORS, script não carregado, URL não mapeada)

**3. Estado de Espera Informado**
- Quando dados são insuficientes para diagnóstico, exibir:
  - Quantas sessões são necessárias para o primeiro diagnóstico
  - Quantas sessões já foram registradas
  - Estimativa de tempo até o primeiro diagnóstico
  - Preview do que o diagnóstico vai mostrar

**4. Funnel Validation**
- Confirmar que todas as etapas configuradas estão recebendo eventos
- Alertar sobre etapas configuradas mas sem eventos nos últimos 7 dias
- Sugerir ajustes no URL pattern se detectar inconsistência

### Critério de "Go Live" aprovado

Um projeto só sai do estado "configuração" quando:
- [ ] Tracker instalado e validado (evento recebido)
- [ ] Mínimo 2 etapas de funil configuradas
- [ ] Mínimo 1 etapa de funil com evento de purchase/conversão
- [ ] Pelo menos 100 sessões registradas

---

## UX INSIGHT POLICY

### 20. Nenhuma métrica exibida sem contexto acionável

Exibir um número sem responder "e daí?" é falhar na missão do produto.

Todo card de métrica deve conter:

```
[Dado]        → o número bruto com unidade clara
[Contexto]    → comparação: vs período anterior, vs benchmark, vs outras etapas
[Insight]     → o que esse número significa em linguagem de negócio
[Hipótese]    → por que isso pode estar acontecendo
[Ação]        → o que fazer a respeito
```

### Proibições de UX

- Exibir percentual sem valor absoluto correspondente
- Exibir valor absoluto sem percentual de contexto
- Exibir métrica sem indicar tendência (↑↓→)
- Exibir diagnóstico sem confiança estimada
- Exibir recomendação genérica

### Padrão de qualidade para recomendações

Toda recomendação deve ser específica, contextual, executável e mensurável.

**Proibido:**
- "Melhorar o checkout"
- "Otimizar o copy"
- "Reduzir fricção"

**Obrigatório:**
- "Remover os campos CPF e Telefone do step 3 (checkout mobile). Esses campos têm taxa de erro 3× maior que os demais e são responsáveis por 38% dos abandonos nesta etapa."

### Dashboards obrigatórios no MVP

| Dashboard | Perguntas que responde |
|---|---|
| Funnel Overview | Onde estou perdendo usuários? Quanto vale cada etapa? |
| Diagnosis Feed | Quais são os meus maiores problemas agora? |
| Action Plan | O que devo fazer primeiro? Qual o impacto esperado? |
| Traffic Quality | Qual tráfego converte? Qual queima verba? |

### Dashboards proibidos no MVP

- Pageviews totais sem contexto de funil
- Tempo no site sem correlação com conversão
- Mapas de calor (Phase 3 no mínimo)
- Relatórios 100% customizáveis (Phase 3)

---

## INTERNATIONALIZATION POLICY

**ECC Approved | v1.0 | 2026-06-15**

---

### Idioma Padrão

**English** é o idioma padrão da plataforma.

### Idiomas Suportados

| Código | Idioma | Status |
|---|---|---|
| `en` | English | Default — lançamento |
| `pt` | Português (pt-BR) | Lançamento |
| `es` | Español | Lançamento |

Idiomas futuros (Phase 2+): fr, de, zh, ja — adicionáveis sem mudança arquitetural.

---

### Library & Arquitetura

**Biblioteca:** `react-i18next` + `i18next-browser-languagedetector`

**Estrutura de arquivos:**
```
src/i18n/
├── config.ts                 # inicialização do i18next
├── types.ts                  # TypeScript key typing obrigatório
└── locales/
    ├── en/
    │   ├── common.json       # botões, labels, ações compartilhadas
    │   ├── auth.json         # login, logout, magic link, sessão
    │   ├── dashboard.json    # métricas, visão geral, cards
    │   ├── projects.json     # CRUD de projetos
    │   ├── diagnosis.json    # diagnosis cards, insights, hipóteses
    │   ├── alerts.json       # alertas e notificações
    │   ├── settings.json     # páginas de configuração
    │   ├── onboarding.json   # wizard de onboarding
    │   ├── action-plan.json  # planos de ação
    │   ├── validation.json   # erros de formulário
    │   └── errors.json       # mensagens de erro do sistema
    ├── pt/
    │   └── (mesma estrutura)
    └── es/
        └── (mesma estrutura)
```

---

### Regra de Tradução

**Tudo o que é visível ao usuário deve ser traduzível:**

| Elemento | Obrigatório |
|---|---|
| Menus, Sidebar, Topbar | ✓ |
| Dashboards e cards | ✓ |
| Diagnosis Cards | ✓ |
| Action Plans | ✓ |
| Alertas e notificações | ✓ |
| Onboarding | ✓ |
| Tooltips | ✓ |
| Botões e modais | ✓ |
| Mensagens de erro | ✓ |
| Estados vazios e loading | ✓ |
| Relatórios | ✓ |
| Diagnósticos IA | ✓ |
| Recomendações IA | ✓ |
| Emails transacionais | ✓ |
| Páginas de configuração | ✓ |

---

### Language Detection Strategy

Ordem de prioridade (maior para menor):

```
1. user.preferred_language (banco — após auth)
2. localStorage 'conversionos_lang' (sessão anterior)
3. navigator.language (idioma do browser)
4. 'en' (fallback universal)
```

Mapeamento de browser language para suportados:
- `pt`, `pt-BR`, `pt-PT` → `pt`
- `es`, `es-*` → `es`
- qualquer outro → `en`

---

### Language Switcher

**Localização:** Topbar (canto superior direito)

**Opções:**
- 🇺🇸 English
- 🇧🇷 Português
- 🇪🇸 Español

**Comportamento:**
- Troca instantânea sem reload de página
- Persiste em localStorage imediatamente
- Persiste em `user_profiles.preferred_language` via API (assíncrono)
- Usuário não perde contexto da página atual

---

### User Language Model

```typescript
export type SupportedLanguage = 'en' | 'pt' | 'es'

// Adicionado a UserProfile:
preferredLanguage: SupportedLanguage   // default: 'en'
```

**Banco de dados — coluna adicionada em user_profiles:**
```sql
preferred_language text NOT NULL DEFAULT 'en'
  CHECK (preferred_language IN ('en', 'pt', 'es'))
```

**Coluna adicionada em invitations** (para email do convidado):
```sql
invitee_language text NOT NULL DEFAULT 'en'
  CHECK (invitee_language IN ('en', 'pt', 'es'))
```

---

### AI Localization Strategy

**Regra:** Diagnósticos, hipóteses e recomendações são gerados **diretamente** no idioma do usuário via instrução no system prompt. Nunca gerados em inglês e traduzidos depois.

**Exemplo de system prompt:**
```
Respond exclusively in ${LANGUAGE_TO_PROMPT[userLanguage]}.
Do not use English unless the user's language is English.
```

**Constante obrigatória:**
```typescript
export const LANGUAGE_TO_PROMPT: Record<SupportedLanguage, string> = {
  en: 'English',
  pt: 'Brazilian Portuguese (pt-BR)',
  es: 'Latin American Spanish',
}
```

**Exemplos de output esperado:**

English:
> "Your biggest bottleneck is the transition from Results to Checkout. 68% of users drop off at this step, representing ~$4,200 in lost revenue over the last 7 days."

Português:
> "Seu maior gargalo está na transição entre Resultados e Checkout. 68% dos usuários abandonam nesta etapa, representando ~R$4.200 em receita perdida nos últimos 7 dias."

Español:
> "Su mayor cuello de botella está en la transición entre Resultados y Checkout. El 68% de los usuarios abandona en este paso, lo que representa ~$4.200 en ingresos perdidos en los últimos 7 días."

**Adicionado em `openai_usage_logs`:**
```sql
language_used text  -- 'en' | 'pt' | 'es'
```

---

### Email Localization

Todos os templates de email da Resend devem ter versão em en · pt · es:

| Email | Localizado |
|---|---|
| Magic link / Login | ✓ |
| Convite de membro | ✓ |
| Alerta de performance | ✓ |
| Notificação de diagnóstico | ✓ |
| Onboarding (sequência) | ✓ |

O idioma usado no email de convite é determinado por `invitations.invitee_language`, não pelo idioma do remetente.

---

### QA Requirements — i18n

Testes obrigatórios adicionados:

```
1. language_switch_persists_in_localstorage
2. language_switch_persists_in_database
3. language_reload_restores_from_db
4. unsupported_browser_language_falls_back_to_en
5. unauthenticated_user_uses_browser_language
6. authenticated_user_uses_preferred_language
7. email_invite_uses_invitee_language_not_sender
8. ai_diagnosis_generated_in_correct_language
```

---

### Success Criteria

- [ ] Usuário americano usa 100% da plataforma em inglês
- [ ] Usuário brasileiro usa 100% da plataforma em português
- [ ] Usuário espanhol usa 100% da plataforma em espanhol
- [ ] Troca instantânea entre idiomas sem perda de contexto
- [ ] Diagnósticos e recomendações da IA no idioma correto
- [ ] Zero strings hardcoded em componentes
- [ ] TypeScript verifica chaves de tradução em build time
- [ ] Emails enviados no idioma correto do destinatário

---

## DATABASE PRINCIPLES

- RLS em todas as tabelas (obrigatório — ver seção Security & RLS Enforcement Policy)
- Materialized views e agregações para todas as queries de dashboard
- Índices estratégicos definidos no design, não adicionados como correção posterior
- Particionamento da tabela `events` por mês desde o primeiro deploy
- Evitar joins excessivos e tabelas redundantes
- Auditabilidade: toda ação sensível gera registro em `audit_logs`
- Archiving de eventos com mais de 90 dias (configurável por plano)

---

## SECURITY PRINCIPLES

**Obrigatório:**
- RLS com testes automatizados em CI
- Validação de payload no endpoint de ingestão
- Rate limiting por IP e por tracker key
- Proteção contra spoofing, bots e fraude de tracking
- Logs de auditoria para ações sensíveis
- Separação de chaves por escopo

**Nunca expor:**
- Service role keys
- Segredos de ambiente
- Tokens de terceiros
- Dados de outros workspaces

---

## PERFORMANCE PRINCIPLES

### Targets de latência

| Operação | Target P95 | Target P99 |
|---|---|---|
| Event ingest (response) | < 80ms | < 150ms |
| Dashboard load | < 500ms | < 800ms |
| Diagnosis generation (background) | < 2min | < 5min |
| Alert detection | < 5min | < 10min |

### Níveis de escala

| Nível | Volume | Estratégia |
|---|---|---|
| 1 | 10k sessões/mês | Básico: índices + RLS |
| 2 | 100k sessões/mês | Particionamento + materialized views + read replica |
| 3 | 1M sessões/mês | Read replica + archiving + aggregation jobs otimizados |
| 4 | 10M sessões/mês | OLAP separado para events raw; Supabase para metadata |

Toda decisão arquitetural deve considerar os quatro níveis.

---

## COST PRINCIPLES

Toda decisão técnica deve considerar:

- custo Supabase (compute, bandwidth, storage)
- custo Vercel (function invocations, bandwidth)
- custo OpenAI (tokens input + output por modelo)
- custo Resend (emails enviados)

Evitar soluções que aumentem custo sem benefício claro mensurável.
OpenAI é o custo que mais escala com volume — caching e batching são obrigatórios.

---

## SUCCESS METRICS

O sucesso do ConversionOS será medido por:

- Tempo para identificar o primeiro gargalo (meta: < 24h após setup)
- Tempo para gerar o primeiro diagnóstico acionável
- Melhoria de conversão documentada dos clientes
- Retenção após 30/60/90 dias
- Uso recorrente da plataforma (logins/semana por workspace)

---

## ECC REVIEW SPECIALISTS

Especialistas disponíveis para revisão obrigatória:

- Product Architect
- Solution Architect
- Database Architect
- Analytics Architect
- CRO Specialist
- Security Specialist
- Frontend Architect
- UX Specialist
- DevOps Architect
- QA Lead
- Performance Engineer
- Data Engineer
- AI Systems Architect

Nenhuma implementação importante pode ser realizada sem revisão dos especialistas relevantes.

---

## GO LIVE CRITERIA (por módulo)

Nenhum módulo é considerado pronto sem:

- [ ] QA aprovado
- [ ] Security aprovado (incluindo RLS testado em CI)
- [ ] Performance aprovada (queries dentro dos targets de latência)
- [ ] ECC Review aprovada
- [ ] Observabilidade configurada (logs, métricas, alertas)
- [ ] Data freshness exibida no dashboard

---

## LANGUAGE & INTERNATIONALIZATION

O ConversionOS opera em **English-First + Internationalization-First**.

**Idioma padrão da plataforma:** English

**Idiomas suportados no lançamento:** English · Português · Español

Ver seção completa: **INTERNATIONALIZATION POLICY** abaixo.

---

## DOCUMENT HISTORY

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 2026-06-15 | Master Governance Prompt inicial |
| 2.0 | 2026-06-15 | Incorporação das 20 decisões não-negociáveis aprovadas pelo ECC após Architecture & Discovery |
| 3.0 | 2026-06-15 | Internationalization Policy — English-First + i18n-first architecture. Decisão #21 adicionada. Suporte a en · pt · es no lançamento. AI Localization Strategy. |

---

*Este documento é a fonte da verdade do ConversionOS.*
*Qualquer decisão técnica ou de produto que contradiga este documento requer nova revisão do ECC antes de ser implementada.*
