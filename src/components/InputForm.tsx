import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, FileJson } from "lucide-react";

export interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
  path: string;
  expanded?: boolean;
}

interface InputFormProps {
  onDataSubmit: (data: TreeNode) => void;
}

interface FormData {
  jsonInput: string;
  pathInput: string;
}

export function InputForm({ onDataSubmit }: InputFormProps) {
  const [activeTab, setActiveTab] = useState("json");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const parsePathToTree = (path: string): TreeNode => {
    const segments = path.split(/[/\\]/).filter(Boolean);
    let currentNode: TreeNode = {
      id: "root",
      name: segments[0] || "Root",
      type: "folder",
      children: [],
      path: segments[0] || "Root",
      expanded: true
    };

    let current = currentNode;
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const newNode: TreeNode = {
        id: `${current.id}/${segment}`,
        name: segment,
        type: isLast && segment.includes('.') ? "file" : "folder",
        children: isLast && segment.includes('.') ? undefined : [],
        path: segments.slice(0, i + 1).join('/'),
        expanded: true
      };
      
      if (!current.children) current.children = [];
      current.children.push(newNode);
      current = newNode;
    }

    return currentNode;
  };

  const parseJsonToTree = (jsonString: string): TreeNode => {
    try {
      const parsed = JSON.parse(jsonString);
      
      const convertToTreeNode = (obj: any, parentPath = "", id = "root"): TreeNode => {
        if (typeof obj === "string") {
          return {
            id,
            name: obj,
            type: obj.includes('.') ? "file" : "folder",
            path: parentPath ? `${parentPath}/${obj}` : obj,
            expanded: true
          };
        }

        if (Array.isArray(obj)) {
          return {
            id,
            name: "Array",
            type: "folder",
            children: obj.map((item, index) => 
              convertToTreeNode(item, parentPath, `${id}_${index}`)
            ),
            path: parentPath || "Array",
            expanded: true
          };
        }

        if (typeof obj === "object" && obj !== null) {
          const name = obj.name || Object.keys(obj)[0] || "Object";
          return {
            id,
            name,
            type: "folder",
            children: Object.entries(obj).map(([key, value]) =>
              convertToTreeNode(value, parentPath ? `${parentPath}/${key}` : key, `${id}_${key}`)
            ),
            path: parentPath ? `${parentPath}/${name}` : name,
            expanded: true
          };
        }

        return {
          id,
          name: String(obj),
          type: "file",
          path: parentPath ? `${parentPath}/${String(obj)}` : String(obj),
          expanded: true
        };
      };

      return convertToTreeNode(parsed);
    } catch (error) {
      throw new Error("Invalid JSON format");
    }
  };

  const onSubmit = (data: FormData) => {
    try {
      let treeData: TreeNode;
      
      if (activeTab === "json") {
        if (!data.jsonInput.trim()) {
          throw new Error("Please enter JSON data");
        }
        treeData = parseJsonToTree(data.jsonInput);
      } else {
        if (!data.pathInput.trim()) {
          throw new Error("Please enter a folder path");
        }
        treeData = parsePathToTree(data.pathInput);
      }
      
      onDataSubmit(treeData);
      
      // Save to localStorage
      localStorage.setItem('folderTreeData', JSON.stringify(treeData));
      localStorage.setItem('folderTreeInput', JSON.stringify({ 
        type: activeTab, 
        value: activeTab === "json" ? data.jsonInput : data.pathInput 
      }));
      
    } catch (error) {
      console.error("Parse error:", error);
    }
  };

  const loadSampleData = () => {
    const sampleJson = `{
  "src": {
    "components": {
      "Header.tsx": "",
      "Footer.tsx": "",
      "ui": {
        "Button.tsx": "",
        "Input.tsx": ""
      }
    },
    "pages": {
      "Home.tsx": "",
      "About.tsx": ""
    },
    "App.tsx": "",
    "main.tsx": ""
  },
  "public": {
    "index.html": "",
    "favicon.ico": ""
  },
  "package.json": ""
}`;
    
    if (activeTab === "json") {
      reset({ jsonInput: sampleJson });
    } else {
      reset({ pathInput: "C:/Users/developer/Projects/my-app/src/components/ui/Button.tsx" });
    }
  };

  return (
    <Card className="w-full bg-gradient-surface border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileJson className="h-5 w-5 text-primary" />
          Data Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="path" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Path
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jsonInput" className="text-sm font-medium text-foreground">
                  JSON Structure
                </Label>
                <Textarea
                  id="jsonInput"
                  placeholder="Paste your JSON folder structure here..."
                  className="min-h-[200px] font-mono text-sm bg-background/50 border-border/50 resize-none"
                  {...register("jsonInput", { 
                    required: activeTab === "json" ? "JSON input is required" : false 
                  })}
                />
                {errors.jsonInput && (
                  <p className="text-sm text-destructive">{errors.jsonInput.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="path" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pathInput" className="text-sm font-medium text-foreground">
                  Folder Path
                </Label>
                <Input
                  id="pathInput"
                  placeholder="C:\Users\user\Documents\project\src\components"
                  className="bg-background/50 border-border/50"
                  {...register("pathInput", { 
                    required: activeTab === "path" ? "Path input is required" : false 
                  })}
                />
                {errors.pathInput && (
                  <p className="text-sm text-destructive">{errors.pathInput.message}</p>
                )}
              </div>
            </TabsContent>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Generate Tree
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={loadSampleData}
                className="border-border/50 hover:bg-muted/50"
              >
                Load Sample
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}