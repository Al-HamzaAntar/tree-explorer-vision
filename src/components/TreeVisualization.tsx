import { useState, useEffect, useRef } from "react";
import { TreeNode } from "./InputForm";
import { Folder } from "lucide-react";
import { useTreeLayout } from "@/hooks/useTreeLayout";
import { useTreeDragDrop } from "@/hooks/useTreeDragDrop";
import { TreeConnections } from "./TreeConnections";
import { TreeNode as TreeNodeComponent } from "./TreeNode";
import { NodePosition } from "@/types/tree";

interface TreeVisualizationProps {
  data: TreeNode | null;
  selectedNode: TreeNode | null;
  onNodeSelect: (node: TreeNode) => void;
  onDataUpdate?: (data: TreeNode) => void;
  searchTerm: string;
}

export function TreeVisualization({ 
  data, 
  selectedNode, 
  onNodeSelect, 
  onDataUpdate,
  searchTerm 
}: TreeVisualizationProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);

  const { calculateLayout, NODE_WIDTH, NODE_HEIGHT } = useTreeLayout(expandedNodes);
  const {
    draggedNode,
    dropTarget,
    isNodeDragging,
    handleNodeDragStart,
    handleNodeDragOver,
    handleNodeDragLeave,
    handleNodeDrop,
    handleNodeDragEnd,
  } = useTreeDragDrop();

  useEffect(() => {
    if (data) {
      const expanded = new Set<string>();
      const collectExpanded = (node: TreeNode) => {
        if (node.expanded !== false) {
          expanded.add(node.id);
        }
        node.children?.forEach(collectExpanded);
      };
      collectExpanded(data);
      setExpandedNodes(expanded);
    }
  }, [data]);


  useEffect(() => {
    if (data) {
      const positions = calculateLayout(data);
      setNodePositions(positions);
    }
  }, [data, calculateLayout]);

  const handleNodeClick = (node: TreeNode) => {
    if (node.children) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    }
    onNodeSelect(node);
  };

  const handleNodeRename = (nodeId: string, newName: string) => {
    if (!data || !onDataUpdate) return;
    
    const updateNodeName = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, name: newName };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeName)
        };
      }
      
      return node;
    };
    
    const updatedData = updateNodeName(data);
    onDataUpdate(updatedData);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };


  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-surface border border-border/50 rounded-lg">
        <div className="text-center text-muted-foreground">
          <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No data to visualize</p>
          <p className="text-sm">Enter JSON data or a folder path to generate the tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-surface border border-border/50 rounded-lg overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="bg-card/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm text-muted-foreground">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
      
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <TreeConnections 
            nodePositions={nodePositions}
            expandedNodes={expandedNodes}
            nodeWidth={NODE_WIDTH}
            nodeHeight={NODE_HEIGHT}
          />
          
          {nodePositions.map(node => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              selectedNode={selectedNode}
              hoveredNode={hoveredNode}
              expandedNodes={expandedNodes}
              draggedNode={draggedNode}
              dropTarget={dropTarget}
              searchTerm={searchTerm}
              nodeWidth={NODE_WIDTH}
              nodeHeight={NODE_HEIGHT}
              isNodeDragging={isNodeDragging}
              onNodeClick={handleNodeClick}
              onMouseEnter={setHoveredNode}
              onMouseLeave={() => setHoveredNode(null)}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragOver={handleNodeDragOver}
              onNodeDragLeave={handleNodeDragLeave}
              onNodeDrop={(e, targetNode) => handleNodeDrop(e, targetNode, data, onDataUpdate)}
              onNodeDragEnd={handleNodeDragEnd}
              onNodeRename={handleNodeRename}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}