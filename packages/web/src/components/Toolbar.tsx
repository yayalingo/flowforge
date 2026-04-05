import { useFlowStore } from '../stores/flowStore';
import { useCreateFlow, useUpdateFlow } from '../hooks/useFlow';
import { useRunFlow } from '../hooks/useExecution';
import { Play, Save, Plus } from 'lucide-react';

interface Props {
  flowId?: string;
}

export function Toolbar({ flowId }: Props) {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const createFlow = useCreateFlow();
  const updateFlow = useUpdateFlow(flowId || '');
  const runFlow = useRunFlow(flowId || '');

  const handleSave = async () => {
    const data = {
      name: 'My Flow',
      nodes: nodes.map(({ position, ...rest }: any) => rest),
      edges,
    };

    if (flowId) {
      await updateFlow.mutateAsync(data);
    } else {
      const result = await createFlow.mutateAsync(data);
      window.history.pushState({}, '', `?flow=${result.data.id}`);
    }
  };

  const handleRun = async () => {
    await runFlow.mutateAsync();
  };

  const handleNew = () => {
    setNodes([]);
    setEdges([]);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <button onClick={handleNew} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
        <Plus className="w-4 h-4" /> New
      </button>
      <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded">
        <Save className="w-4 h-4" /> Save
      </button>
      {flowId && (
        <button onClick={handleRun} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded">
          <Play className="w-4 h-4" /> Run
        </button>
      )}
    </div>
  );
}
