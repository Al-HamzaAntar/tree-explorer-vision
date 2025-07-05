import { TreeNode as TreeNodeType } from "./InputForm";
import { NodePosition } from "@/types/tree";
import { Folder, FolderOpen } from "lucide-react";

interface TreeNodeProps {
  node: NodePosition;
  selectedNode: TreeNodeType | null;
  hoveredNode: string | null;
  expandedNodes: Set<string>;
  draggedNode: TreeNodeType | null;
  dropTarget: TreeNodeType | null;
  searchTerm: string;
  nodeWidth: number;
  nodeHeight: number;
  isNodeDragging: boolean;
  onNodeClick: (node: TreeNodeType) => void;
  onMouseEnter: (nodeId: string) => void;
  onMouseLeave: () => void;
  onNodeDragStart: (e: React.DragEvent, node: TreeNodeType) => void;
  onNodeDragOver: (e: React.DragEvent, node: TreeNodeType) => void;
  onNodeDragLeave: (e: React.DragEvent) => void;
  onNodeDrop: (e: React.DragEvent, node: TreeNodeType) => void;
  onNodeDragEnd: () => void;
}

export function TreeNode({
  node,
  selectedNode,
  hoveredNode,
  expandedNodes,
  draggedNode,
  dropTarget,
  searchTerm,
  nodeWidth,
  nodeHeight,
  isNodeDragging,
  onNodeClick,
  onMouseEnter,
  onMouseLeave,
  onNodeDragStart,
  onNodeDragOver,
  onNodeDragLeave,
  onNodeDrop,
  onNodeDragEnd,
}: TreeNodeProps) {
  const isNodeHighlighted = () => {
    if (!searchTerm) return false;
    return node.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const getNodeColor = () => {
    if (draggedNode?.id === node.id) return "hsl(var(--muted))";
    if (dropTarget?.id === node.id && node.type === "folder") return "hsl(var(--ring))";
    if (selectedNode?.id === node.id) return "hsl(var(--selected-node))";
    if (isNodeHighlighted()) return "hsl(var(--node-hover))";
    return node.type === "folder" ? "hsl(var(--folder-node))" : "hsl(var(--file-node))";
  };

  return (
    <g 
      onDragStart={(e) => onNodeDragStart(e, node)}
      onDragOver={(e) => onNodeDragOver(e, node)}
      onDragLeave={onNodeDragLeave}
      onDrop={(e) => onNodeDrop(e, node)}
      onDragEnd={onNodeDragEnd}
      style={{ cursor: isNodeDragging ? 'grabbing' : 'grab' }}
    >
      <rect
        x={node.x}
        y={node.y}
        width={nodeWidth}
        height={nodeHeight}
        rx="6"
        fill={getNodeColor()}
        stroke={selectedNode?.id === node.id ? "hsl(var(--ring))" : "transparent"}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:opacity-80"
        onClick={() => onNodeClick(node)}
        onMouseEnter={() => onMouseEnter(node.id)}
        onMouseLeave={onMouseLeave}
      />
      
      <foreignObject
        x={node.x + 8}
        y={node.y + 8}
        width={nodeWidth - 16}
        height={nodeHeight - 16}
        className="pointer-events-none"
      >
        <div className="flex items-center gap-2 h-full text-white text-sm font-medium">
          {node.type === "folder" ? (
            expandedNodes.has(node.id) ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 rounded-sm bg-white/20 flex-shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
      </foreignObject>
      
      {/* Tooltip */}
      {hoveredNode === node.id && (
        <g>
          <rect
            x={node.x + nodeWidth + 10}
            y={node.y - 5}
            width="200"
            height="50"
            rx="4"
            fill="hsl(var(--popover))"
            stroke="hsl(var(--border))"
            className="drop-shadow-lg"
          />
          <foreignObject
            x={node.x + nodeWidth + 15}
            y={node.y}
            width="190"
            height="40"
          >
            <div className="text-xs text-foreground">
              <div className="font-medium">{node.name}</div>
              <div className="text-muted-foreground">{node.path}</div>
              <div className="text-muted-foreground capitalize">{node.type}</div>
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}