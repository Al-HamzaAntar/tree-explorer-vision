import { TreeNode } from "./InputForm";
import { Move, Trash, X } from "lucide-react";
import { Button } from "./ui/button";

interface BatchOperationsProps {
  selectedNodes: TreeNode[];
  onDelete: () => void;
  onMove: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearSelection: () => void;
}

export function BatchOperations({
  selectedNodes,
  onDelete,
  onMove,
  onExpandAll,
  onCollapseAll,
  onClearSelection,
}: BatchOperationsProps) {
  if (selectedNodes.length === 0) return null;

  const folderCount = selectedNodes.filter(node => node.type === "folder").length;

  return (
    <div className="bg-gradient-surface border border-border/50 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          {selectedNodes.length} item{selectedNodes.length > 1 ? "s" : ""} selected
          {folderCount > 0 && ` (${folderCount} folder${folderCount > 1 ? "s" : ""})`}
        </h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="h-7 text-xs"
        >
          <Trash className="h-3 w-3 mr-1" />
          Delete
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          className="h-7 text-xs"
        >
          <Move className="h-3 w-3 mr-1" />
          Move
        </Button>
        
        {folderCount > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onExpandAll}
              className="h-7 text-xs"
            >
              Expand All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCollapseAll}
              className="h-7 text-xs"
            >
              Collapse All
            </Button>
          </>
        )}
      </div>
    </div>
  );
}