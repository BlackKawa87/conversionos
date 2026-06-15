import { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'elevated' | 'interactive'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: string
}

const VAR: Record<CardVariant, React.CSSProperties> = {
  default:     { background: 'var(--color-bg-card)',     border: '1px solid var(--color-bg-border)' },
  elevated:    { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', boxShadow: 'var(--shadow-md)' },
  interactive: { background: 'var(--color-bg-card)',     border: '1px solid var(--color-bg-border)', cursor: 'pointer', transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)' },
}

export function Card({ variant = 'default', padding = '1.25rem', children, style, ...rest }: CardProps) {
  return (
    <div
      style={{ borderRadius: 'var(--radius-lg)', padding, ...VAR[variant], ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
