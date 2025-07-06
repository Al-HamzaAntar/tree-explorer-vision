import { TreeNode } from "./InputForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FolderOpen } from "lucide-react";

interface NodeDetailsProps {
  nodes: TreeNode[];
}

export function NodeDetails({ nodes }: NodeDetailsProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <Card className="w-full h-full bg-gradient-surface border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Node Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a node to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (nodes.length === 1) {
    const node = nodes[0];
    
    const getNodeStats = (node: TreeNode): { files: number; folders: number; depth: number } => {
      const stats = { files: 0, folders: 0, depth: 0 };
      
      const traverse = (n: TreeNode, currentDepth: number) => {
        if (n.type === "file") {
          stats.files++;
        } else {
          stats.folders++;
        }
        
        stats.depth = Math.max(stats.depth, currentDepth);
        
        if (n.children) {
          n.children.forEach(child => traverse(child, currentDepth + 1));
        }
      };
      
      traverse(node, 0);
      return stats;
    };

    const stats = getNodeStats(node);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Card className="w-full h-full bg-gradient-surface border-border/50 flex flex-col max-h-full">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            {node.type === "folder" ? (
              node.expanded !== false ? (
                <FolderOpen className="h-5 w-5 text-folder-node" />
              ) : (
                <Folder className="h-5 w-5 text-folder-node" />
              )
            ) : (
              <div className="w-5 h-5 rounded-sm bg-file-node" />
            )}
            Node Details
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 overflow-hidden">
          <CardContent className="space-y-6 px-6 pb-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold text-foreground break-all">{node.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <div className="mt-1">
                <Badge 
                  variant={node.type === "folder" ? "default" : "secondary"}
                  className={node.type === "folder" ? "bg-folder-node" : "bg-file-node"}
                >
                  {node.type === "folder" ? "Folder" : "File"}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Path</label>
              <p className="text-sm text-foreground font-mono bg-muted/30 p-2 rounded-md mt-1 break-all">
                {node.path}
              </p>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Statistics</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-folder-node">{stats.folders}</div>
                <div className="text-xs text-muted-foreground">Folders</div>
              </div>
              
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-file-node">{stats.files}</div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.depth}</div>
              <div className="text-xs text-muted-foreground">Max Depth</div>
            </div>
          </div>

          {hasChildren && (
            <>
              <Separator className="bg-border/50" />
              
              {/* Children */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  Children ({node.children?.length || 0})
                </h4>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {node.children?.map((child, index) => (
                    <div 
                      key={child.id} 
                      className="flex items-center justify-between p-2 bg-muted/20 rounded-md"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {child.type === "folder" ? (
                          <Folder className="h-4 w-4 text-folder-node flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-sm bg-file-node flex-shrink-0" />
                        )}
                        <span className="text-sm text-foreground truncate">{child.name}</span>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className="text-xs flex-shrink-0 ml-2"
                      >
                        {child.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator className="bg-border/50" />

          {/* Metadata */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Metadata</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="text-foreground font-mono text-xs">{node.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expandable:</span>
                <span className="text-foreground">{hasChildren ? "Yes" : "No"}</span>
              </div>
              
              {hasChildren && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expanded:</span>
                  <span className="text-foreground">{node.expanded !== false ? "Yes" : "No"}</span>
                </div>
              )}
            </div>
          </div>
          </CardContent>
        </ScrollArea>
      </Card>
    );
  }

  // Multiple nodes selected
  const totalFiles = nodes.filter(node => node.type === "file").length;
  const totalFolders = nodes.filter(node => node.type === "folder").length;

  return (
    <Card className="w-full h-full bg-gradient-surface border-border/50 flex flex-col max-h-full">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="w-5 h-5 rounded-sm bg-primary" />
          Multiple Selected ({nodes.length})
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 overflow-hidden">
        <CardContent className="space-y-4 px-6 pb-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-folder-node">{totalFolders}</div>
              <div className="text-xs text-muted-foreground">Folders</div>
            </div>
            
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-file-node">{totalFiles}</div>
              <div className="text-xs text-muted-foreground">Files</div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Selected nodes list */}
          <div className="space-y-2">
            {nodes.map((node) => (
              <div key={node.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
                {node.type === "folder" ? (
                  <Folder className="h-4 w-4 text-folder-node flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-file-node flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-foreground">{node.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{node.path}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs flex-shrink-0"
                >
                  {node.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}