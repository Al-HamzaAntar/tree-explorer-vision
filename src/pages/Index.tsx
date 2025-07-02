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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Folder Tree Visualizer
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive folder structure visualization tool
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Zoom & Pan • Click to Expand • Hover for Details</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-6 py-4">
        <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Input Form */}
          <div className="col-span-3">
            <InputForm onDataSubmit={handleDataSubmit} />
          </div>

          {/* Main Visualization Area */}
          <div className="col-span-6">
            <TreeVisualization
              data={treeData}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
              searchTerm={searchTerm}
            />
          </div>

          {/* Right Sidebar - Node Details */}
          <div className="col-span-3">
            <NodeDetails node={selectedNode} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-surface/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
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
