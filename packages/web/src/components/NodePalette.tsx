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

const nodeOrder: Array<'trigger' | 'action' | 'logic'> = ['trigger', 'action', 'logic'];

export function NodePalette() {
  const { nodes, setNodes } = useFlowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const def = NODE_DEFINITIONS[type as keyof typeof NODE_DEFINITIONS];
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      label: def.label,
      config: {},
      position,
    };

    setNodes([...nodes, newNode]);
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-4 overflow-y-auto" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
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
