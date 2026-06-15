import { supabase } from '@/providers/supabase'
import { logger } from '@/lib/logger'
import type { Invitation, InvitationRole, SupportedLanguage } from '@/types'

export const invitationService = {
  async create(orgId: string, email: string, role: InvitationRole, language: SupportedLanguage = 'en'): Promise<Invitation> {
    logger.info('invitation: creating', { orgId, email, role })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        organization_id:  orgId,
        email:            email.trim().toLowerCase(),
        role,
        invitee_language: language,
        created_by:       user.id,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Invitation
  },

  async list(orgId: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', orgId)
      .is('used_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as Invitation[]
  },

  async accept(token: string): Promise<{ organization_id: string; role: InvitationRole }> {
    logger.info('invitation: accepting')
    const { data, error } = await supabase.rpc('accept_invitation', { p_token: token })
    if (error) throw new Error(error.message)
    return data as { organization_id: string; role: InvitationRole }
  },

  async revoke(id: string): Promise<void> {
    logger.info('invitation: revoking', { id })
    const { error } = await supabase
      .from('invitations')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  getAcceptUrl(token: string): string {
    return `${window.location.origin}/accept-invite?token=${token}`
  },
}
