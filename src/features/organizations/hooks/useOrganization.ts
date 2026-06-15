import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '../services/organization.service'
import type { Organization } from '@/types'

export const ORG_KEY = ['organization', 'current'] as const

export function useOrganization() {
  return useQuery({
    queryKey: ORG_KEY,
    queryFn:  () => organizationService.getCurrent(),
    staleTime: 30_000,
    retry: 1,
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) =>
      organizationService.create(name, slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization'] }),
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Pick<Organization, 'name' | 'billing_email' | 'logo_url'>>) =>
      organizationService.update(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization'] }),
  })
}

export function useMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ['members', orgId],
    queryFn:  () => organizationService.getMembers(orgId!),
    enabled:  !!orgId,
    staleTime: 30_000,
  })
}
