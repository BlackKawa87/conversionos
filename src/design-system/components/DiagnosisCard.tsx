import { useTranslation } from 'react-i18next'
import { Lightbulb, FlaskConical, Zap, ArrowRight } from 'lucide-react'
import { Badge } from './Badge'

type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface DiagnosisCardProps {
  dropoffRate?: string | number
  potentialRevenue?: string
  insight: string
  hypothesis: string
  action: string
  severity?: Severity
  stepLabel?: string
  onAction?: () => void
}

const SEV_BADGE: Record<Severity, { variant: 'danger' | 'warning' | 'neutral' | 'accent'; label: string }> = {
  critical: { variant: 'danger',  label: 'CRITICAL' },
  high:     { variant: 'warning', label: 'HIGH' },
  medium:   { variant: 'neutral', label: 'MEDIUM' },
  low:      { variant: 'accent',  label: 'LOW' },
}

const SEV_BORDER: Record<Severity, string> = {
  critical: 'var(--color-danger)',
  high:     'var(--color-warning)',
  medium:   'var(--color-text-faint)',
  low:      'var(--color-accent)',
}

export function DiagnosisCard({ dropoffRate, potentialRevenue, insight, hypothesis, action, severity = 'high', stepLabel, onAction }: DiagnosisCardProps) {
  const { t } = useTranslation('shell')
  const badge  = SEV_BADGE[severity]
  const border = SEV_BORDER[severity]

  return (
    <article
      aria-label={`Diagnosis: ${insight}`}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-bg-border)',
        borderTop: `3px solid ${border}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* ── DADO ── */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-bg-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('diagnosis.dado', 'DADO')}
            </span>
            {stepLabel && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{stepLabel}</span>}
          </div>
          {dropoffRate !== undefined && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>
                {typeof dropoffRate === 'number' ? `${dropoffRate}%` : dropoffRate}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {t('diagnosis.dropoffLabel', 'drop-off')}
              </span>
            </div>
          )}
          {potentialRevenue && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {potentialRevenue}
            </p>
          )}
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* ── INSIGHT ── */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--color-bg-border)', display: 'flex', gap: '0.625rem' }}>
        <Lightbulb size={15} color="var(--color-warning)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {t('diagnosis.insight', 'INSIGHT')}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{insight}</p>
        </div>
      </div>

      {/* ── HIPÓTESE ── */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--color-bg-border)', display: 'flex', gap: '0.625rem' }}>
        <FlaskConical size={15} color="var(--color-info)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {t('diagnosis.hipotese', 'HIPÓTESE')}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{hypothesis}</p>
        </div>
      </div>

      {/* ── AÇÃO ── */}
      <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.625rem', flex: 1 }}>
          <Zap size={15} color="var(--color-accent)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              {t('diagnosis.acao', 'AÇÃO')}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{action}</p>
          </div>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            aria-label={`Act on: ${action}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'var(--color-accent-dim)', border: '1px solid rgba(0,208,132,0.25)',
              color: 'var(--color-accent)', borderRadius: 'var(--radius-md)',
              padding: '0.375rem 0.75rem', fontSize: 'var(--text-sm)', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {t('diagnosis.agir', 'Agir')} <ArrowRight size={13} aria-hidden />
          </button>
        )}
      </div>
    </article>
  )
}
