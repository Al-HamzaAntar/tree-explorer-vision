import { useState, useEffect } from "react";
import { InputForm, TreeNode } from "@/components/InputForm";
import { TreeVisualization } from "@/components/TreeVisualization";
import { NodeDetails } from "@/components/NodeDetails";
import { SearchBar } from "@/components/SearchBar";
import { BatchOperations } from "@/components/BatchOperations";

const Index = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('folderTreeData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTreeData(parsed);
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  }, []);

  const handleDataSubmit = (data: TreeNode) => {
    setTreeData(data);
    setSelectedNodes(new Set());
    setSearchTerm("");
    
    // Save to localStorage
    localStorage.setItem('folderTreeData', JSON.stringify(data));
  };

  const handleDataUpdate = (data: TreeNode) => {
    setTreeData(data);
    
    // Save updated data to localStorage
    localStorage.setItem('folderTreeData', JSON.stringify(data));
  };

  const handleBatchDelete = () => {
    if (!treeData || selectedNodes.size === 0) return;
    
    const deleteNodes = (node: TreeNode): TreeNode | null => {
      if (selectedNodes.has(node.id)) {
        return null; // Mark for deletion
      }
      
      if (node.children) {
        const filteredChildren = node.children
          .map(deleteNodes)
          .filter((child): child is TreeNode => child !== null);
        
        return { ...node, children: filteredChildren };
      }
      
      return node;
    };
    
    const updatedData = deleteNodes(treeData);
    if (updatedData) {
      handleDataUpdate(updatedData);
      setSelectedNodes(new Set());
    }
  };

  const handleBatchExpandAll = () => {
    if (!treeData) return;
    
    const expandSelectedFolders = (node: TreeNode): TreeNode => {
      const shouldExpand = selectedNodes.has(node.id) && node.type === "folder";
      
      const updatedNode = {
        ...node,
        expanded: shouldExpand ? true : node.expanded
      };
      
      if (node.children) {
        updatedNode.children = node.children.map(expandSelectedFolders);
      }
      
      return updatedNode;
    };
    
    const updatedData = expandSelectedFolders(treeData);
    handleDataUpdate(updatedData);
  };

  const handleBatchCollapseAll = () => {
    if (!treeData) return;
    
    const collapseSelectedFolders = (node: TreeNode): TreeNode => {
      const shouldCollapse = selectedNodes.has(node.id) && node.type === "folder";
      
      const updatedNode = {
        ...node,
        expanded: shouldCollapse ? false : node.expanded
      };
      
      if (node.children) {
        updatedNode.children = node.children.map(collapseSelectedFolders);
      }
      
      return updatedNode;
    };
    
    const updatedData = collapseSelectedFolders(treeData);
    handleDataUpdate(updatedData);
  };

  const handleNodeSelect = (nodeId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    } else {
      setSelectedNodes(new Set([nodeId]));
    }
  };

  const getSelectedNodesData = (): TreeNode[] => {
    if (!treeData) return [];
    
    const nodes: TreeNode[] = [];
    const collectNodes = (node: TreeNode) => {
      if (selectedNodes.has(node.id)) {
        nodes.push(node);
      }
      node.children?.forEach(collectNodes);
    };
    
    collectNodes(treeData);
    return nodes;
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Folder Tree Visualizer
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Interactive folder structure visualization tool
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
              <span>Zoom & Pan • Click to Expand • Drag to Move • Hover for Details</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
      </div>

      {/* Batch Operations */}
      <div className="container mx-auto px-3 sm:px-6">
        <BatchOperations
          selectedNodes={getSelectedNodesData()}
          onDelete={handleBatchDelete}
          onMove={() => {
            // TODO: Implement batch move - requires move destination selection UI
            console.log("Move functionality not yet implemented");
          }}
          onExpandAll={handleBatchExpandAll}
          onCollapseAll={handleBatchCollapseAll}
          onClearSelection={() => setSelectedNodes(new Set())}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 pb-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 min-h-[calc(100vh-240px)] lg:h-[calc(100vh-200px)]">
          {/* Mobile: Input Form */}
          <div className="lg:col-span-3 order-1 lg:order-none">
            <InputForm onDataSubmit={handleDataSubmit} />
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-6 order-3 lg:order-none min-h-[400px] lg:min-h-0">
            <TreeVisualization
              data={treeData}
              selectedNodes={selectedNodes}
              onNodeSelect={handleNodeSelect}
              onDataUpdate={handleDataUpdate}
              searchTerm={searchTerm}
            />
          </div>

          {/* Node Details */}
          <div className="lg:col-span-3 order-2 lg:order-none">
            <NodeDetails nodes={getSelectedNodesData()} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-surface/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
            <div>
              Built with React, TypeScript & SVG
            </div>
            <div>
              Data persisted locally
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
