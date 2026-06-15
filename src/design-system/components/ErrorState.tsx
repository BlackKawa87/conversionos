import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation('shell')
  return (
    <div
      role="alert"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', padding: '3rem 1.5rem', textAlign: 'center',
      }}
    >
      <AlertCircle size={40} color="var(--color-danger)" strokeWidth={1.5} aria-hidden />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--text-base)' }}>
          {title ?? t('states.errorTitle', 'Something went wrong')}
        </p>
        {description && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 320 }}>{description}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('states.retry', 'Try again')}
        </Button>
      )}
    </div>
  )
}
