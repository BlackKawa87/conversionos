import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Wifi, Activity, Brain, Lightbulb, FolderPlus } from 'lucide-react'

export type EmptyStatePreset =
  | 'no-projects'
  | 'no-tracker'
  | 'no-events'
  | 'no-diagnosis'
  | 'no-recommendations'

export interface EmptyStateProps {
  preset?: EmptyStatePreset
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

const PRESET_ICONS: Record<EmptyStatePreset, ReactNode> = {
  'no-projects':       <FolderPlus   size={40} strokeWidth={1.25} />,
  'no-tracker':        <Wifi         size={40} strokeWidth={1.25} />,
  'no-events':         <Activity     size={40} strokeWidth={1.25} />,
  'no-diagnosis':      <Brain        size={40} strokeWidth={1.25} />,
  'no-recommendations': <Lightbulb   size={40} strokeWidth={1.25} />,
}

const PRESET_ACCENT: Record<EmptyStatePreset, string> = {
  'no-projects':        'var(--color-accent)',
  'no-tracker':         'var(--color-warning)',
  'no-events':          'var(--color-accent)',
  'no-diagnosis':       'var(--color-text-muted)',
  'no-recommendations': 'var(--color-text-muted)',
}

function PresetContent({ preset, action }: { preset: EmptyStatePreset; action?: ReactNode }) {
  const { t } = useTranslation('diagnosis')
  const key = preset.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()) as
    'noProjects' | 'noTracker' | 'noEvents' | 'noDiagnosis' | 'noRecommendations'

  const titleMap: Record<EmptyStatePreset, string> = {
    'no-projects':        t('emptyStates.noProjects.title'),
    'no-tracker':         t('emptyStates.noTracker.title'),
    'no-events':          t('emptyStates.noEvents.title'),
    'no-diagnosis':       t('emptyStates.noDiagnosis.title'),
    'no-recommendations': t('emptyStates.noRecommendations.title'),
  }
  const descMap: Record<EmptyStatePreset, string> = {
    'no-projects':        t('emptyStates.noProjects.desc'),
    'no-tracker':         t('emptyStates.noTracker.desc'),
    'no-events':          t('emptyStates.noEvents.desc'),
    'no-diagnosis':       t('emptyStates.noDiagnosis.desc'),
    'no-recommendations': t('emptyStates.noRecommendations.desc'),
  }

  void key // suppress unused-var lint

  return (
    <div
      role="status"
      aria-label={titleMap[preset]}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '1rem', padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <span aria-hidden style={{ color: PRESET_ACCENT[preset], opacity: 0.7 }}>
        {PRESET_ICONS[preset]}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 360 }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--text-md)' }}>
          {titleMap[preset]}
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {descMap[preset]}
        </p>
      </div>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  )
}

export function EmptyState({ preset, title, description, icon, action }: EmptyStateProps) {
  const { t } = useTranslation('shell')

  if (preset) return <PresetContent preset={preset} action={action} />

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
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', maxWidth: 320, lineHeight: 1.6 }}>{description}</p>
        )}
      </div>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  )
}
