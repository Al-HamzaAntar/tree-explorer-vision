import { useState, useEffect } from "react";
import { InputForm, TreeNode } from "@/components/InputForm";
import { TreeVisualization } from "@/components/TreeVisualization";
import { NodeDetails } from "@/components/NodeDetails";
import { SearchBar } from "@/components/SearchBar";

const Index = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
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
    setSelectedNode(null);
    setSearchTerm("");
    
    // Save to localStorage
    localStorage.setItem('folderTreeData', JSON.stringify(data));
  };

  const handleDataUpdate = (data: TreeNode) => {
    setTreeData(data);
    
    // Save updated data to localStorage
    localStorage.setItem('folderTreeData', JSON.stringify(data));
  };

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
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
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
              onDataUpdate={handleDataUpdate}
              searchTerm={searchTerm}
            />
          </div>

          {/* Node Details */}
          <div className="lg:col-span-3 order-2 lg:order-none">
            <NodeDetails node={selectedNode} />
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
