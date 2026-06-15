import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService, type UpdateProjectConfigPayload } from '../services/project.service'

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn:  () => projectService.getById(projectId!),
    enabled:  !!projectId,
    staleTime: 15_000,
  })
}

export function useUpdateProjectConfig(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: UpdateProjectConfigPayload) =>
      projectService.updateConfig(projectId, updates),
    onSuccess: (updated) => {
      qc.setQueryData(['project', projectId], updated)
      qc.invalidateQueries({ queryKey: ['projects', updated.organization_id] })
    },
  })
}

export function useCompleteSetup(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => projectService.completeSetup(projectId),
    onSuccess: (updated) => {
      qc.setQueryData(['project', projectId], updated)
      qc.invalidateQueries({ queryKey: ['projects', updated.organization_id] })
    },
  })
}
