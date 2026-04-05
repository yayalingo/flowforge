import type { NodeType } from './flow';

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'timeout';

export interface Execution {
  id: string;
  flowId: string;
  status: ExecutionStatus;
  steps: StepOutput[];
  input: unknown;
  output: unknown;
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
  duration?: number;
}

export interface StepOutput {
  nodeId: string;
  nodeType: NodeType;
  status: 'success' | 'failed' | 'skipped';
  input: unknown;
  output: unknown;
  error?: string;
  duration?: number;
}
