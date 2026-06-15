import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Archive, Globe, Clock, ChevronRight } from 'lucide-react'
import { Button, Badge, EmptyState, LoadingState, ErrorState } from '@/design-system'
import { useToast } from '@/design-system'
import { useProjects, useArchiveProject } from '../hooks/useProjects'
import { CreateProjectModal } from './CreateProjectModal'
import type { Project, ProjectStatus } from '@/types'

const STATUS_BADGE: Record<ProjectStatus, { variant: 'accent' | 'success' | 'neutral' | 'warning'; label: string }> = {
  setup:    { variant: 'neutral',  label: 'Setup'   },
  active:   { variant: 'success',  label: 'Active'  },
  paused:   { variant: 'warning',  label: 'Paused'  },
  archived: { variant: 'neutral',  label: 'Archived' },
}

interface Props { orgId: string }

export function ProjectsList({ orgId }: Props) {
  const { t }         = useTranslation('common')
  const { showToast } = useToast()
  const navigate      = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const { data: projects, isLoading, error, refetch } = useProjects(orgId)
  const archive = useArchiveProject(orgId)

  const handleArchive = async (e: React.MouseEvent, p: Project) => {
    e.stopPropagation()
    if (!confirm(`Archive "${p.name}"?`)) return
    try {
      await archive.mutateAsync(p.id)
      showToast(t('project.archived', 'Project archived'), 'info')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', 'error')
    }
  }

  if (isLoading) return <LoadingState />
  if (error)     return <ErrorState description={error.message} onRetry={refetch} />

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{t('nav.projects', 'Projects')}</h2>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          {t('project.new', 'New project')}
        </Button>
      </div>

      {!projects?.length ? (
        <EmptyState
          title={t('project.emptyTitle', 'No projects yet')}
          description={t('project.emptyDesc', 'Create your first project to start tracking conversions.')}
          action={<Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>{t('project.new', 'New project')}</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {projects.map(p => {
            const s = STATUS_BADGE[p.status]
            return (
              <div
                key={p.id}
                onClick={() => navigate(p.setup_completed ? `/projects/${p.id}` : `/projects/${p.id}/setup`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${p.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 1rem',
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)',
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-text-faint)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-bg-border)')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 'var(--text-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </p>
                  {p.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
                    {p.domain && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                        <Globe size={11} />{p.domain}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                      <Clock size={11} />{new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge variant={s.variant}>{s.label}</Badge>
                <button
                  onClick={e => handleArchive(e, p)}
                  aria-label={`Archive ${p.name}`}
                  title="Archive"
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-faint)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Archive size={15} />
                </button>
                <ChevronRight size={15} color="var(--color-text-faint)" />
              </div>
            )
          })}
        </div>
      )}

      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} orgId={orgId} />
    </section>
  )
}
