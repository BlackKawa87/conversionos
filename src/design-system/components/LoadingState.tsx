import { useTranslation } from 'react-i18next'

export interface LoadingStateProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 20, md: 32, lg: 48 }

export function LoadingState({ label, size = 'md' }: LoadingStateProps) {
  const { t } = useTranslation('shell')
  const px = SIZES[size]
  const text = label ?? t('states.loading', 'Loading…')
  return (
    <div
      role="status"
      aria-label={text}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', padding: '3rem 1.5rem',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'block', width: px, height: px,
          border: `${size === 'sm' ? 2 : 3}px solid var(--color-bg-border)`,
          borderTopColor: 'var(--color-accent)',
          borderRadius: '9999px',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>{text}</span>
    </div>
  )
}
