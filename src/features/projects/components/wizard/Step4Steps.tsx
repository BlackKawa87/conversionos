import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button, Input, Select } from '@/design-system'
import { STEP_TYPES } from '../../constants'
import { useCreateStep, useDeleteStep, useReorderSteps } from '../../hooks/useProjectSteps'
import type { ProjectStep, StepType } from '@/types'

interface Props {
  projectId: string
  steps: ProjectStep[]
  onNext: () => void
  onBack: () => void
}

interface NewStepForm {
  step_name: string
  step_type: StepType
  url_pattern: string
}

const EMPTY_FORM: NewStepForm = { step_name: '', step_type: 'landing', url_pattern: '' }

export function Step4Steps({ projectId, steps, onNext, onBack }: Props) {
  const { t }       = useTranslation('projects')
  const [form, setForm] = useState<NewStepForm>(EMPTY_FORM)
  const [adding, setAdding] = useState(false)

  const createStep   = useCreateStep(projectId)
  const deleteStep   = useDeleteStep(projectId)
  const reorderSteps = useReorderSteps(projectId)

  const handleAdd = async () => {
    if (!form.step_name.trim()) return
    await createStep.mutateAsync({
      step_name:   form.step_name.trim(),
      step_type:   form.step_type,
      url_pattern: form.url_pattern.trim() || undefined,
    })
    setForm(EMPTY_FORM)
    setAdding(false)
  }

  const moveStep = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...steps].sort((a, b) => a.step_index - b.step_index)
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const updates = sorted.map((s, i) => ({ id: s.id, step_index: i }))
    const tmp = updates[index].step_index
    updates[index].step_index = updates[swapIdx].step_index
    updates[swapIdx].step_index = tmp
    await reorderSteps.mutateAsync(updates)
  }

  const sorted = [...steps].sort((a, b) => a.step_index - b.step_index)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '0.375rem' }}>
          {t('wizard.step4.title', 'Funnel steps')}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {t('wizard.step4.subtitle', 'Map each key page of your funnel so ConversionOS can track drop-offs.')}
        </p>
      </div>

      {/* Steps list */}
      {sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {sorted.map((step, i) => (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 0.75rem',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-bg-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ width: 20, textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{step.step_name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {t(`stepType.${step.step_type}`, step.step_type)}
                  {step.url_pattern && ` · ${step.url_pattern}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => moveStep(i, 'up')} disabled={i === 0} aria-label="Move up"
                  style={{ background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', color: 'var(--color-text-faint)', padding: '0.2rem' }}>
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveStep(i, 'down')} disabled={i === sorted.length - 1} aria-label="Move down"
                  style={{ background: 'none', border: 'none', cursor: i === sorted.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--color-text-faint)', padding: '0.2rem' }}>
                  <ChevronDown size={14} />
                </button>
                <button onClick={() => deleteStep.mutate(step.id)} aria-label="Delete step"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '0.2rem' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add step form */}
      {adding ? (
        <div style={{
          padding: '1rem',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <Input
            label={t('wizard.step4.stepName', 'Step name')}
            value={form.step_name}
            onChange={e => setForm(f => ({ ...f, step_name: e.target.value }))}
            placeholder="e.g. Quiz start page"
            autoFocus
          />
          <Select
            label={t('wizard.step4.stepType', 'Step type')}
            value={form.step_type}
            onChange={e => setForm(f => ({ ...f, step_type: e.target.value as StepType }))}
          >
            {STEP_TYPES.map(st => (
              <option key={st.value} value={st.value}>{t(st.labelKey, st.value)}</option>
            ))}
          </Select>
          <Input
            label={t('wizard.step4.urlPattern', 'URL pattern')}
            value={form.url_pattern}
            onChange={e => setForm(f => ({ ...f, url_pattern: e.target.value }))}
            placeholder="/quiz or /checkout"
            helperText={t('wizard.step4.urlPatternHint', 'Path or pattern to match this step.')}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setForm(EMPTY_FORM) }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button size="sm" onClick={handleAdd} loading={createStep.isPending} disabled={!form.step_name.trim()}>
              {t('wizard.step4.addStep', 'Add step')}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            padding: '0.625rem',
            background: 'transparent',
            border: '1px dashed var(--color-bg-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)',
            transition: 'all 0.15s',
          }}
        >
          <Plus size={14} /> {t('wizard.step4.addStep', 'Add step')}
        </button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={onBack}>← {t('wizard.back', 'Back')}</Button>
        <Button onClick={onNext}>
          {t('wizard.next', 'Continue')} →
        </Button>
      </div>
    </div>
  )
}
