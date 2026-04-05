import type { BaseNode } from './nodes/base';
import type { NodeType } from '@flowforge/shared';

export class NodeRegistry {
  private nodes = new Map<NodeType, BaseNode>();

  register(node: BaseNode): void {
    this.nodes.set(node.type, node);
  }

  get(type: NodeType): BaseNode {
    const handler = this.nodes.get(type);
    if (!handler) throw new Error(`Unknown node type: ${type}`);
    return handler;
  }

  has(type: NodeType): boolean {
    return this.nodes.has(type);
  }
}
