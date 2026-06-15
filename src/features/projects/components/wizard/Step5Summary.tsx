import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Check } from 'lucide-react'
import { Button, Badge } from '@/design-system'
import { SnippetBlock } from '../SnippetBlock'
import { InstallationChecklist } from '../InstallationChecklist'
import { generateSnippet } from '../../services/project-steps.service'
import { FUNNEL_TYPES, PLATFORMS } from '../../constants'
import type { Project, ProjectStep } from '@/types'

interface Props {
  project: Project
  steps: ProjectStep[]
  onFinish: () => Promise<void>
  onBack: () => void
  finishing: boolean
}

export function Step5Summary({ project, steps, onFinish, onBack, finishing }: Props) {
  const { t } = useTranslation('projects')
  const [showTracker, setShowTracker] = useState(false)
  const snippet = generateSnippet(project.public_tracking_id)

  const funnelLabel = FUNNEL_TYPES.find(f => f.value === project.funnel_type)
  const platformLabel = PLATFORMS.find(p => p.value === project.platform)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.375rem' }}>
          {t('wizard.step5.title', 'Summary & installation')}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {t('wizard.step5.subtitle', 'Review your setup and paste the snippet into your site.')}
        </p>
      </div>

      {/* Summary */}
      <div style={{
        padding: '1rem', background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-bg-border)', borderRadius: 'var(--radius-md)',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{project.name}</span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {funnelLabel && <Badge variant="accent">{t(funnelLabel.labelKey, funnelLabel.value)}</Badge>}
            {platformLabel && <Badge variant="neutral">{platformLabel.label}</Badge>}
          </div>
        </div>
        {project.base_url && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {project.base_url}
          </p>
        )}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          {steps.length} {t('wizard.step5.stepsConfigured', 'funnel steps configured')}
        </p>
      </div>

      {/* Public Tracking ID */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem' }}>
          {t('wizard.step5.publicId', 'Public tracking ID')}
        </p>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
          padding: '0.5rem 0.75rem',
          background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)',
          borderRadius: 'var(--radius-md)', color: 'var(--color-accent)',
          letterSpacing: '0.04em',
        }}>
          {project.public_tracking_id}
        </div>
      </div>

      {/* Tracker key (masked) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            {t('wizard.step5.trackerKey', 'Tracker key')}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginLeft: '0.375rem' }}>
              {t('wizard.step5.trackerKeyNote', '(server-side only — never expose client-side)')}
            </span>
          </p>
          <button
            onClick={() => setShowTracker(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)' }}
          >
            {showTracker ? <EyeOff size={13} /> : <Eye size={13} />}
            {showTracker ? t('common.hide', 'Hide') : t('common.reveal', 'Reveal')}
          </button>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
          padding: '0.5rem 0.75rem',
          background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)',
          borderRadius: 'var(--radius-md)',
          color: showTracker ? 'var(--color-text-primary)' : 'var(--color-text-faint)',
          letterSpacing: showTracker ? '0.04em' : '0.2em',
          userSelect: showTracker ? 'text' : 'none',
        }}>
          {showTracker ? project.tracker_key : '••••••••••••••••••••••••'}
        </div>
      </div>

      {/* Snippet */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.5rem' }}>
          {t('wizard.step5.snippet', 'Installation snippet')}
        </p>
        <SnippetBlock code={snippet} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>
          {t('wizard.step5.snippetHint', 'Paste this before the closing </head> tag on every page of your funnel.')}
        </p>
      </div>

      {/* Checklist */}
      <div style={{ padding: '1rem', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: 'var(--radius-md)' }}>
        <InstallationChecklist project={project} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={onBack}>← {t('wizard.back', 'Back')}</Button>
        <Button onClick={onFinish} loading={finishing} leftIcon={<Check size={14} />}>
          {t('wizard.step5.finish', 'Complete setup')}
        </Button>
      </div>
    </div>
  )
}
