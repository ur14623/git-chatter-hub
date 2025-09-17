import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface AsciiDecoderNodeProps {
  data: {
    label: string;
    description?: string;
    parameters?: any;
    subnodes?: any[];
  };
  selected: boolean;
}

export const AsciiDecoderNode = memo(({ data, selected }: AsciiDecoderNodeProps) => {
  return (
    <div 
      className={`
        bg-node-background border-2 p-4 min-w-[200px] shadow-node
        ${selected ? 'border-primary' : 'border-node-border'}
        transition-all duration-200
      `}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-primary !border-background !w-3 !h-3" 
      />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-medium text-sm">{data.label}</h3>
        </div>
        
        {data.description && (
          <p className="text-xs text-muted-foreground">{data.description}</p>
        )}
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {data.label}
          </Badge>
          {data.subnodes && (
            <Badge variant="secondary" className="text-xs">
              {data.subnodes.length} subnodes
            </Badge>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-primary !border-background !w-3 !h-3" 
      />
    </div>
  );
});