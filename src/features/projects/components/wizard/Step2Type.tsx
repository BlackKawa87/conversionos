import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/design-system'
import { FUNNEL_TYPES, PLATFORMS } from '../../constants'
import type { FunnelType, Platform, Project } from '@/types'

interface Props {
  project: Project
  onNext: (data: { funnel_type: FunnelType; platform: Platform }) => Promise<void>
  onBack: () => void
  saving: boolean
}

function SelectGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
}: {
  options: Array<{ value: T; label?: string; labelKey?: string; icon?: string }>
  value: T | null
  onChange: (v: T) => void
  columns?: number
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '0.5rem' }}>
      {options.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '0.625rem 0.5rem',
              background:   selected ? 'var(--color-accent-dim)' : 'var(--color-bg-elevated)',
              border:       `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-bg-border)'}`,
              borderRadius: 'var(--radius-md)',
              color:        selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
              cursor: 'pointer', textAlign: 'center',
              fontSize: 'var(--text-xs)', fontWeight: selected ? 600 : 400,
              transition: 'all 0.15s', lineHeight: 1.3,
            }}
          >
            {opt.icon && <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{opt.icon}</div>}
            {opt.label ?? opt.value}
          </button>
        )
      })}
    </div>
  )
}

export function Step2Type({ project, onNext, onBack, saving }: Props) {
  const { t } = useTranslation('projects')
  const [funnelType, setFunnelType] = useState<FunnelType | null>(project.funnel_type)
  const [platform,   setPlatform]   = useState<Platform | null>(project.platform)

  const labelledFunnels = FUNNEL_TYPES.map(f => ({ ...f, label: t(f.labelKey, f.value) }))
  const canProceed = funnelType && platform

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.375rem' }}>
          {t('wizard.step2.title', 'Type & platform')}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {t('wizard.step2.subtitle', 'Select your funnel type and the platform it runs on.')}
        </p>
      </div>

      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.625rem' }}>
          {t('wizard.step2.funnelType', 'Funnel type')}
        </p>
        <SelectGrid options={labelledFunnels} value={funnelType} onChange={setFunnelType} columns={4} />
      </div>

      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.625rem' }}>
          {t('wizard.step2.platform', 'Platform')}
        </p>
        <SelectGrid options={PLATFORMS} value={platform} onChange={setPlatform} columns={5} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={onBack}>← {t('wizard.back', 'Back')}</Button>
        <Button
          onClick={() => canProceed && onNext({ funnel_type: funnelType, platform })}
          loading={saving}
          disabled={!canProceed}
        >
          {t('wizard.next', 'Continue')} →
        </Button>
      </div>
    </div>
  )
}
