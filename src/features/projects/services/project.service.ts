import { supabase } from '@/providers/supabase'
import { logger } from '@/lib/logger'
import type { Project } from '@/types'

export interface CreateProjectPayload {
  name: string
  description?: string
  domain?: string
}

export const projectService = {
  async list(orgId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', orgId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as Project[]
  },

  async create(orgId: string, payload: CreateProjectPayload): Promise<Project> {
    logger.info('project: creating', { orgId, name: payload.name })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        organization_id: orgId,
        name:            payload.name.trim(),
        description:     payload.description?.trim() || null,
        domain:          payload.domain?.trim() || null,
        created_by:      user.id,
        status:          'setup',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Project
  },

  async update(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'domain' | 'status'>>): Promise<Project> {
    logger.info('project: updating', { id })
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Project
  },

  async archive(id: string): Promise<Project> {
    logger.info('project: archiving', { id })
    return projectService.update(id, { status: 'archived' })
  },
}
