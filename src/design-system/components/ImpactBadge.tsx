import { useTranslation } from 'react-i18next'

export type ImpactLevel = 'high' | 'medium' | 'low' | 'unknown'

export interface ImpactBadgeProps {
  level: ImpactLevel
}

const STYLES: Record<ImpactLevel, React.CSSProperties> = {
  high:    { background: 'var(--color-danger-dim)',   color: 'var(--color-danger-text)',   border: '1px solid var(--color-danger)' },
  medium:  { background: 'var(--color-warning-dim)',  color: 'var(--color-warning-text)',  border: '1px solid var(--color-warning)' },
  low:     { background: 'var(--color-info-dim)',     color: 'var(--color-info-text)',     border: '1px solid var(--color-info)' },
  unknown: { background: 'var(--color-bg-elevated)',  color: 'var(--color-text-muted)',    border: '1px solid var(--color-border)' },
}

export function ImpactBadge({ level }: ImpactBadgeProps) {
  const { t } = useTranslation('diagnosis')
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)', fontWeight: 600, lineHeight: 1.6,
      fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      ...STYLES[level],
    }}>
      {t(`impact.${level}`, level)}
    </span>
  )
}
