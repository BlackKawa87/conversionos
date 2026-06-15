import { supabase } from '@/providers/supabase'
import { logger } from '@/lib/logger'
import type { LoggerEvent } from '@/types'

export const auditService = {
  async log(
    orgId: string,
    event: LoggerEvent,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        actor_id:        user.id,
        action:          event,
        resource_type:   resourceType,
        resource_id:     resourceId ?? null,
        metadata:        metadata ?? {},
      })

      logger.debug('audit: logged', { event, orgId, resourceType })
    } catch (err) {
      // Audit logs must never break the main flow
      logger.warn('audit: failed to log event', { event, err: String(err) })
    }
  },
}
