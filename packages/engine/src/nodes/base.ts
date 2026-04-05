import type { FlowNode, StepOutput, NodeType } from '@flowforge/shared';

export abstract class BaseNode {
  abstract readonly type: NodeType;

  abstract execute(
    node: FlowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<unknown>;

  protected async runWithTiming(
    node: FlowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<StepOutput> {
    const start = Date.now();
    try {
      const output = await this.execute(node, input, context);
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'success',
        input,
        output,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'failed',
        input,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - start,
      };
    }
  }
}

export interface ExecutionContext {
  getStepOutput(nodeId: string): unknown;
  setStepOutput(nodeId: string, output: unknown): void;
  resolveExpression(expr: string): unknown;
}
