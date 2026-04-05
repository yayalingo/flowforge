import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data }: any) {
  return (
    <div className="px-4 py-2 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-600" />
        <span className="font-semibold text-sm text-amber-900">{data.label}</span>
      </div>
      <span className="text-xs text-amber-600">{data.type}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
    </div>
  );
}
