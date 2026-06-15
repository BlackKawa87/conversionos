import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings, Globe, Archive, ChevronRight, Layers } from 'lucide-react'
import { Button, Badge, LoadingState, ErrorState } from '@/design-system'
import { useToast } from '@/design-system'
import { useProject } from '@/features/projects/hooks/useProject'
import { useProjectSteps } from '@/features/projects/hooks/useProjectSteps'
import { useArchiveProject } from '@/features/projects/hooks/useProjects'
import { SnippetBlock } from '@/features/projects/components/SnippetBlock'
import { InstallationChecklist } from '@/features/projects/components/InstallationChecklist'
import { generateSnippet } from '@/features/projects/services/project-steps.service'
import { FUNNEL_TYPES, PLATFORMS, STEP_TYPES } from '@/features/projects/constants'
import type { ProjectStatus } from '@/types'

const STATUS_BADGE: Record<ProjectStatus, { variant: 'accent' | 'success' | 'neutral' | 'warning'; label: string }> = {
  setup:    { variant: 'neutral',  label: 'Setup'   },
  active:   { variant: 'success',  label: 'Active'  },
  paused:   { variant: 'warning',  label: 'Paused'  },
  archived: { variant: 'neutral',  label: 'Archived' },
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate      = useNavigate()
  const { t }         = useTranslation('projects')
  const { showToast } = useToast()

  const { data: project, isLoading, error, refetch } = useProject(projectId)
  const { data: steps = [] }                         = useProjectSteps(projectId)
  const archive = useArchiveProject(project?.organization_id ?? '')

  if (isLoading) return (
    <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
      <LoadingState size="lg" />
    </div>
  )
  if (error || !project) return (
    <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
      <ErrorState description={error?.message ?? 'Project not found'} onRetry={refetch} />
    </div>
  )

  const funnelLabel   = FUNNEL_TYPES.find(f => f.value === project.funnel_type)
  const platformLabel = PLATFORMS.find(p => p.value === project.platform)
  const status        = STATUS_BADGE[project.status]
  const snippet       = generateSnippet(project.public_tracking_id)
  const sortedSteps   = [...steps].sort((a, b) => a.step_index - b.step_index)

  const handleArchive = async () => {
    if (!confirm(`Archive "${project.name}"?`)) return
    try {
      await archive.mutateAsync(project.id)
      showToast(t('detail.archived', 'Project archived'), 'info')
      navigate('/')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', 'error')
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--color-text-faint)', textDecoration: 'none' }}>{t('detail.projects', 'Projects')}</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--color-text-muted)' }}>{project.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: '0.5rem' }}>
            {project.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant={status.variant}>{status.label}</Badge>
            {funnelLabel   && <Badge variant="accent">{t(funnelLabel.labelKey, funnelLabel.value)}</Badge>}
            {platformLabel && <Badge variant="neutral">{platformLabel.label}</Badge>}
            {project.base_url && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
                <Globe size={11} />{project.base_url}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="secondary" size="sm"
            leftIcon={<Settings size={13} />}
            onClick={() => navigate(`/projects/${project.id}/setup`)}
          >
            {t('detail.editSetup', 'Edit setup')}
          </Button>
          <Button
            variant="ghost" size="sm"
            leftIcon={<Archive size={13} />}
            onClick={handleArchive}
          >
            {t('detail.archive', 'Archive')}
          </Button>
        </div>
      </div>

      {/* Incomplete setup banner */}
      {!project.setup_completed && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1rem', marginBottom: '1.5rem',
          background: 'var(--color-warning-dim)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-lg)',
          gap: '1rem', flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>
            {t('detail.setupIncomplete', 'Setup is not complete. Finish configuring this project to start tracking.')}
          </p>
          <Button size="sm" onClick={() => navigate(`/projects/${project.id}/setup`)}>
            {t('detail.completeSetup', 'Complete setup')} →
          </Button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Funnel Steps */}
        <section style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="var(--color-text-muted)" />
              {t('detail.funnelSteps', 'Funnel steps')}
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontWeight: 400, marginLeft: '0.25rem' }}>
                ({sortedSteps.length})
              </span>
            </h2>
            <button
              onClick={() => navigate(`/projects/${project.id}/setup`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}
            >
              {t('detail.editSteps', 'Edit')}
            </button>
          </div>
          {sortedSteps.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', textAlign: 'center', padding: '1rem 0' }}>
              {t('detail.noSteps', 'No steps configured yet.')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {sortedSteps.map((step, i) => {
                const stepTypeLabel = STEP_TYPES.find(st => st.value === step.step_type)
                return (
                  <div key={step.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <span style={{ width: 20, textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{step.step_name}</p>
                      {step.url_pattern && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                          {step.url_pattern}
                        </p>
                      )}
                    </div>
                    <Badge variant="neutral">
                      {stepTypeLabel ? t(stepTypeLabel.labelKey, step.step_type) : step.step_type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Installation */}
        <section style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '1rem' }}>
            {t('detail.installation', 'Installation')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('detail.publicId', 'Public tracking ID')}
              </p>
              <span style={{
                display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                padding: '0.375rem 0.625rem',
                background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--color-accent)',
              }}>
                {project.public_tracking_id}
              </span>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('detail.snippet', 'Snippet')}
              </p>
              <SnippetBlock code={snippet} />
            </div>

            <div style={{ borderTop: '1px solid var(--color-bg-border)', paddingTop: '1rem' }}>
              <InstallationChecklist project={project} />
            </div>
          </div>
        </section>

        {/* Description */}
        {project.description && (
          <section style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {t('detail.description', 'Description')}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              {project.description}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
