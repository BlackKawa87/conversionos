import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/design-system'
import { SUPPORT_MODES } from '../../constants'
import type { SupportMode, Project } from '@/types'

interface Props {
  project: Project
  onNext: (data: { base_url: string; support_mode: SupportMode }) => Promise<void>
  onBack: () => void
  saving: boolean
}

export function Step3Config({ project, onNext, onBack, saving }: Props) {
  const { t } = useTranslation('projects')
  const [baseUrl,     setBaseUrl]     = useState(project.base_url ?? '')
  const [supportMode, setSupportMode] = useState<SupportMode | null>(project.support_mode)

  const canProceed = baseUrl.trim() && supportMode

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.375rem' }}>
          {t('wizard.step3.title', 'Configuration')}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {t('wizard.step3.subtitle', 'Set the base URL and choose how ConversionOS will assist you.')}
        </p>
      </div>

      <Input
        label={t('wizard.step3.baseUrl', 'Base URL')}
        value={baseUrl}
        onChange={e => setBaseUrl(e.target.value)}
        placeholder="https://yoursite.com"
        type="url"
        helperText={t('wizard.step3.baseUrlHint', 'The root domain where your funnel lives.')}
      />

      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.75rem' }}>
          {t('wizard.step3.supportMode', 'Support mode')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SUPPORT_MODES.map(mode => {
            const selected = supportMode === mode.value
            return (
              <button
                key={mode.value}
                onClick={() => setSupportMode(mode.value)}
                style={{
                  textAlign: 'left', padding: '0.875rem 1rem',
                  background:   selected ? 'var(--color-accent-dim)' : 'var(--color-bg-elevated)',
                  border:       `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-bg-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: selected ? 'var(--color-accent)' : 'var(--color-text-primary)', marginBottom: '0.2rem' }}>
                  {t(mode.labelKey, mode.value)}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {t(mode.descKey, '')}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={onBack}>← {t('wizard.back', 'Back')}</Button>
        <Button
          onClick={() => canProceed && onNext({ base_url: baseUrl.trim(), support_mode: supportMode })}
          loading={saving}
          disabled={!canProceed}
        >
          {t('wizard.next', 'Continue')} →
        </Button>
      </div>
    </div>
  )
}
