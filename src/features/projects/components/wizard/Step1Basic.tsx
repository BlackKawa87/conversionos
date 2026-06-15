import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/design-system'
import type { Project } from '@/types'

interface Props {
  project: Project
  onNext: (data: { name: string; description: string }) => Promise<void>
  saving: boolean
}

export function Step1Basic({ project, onNext, saving }: Props) {
  const { t } = useTranslation('projects')
  const [name, setName]               = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')

  const handleNext = async () => {
    if (!name.trim()) return
    await onNext({ name: name.trim(), description: description.trim() })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.375rem' }}>
          {t('wizard.step1.title', 'Basic info')}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {t('wizard.step1.subtitle', 'Give your project a clear name that identifies the funnel.')}
        </p>
      </div>

      <Input
        label={t('wizard.step1.nameLabel', 'Project name')}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="e.g. Weight Loss Quiz Funnel"
        autoFocus
        required
      />

      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem' }}>
          {t('wizard.step1.descLabel', 'Description')}
          <span style={{ color: 'var(--color-text-faint)', fontWeight: 400, marginLeft: '0.375rem' }}>
            {t('common.optional', 'optional')}
          </span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t('wizard.step1.descPlaceholder', 'What does this funnel do?')}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-bg-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)', fontFamily: 'inherit',
            padding: '0.625rem 0.75rem',
            resize: 'vertical', outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleNext} loading={saving} disabled={!name.trim()}>
          {t('wizard.next', 'Continue')} →
        </Button>
      </div>
    </div>
  )
}
