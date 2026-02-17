import type { Node } from "@xyflow/react";

export type DataArchitectureProvider = "generic" | "aws" | "azure" | "gcp";

export type DataArchitectureLayer =
  | "source"
  | "ingestion"
  | "processing"
  | "storage"
  | "analytics"
  | "governance"
  | "security";

export type DataFrequency = "batch" | "stream" | "near_real_time";
export type SecurityLevel = "public" | "internal" | "confidential" | "restricted";

export type DataArchitectureObjectType =
  | "file_source"
  | "database_source"
  | "api_source"
  | "stream_source"
  | "queue"
  | "event_stream"
  | "etl"
  | "transform"
  | "warehouse"
  | "lake"
  | "object_store"
  | "sql_db"
  | "nosql_db"
  | "search"
  | "bi"
  | "ml"
  | "catalog"
  | "quality"
  | "observability"
  | "security";

export type DataArchitectureNodeKind = "data_arch_object" | "data_arch_container";

export type DataArchitectureNodeData = {
  kind: DataArchitectureNodeKind;
  objectType?: DataArchitectureObjectType;
  label: string;
  subtitle?: string;
  provider?: DataArchitectureProvider;
  layer?: DataArchitectureLayer;
  meta?: {
    color?: string;
    border?: string;
    iconSrc?: string; // same-origin URL path, e.g. "/icon-packs/aws/icons/s3.svg"
    frequency?: DataFrequency;
    security?: SecurityLevel;
    owner?: string;
  };
  size?: { w: number; h: number };

  // container-only
  containerStyle?: "domain" | "platform" | "lakehouse" | "workspace" | "resource_group";
};

export function isDataArchObject(n: Node | null | undefined) {
  if (!n) return false;
  return String((n.data as any)?.kind ?? "") === "data_arch_object" || String(n.type ?? "") === "data_arch_object";
}

export function isDataArchContainer(n: Node | null | undefined) {
  if (!n) return false;
  return String((n.data as any)?.kind ?? "") === "data_arch_container" || String(n.type ?? "") === "data_arch_container";
}

export const DATA_LAYER_COLORS: Record<DataArchitectureLayer, { fill: string; border: string; label: string }> = {
  source: { fill: "#f1f5f9", border: "#334155", label: "Source" },
  ingestion: { fill: "#ecfeff", border: "#0891b2", label: "Ingestion" }, // blue/cyan
  processing: { fill: "#f5f3ff", border: "#7c3aed", label: "Processing" }, // purple
  storage: { fill: "#ecfdf5", border: "#16a34a", label: "Storage" }, // green
  analytics: { fill: "#fff7ed", border: "#f97316", label: "Analytics" }, // orange
  governance: { fill: "#eef2ff", border: "#4f46e5", label: "Governance" },
  security: { fill: "#fff1f2", border: "#e11d48", label: "Security" },
};

