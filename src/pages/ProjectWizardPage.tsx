import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoadingState, ErrorState } from '@/design-system'
import { useToast } from '@/design-system'
import { useProject, useUpdateProjectConfig, useCompleteSetup } from '@/features/projects/hooks/useProject'
import { useProjectSteps } from '@/features/projects/hooks/useProjectSteps'
import { Step1Basic }   from '@/features/projects/components/wizard/Step1Basic'
import { Step2Type }    from '@/features/projects/components/wizard/Step2Type'
import { Step3Config }  from '@/features/projects/components/wizard/Step3Config'
import { Step4Steps }   from '@/features/projects/components/wizard/Step4Steps'
import { Step5Summary } from '@/features/projects/components/wizard/Step5Summary'

const TOTAL = 5

function WizardProgress({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
      {Array.from({ length: TOTAL }, (_, i) => {
        const n = i + 1
        const done    = n < current
        const active  = n === current
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: n < TOTAL ? 1 : 'none' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--text-xs)', fontWeight: 600,
              background: done || active ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color:      done || active ? '#000' : 'var(--color-text-faint)',
              border:     active ? 'none' : `1px solid ${done ? 'var(--color-accent)' : 'var(--color-bg-border)'}`,
              transition: 'all 0.2s',
            }}>
              {n}
            </div>
            {n < TOTAL && (
              <div style={{
                flex: 1, height: 2, margin: '0 4px',
                background: done ? 'var(--color-accent)' : 'var(--color-bg-border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ProjectWizardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate      = useNavigate()
  const { t }         = useTranslation('projects')
  const { showToast } = useToast()

  const [step, setStep] = useState(1)

  const { data: project, isLoading, error, refetch } = useProject(projectId)
  const { data: steps = [] }                         = useProjectSteps(projectId)
  const updateConfig  = useUpdateProjectConfig(projectId!)
  const completeSetup = useCompleteSetup(projectId!)

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingState size="lg" />
    </div>
  )
  if (error || !project) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ErrorState description={error?.message ?? 'Project not found'} onRetry={refetch} />
    </div>
  )

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg-page)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '3rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 540 }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            {t('wizard.title', 'Project setup')}
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            {project.name}
          </h1>
        </div>

        <WizardProgress current={step} />

        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-bg-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
        }}>
          {step === 1 && (
            <Step1Basic
              project={project}
              saving={updateConfig.isPending}
              onNext={async ({ name, description }) => {
                await updateConfig.mutateAsync({ name, description })
                setStep(2)
              }}
            />
          )}
          {step === 2 && (
            <Step2Type
              project={project}
              saving={updateConfig.isPending}
              onNext={async ({ funnel_type, platform }) => {
                await updateConfig.mutateAsync({ funnel_type, platform })
                setStep(3)
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Config
              project={project}
              saving={updateConfig.isPending}
              onNext={async ({ base_url, support_mode }) => {
                await updateConfig.mutateAsync({ base_url, support_mode })
                setStep(4)
              }}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4Steps
              projectId={project.id}
              steps={steps}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <Step5Summary
              project={project}
              steps={steps}
              finishing={completeSetup.isPending}
              onBack={() => setStep(4)}
              onFinish={async () => {
                try {
                  await completeSetup.mutateAsync()
                  showToast(t('wizard.completed', 'Setup complete!'), 'success')
                  navigate(`/projects/${project.id}`, { replace: true })
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Error', 'error')
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
