import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react'
import { Button, Badge, LoadingState, ErrorState, EmptyState } from '@/design-system'
import { useMembers } from '../hooks/useOrganization'
import { InviteModal } from './InviteModal'
import type { MemberRole } from '@/types'

const ROLE_BADGE: Record<MemberRole, { variant: 'accent' | 'success' | 'neutral' | 'warning' }> = {
  owner:   { variant: 'accent'  },
  admin:   { variant: 'success' },
  analyst: { variant: 'neutral' },
  viewer:  { variant: 'neutral' },
}

interface Props { orgId: string }

export function MembersList({ orgId }: Props) {
  const { t } = useTranslation('common')
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data: members, isLoading, error, refetch } = useMembers(orgId)

  if (isLoading) return <LoadingState size="sm" />
  if (error)     return <ErrorState description={error.message} onRetry={refetch} />

  return (
    <section style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{t('members.title', 'Members')}</h2>
        <Button size="sm" variant="secondary" leftIcon={<UserPlus size={14} />} onClick={() => setInviteOpen(true)}>
          {t('members.invite', 'Invite')}
        </Button>
      </div>

      {!members?.length ? (
        <EmptyState title={t('members.emptyTitle', 'No members yet')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.map(m => {
            const profile = m.user_profiles
            const name    = profile?.full_name ?? profile?.email ?? m.user_id
            const badge   = ROLE_BADGE[m.role]
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '9999px',
                  background: 'var(--color-accent-dim)', border: '1px solid rgba(0,208,132,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)',
                  flexShrink: 0,
                }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                  {profile?.email && profile.full_name && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{profile.email}</p>
                  )}
                </div>
                <Badge variant={badge.variant}>{m.role}</Badge>
              </div>
            )
          })}
        </div>
      )}

      <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} orgId={orgId} />
    </section>
  )
}
