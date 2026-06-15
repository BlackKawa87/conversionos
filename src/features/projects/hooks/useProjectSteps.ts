import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectStepsService, type CreateStepPayload } from '../services/project-steps.service'
import type { ProjectStep } from '@/types'

export function useProjectSteps(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-steps', projectId],
    queryFn:  () => projectStepsService.list(projectId!),
    enabled:  !!projectId,
    staleTime: 10_000,
  })
}

export function useCreateStep(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStepPayload) => projectStepsService.create(projectId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['project-steps', projectId] }),
  })
}

export function useUpdateStep(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Pick<ProjectStep, 'step_name' | 'step_type' | 'url_pattern' | 'step_index'>>) =>
      projectStepsService.update(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-steps', projectId] }),
  })
}

export function useDeleteStep(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectStepsService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['project-steps', projectId] }),
  })
}

export function useReorderSteps(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Array<{ id: string; step_index: number }>) =>
      projectStepsService.reorderBatch(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-steps', projectId] }),
  })
}
