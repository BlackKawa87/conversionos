import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService, type CreateProjectPayload } from '../services/project.service'

export function useProjects(orgId: string | undefined) {
  return useQuery({
    queryKey: ['projects', orgId],
    queryFn:  () => projectService.list(orgId!),
    enabled:  !!orgId,
    staleTime: 15_000,
  })
}

export function useCreateProject(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.create(orgId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['projects', orgId] }),
  })
}

export function useUpdateProject(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<CreateProjectPayload>) =>
      projectService.update(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', orgId] }),
  })
}

export function useArchiveProject(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.archive(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['projects', orgId] }),
  })
}
