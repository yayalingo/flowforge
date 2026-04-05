import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

export function LLMNode({ data }: any) {
  return (
    <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-emerald-600" />
        <span className="font-semibold text-sm text-emerald-900">{data.label}</span>
      </div>
      <span className="text-xs text-emerald-600">{data.config?.model || 'gpt-4o-mini'}</span>
      <Handle type="target" position={Position.Top} className="!bg-emerald-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400" />
    </div>
  );
}
