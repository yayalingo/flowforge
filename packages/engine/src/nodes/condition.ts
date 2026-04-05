import { evaluateExpression } from '../expression';
import { BaseNode } from './base';
import type { ExecutionContext } from './base';
import type { FlowNode } from '@flowforge/shared';

export class ConditionNode extends BaseNode {
  readonly type = 'condition' as const;

  async execute(node: FlowNode, _input: unknown, context: ExecutionContext): Promise<unknown> {
    const expression = context.resolveExpression(node.config.expression as string) as string;
    const allOutputs = (context as any).getAllOutputs?.() ?? {};
    const result = evaluateExpression(expression, allOutputs);
    return { result };
  }
}
