import { supabase } from '@/providers/supabase'
import type { ProjectStep, StepType } from '@/types'

export interface CreateStepPayload {
  step_name: string
  step_type: StepType
  url_pattern?: string
}

export const projectStepsService = {
  async list(projectId: string): Promise<ProjectStep[]> {
    const { data, error } = await supabase
      .from('project_steps')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('step_index', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as ProjectStep[]
  },

  async create(projectId: string, payload: CreateStepPayload): Promise<ProjectStep> {
    const { data: existing } = await supabase
      .from('project_steps')
      .select('step_index')
      .eq('project_id', projectId)
      .order('step_index', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextIndex = existing ? existing.step_index + 1 : 0

    const { data, error } = await supabase
      .from('project_steps')
      .insert({
        project_id:  projectId,
        step_name:   payload.step_name,
        step_type:   payload.step_type,
        url_pattern: payload.url_pattern?.trim() || null,
        step_index:  nextIndex,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as ProjectStep
  },

  async update(id: string, updates: Partial<Pick<ProjectStep, 'step_name' | 'step_type' | 'url_pattern' | 'step_index'>>): Promise<ProjectStep> {
    const { data, error } = await supabase
      .from('project_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as ProjectStep
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_steps')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async reorderBatch(updates: Array<{ id: string; step_index: number }>): Promise<void> {
    await Promise.all(
      updates.map(u =>
        supabase.from('project_steps').update({ step_index: u.step_index }).eq('id', u.id)
      )
    )
  },
}

export function generateSnippet(publicTrackingId: string): string {
  return `<!-- ConversionOS Tracker -->
<script>
  window.ConversionOSProjectId = "${publicTrackingId}";
</script>
<script src="https://cdn.conversionos.com/tracker.js" async></script>`
}
