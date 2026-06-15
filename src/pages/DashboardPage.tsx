import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, ExternalLink, AlertTriangle } from 'lucide-react'
import {
  LoadingState, ErrorState, EmptyState, Badge,
  DiagnosisCard, ActionPreview, MetricCard, RevenueNumber,
} from '@/design-system'
import { useOrganization } from '@/features/organizations/hooks/useOrganization'
import { useProjects }     from '@/features/projects/hooks/useProjects'
import type { Project }    from '@/types'

// ── Greeting helper ──────────────────────────────────────────────────────────

function getGreetingKey(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {badge && <Badge variant="warning">{badge}</Badge>}
    </div>
  )
}

// ── SVG donut health score ────────────────────────────────────────────────────

function HealthScoreRing({ score }: { score: number }) {
  const r     = 30
  const circ  = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color  = score >= 80 ? 'var(--color-success)' : score >= 55 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <svg width={76} height={76} viewBox="0 0 76 76" aria-label={`Health score: ${score}`} role="img">
      <circle cx={38} cy={38} r={r} fill="none" stroke="var(--color-border)" strokeWidth={7} />
      <circle
        cx={38} cy={38} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 38 38)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={38} y={44} textAnchor="middle" fontSize={17} fontWeight={700}
        fill={color} fontFamily="var(--font-body)">
        {score}
      </text>
    </svg>
  )
}

// ── Funnel Health card ────────────────────────────────────────────────────────

function FunnelHealthCard() {
  const { t } = useTranslation('dashboard')
  const score = 72

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-xs)',
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {t('funnelHealth.title')}
        </h3>
        <Badge variant="warning">{t('funnelHealth.sample')}</Badge>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
        <HealthScoreRing score={score} />
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            {t('funnelHealth.scoreLabel')}
          </p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-warning)', fontVariantNumeric: 'tabular-nums' }}>
            {score}<span style={{ fontSize: '0.6em', color: 'var(--color-text-faint)' }}>/100</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={13} color="var(--color-danger)" aria-hidden />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {t('funnelHealth.sample2issues')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={13} color="var(--color-success)" aria-hidden />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {t('funnelHealth.sample3steps')}
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '0.5rem', lineHeight: 1.5 }}>
          {t('funnelHealth.noDataDesc')}
        </p>
      </div>
    </div>
  )
}

// ── Project Readiness card ────────────────────────────────────────────────────

