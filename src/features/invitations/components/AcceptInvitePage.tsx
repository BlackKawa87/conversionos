import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button, Card, LoadingState } from '@/design-system'
import { useToast } from '@/design-system'
import { useAcceptInvitation } from '../hooks/useInvitations'

export default function AcceptInvitePage() {
  const { t } = useTranslation('common')
  const [params] = useSearchParams()
  const navigate  = useNavigate()
  const { showToast } = useToast()
  const token = params.get('token')

  const accept  = useAcceptInvitation()
  const [done,  setDone]  = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) { setError('No invitation token found.'); return }
    accept.mutate(token, {
      onSuccess: () => { setDone(true); showToast(t('invite.accepted'), 'success') },
      onError:   (err) => setError(err instanceof Error ? err.message : 'Failed to accept invitation'),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (accept.isPending) return <LoadingState label={t('invite.accepting')} size="lg" />

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-page)', padding: '1.5rem',
    }}>
      <Card variant="elevated" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        {done ? (
          <>
            <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>
              {t('invite.successTitle')}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
              {t('invite.successDesc')}
            </p>
            <Button onClick={() => navigate('/', { replace: true })} style={{ width: '100%', justifyContent: 'center' }}>
              {t('invite.goDashboard')}
            </Button>
          </>
        ) : (
          <>
            <AlertCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>
              {t('invite.errorTitle')}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
              {error ?? t('invite.errorDesc')}
            </p>
            <Button variant="secondary" onClick={() => navigate('/', { replace: true })} style={{ width: '100%', justifyContent: 'center' }}>
              {t('common.home')}
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
