import { useTranslation } from 'react-i18next'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel
  percentage?: number
}

const STYLES: Record<ConfidenceLevel, React.CSSProperties> = {
  high:   { background: 'var(--color-success-dim)',  color: 'var(--color-success-text)',  border: '1px solid var(--color-success)' },
  medium: { background: 'var(--color-warning-dim)',  color: 'var(--color-warning-text)',  border: '1px solid var(--color-warning)' },
  low:    { background: 'var(--color-bg-elevated)',  color: 'var(--color-text-muted)',    border: '1px solid var(--color-border)' },
}

export function ConfidenceBadge({ level, percentage }: ConfidenceBadgeProps) {
  const { t } = useTranslation('diagnosis')
  const label = percentage != null
    ? `${t('confidence.label', 'Confidence')}: ${percentage}%`
    : t(`confidence.${level}`, level)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)', fontWeight: 500, lineHeight: 1.6,
      fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
      ...STYLES[level],
    }}>
      {label}
    </span>
  )
}
