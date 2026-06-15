import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoadingState, ErrorState, Badge } from '@/design-system'
import { useOrganization } from '@/features/organizations/hooks/useOrganization'
import { ProjectsList } from '@/features/projects/components/ProjectsList'
import { MembersList }  from '@/features/organizations/components/MembersList'

const PLAN_BADGE: Record<string, 'neutral' | 'accent' | 'success' | 'warning'> = {
  free: 'neutral', pro: 'accent', agency: 'success', enterprise: 'warning',
}

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { data: org, isLoading, error, refetch } = useOrganization()

  useEffect(() => {
    if (!isLoading && org === null) navigate('/onboarding', { replace: true })
  }, [org, isLoading, navigate])

  if (isLoading) return <LoadingState size="lg" />
  if (error)     return <ErrorState description={error.message} onRetry={refetch} />
  if (!org)      return null

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Org header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-bg-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}>{org.name}</h1>
          <Badge variant={PLAN_BADGE[org.plan] ?? 'neutral'}>{org.plan.toUpperCase()}</Badge>
        </div>
        <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
          {org.slug}
        </p>
      </div>

      <ProjectsList orgId={org.id} />
      <MembersList  orgId={org.id} />

      {/* i18n hint */}
      <p style={{ marginTop: '3rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
        {t('dashboard.hint', 'More analytics coming in Engine 02.')}
      </p>
    </div>
  )
}
