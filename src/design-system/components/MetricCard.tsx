import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Trend {
  value: string
  direction: 'up' | 'down' | 'neutral'
  positiveIsUp?: boolean
}

export interface MetricCardProps {
  label: string
  value: string | number
  trend?: Trend
  icon?: ReactNode
  description?: string
}

export function MetricCard({ label, value, trend, icon, description }: MetricCardProps) {
  const trendColor = !trend ? undefined
    : trend.direction === 'neutral' ? 'var(--color-text-faint)'
    : (trend.direction === 'up') === (trend.positiveIsUp !== false)
      ? 'var(--color-text-success)' : 'var(--color-text-danger)'

  const TrendIcon = trend?.direction === 'up' ? TrendingUp
    : trend?.direction === 'down' ? TrendingDown : Minus

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-xs)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {label}
        </span>
        {icon && <span style={{ color: 'var(--color-text-faint)' }}>{icon}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{
          fontSize: 'var(--text-3xl)', fontWeight: 700, fontFamily: 'var(--font-body)',
          fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)',
        }}>
          {value}
        </span>
        {trend && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-sm)', fontWeight: 500, color: trendColor, fontVariantNumeric: 'tabular-nums' }}>
            <TrendIcon size={14} aria-hidden />
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          {description}
        </span>
      )}
    </div>
  )
}
