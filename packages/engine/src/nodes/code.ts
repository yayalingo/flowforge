import { BaseNode } from './base';
import type { ExecutionContext } from './base';
import type { FlowNode } from '@flowforge/shared';

export class CodeExecutionNode extends BaseNode {
  readonly type = 'code' as const;

  async execute(node: FlowNode, input: unknown, context: ExecutionContext): Promise<unknown> {
    const code = node.config.code as string;
    if (!code) throw new Error('No code provided');

    const allOutputs = (context as any).getAllOutputs?.() ?? {};
    const fn = new Function('input', 'context', `"use strict"; ${code}`);
    return fn(input, { outputs: allOutputs });
  }
}
