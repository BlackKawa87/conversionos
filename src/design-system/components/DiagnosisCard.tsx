import { useTranslation } from 'react-i18next'
import { Lightbulb, FlaskConical, Zap, ArrowRight, X, TrendingDown } from 'lucide-react'
import { ConfidenceBadge } from './ConfidenceBadge'
import type { ConfidenceLevel } from './ConfidenceBadge'

// ── Types ──────────────────────────────────────────────────────────────────

export type DiagnosisVariant = 'critical' | 'warning' | 'info'
export type DiagnosisSize    = 'hero' | 'standard' | 'compact'

export interface DiagnosisData {
  value: string | number
  label: string
  sampleSize?: string
  freshness?: string
}

export interface DiagnosisCardProps {
  // 6-step mandatory chain
  data: DiagnosisData
  context?: string
  insight: string
  hypothesis: string
  action: string | string[]
  impact: string

  // Optional metadata
  revenueEstimate?: string
  stepLabel?: string
  variant?: DiagnosisVariant
  size?: DiagnosisSize
  confidence?: ConfidenceLevel
  confidencePct?: number

  // Callbacks
  onDismiss?: () => void
  onInvestigate?: () => void
  onCreateAction?: () => void
}

// ── Constants ──────────────────────────────────────────────────────────────

const BORDER_COLOR: Record<DiagnosisVariant, string> = {
  critical: 'var(--color-danger)',
  warning:  'var(--color-warning)',
  info:     'var(--color-accent)',
}

const SEVERITY_DOT: Record<DiagnosisVariant, string> = {
  critical: 'var(--color-danger)',
  warning:  'var(--color-warning)',
  info:     'var(--color-accent)',
}

// ── Section header (shared across sizes) ──────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 'var(--text-2xs)', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'var(--color-text-faint)',
      fontFamily: 'var(--font-mono)', marginBottom: '0.25rem',
    }}>
      {text}
    </p>
  )
}

const DIVIDER: React.CSSProperties = {
  borderTop: '1px solid var(--color-border)',
  margin: '0',
}

// ── COMPACT variant ────────────────────────────────────────────────────────

function CompactCard({ data, stepLabel, variant = 'warning', revenueEstimate, onCreateAction }: DiagnosisCardProps) {
  const { t } = useTranslation('diagnosis')
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      padding: '0.5rem 0.875rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderLeft: `3px solid ${BORDER_COLOR[variant]}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <TrendingDown size={14} color={BORDER_COLOR[variant]} aria-hidden style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {stepLabel && <span style={{ color: 'var(--color-text-secondary)' }}>{stepLabel} · </span>}
        <span style={{ fontVariantNumeric: 'tabular-nums', color: BORDER_COLOR[variant], fontWeight: 600 }}>
          {typeof data.value === 'number' ? `${data.value}%` : data.value}
        </span>
        {' '}{t('labels.dropoff', 'drop-off')}
      </span>
      {revenueEstimate && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-revenue-loss)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {revenueEstimate}
        </span>
      )}
      {onCreateAction && (
        <button
          onClick={onCreateAction}
          aria-label={t('actions.view', 'View')}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: 'var(--text-xs)', fontWeight: 500, flexShrink: 0, padding: '0.125rem' }}
        >
          {t('actions.view', 'View')} <ArrowRight size={11} aria-hidden />
        </button>
      )}
    </div>
  )
}

// ── STANDARD variant ───────────────────────────────────────────────────────

