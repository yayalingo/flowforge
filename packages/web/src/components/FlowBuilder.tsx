import { useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useReactFlow, Panel, Node, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '../stores/flowStore';

const nodeDefinitions = {
  webhook: { label: 'Webhook' },
  manual: { label: 'Manual Trigger' },
  http: { label: 'HTTP Request' },
  llm: { label: 'AI / LLM Call' },
  condition: { label: 'Condition' },
  loop: { label: 'Loop' },
  code: { label: 'Code' },
  transform: { label: 'Transform' },
};

export function FlowBuilder() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, setNodes, setEdges } = useFlowStore();
  const { getNodes } = useReactFlow();

  const handleConnect = useCallback(
    (params: any) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onConnect(params);
    },
    [edges, onConnect, setEdges],
  );

  const onNodeClick = useCallback(
    (_: any, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: 250 + Math.random() * 100,
        y: 150 + Math.random() * 100,
      };

      const def = nodeDefinitions[type as keyof typeof nodeDefinitions];
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: 'default',
        position,
        data: { label: def?.label || type },
      };

      setNodes([...nodes, newNode]);
    },
    [setNodes, nodes],
  );

  useEffect(() => {
    if (nodes.length > 0) {
      console.log('Nodes in store:', nodes);
      console.log('RF nodes:', getNodes());
    }
  }, [nodes, getNodes]);

  return (
    <div className="flex-1 h-full" style={{ height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="bg-white p-2 text-xs border">
          <div>Store Nodes: {nodes.length}</div>
          <div>RF Nodes: {getNodes().length}</div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
