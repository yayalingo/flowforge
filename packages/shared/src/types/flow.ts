export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number }; // UI only
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // 'true' | 'false' for condition nodes
  targetHandle?: string;
}

export type NodeType =
  | 'webhook'
  | 'manual'
  | 'http'
  | 'llm'
  | 'condition'
  | 'loop'
  | 'code'
  | 'transform';
