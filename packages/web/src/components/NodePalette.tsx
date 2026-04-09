

// Node definitions - copied from @flowforge/shared
const NODE_DEFINITIONS = {
  webhook: {
    type: 'webhook',
    label: 'Webhook',
    category: 'trigger' as const,
    description: 'Trigger flow via HTTP webhook',
    configSchema: {
      path: { type: 'text' as const, label: 'Path', required: true, placeholder: '/my-webhook' },
      method: { type: 'select' as const, label: 'Method', defaultValue: 'POST', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
      ]},
    },
  },
  manual: {
    type: 'manual',
    label: 'Manual Trigger',
    category: 'trigger' as const,
    description: 'Trigger flow manually',
    configSchema: {},
  },
  http: {
    type: 'http',
    label: 'HTTP Request',
    category: 'action' as const,
    description: 'Make HTTP requests to any API',
    configSchema: {
      url: { type: 'text' as const, label: 'URL', required: true, placeholder: 'https://api.example.com' },
      method: { type: 'select' as const, label: 'Method', defaultValue: 'GET', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' },
      ]},
      headers: { type: 'json' as const, label: 'Headers', defaultValue: '{}' },
      body: { type: 'json' as const, label: 'Body' },
    },
  },
  llm: {
    type: 'llm',
    label: 'AI / LLM Call',
    category: 'action' as const,
    description: 'Call any OpenAI-compatible LLM',
    configSchema: {
      model: { type: 'text' as const, label: 'Model', defaultValue: 'gpt-4o-mini' },
      systemPrompt: { type: 'textarea' as const, label: 'System Prompt' },
      userPrompt: { type: 'textarea' as const, label: 'User Prompt', required: true },
      temperature: { type: 'number' as const, label: 'Temperature', defaultValue: 0.7 },
      maxTokens: { type: 'number' as const, label: 'Max Tokens', defaultValue: 1024 },
    },
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    category: 'logic' as const,
    description: 'Branch flow based on condition',
    configSchema: {
      expression: { type: 'text' as const, label: 'Expression', required: true, placeholder: '{{step1.output.status}} == "success"' },
    },
  },
  loop: {
    type: 'loop',
    label: 'Loop',
    category: 'logic' as const,
    description: 'Iterate over array items',
    configSchema: {
      items: { type: 'text' as const, label: 'Array Expression', required: true, placeholder: '{{step1.output.items}}' },
    },
  },
  code: {
    type: 'code',
    label: 'Code',
    category: 'action' as const,
    description: 'Run custom JavaScript',
    configSchema: {
      code: { type: 'textarea' as const, label: 'JavaScript', required: true, placeholder: 'return { result: input.data }' },
    },
  },
  transform: {
    type: 'transform',
    label: 'Transform',
    category: 'action' as const,
    description: 'Map, filter, or set data',
    configSchema: {
      operation: { type: 'select' as const, label: 'Operation', required: true, options: [
        { label: 'Map', value: 'map' },
        { label: 'Filter', value: 'filter' },
        { label: 'Set', value: 'set' },
      ]},
      expression: { type: 'textarea' as const, label: 'Expression', required: true },
    },
  },
};

const nodeOrder: Array<'trigger' | 'action' | 'logic'> = ['trigger', 'action', 'logic'];

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-bold text-gray-700 mb-4">Nodes</h2>
      {nodeOrder.map((category: any) => (
        <div key={category} className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h3>
          <div className="space-y-2">
            {Object.values(NODE_DEFINITIONS)
              .filter((def: any) => def.category === category)
              .map((def: any) => (
                <div
                  key={def.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, def.type)}
                  className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded cursor-grab hover:bg-gray-100 text-sm"
                >
                  <span>{def.label}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
