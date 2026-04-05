import { Handle, Position } from '@xyflow/react';
import { Globe, Code, Shuffle, Repeat } from 'lucide-react';

const iconMap: Record<string, any> = {
  http: Globe,
  code: Code,
  transform: Shuffle,
  loop: Repeat,
};

export function ActionNode({ data }: any) {
  const Icon = iconMap[data.type] || Globe;
  return (
    <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-sm text-blue-900">{data.label}</span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}
