import { supabase } from '@/providers/supabase'
import { logger } from '@/lib/logger'
import type { Organization, OrganizationMember } from '@/types'

export const organizationService = {
  async create(name: string, slug: string): Promise<string> {
    logger.info('org: creating', { name, slug })
    const { data, error } = await supabase.rpc('create_organization', {
      p_name: name,
      p_slug: slug,
    })
    if (error) throw new Error(error.message)
    return data as string
  },

  async getCurrent(): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('organizations(*)')
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) { logger.error('org: getCurrent failed', { error: error.message }); throw new Error(error.message) }
    if (!data) return null

    const row = data as unknown as { organizations: Organization }
    return row.organizations
  },

  async update(id: string, updates: Partial<Pick<Organization, 'name' | 'billing_email' | 'logo_url'>>) {
    logger.info('org: updating', { id })
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Organization
  },

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*, user_profiles(id, email, full_name, avatar_url)')
      .eq('organization_id', orgId)
      .order('joined_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as OrganizationMember[]
  },
}
