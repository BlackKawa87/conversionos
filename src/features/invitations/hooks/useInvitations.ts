import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invitationService } from '../services/invitation.service'
import type { InvitationRole, SupportedLanguage } from '@/types'

export function useInvitations(orgId: string | undefined) {
  return useQuery({
    queryKey: ['invitations', orgId],
    queryFn:  () => invitationService.list(orgId!),
    enabled:  !!orgId,
    staleTime: 30_000,
  })
}

export function useCreateInvitation(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ email, role, language }: { email: string; role: InvitationRole; language?: SupportedLanguage }) =>
      invitationService.create(orgId, email, role, language),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations', orgId] }),
  })
}

export function useRevokeInvitation(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invitationService.revoke(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['invitations', orgId] }),
  })
}

export function useAcceptInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => invitationService.accept(token),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['organization'] })
      qc.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
