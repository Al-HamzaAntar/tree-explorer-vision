import { useState, useEffect, useRef, useCallback } from "react";
import { TreeNode } from "./InputForm";
import { Folder, FolderOpen } from "lucide-react";

interface TreeVisualizationProps {
  data: TreeNode | null;
  selectedNode: TreeNode | null;
  onNodeSelect: (node: TreeNode) => void;
  searchTerm: string;
}

interface Position {
  x: number;
  y: number;
}

interface NodePosition extends TreeNode {
  x: number;
  y: number;
}

export function TreeVisualization({ 
  data, 
  selectedNode, 
  onNodeSelect, 
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

  const NODE_WIDTH = 120;
  const NODE_HEIGHT = 40;
  const LEVEL_HEIGHT = 80;
  const SIBLING_SPACING = 40;

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

  const calculateLayout = useCallback((node: TreeNode, level = 0, siblingIndex = 0): NodePosition[] => {
    const positions: NodePosition[] = [];
    
    const calculateSubtreeWidth = (n: TreeNode): number => {
      if (!n.children || !expandedNodes.has(n.id)) return NODE_WIDTH;
      const childrenWidth = n.children.reduce((sum, child, index) => {
        return sum + calculateSubtreeWidth(child) + (index > 0 ? SIBLING_SPACING : 0);
      }, 0);
      return Math.max(NODE_WIDTH, childrenWidth);
    };

    const layoutChildren = (parent: TreeNode, parentX: number, startY: number): NodePosition[] => {
      if (!parent.children || !expandedNodes.has(parent.id)) return [];
      
      const childPositions: NodePosition[] = [];
      let currentX = parentX;
      
      parent.children.forEach((child, index) => {
        const subtreeWidth = calculateSubtreeWidth(child);
        const childX = currentX + subtreeWidth / 2 - NODE_WIDTH / 2;
        
        childPositions.push({
          ...child,
          x: childX,
          y: startY
        });
        
        const grandchildPositions = layoutChildren(child, childX + NODE_WIDTH / 2, startY + LEVEL_HEIGHT);
        childPositions.push(...grandchildPositions);
        
        currentX += subtreeWidth + SIBLING_SPACING;
      });
      
      return childPositions;
    };

    // Position root node
    const rootX = 400; // Center the root
    positions.push({
      ...node,
      x: rootX,
      y: 50
    });

    // Position children
    const childPositions = layoutChildren(node, rootX + NODE_WIDTH / 2, 50 + LEVEL_HEIGHT);
    positions.push(...childPositions);

    return positions;
  }, [expandedNodes, NODE_WIDTH, NODE_HEIGHT, LEVEL_HEIGHT, SIBLING_SPACING]);

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

  const isNodeHighlighted = (node: TreeNode) => {
    if (!searchTerm) return false;
    return node.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const getNodeColor = (node: TreeNode) => {
    if (selectedNode?.id === node.id) return "hsl(var(--selected-node))";
    if (isNodeHighlighted(node)) return "hsl(var(--node-hover))";
    return node.type === "folder" ? "hsl(var(--folder-node))" : "hsl(var(--file-node))";
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodePositions.forEach(node => {
      if (node.children && expandedNodes.has(node.id)) {
        node.children.forEach(child => {
          const childPos = nodePositions.find(pos => pos.id === child.id);
          if (childPos) {
            const startX = node.x + NODE_WIDTH / 2;
            const startY = node.y + NODE_HEIGHT;
            const endX = childPos.x + NODE_WIDTH / 2;
            const endY = childPos.y;
            
            connections.push(
              <path
                key={`${node.id}-${child.id}`}
                d={`M ${startX} ${startY} Q ${startX} ${startY + 20} ${(startX + endX) / 2} ${(startY + endY) / 2} Q ${endX} ${endY - 20} ${endX} ${endY}`}
                stroke="hsl(var(--connection-line))"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
            );
          }
        });
      }
    });
    
    return connections;
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
          {renderConnections()}
          
          {nodePositions.map(node => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx="6"
                fill={getNodeColor(node)}
                stroke={selectedNode?.id === node.id ? "hsl(var(--ring))" : "transparent"}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
              
              <foreignObject
                x={node.x + 8}
                y={node.y + 8}
                width={NODE_WIDTH - 16}
                height={NODE_HEIGHT - 16}
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
                    x={node.x + NODE_WIDTH + 10}
                    y={node.y - 5}
                    width="200"
                    height="50"
                    rx="4"
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                    className="drop-shadow-lg"
                  />
                  <foreignObject
                    x={node.x + NODE_WIDTH + 15}
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
          ))}
        </g>
      </svg>
    </div>
  );
}