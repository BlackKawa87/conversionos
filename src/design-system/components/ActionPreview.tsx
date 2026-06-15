import { useTranslation } from 'react-i18next'
import { ArrowRight, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { ImpactBadge } from './ImpactBadge'
import type { ImpactLevel } from './ImpactBadge'

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low'
export type ActionEffort   = 'low' | 'medium' | 'high'
export type ActionStatus   = 'pending' | 'in_progress' | 'done'

export interface ActionPreviewProps {
  title: string
  priority: ActionPriority
  expectedImpact: string
  effort: ActionEffort
  status?: ActionStatus
  onAction?: () => void
}

const PRIORITY_IMPACT: Record<ActionPriority, ImpactLevel> = {
  critical: 'high',
  high:     'high',
  medium:   'medium',
  low:      'low',
}

const PRIORITY_DOT: Record<ActionPriority, string> = {
  critical: 'var(--color-danger)',
  high:     'var(--color-warning)',
  medium:   'var(--color-info)',
  low:      'var(--color-text-faint)',
}

const STATUS_ICON = {
  pending:     <Circle size={13} aria-hidden />,
  in_progress: <Clock  size={13} aria-hidden />,
  done:        <CheckCircle2 size={13} aria-hidden />,
}

const STATUS_COLOR: Record<ActionStatus, string> = {
  pending:     'var(--color-text-faint)',
  in_progress: 'var(--color-accent)',
  done:        'var(--color-success-text)',
}

export function ActionPreview({ title, priority, expectedImpact, effort, status = 'pending', onAction }: ActionPreviewProps) {
  const { t } = useTranslation('diagnosis')

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '0.875rem 1rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderLeft: `3px solid ${PRIORITY_DOT[priority]}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Status icon */}
      <span style={{ color: STATUS_COLOR[status], flexShrink: 0 }}>
        {STATUS_ICON[status]}
      </span>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: '0.25rem',
        }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ImpactBadge level={PRIORITY_IMPACT[priority]} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {t('actionPreview.expectedImpact', 'Expected impact')}: <strong style={{ color: 'var(--color-text-secondary)' }}>{expectedImpact}</strong>
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            {t(`effort.${effort}`, effort)}
          </span>
        </div>
      </div>

      {/* CTA */}
      {onAction && (
        <button
          onClick={onAction}
          aria-label={`${t('actions.act', 'Act')}: ${title}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            background: 'none', border: 'none',
            color: 'var(--color-accent)', fontSize: 'var(--text-sm)', fontWeight: 500,
            cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          {t('actions.act', 'Act')} <ArrowRight size={13} aria-hidden />
        </button>
      )}
    </div>
  )
}
