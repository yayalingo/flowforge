import { BaseNode } from './base';
import type { ExecutionContext } from './base';
import type { FlowNode } from '@flowforge/shared';

export class TransformNode extends BaseNode {
  readonly type = 'transform' as const;

  async execute(node: FlowNode, input: unknown, context: ExecutionContext): Promise<unknown> {
    const operation = node.config.operation as string;
    const expression = node.config.expression as string;

    switch (operation) {
      case 'set': {
        return context.resolveExpression(expression);
      }
      case 'map': {
        if (!Array.isArray(input)) throw new Error('Map requires array input');
        const fn = new Function('item', 'index', `"use strict"; return ${expression}`) as any;
        return (input as any[]).map(fn);
      }
      case 'filter': {
        if (!Array.isArray(input)) throw new Error('Filter requires array input');
        const fn = new Function('item', 'index', `"use strict"; return ${expression}`) as any;
        return (input as any[]).filter(fn);
      }
      default:
        throw new Error(`Unknown transform operation: ${operation}`);
    }
  }
}
