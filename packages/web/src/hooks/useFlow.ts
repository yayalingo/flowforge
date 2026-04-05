import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowsApi } from '../api/client';

export function useFlows() {
  return useQuery({ queryKey: ['flows'], queryFn: () => flowsApi.getAll().then(r => r.data) });
}

export function useFlow(id: string) {
  return useQuery({
    queryKey: ['flow', id],
    queryFn: () => flowsApi.getById(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: flowsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flows'] }),
  });
}

export function useUpdateFlow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => flowsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flow', id] });
      qc.invalidateQueries({ queryKey: ['flows'] });
    },
  });
}