function StandardCard(props: DiagnosisCardProps) {
  const { data, context, insight, hypothesis, action, impact, revenueEstimate, stepLabel, variant = 'warning', confidence, confidencePct, onCreateAction } = props
  const { t } = useTranslation('diagnosis')
  const actions = Array.isArray(action) ? action : [action]

  return (
    <article
      aria-label={`${t(`severity.${variant}`, variant)}: ${insight}`}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTop: `3px solid ${BORDER_COLOR[variant]}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: SEVERITY_DOT[variant], flexShrink: 0 }} aria-hidden />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: BORDER_COLOR[variant], fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t(`severity.${variant}`, variant)}
            </span>
            {stepLabel && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {stepLabel}
              </span>
            )}
          </div>
          {/* Data row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.125rem' }}>
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: BORDER_COLOR[variant], fontVariantNumeric: 'tabular-nums' }}>
              {typeof data.value === 'number' ? `${data.value}%` : data.value}
            </span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{data.label}</span>
            {data.sampleSize && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>· {data.sampleSize} {t('labels.sessions', 'sessions analyzed')}</span>}
          </div>
          {context && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{context}</p>}
        </div>
        {revenueEstimate && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-revenue-loss)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-heading)' }}>
              {revenueEstimate}
            </span>
            <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-faint)', marginTop: '0.1rem' }}>
              {t('labels.revenueLoss', 'est. monthly loss')}
            </p>
          </div>
        )}
      </div>

      <div style={DIVIDER} />

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <Lightbulb size={14} color="var(--color-warning)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
        <div>
          <SectionLabel text={t('chain.insight', 'INSIGHT')} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{insight}</p>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Hypothesis */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <FlaskConical size={14} color="var(--color-info)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
        <div>
          <SectionLabel text={t('chain.hypothesis', 'HYPOTHESIS')} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{hypothesis}</p>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Action + Impact */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <Zap size={14} color="var(--color-accent)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
          <div>
            <SectionLabel text={t('chain.action', 'RECOMMENDED ACTION')} />
            {actions.map((a, i) => (
              <p key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                {actions.length > 1 ? `→ ${a}` : a}
              </p>
            ))}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-success)', fontWeight: 500, marginTop: '0.25rem' }}>
              {t('labels.liftEstimate', 'Estimated lift')}: {impact}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
          {confidence && <ConfidenceBadge level={confidence} percentage={confidencePct} />}
          {onCreateAction && (
            <button
              onClick={onCreateAction}
              aria-label={t('actions.createAction', 'Create action')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-dim)',
                color: 'var(--color-accent)', borderRadius: 'var(--radius-md)',
                padding: '0.375rem 0.75rem', fontSize: 'var(--text-sm)', fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {t('actions.createAction', 'Create action')} <ArrowRight size={12} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// ── HERO variant ───────────────────────────────────────────────────────────

function HeroCard(props: DiagnosisCardProps) {
  const { data, context, insight, hypothesis, action, impact, revenueEstimate, stepLabel, variant = 'critical', confidence, confidencePct, onDismiss, onInvestigate, onCreateAction } = props
  const { t } = useTranslation('diagnosis')
  const actions = Array.isArray(action) ? action : [action]

  return (
    <article
      aria-label={`${t('hero.headline', 'Biggest revenue leak')}: ${insight}`}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTop: `4px solid ${BORDER_COLOR[variant]}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Hero header */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_DOT[variant], flexShrink: 0 }} aria-hidden />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: BORDER_COLOR[variant], fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t(`severity.${variant}`, variant)}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
            {t('hero.headline', 'Your biggest revenue leak this week')}
          </h2>
          {stepLabel && (
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stepLabel}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {confidence && <ConfidenceBadge level={confidence} percentage={confidencePct} />}
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label={t('actions.dismiss', 'Dismiss')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-faint)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
            >
              <X size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '0 1.5rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {/* Revenue stat */}
        {revenueEstimate && (
          <div style={{ background: 'var(--color-danger-light)', border: '1px solid var(--color-danger-dim)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--color-revenue-loss)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, display: 'block' }}>
              {revenueEstimate}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-text)', marginTop: '0.25rem', display: 'block' }}>
              {t('labels.revenueLoss', 'estimated monthly revenue loss')}
            </span>
          </div>
        )}
        {/* Drop-off stat */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, display: 'block' }}>
            {typeof data.value === 'number' ? `${data.value}%` : data.value}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
            {data.label}
          </span>
        </div>
      </div>

      {/* Meta */}
      {(data.sampleSize || data.freshness || context) && (
        <div style={{ padding: '0 1.5rem 1rem' }}>
          {data.sampleSize && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            {t('labels.sessions', 'sessions analyzed')}: <strong style={{ color: 'var(--color-text-muted)' }}>{data.sampleSize}</strong>
          </p>}
          {data.freshness && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '0.125rem' }}>{data.freshness}</p>}
          {context && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>{context}</p>}
        </div>
      )}

      <div style={DIVIDER} />

      {/* Hypothesis */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.625rem' }}>
        <FlaskConical size={16} color="var(--color-info)" style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
        <div>
          <SectionLabel text={t('chain.hypothesis', 'HYPOTHESIS')} />
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: 1.65 }}>{hypothesis}</p>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Action + Impact */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.625rem' }}>
        <Zap size={16} color="var(--color-accent)" style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
        <div style={{ flex: 1 }}>
          <SectionLabel text={t('chain.action', 'RECOMMENDED ACTION')} />
          {actions.map((a, i) => (
            <p key={i} style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
              → {a}
            </p>
          ))}
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-success)', fontWeight: 600, marginTop: '0.5rem' }}>
            {t('labels.liftEstimate', 'Estimated lift')}: {impact}
          </p>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Hero Footer CTAs */}
      <div style={{ padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label={t('actions.dismiss', 'Dismiss')}
              style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.875rem', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
            >
              {t('actions.dismiss', 'Dismiss')}
            </button>
          )}
          {onInvestigate && (
            <button
              onClick={onInvestigate}
              aria-label={t('actions.investigate', 'Investigate')}
              style={{ background: 'none', border: '1px solid var(--color-accent-dim)', color: 'var(--color-accent)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.875rem', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer' }}
            >
              {t('actions.investigate', 'Investigate')} →
            </button>
          )}
        </div>
        {onCreateAction && (
          <button
            onClick={onCreateAction}
            aria-label={t('actions.createAction', 'Create action')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'var(--color-accent)', border: 'none',
              color: '#FFFFFF', borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1.125rem', fontSize: 'var(--text-sm)', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('actions.createAction', 'Create action')} <ArrowRight size={14} aria-hidden />
          </button>
        )}
      </div>
    </article>
  )
}

// ── Public export ──────────────────────────────────────────────────────────

export function DiagnosisCard(props: DiagnosisCardProps) {
  const { size = 'standard' } = props
  if (size === 'hero')    return <HeroCard     {...props} />
  if (size === 'compact') return <CompactCard  {...props} />
  return                         <StandardCard {...props} />
}
