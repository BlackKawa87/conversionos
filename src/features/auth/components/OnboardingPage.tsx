import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import { Button, Input, Card } from '@/design-system'
import { useToast } from '@/design-system'
import { useCreateOrganization } from '@/features/organizations/hooks/useOrganization'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export default function OnboardingPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createOrg = useCreateOrganization()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug) return
    try {
      await createOrg.mutateAsync({ name: name.trim(), slug })
      showToast(t('onboarding.success'), 'success')
      navigate('/', { replace: true })
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', 'error')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-page)', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', padding: '0.875rem',
            background: 'var(--color-accent-dim)', borderRadius: 'var(--radius-xl)',
            marginBottom: '1rem',
          }}>
            <Building2 size={32} color="var(--color-accent)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: '0.5rem' }}>
            {t('onboarding.title')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {t('onboarding.subtitle')}
          </p>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label={t('onboarding.orgName')}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Acme Corp"
              required
              autoFocus
            />
            <Input
              label={t('onboarding.slug')}
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
              placeholder="acme-corp"
              helperText={t('onboarding.slugHint')}
              pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{2,}$"
              required
            />
            <Button
              type="submit"
              loading={createOrg.isPending}
              disabled={!name.trim() || !slug}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {t('onboarding.cta')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
