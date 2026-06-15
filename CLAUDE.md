# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

**ConversionOS** — Conversion Intelligence Platform

A plataforma diagnostica, prioriza e orienta a otimização de funis digitais. Não é uma ferramenta de analytics: é um sistema operacional de conversão.

**Cinco perguntas que o sistema deve sempre responder:**
1. Onde estou perdendo usuários?
2. Onde estou perdendo dinheiro?
3. Por que isso está acontecendo?
4. O que devo corrigir primeiro?
5. Qual o impacto esperado da correção?

Se o sistema não responde essas cinco perguntas claramente, está falhando.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Database/Auth:** Supabase (RLS obrigatório em todas as tabelas)
- **Deploy:** Vercel (serverless functions para APIs)
- **AI:** OpenAI API (recomendações específicas e contextuais)
- **Email:** Resend
- **Language:** Português (pt-BR) em todo o UI

## Commands

```bash
npm run dev       # Dev server
npm run build     # TypeScript check + build
npm run lint      # ESLint
npm run preview   # Preview build local
```

No test framework is configured yet. Add vitest when test coverage becomes a requirement.

## Governance Document

O documento oficial de governança do projeto está em:
`docs/CONVERSIONOS_MASTER_GOVERNANCE.md`

Toda decisão técnica e de produto deve ser validada contra esse documento antes de implementação.

## ECC Mode — Mandatory

Todo trabalho neste projeto opera em ECC Mode. Antes de qualquer implementação significativa, os especialistas relevantes devem revisar.

**Especialistas disponíveis:**
Product Architect · Solution Architect · Database Architect · Analytics Architect · CRO Specialist · Security Specialist · Frontend Architect · UX Specialist · DevOps Architect · QA Lead · Performance Engineer · Data Engineer · AI Systems Architect

**Perguntas obrigatórias antes de implementar:**
- Qual problema resolve?
- Existem formas mais simples?
- Como escala para 100k sessões? Para 1M sessões?
- Qual custo futuro (Supabase, Vercel, OpenAI, Resend)?
- Quais riscos existem?
- Qual impacto no banco e em performance?

## Engine Architecture

O sistema é dividido em 15 Engines independentes. Nenhuma Engine pode ser construída diretamente — toda Engine passa por: Architecture Review → Technical Design → Implementation → QA Review → Security Review → Performance Review → Production Readiness Review.

| Engine | Nome |
|--------|------|
| 01 | Foundation Engine |
| 02 | Project Engine |
| 03 | Tracking Engine |
| 04 | Analytics Engine |
| 05 | Revenue Engine |
| 06 | Session Intelligence Engine |
| 07 | Friction Analysis Engine |
| 08 | Diagnosis Engine |
| 09 | Action Plan Engine |
| 10 | Alert Engine |
| 11 | Health Engine |
| 12 | Experiment Engine |
| 13 | Actions Framework |
| 14 | Reporting Engine |
| 15 | Go Live Engine |

## Product Layers

```
Layer 1 — Analytics     tracking, sessões, etapas, eventos, UTMs, receita, dispositivos, campanhas
Layer 2 — Diagnosis     gargalos, fricções, hipóteses, anomalias, padrões
Layer 3 — Action Plan   recomendações, priorização, impacto, tarefas
Layer 4 — Actions       automações futuras (nunca obrigatório para gerar valor)
```

**Ordem estratégica obrigatória:** Diagnóstico → Hipóteses → Plano de ação → Automação. Nunca inverter.

## UX Principle — Data → Insight → Hypothesis → Action

Todo dado exibido deve seguir o padrão:

```
ERRADO:   Drop-off: 72%

CORRETO:  72% dos usuários abandonaram nesta etapa.
          Isso representa ~£3.400 em receita potencial perdida nos últimos 7 dias.
          Principal hipótese: fricção mobile.
          Ação recomendada: reduzir campos e fixar CTA.
```

Todo dashboard deve responder: O que aconteceu? Por que aconteceu? O que fazer agora?

## AI Requirements

Respostas genéricas são proibidas. Toda recomendação deve ser **específica, contextual, executável e mensurável**.

Proibido:
- "melhorar checkout"
- "melhorar copy"
- "melhorar página"

## Database Principles

- RLS em todas as tabelas (obrigatório)
- Priorizar materialized views e agregações para consultas analíticas
- Índices estratégicos desde o design inicial
- Evitar joins excessivos e tabelas redundantes
- Auditabilidade: logs de ações sensíveis

## Security Principles

Obrigatório: RLS · validação de payloads · rate limiting · proteção contra spoofing · proteção contra tracking fraud · logs de auditoria

Nunca expor: service role keys · segredos · tokens sensíveis

## Performance Targets

| Nível | Volume |
|-------|--------|
| 1 | 10k sessões/mês |
| 2 | 100k sessões/mês |
| 3 | 1M sessões/mês |

Toda arquitetura deve ser projetada considerando os três níveis.

## Go Live Criteria

Nenhum módulo é considerado pronto sem aprovação de: QA · Security · Performance · ECC Review.

## Primary Users (ICP)

Media Buyers · Infoprodutores · Afiliados · Agências · Consultores CRO · Ecommerce Operators

## What ConversionOS Is NOT

Não é Google Analytics, Mixpanel, Hotjar, Segment ou Amplitude. O objetivo não é mostrar gráficos — é gerar decisões. Toda métrica deve responder: "So what?" Se não leva a uma ação, deve ser repensada.
