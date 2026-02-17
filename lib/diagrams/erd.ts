import type { Edge, Node } from "@xyflow/react";

export type ErdNotation = "crows_foot" | "chen";

export type ErdCardinality = "0..1" | "1..1" | "0..N" | "1..N";

export type ErdFieldRef = {
  entityId: string;
  field: string;
};

export type ErdField = {
  name: string;
  type?: string;
  pk?: boolean;
  fk?: boolean;
  nullable?: boolean;
  unique?: boolean;
  ref?: ErdFieldRef;
};

export type ErdEntityNodeData = {
  kind: "erd_entity";
  label: string;
  weak?: boolean;
  fields?: ErdField[];
  size?: { w: number; h: number };
};

export type ErdAttributeNodeData = {
  kind: "erd_attribute";
  label: string;
  key?: boolean;
  multivalued?: boolean;
  composite?: boolean;
  size?: { w: number; h: number };
};

export type ErdRelationshipNodeData = {
  kind: "erd_relationship";
  label: string;
  identifying?: boolean;
  size?: { w: number; h: number };
};

export type ErdEdgeData = {
  kind: "erd_relation";
  notation: ErdNotation;
  sourceCardinality: ErdCardinality;
  targetCardinality: ErdCardinality;
  label?: string;
};

export function isErdEntity(n: Node): n is Node<ErdEntityNodeData> {
  return String((n.data as any)?.kind ?? "") === "erd_entity" || String(n.type ?? "") === "erd_entity";
}

export function isErdAttribute(n: Node): n is Node<ErdAttributeNodeData> {
  return String((n.data as any)?.kind ?? "") === "erd_attribute" || String(n.type ?? "") === "erd_attribute";
}

export function isErdRelationship(n: Node): n is Node<ErdRelationshipNodeData> {
  return String((n.data as any)?.kind ?? "") === "erd_relationship" || String(n.type ?? "") === "erd_relationship";
}

export function isErdEdge(e: Edge): boolean {
  return String((e.data as any)?.kind ?? "") === "erd_relation" || String(e.type ?? "") === "erd";
}

