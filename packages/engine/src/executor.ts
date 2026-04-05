import type { Flow, FlowNode, FlowEdge, StepOutput, Execution } from '@flowforge/shared';
import { NodeRegistry } from './registry';
import { FlowExecutionContext } from './context';

export class FlowExecutor {
  constructor(private registry: NodeRegistry) {}

  async execute(
    flow: Flow,
    input: unknown,
    startNodeId?: string,
  ): Promise<Omit<Execution, 'id' | 'flowId'>> {
    const context = new FlowExecutionContext();
    const steps: StepOutput[] = [];
    const startedAt = new Date();

    
    const triggerNode = startNodeId
      ? flow.nodes.find(n => n.id === startNodeId)
      : flow.nodes.find(n => ['webhook', 'manual'].includes(n.type));

    if (!triggerNode) {
      throw new Error('No trigger node found');
    }

    // Execute trigger
    const triggerHandler = this.registry.get(triggerNode.type);
    const triggerResult = await triggerHandler['runWithTiming'](triggerNode, input, context);
    steps.push(triggerResult);
    if (triggerResult.status === 'failed') {
      return this.buildResult(steps, startedAt, triggerResult.error);
    }

    
    const visited = new Set<string>([triggerNode.id]);
    const queue = this.getOutgoingEdges(flow.edges, triggerNode.id).map(e => e.target);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      const node = flow.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      
      const incomingEdges = flow.edges.filter(e => e.target === nodeId);
      const nodeInput = incomingEdges.length > 0
        ? context.getStepOutput(incomingEdges[0].source)
        : input;

      // Special handling for condition nodes
      if (node.type === 'condition') {
        const handler = this.registry.get(node.type);
        const result = await handler['runWithTiming'](node, nodeInput, context);
        steps.push(result);

        if (result.status === 'failed') {
          return this.buildResult(steps, startedAt, result.error);
        }

        const conditionResult = (result.output as any)?.result;
        const outgoingEdges = flow.edges.filter(e => e.source === nodeId);
        for (const edge of outgoingEdges) {
          const shouldTraverse = conditionResult
            ? edge.sourceHandle !== 'false'
            : edge.sourceHandle === 'false';
          if (shouldTraverse) {
            queue.push(edge.target);
          }
        }
        visited.add(nodeId);
        continue;
      }

      // Normal node execution
      const handler = this.registry.get(node.type);
      const result = await handler['runWithTiming'](node, nodeInput, context);
      steps.push(result);

      if (result.status === 'failed') {
        return this.buildResult(steps, startedAt, result.error);
      }

      
      const outgoingEdges = flow.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      }

      visited.add(nodeId);
    }

    return this.buildResult(steps, startedAt);
  }

  private getOutgoingEdges(edges: FlowEdge[], nodeId: string): FlowEdge[] {
    return edges.filter(e => e.source === nodeId);
  }

  private buildResult(
    steps: StepOutput[],
    startedAt: Date,
    error?: string,
  ): Omit<Execution, 'id' | 'flowId'> {
    const finishedAt = new Date();
    const lastStep = steps[steps.length - 1];
    return {
      status: error ? 'failed' : 'success',
      steps,
      input: null,
      output: lastStep?.status === 'success' ? lastStep.output : null,
      error,
      startedAt,
      finishedAt,
      duration: finishedAt.getTime() - startedAt.getTime(),
    };
  }
}
