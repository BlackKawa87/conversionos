import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

export type RevenueVariant = 'loss' | 'gain' | 'neutral'
export type RevenueSize    = 'sm' | 'md' | 'lg' | 'hero'

export interface RevenueNumberProps {
  variant: RevenueVariant
  value: string
  currency?: string
  period?: string
  trend?: 'up' | 'down' | 'neutral'
  size?: RevenueSize
}

const COLOR: Record<RevenueVariant, string> = {
  loss:    'var(--color-revenue-loss)',
  gain:    'var(--color-revenue-gain)',
  neutral: 'var(--color-text-primary)',
}

const FONT_SIZE: Record<RevenueSize, string> = {
  sm:   'var(--text-xl)',
  md:   'var(--text-2xl)',
  lg:   'var(--text-3xl)',
  hero: 'var(--text-4xl)',
}

const FONT_FAMILY: Record<RevenueVariant, string> = {
  loss:    'var(--font-heading)',
  gain:    'var(--font-body)',
  neutral: 'var(--font-body)',
}

const FONT_WEIGHT: Record<RevenueVariant, number> = {
  loss:    700,
  gain:    800,
  neutral: 700,
}

export function RevenueNumber({ variant, value, currency, period, trend, size = 'md' }: RevenueNumberProps) {
  const { t } = useTranslation('diagnosis')
  const color      = COLOR[variant]
  const TrendIcon  = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'down' && variant === 'loss' ? 'var(--color-danger-text)'
    : trend === 'up' && variant === 'gain' ? 'var(--color-success-text)'
    : 'var(--color-text-faint)'
  const label = t(`revenueNumber.${variant}`, variant)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
      <span style={{
        fontFamily: FONT_FAMILY[variant],
        fontSize:   FONT_SIZE[size],
        fontWeight: FONT_WEIGHT[variant],
        color,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
        letterSpacing: variant === 'loss' ? '-0.01em' : undefined,
      }}>
        {currency && <span style={{ fontSize: '0.7em', verticalAlign: 'super', marginRight: '0.1em' }}>{currency}</span>}
        {value}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {label}{period ? ` · ${period}` : ''}
        </span>
        {trend && trend !== 'neutral' && (
          <span style={{ display: 'flex', alignItems: 'center', color: trendColor }}>
            <TrendIcon size={12} aria-hidden />
          </span>
        )}
      </div>
    </div>
  )
}
