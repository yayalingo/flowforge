import { useFlowRuns } from '../hooks/useExecution';

interface Props {
  flowId: string;
}

export function ExecutionLog({ flowId }: Props) {
  const { data: runs, isLoading } = useFlowRuns(flowId);

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading runs...</div>;
  if (!runs?.length) return <div className="p-4 text-sm text-gray-500">No executions yet</div>;

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-sm text-gray-700">Recent Executions</h3>
      {runs.map((run: any) => (
        <div key={run.id} className={`p-3 rounded border text-sm ${
          run.status === 'success' ? 'bg-green-50 border-green-200' :
          run.status === 'failed' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex justify-between">
            <span className="font-mono text-xs">{run.id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              run.status === 'success' ? 'bg-green-200 text-green-800' :
              run.status === 'failed' ? 'bg-red-200 text-red-800' :
              'bg-yellow-200 text-yellow-800'
            }`}>{run.status}</span>
          </div>
          {run.duration && <span className="text-xs text-gray-500">{run.duration}ms</span>}
        </div>
      ))}
    </div>
  );
}
