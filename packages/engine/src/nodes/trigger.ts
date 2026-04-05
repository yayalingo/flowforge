import { BaseNode } from './base';
import type { ExecutionContext } from './base';
import type { FlowNode } from '@flowforge/shared';

export class WebhookTrigger extends BaseNode {
  readonly type = 'webhook' as const;

  async execute(_node: FlowNode, input: unknown, _context: ExecutionContext): Promise<unknown> {
    return input;
  }
}

export class ManualTrigger extends BaseNode {
  readonly type = 'manual' as const;

  async execute(_node: FlowNode, input: unknown, _context: ExecutionContext): Promise<unknown> {
    return input ?? {};
  }
}
