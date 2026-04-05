import { NodeRegistry } from './registry';
import { FlowExecutor } from './executor';
import { WebhookTrigger, ManualTrigger } from './nodes/trigger';
import { HttpRequestNode } from './nodes/http';
import { LLMCallNode } from './nodes/llm';
import { ConditionNode } from './nodes/condition';
import { CodeExecutionNode } from './nodes/code';
import { TransformNode } from './nodes/transform';

export * from './registry';
export * from './context';
export * from './nodes/base';
export * from './expression';

export function createDefaultExecutor(): FlowExecutor {
  const registry = new NodeRegistry();
  registry.register(new WebhookTrigger());
  registry.register(new ManualTrigger());
  registry.register(new HttpRequestNode());
  registry.register(new LLMCallNode());
  registry.register(new ConditionNode());
  registry.register(new CodeExecutionNode());
  registry.register(new TransformNode());
  return new FlowExecutor(registry);
}
