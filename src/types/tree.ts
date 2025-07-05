import { TreeNode } from "@/components/InputForm";

export interface Position {
  x: number;
  y: number;
}

export interface NodePosition extends TreeNode {
  x: number;
  y: number;
}