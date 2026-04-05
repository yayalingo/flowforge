import { TriggerNode } from './NodeTypes/TriggerNode';
import { ActionNode } from './NodeTypes/ActionNode';
import { ConditionNode } from './NodeTypes/ConditionNode';
import { LLMNode } from './NodeTypes/LLMNode';

export const nodeTypes = {
  webhook: TriggerNode,
  manual: TriggerNode,
  http: ActionNode,
  code: ActionNode,
  transform: ActionNode,
  condition: ConditionNode,
  llm: LLMNode,
  loop: ActionNode,
};
