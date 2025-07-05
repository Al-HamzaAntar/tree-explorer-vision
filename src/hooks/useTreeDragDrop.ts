import { useState } from "react";
import { TreeNode } from "@/components/InputForm";

export function useTreeDragDrop() {
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);
  const [dropTarget, setDropTarget] = useState<TreeNode | null>(null);
  const [isNodeDragging, setIsNodeDragging] = useState(false);

  // Drag and drop utility functions
  const isValidMove = (draggedNode: TreeNode, targetNode: TreeNode): boolean => {
    if (draggedNode.id === targetNode.id) return false;
    if (targetNode.type !== "folder") return false;
    
    // Check if target is a descendant of dragged node
    const isDescendant = (node: TreeNode, ancestorId: string): boolean => {
      if (node.id === ancestorId) return true;
      return node.children?.some(child => isDescendant(child, ancestorId)) || false;
    };
    
    return !isDescendant(targetNode, draggedNode.id);
  };

  const removeNodeFromTree = (tree: TreeNode, nodeId: string): TreeNode => {
    const newTree = { ...tree };
    
    const removeFromChildren = (parent: TreeNode): boolean => {
      if (!parent.children) return false;
      
      const childIndex = parent.children.findIndex(child => child.id === nodeId);
      if (childIndex !== -1) {
        parent.children = parent.children.filter((_, index) => index !== childIndex);
        return true;
      }
      
      return parent.children.some(child => removeFromChildren(child));
    };
    
    if (newTree.id === nodeId) {
      return newTree;
    }
    
    removeFromChildren(newTree);
    return newTree;
  };

  const addNodeToParent = (tree: TreeNode, parentId: string, nodeToAdd: TreeNode): TreeNode => {
    const newTree = { ...tree };
    
    const addToChildren = (parent: TreeNode): boolean => {
      if (parent.id === parentId) {
        if (!parent.children) parent.children = [];
        parent.children.push(nodeToAdd);
        return true;
      }
      
      return parent.children?.some(child => addToChildren(child)) || false;
    };
    
    addToChildren(newTree);
    return newTree;
  };

  const handleNodeDragStart = (e: React.DragEvent, node: TreeNode) => {
    e.stopPropagation();
    setDraggedNode(node);
    setIsNodeDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleNodeDragOver = (e: React.DragEvent, node: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedNode && isValidMove(draggedNode, node)) {
      setDropTarget(node);
      e.dataTransfer.dropEffect = "move";
    } else {
      setDropTarget(null);
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleNodeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
  };

  const handleNodeDrop = (e: React.DragEvent, targetNode: TreeNode, data: TreeNode | null, onDataUpdate?: (data: TreeNode) => void) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedNode || !isValidMove(draggedNode, targetNode)) {
      return;
    }
    
    if (data && onDataUpdate) {
      // Remove node from current position
      let updatedTree = removeNodeFromTree(data, draggedNode.id);
      
      // Add node to new parent
      updatedTree = addNodeToParent(updatedTree, targetNode.id, draggedNode);
      
      onDataUpdate(updatedTree);
    }
    
    setDraggedNode(null);
    setDropTarget(null);
    setIsNodeDragging(false);
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
    setDropTarget(null);
    setIsNodeDragging(false);
  };

  return {
    draggedNode,
    dropTarget,
    isNodeDragging,
    handleNodeDragStart,
    handleNodeDragOver,
    handleNodeDragLeave,
    handleNodeDrop,
    handleNodeDragEnd,
  };
}