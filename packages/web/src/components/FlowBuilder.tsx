import { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './NodeWrapper';
import { useFlowStore } from '../stores/flowStore';

export function FlowBuilder() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode } = useFlowStore();

  const [rfNodes] = useNodesState(
    nodes.map((n: any) => ({
      id: n.id,
      type: n.type,
      position: n.position || { x: 0, y: 0 },
      data: n,
    }))
  );

  const [rfEdges, setRfEdges] = useEdgesState(edges);

  const handleConnect = useCallback(
    (params: any) => {
      onConnect(params);
      setRfEdges((eds) => addEdge(params, eds));
    },
    [onConnect, setRfEdges],
  );

  const onNodeClick = useCallback(
    (_: any, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onNodeClick={onNodeClick}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
