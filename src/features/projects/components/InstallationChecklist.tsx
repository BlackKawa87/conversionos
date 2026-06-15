import { CheckCircle2, Circle } from 'lucide-react'
import type { Project } from '@/types'

interface CheckItem {
  label: string
  done: boolean
}

interface Props {
  project: Project
  trackerDetected?: boolean
}

export function InstallationChecklist({ project, trackerDetected = false }: Props) {
  const items: CheckItem[] = [
    { label: 'Project created',                                done: true },
    { label: 'Funnel type & platform configured',              done: !!project.funnel_type && !!project.platform },
    { label: 'Support mode selected',                          done: !!project.support_mode },
    { label: 'Snippet copied and pasted into your site',       done: trackerDetected },
    { label: 'First tracking event received (Engine 03)',      done: false },
  ]

  const completed = items.filter(i => i.done).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Setup checklist</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {completed}/{items.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--color-bg-border)', borderRadius: 2, marginBottom: '0.875rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(completed / items.length) * 100}%`,
          background: 'var(--color-accent)',
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {item.done
              ? <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
              : <Circle size={16} color="var(--color-text-faint)" style={{ flexShrink: 0 }} />
            }
            <span style={{
              fontSize: 'var(--text-sm)',
              color: item.done ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              textDecoration: item.done ? 'none' : 'none',
            }}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