function ProjectReadinessCard({ projects }: { projects: Project[] }) {
  const { t }       = useTranslation('dashboard')
  const navigate    = useNavigate()

  if (!projects.length) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.75rem' }}>{t('projectReadiness.title')}</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>{t('projectReadiness.noProjects')}</p>
      </div>
    )
  }

  const project = projects[0]
  const isSetup = project.setup_completed

  const steps: { key: keyof typeof t; done: boolean; pending?: boolean }[] = [
    { key: 'step.created' as keyof typeof t, done: true },
    { key: 'step.steps'   as keyof typeof t, done: isSetup },
    { key: 'step.snippet' as keyof typeof t, done: isSetup },
    { key: 'step.tracker' as keyof typeof t, done: false, pending: true },
  ]

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-xs)', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {t('projectReadiness.title')}
        </h3>
        {!isSetup && (
          <button
            onClick={() => navigate(`/projects/${project.id}/setup`)}
            aria-label={t('projectReadiness.configure')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer', padding: 0 }}
          >
            {t('projectReadiness.configure')} <ExternalLink size={11} aria-hidden />
          </button>
        )}
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {project.name}
      </p>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {steps.map((step, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            {step.done
              ? <CheckCircle2 size={15} color="var(--color-success)" style={{ marginTop: 1, flexShrink: 0 }} aria-hidden />
              : <Circle       size={15} color={step.pending ? 'var(--color-text-faint)' : 'var(--color-border-strong)'} style={{ marginTop: 1, flexShrink: 0 }} aria-hidden />
            }
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: step.done ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: step.done ? 500 : 400 }}>
                {t(step.key as string)}
              </span>
              {step.pending && !step.done && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '0.1rem' }}>
                  {t('projectReadiness.pending')}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t: tD }  = useTranslation('dashboard')
  const { t: tC }  = useTranslation('common')
  const { t: tDx } = useTranslation('diagnosis')
  const navigate   = useNavigate()
  const { data: org, isLoading: orgLoading, error: orgError, refetch: refetchOrg } = useOrganization()
  const { data: projects, isLoading: projLoading } = useProjects(org?.id)

  useEffect(() => {
    if (!orgLoading && org === null) navigate('/onboarding', { replace: true })
  }, [org, orgLoading, navigate])

  if (orgLoading || projLoading) return <LoadingState size="lg" />
  if (orgError)   return <ErrorState description={orgError.message} onRetry={refetchOrg} />
  if (!org)       return null

  const hasProjects = (projects?.length ?? 0) > 0
  const greeting    = tD(`greeting.${getGreetingKey()}`)
  const orgFirstName = org.name.split(' ')[0]

  // ── Mock data (sample diagnosis, all labeled) ──────────────────────────────
  const mockDiagnosis = {
    data: {
      value:      72,
      label:      tDx('labels.dropoff'),
      sampleSize: '2,840',
      freshness:  tD('demo.heroBadge'),
    },
    context:        tD('demo.context'),
    insight:        tD('demo.insight'),
    hypothesis:     tD('demo.hypothesis'),
    action:         [tD('demo.action1'), tD('demo.action2')],
    impact:         tD('demo.impact'),
    revenueEstimate:'$4,320',
    stepLabel:      'Results → Checkout',
    variant:        'critical' as const,
    size:           'hero'     as const,
    confidence:     'high'     as const,
    confidencePct:  94,
  }

  const mockActions = [
    { title: tD('demo.action1Title'), priority: 'critical' as const, expectedImpact: tD('demo.action1Impact'), effort: 'low' as const },
    { title: tD('demo.action2Title'), priority: 'high'     as const, expectedImpact: tD('demo.action2Impact'), effort: 'medium' as const },
    { title: tD('demo.action3Title'), priority: 'medium'   as const, expectedImpact: tD('demo.action3Impact'), effort: 'medium' as const },
  ]

  const mockMetrics = [
    {
      label: tD('metrics.sessions'),
      value: tD('demo.sessions'),
      trend: { value: tD('demo.sessionsTrend'), direction: 'up' as const },
      description: tD('metrics.trend7d'),
    },
    {
      label: tD('metrics.completionRate'),
      value: tD('demo.completionRate'),
      trend: { value: tD('demo.completionTrend'), direction: 'down' as const, positiveIsUp: true },
      description: tD('metrics.trend7d'),
    },
    {
      label: tD('metrics.revenueAtRisk'),
      value: tD('demo.revenueAtRisk'),
      description: tD('demo.metricsNotice'),
    },
  ]

  return (
    <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>
          {greeting}, <strong style={{ color: 'var(--color-text-primary)' }}>{orgFirstName}</strong>
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', lineHeight: 1.25 }}>
          {tC('app.name', 'ConversionOS')}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', marginTop: '0.125rem' }}>
          {tC('app.tagline', 'Conversion Intelligence Platform')}
        </p>
      </div>

      {/* ── BLOCK 1: HERO DIAGNOSIS ─────────────────────────────────────── */}
      <section aria-labelledby="hero-diagnosis-heading">
        <SectionHeader
          title={tD('sections.heroDiagnosis')}
          badge={tD('demo.heroBadge')}
        />
        <DiagnosisCard {...mockDiagnosis} />
      </section>

      {/* ── BLOCK 2: ACTION PLAN PREVIEW ────────────────────────────────── */}
      <section aria-labelledby="action-plan-heading">
        <SectionHeader
          title={tD('sections.actionPlan')}
          badge={tD('demo.badge')}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {mockActions.map((action, i) => (
            <ActionPreview key={i} {...action} />
          ))}
        </div>
      </section>

      {/* ── BLOCK 3: FUNNEL HEALTH + PROJECT READINESS (2-col) ──────────── */}
      <section aria-labelledby="health-readiness-heading" className="dashboard-two-col">
        <FunnelHealthCard />
        <ProjectReadinessCard projects={projects ?? []} />
      </section>

      {/* ── BLOCK 4: SUPPORTING METRICS ─────────────────────────────────── */}
      <section aria-labelledby="metrics-heading">
        <SectionHeader
          title={tD('sections.supportingMetrics')}
          badge={tD('demo.metricsBadge')}
        />
        <div className="dashboard-metrics-grid">
          {mockMetrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} trend={m.trend} description={m.description} />
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RevenueNumber variant="loss" value="4,320" currency="$" period="/month" size="sm" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>·</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            {tD('demo.metricsNotice')}
          </span>
        </div>
      </section>

      {/* ── BLOCK 5: PROJECTS ────────────────────────────────────────────── */}
      <section aria-labelledby="projects-heading">
        <SectionHeader title={tD('sections.projects')} />
        {!hasProjects ? (
          <EmptyState preset="no-projects" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(projects ?? []).map(p => (
              <button
                key={p.id}
                onClick={() => navigate(p.setup_completed ? `/projects/${p.id}` : `/projects/${p.id}/setup`)}
                aria-label={`Open project ${p.name}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  padding: '0.875rem 1rem', textAlign: 'left', width: '100%',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'border-color var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent-dim)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </p>
                  {p.description && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description}
                    </p>
                  )}
                </div>
                <Badge variant={p.setup_completed ? 'success' : 'neutral'}>
                  {p.setup_completed ? 'Active' : 'Setup'}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Responsive grid styles */}
      <style>{`
        .dashboard-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          align-items: start;
        }
        .dashboard-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .dashboard-two-col     { grid-template-columns: 1fr; }
          .dashboard-metrics-grid{ grid-template-columns: 1fr; }
        }
        @media (max-width: 1023px) and (min-width: 769px) {
          .dashboard-metrics-grid{ grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  )
}
