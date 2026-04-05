import type { NodeType } from './flow';

export interface NodeDefinition {
  type: NodeType;
  label: string;
  category: 'trigger' | 'action' | 'logic';
  description: string;
  icon: string;
  configSchema: Record<string, NodeProperty>;
}

export interface NodeProperty {
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'json';
  label: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  webhook: {
    type: 'webhook',
    label: 'Webhook',
    category: 'trigger',
    description: 'Trigger flow via HTTP webhook',
    icon: 'webhook',
    configSchema: {
      path: { type: 'text', label: 'Path', required: true, placeholder: '/my-webhook' },
      method: { type: 'select', label: 'Method', defaultValue: 'POST', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
      ]},
    },
  },
  manual: {
    type: 'manual',
    label: 'Manual Trigger',
    category: 'trigger',
    description: 'Trigger flow manually',
    icon: 'play',
    configSchema: {},
  },
  http: {
    type: 'http',
    label: 'HTTP Request',
    category: 'action',
    description: 'Make HTTP requests to any API',
    icon: 'globe',
    configSchema: {
      url: { type: 'text', label: 'URL', required: true, placeholder: 'https://api.example.com' },
      method: { type: 'select', label: 'Method', defaultValue: 'GET', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' },
      ]},
      headers: { type: 'json', label: 'Headers', defaultValue: '{}' },
      body: { type: 'json', label: 'Body' },
    },
  },
  llm: {
    type: 'llm',
    label: 'AI / LLM Call',
    category: 'action',
    description: 'Call any OpenAI-compatible LLM',
    icon: 'brain',
    configSchema: {
      model: { type: 'text', label: 'Model', defaultValue: 'gpt-4o-mini' },
      systemPrompt: { type: 'textarea', label: 'System Prompt' },
      userPrompt: { type: 'textarea', label: 'User Prompt', required: true },
      temperature: { type: 'number', label: 'Temperature', defaultValue: 0.7 },
      maxTokens: { type: 'number', label: 'Max Tokens', defaultValue: 1024 },
    },
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    category: 'logic',
    description: 'Branch flow based on condition',
    icon: 'git-branch',
    configSchema: {
      expression: { type: 'text', label: 'Expression', required: true, placeholder: '{{step1.output.status}} == "success"' },
    },
  },
  loop: {
    type: 'loop',
    label: 'Loop',
    category: 'logic',
    description: 'Iterate over array items',
    icon: 'repeat',
    configSchema: {
      items: { type: 'text', label: 'Array Expression', required: true, placeholder: '{{step1.output.items}}' },
    },
  },
  code: {
    type: 'code',
    label: 'Code',
    category: 'action',
    description: 'Run custom JavaScript',
    icon: 'code',
    configSchema: {
      code: { type: 'textarea', label: 'JavaScript', required: true, placeholder: 'return { result: input.data }' },
    },
  },
  transform: {
    type: 'transform',
    label: 'Transform',
    category: 'action',
    description: 'Map, filter, or set data',
    icon: 'shuffle',
    configSchema: {
      operation: { type: 'select', label: 'Operation', required: true, options: [
        { label: 'Map', value: 'map' },
        { label: 'Filter', value: 'filter' },
        { label: 'Set', value: 'set' },
      ]},
      expression: { type: 'textarea', label: 'Expression', required: true },
    },
  },
};
