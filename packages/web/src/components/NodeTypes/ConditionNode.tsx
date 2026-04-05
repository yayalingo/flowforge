import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data }: any) {
  return (
    <div className="px-4 py-3 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-sm min-w-[180px] relative">
      <div className="flex items-center gap-2 justify-center">
        <GitBranch className="w-4 h-4 text-purple-600" />
        <span className="font-semibold text-sm text-purple-900">{data.label}</span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <Handle type="source" position={Position.Bottom} id="true" className="!left-1/4 !bg-green-400" />
      <span className="absolute bottom-[-18px] left-1/4 text-[10px] text-green-600">True</span>
      <Handle type="source" position={Position.Bottom} id="false" className="!left-3/4 !bg-red-400" />
      <span className="absolute bottom-[-18px] left-3/4 text-[10px] text-red-600">False</span>
    </div>
  );
}
