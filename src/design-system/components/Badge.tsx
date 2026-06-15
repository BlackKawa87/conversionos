import { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const VAR: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: 'rgba(34,197,94,0.12)',   color: 'var(--color-success)', border: '1px solid rgba(34,197,94,0.25)' },
  warning: { background: 'rgba(245,158,11,0.12)',  color: 'var(--color-warning)', border: '1px solid rgba(245,158,11,0.25)' },
  danger:  { background: 'rgba(239,68,68,0.12)',   color: 'var(--color-danger)',  border: '1px solid rgba(239,68,68,0.25)' },
  neutral: { background: 'rgba(136,136,136,0.12)', color: 'var(--color-text-muted)', border: '1px solid rgba(136,136,136,0.2)' },
  accent:  { background: 'var(--color-accent-dim)', color: 'var(--color-accent)',  border: '1px solid rgba(0,208,132,0.25)' },
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
