import { useMutation, useQuery } from '@tanstack/react-query';
import { flowsApi } from '../api/client';

export function useRunFlow(flowId: string) {
  return useMutation({
    mutationFn: () => flowsApi.run(flowId),
  });
}

export function useFlowRuns(flowId: string) {
  return useQuery({
    queryKey: ['runs', flowId],
    queryFn: () => flowsApi.getRuns(flowId).then(r => r.data),
    refetchInterval: 3000,
  });
}
