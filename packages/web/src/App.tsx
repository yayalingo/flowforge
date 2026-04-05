import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowBuilder } from './components/FlowBuilder';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { Toolbar } from './components/Toolbar';
import { ExecutionLog } from './components/ExecutionLog';
import { useFlowStore } from './stores/flowStore';
import { useFlow } from './hooks/useFlow';

function FlowForgeApp() {
  const [flowId, setFlowId] = useState<string | undefined>();
  const selectedNode = useFlowStore(s => s.selectedNode);
  const { data: flow } = useFlow(flowId || '');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('flow');
    if (id) setFlowId(id);
  }, []);

  useEffect(() => {
    if (flow) {
      useFlowStore.getState().setNodes(
        (flow.nodes as any[]).map((n: any) => ({
          ...n,
          position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        }))
      );
      useFlowStore.getState().setEdges(flow.edges || []);
    }
  }, [flow]);

  return (
    <div className="flex h-screen w-screen">
      <NodePalette />
      <div className="flex-1 relative">
        <Toolbar flowId={flowId} />
        <FlowBuilder />
        {flowId && (
          <div className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-10">
            <ExecutionLog flowId={flowId} />
          </div>
        )}
      </div>
      {selectedNode && <NodeConfigPanel nodeId={selectedNode} />}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowForgeApp />
    </ReactFlowProvider>
  );
}
