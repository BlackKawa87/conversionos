import { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const VAR: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: 'var(--color-success-dim)',  color: 'var(--color-success-text)', border: '1px solid var(--color-success)' },
  warning: { background: 'var(--color-warning-dim)',  color: 'var(--color-warning-text)', border: '1px solid var(--color-warning)' },
  danger:  { background: 'var(--color-danger-dim)',   color: 'var(--color-danger-text)',  border: '1px solid var(--color-danger)' },
  neutral: { background: 'var(--color-bg-elevated)',  color: 'var(--color-text-muted)',   border: '1px solid var(--color-border)' },
  accent:  { background: 'var(--color-accent-dim)',   color: 'var(--color-accent)',       border: '1px solid var(--color-accent)' },
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)', fontWeight: 500, lineHeight: 1.6,
      fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
      ...VAR[variant],
    }}>
      {children}
    </span>
  )
}
