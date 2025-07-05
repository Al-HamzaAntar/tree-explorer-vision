import { NodePosition } from "@/types/tree";

interface TreeConnectionsProps {
  nodePositions: NodePosition[];
  expandedNodes: Set<string>;
  nodeWidth: number;
  nodeHeight: number;
}

export function TreeConnections({ nodePositions, expandedNodes, nodeWidth, nodeHeight }: TreeConnectionsProps) {
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodePositions.forEach(node => {
      if (node.children && expandedNodes.has(node.id)) {
        node.children.forEach(child => {
          const childPos = nodePositions.find(pos => pos.id === child.id);
          if (childPos) {
            const startX = node.x + nodeWidth / 2;
            const startY = node.y + nodeHeight;
            const endX = childPos.x + nodeWidth / 2;
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

  return <>{renderConnections()}</>;
}