/* Fallback-safe import for NODE_DEFINITIONS to accommodate build systems
   where direct named export may not be statically resolvable. */
declare const require: any;
let NODE_DEFINITIONS: any = {};
try {
  // @ts-ignore
  NODE_DEFINITIONS = require('@flowforge/shared').NODE_DEFINITIONS;
} catch {
  NODE_DEFINITIONS = {};
}
import { useFlowStore } from '../stores/flowStore';

interface Props {
  nodeId: string;
}

export function NodeConfigPanel({ nodeId }: Props) {
  const { nodes, setNodes, setSelectedNode } = useFlowStore();
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const def: any = (NODE_DEFINITIONS as any)[node.type as string] ?? {};

  const updateField = (field: string, value: unknown) => {
    const updated = nodes.map(n =>
      n.id === nodeId ? { ...n, config: { ...n.config, [field]: value } } : n
    );
    setNodes(updated);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{def.label}</h2>
        <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{def.description}</p>

      {(Object.entries(def.configSchema as any) as [string, any][]).map(([key, prop]) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {prop.label} {prop.required && <span className="text-red-500">*</span>}
          </label>
          {prop.type === 'textarea' ? (
            <textarea
              value={(node.config[key] as string) || ''}
              onChange={e => updateField(key, e.target.value)}
              placeholder={prop.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
              rows={4}
            />
          ) : prop.type === 'select' ? (
            <select
              value={(node.config[key] as string) || (prop.defaultValue as string) || ''}
              onChange={e => updateField(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {prop.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : prop.type === 'number' ? (
            <input
              type="number"
              value={(node.config[key] as number) ?? (prop.defaultValue as number) ?? ''}
              onChange={e => updateField(key, parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          ) : prop.type === 'json' ? (
            <textarea
              value={typeof node.config[key] === 'string' ? node.config[key] : JSON.stringify(node.config[key] || prop.defaultValue, null, 2)}
              onChange={e => {
                try { updateField(key, JSON.parse(e.target.value)); } catch { updateField(key, e.target.value); }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono resize-none"
              rows={4}
            />
          ) : (
            <input
              type="text"
              value={(node.config[key] as string) || ''}
              onChange={e => updateField(key, e.target.value)}
              placeholder={prop.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
