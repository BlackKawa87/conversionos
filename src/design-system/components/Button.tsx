import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const VAR: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--color-accent)',   color: '#000',                    border: 'none' },
  secondary: { background: 'transparent',            color: 'var(--color-text-primary)', border: '1px solid var(--color-bg-border)' },
  ghost:     { background: 'transparent',            color: 'var(--color-text-muted)',  border: 'none' },
  danger:    { background: 'rgba(239,68,68,0.10)',   color: 'var(--color-danger)',      border: '1px solid var(--color-danger)' },
}

const SZ: Record<Size, React.CSSProperties> = {
  sm: { padding: '0.25rem 0.625rem', fontSize: 'var(--text-sm)',  height: '1.875rem', gap: '0.375rem' },
  md: { padding: '0.5rem 1rem',     fontSize: 'var(--text-base)', height: '2.375rem', gap: '0.5rem'   },
  lg: { padding: '0.625rem 1.25rem',fontSize: 'var(--text-lg)',  height: '2.875rem', gap: '0.5rem'   },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, leftIcon, rightIcon, style, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-md)', fontWeight: 500, cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.55 : 1, transition: 'opacity var(--transition-fast), background var(--transition-fast)',
        lineHeight: 1, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
        ...VAR[variant], ...SZ[size], ...style,
      }}
      {...rest}
    >
      {loading
        ? <span aria-hidden style={{ width: '1em', height: '1em', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '9999px', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
        : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
)
Button.displayName = 'Button'
