import { useCallback } from "react";
import { TreeNode } from "@/components/InputForm";
import { NodePosition } from "@/types/tree";

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const LEVEL_HEIGHT = 80;
const SIBLING_SPACING = 40;

export function useTreeLayout(expandedNodes: Set<string>) {
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
        
        const childNodePosition: NodePosition = {
          ...child,
          x: childX,
          y: startY
        };
        childPositions.push(childNodePosition);
        
        const grandchildPositions = layoutChildren(child, childX + NODE_WIDTH / 2, startY + LEVEL_HEIGHT);
        childPositions.push(...grandchildPositions);
        
        currentX += subtreeWidth + SIBLING_SPACING;
      });
      
      return childPositions;
    };

    // Position root node
    const rootX = 400; // Center the root
    const rootNodePosition: NodePosition = {
      ...node,
      x: rootX,
      y: 50
    };
    positions.push(rootNodePosition);

    // Position children
    const childPositions = layoutChildren(node, rootX + NODE_WIDTH / 2, 50 + LEVEL_HEIGHT);
    positions.push(...childPositions);

    return positions;
  }, [expandedNodes]);

  return { calculateLayout, NODE_WIDTH, NODE_HEIGHT, LEVEL_HEIGHT, SIBLING_SPACING };
}