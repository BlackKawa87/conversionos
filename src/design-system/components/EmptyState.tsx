import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const { t } = useTranslation('shell')
  return (
    <div
      role="status"
      aria-label={title ?? t('states.emptyTitle', 'Nothing here yet')}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', padding: '3rem 1.5rem', textAlign: 'center',
        color: 'var(--color-text-faint)',
      }}
    >
      <span aria-hidden style={{ opacity: 0.4 }}>
        {icon ?? <Inbox size={40} strokeWidth={1.5} />}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
          {title ?? t('states.emptyTitle', 'Nothing here yet')}
        </p>
        {description && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', maxWidth: 320 }}>{description}</p>
        )}
      </div>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  )
}
