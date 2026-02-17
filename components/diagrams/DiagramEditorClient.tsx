"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  useReactFlow,
  ConnectionLineType,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  ConnectionMode,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import SwimlaneNode from "@/components/diagrams/nodes/SwimlaneNode";
import SwimFlowNode from "@/components/diagrams/nodes/SwimFlowNode";
import ErdEntityNode from "@/components/diagrams/nodes/ErdEntityNode";
import ErdAttributeNode from "@/components/diagrams/nodes/ErdAttributeNode";
import ErdRelationshipNode from "@/components/diagrams/nodes/ErdRelationshipNode";
import FlowchartNode from "@/components/diagrams/nodes/FlowchartNode";
import OrgPersonNode from "@/components/diagrams/nodes/OrgPersonNode";
import OrgGroupNode from "@/components/diagrams/nodes/OrgGroupNode";
import ArchitectureNode from "@/components/diagrams/nodes/ArchitectureNode";
import ArchitectureBoundaryNode from "@/components/diagrams/nodes/ArchitectureBoundaryNode";
import DataArchitectureNode from "@/components/diagrams/nodes/DataArchitectureNode";
import DataArchitectureContainerNode from "@/components/diagrams/nodes/DataArchitectureContainerNode";

import SwimlaneOverlay from "@/components/diagrams/swimlane/SwimlaneOverlay";
import StencilSidebar, { type StencilType } from "@/components/diagrams/swimlane/StencilSidebar";
import ErdStencilSidebar from "@/components/diagrams/erd/ErdStencilSidebar";
import FlowchartStencilSidebar, { type FlowchartStencilType } from "@/components/diagrams/flowchart/FlowchartStencilSidebar";
import PropertiesPanel from "@/components/diagrams/swimlane/PropertiesPanel";
import ErdPropertiesPanel from "@/components/diagrams/erd/ErdPropertiesPanel";
import ErdEdge from "@/components/diagrams/erd/ErdEdge";
import FlowchartLegend from "@/components/diagrams/flowchart/FlowchartLegend";
import OrgChartStencilSidebar, { type OrgStencilType } from "@/components/diagrams/orgchart/OrgChartStencilSidebar";
import OrgLegend from "@/components/diagrams/orgchart/OrgLegend";
import OrgPropertiesPanel from "@/components/diagrams/orgchart/OrgPropertiesPanel";
import ArchitectureStencilSidebar, { type ArchitectureStencilType } from "@/components/diagrams/architecture/ArchitectureStencilSidebar";
import ArchitectureLegend from "@/components/diagrams/architecture/ArchitectureLegend";
import ArchitecturePropertiesPanel from "@/components/diagrams/architecture/ArchitecturePropertiesPanel";
import DataArchitectureStencilSidebar, {
  type DataArchitectureStencilType,
  type DataArchitectureTemplateId,
} from "@/components/diagrams/dataarchitecture/DataArchitectureStencilSidebar";
import DataArchitectureLegend from "@/components/diagrams/dataarchitecture/DataArchitectureLegend";
import DataArchitecturePropertiesPanel from "@/components/diagrams/dataarchitecture/DataArchitecturePropertiesPanel";

import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";
import { exportSimpleSvg } from "@/lib/diagrams/exportSvg";
import { computeVisibility } from "@/lib/diagrams/nesting";

import {
  type LaneOrientation,
  createOrUpdateSwimlaneNode,
  findLaneAtPoint,
  snapNodeIntoLane,
  clampAbsToLane,
  stripNonSerializableFromEdges,
  stripNonSerializableFromNodes,
  type SwimlaneNodeData,
} from "@/lib/diagrams/swimlanes";

import { DiagramEditorProvider, type EditorActions } from "@/components/diagrams/DiagramEditorContext";
import { saveAs } from "file-saver";
import { getEditKey, setEditKey, upsertRecent } from "@/lib/diagrams/localRecents";
import { useErdSettingsStore } from "@/lib/diagrams/erdStore";
import { exportPostgresDDL, importPostgresDDL } from "@/lib/diagrams/erdSql";
import { autoLayoutGrid } from "@/lib/diagrams/erdLayout";
import { useFlowchartSettingsStore } from "@/lib/diagrams/flowchartStore";
import { exportFlowchartMermaid } from "@/lib/diagrams/flowchartMermaid";
import { useOrgChartSettingsStore } from "@/lib/diagrams/orgChartStore";
import { autoLayoutOrg } from "@/lib/diagrams/orgLayout";
import { exportOrgMermaid } from "@/lib/diagrams/orgMermaid";
import { useArchitectureSettingsStore } from "@/lib/diagrams/architectureStore";
import { autoLayoutArchitecture } from "@/lib/diagrams/architectureLayout";
import { exportArchitectureMermaid } from "@/lib/diagrams/architectureMermaid";
import { useDataArchitectureStore } from "@/lib/diagrams/dataArchitectureStore";
import { autoLayoutDataArchitecture } from "@/lib/diagrams/dataArchitectureLayout";
import { DATA_LAYER_COLORS } from "@/lib/diagrams/dataArchitecture";
import { getDataArchitectureTemplate } from "@/lib/diagrams/dataArchitectureTemplates";
import { useIconPackStore } from "@/lib/diagrams/iconPackStore";
import { isIconPackManifestV1 } from "@/lib/diagrams/iconPacks";
import { importDiagramFromJson } from "@/lib/diagrams/importDiagramJson";
import type { DiagramType } from "@/lib/diagrams/createDiagram";

const TOOLBAR_INPUT =
  "flex-1 min-w-[240px] rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30";
const TOOLBAR_BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50";
const TOOLBAR_BTN_SUBTLE =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50";
const TOOLBAR_BADGE =
  "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900";

const NODE_TYPES = {
  swimlane: SwimlaneNode as unknown as React.ComponentType<any>,
  flow: SwimFlowNode as unknown as React.ComponentType<any>,
  flowchart: FlowchartNode as unknown as React.ComponentType<any>,
  org_person: OrgPersonNode as unknown as React.ComponentType<any>,
  org_group: OrgGroupNode as unknown as React.ComponentType<any>,
  architecture: ArchitectureNode as unknown as React.ComponentType<any>,
  architecture_boundary: ArchitectureBoundaryNode as unknown as React.ComponentType<any>,
  data_arch_object: DataArchitectureNode as unknown as React.ComponentType<any>,
  data_arch_container: DataArchitectureContainerNode as unknown as React.ComponentType<any>,
  erd_entity: ErdEntityNode as unknown as React.ComponentType<any>,
  erd_attribute: ErdAttributeNode as unknown as React.ComponentType<any>,
  erd_relationship: ErdRelationshipNode as unknown as React.ComponentType<any>,
} satisfies NodeTypes;

const LANE_HEADER_COLORS = ["#7C3AED", "#F97316", "#2563EB", "#16A34A", "#DB2777", "#0D9488"];
function laneColorForIndex(i: number) {
  return LANE_HEADER_COLORS[i % LANE_HEADER_COLORS.length];
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function sameIds(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

type Snap = {
  nodes: Node[];
  edges: Edge[];
  meta?: { themeId?: string; layoutMode?: string };
};

function getFocusParam() {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("focus");
  return v && v.trim().length ? v.trim() : null;
}

function isSwimlaneContainer(n: Node) {
  return String((n.data as any)?.kind ?? "") === "swimlane" || String(n.type ?? "") === "swimlane";
}

function nodeRectAbs(n: Node) {
  const w = (n.data as any)?.size?.w ?? (n as any).width ?? (n as any)?.measured?.width ?? 170;
  const h = (n.data as any)?.size?.h ?? (n as any).height ?? (n as any)?.measured?.height ?? 70;
  const pos = (n as any).positionAbsolute ?? n.position ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y, w, h };
}

function toChildPosition(abs: { x: number; y: number }, parent: Node) {
  const pAbs = (parent as any).positionAbsolute ?? parent.position ?? { x: 0, y: 0 };
  return { x: abs.x - pAbs.x, y: abs.y - pAbs.y };
}

async function svgStringToPngBlob(svg: string, pixelRatio: number) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load SVG for PNG export"));
    });
    img.src = url;
    await loaded;

    const w = Math.max(1, img.naturalWidth || (img as any).width || 1200);
    const h = Math.max(1, img.naturalHeight || (img as any).height || 800);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * pixelRatio);
    canvas.height = Math.round(h * pixelRatio);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const out: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
    if (!out) throw new Error("Failed to generate PNG blob");
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function svgTextToDataUri(svgText: string) {
  // Robust across browsers + "open SVG from disk" viewers: base64-encoded UTF-8.
  // Works for both <image href="..."> in SVG export and rasterization via <img>.
  const bytes = new TextEncoder().encode(svgText);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:image/svg+xml;base64,${btoa(bin)}`;
}

function isArchitectureNode(n: Node) {
  return String((n.data as any)?.kind ?? "") === "architecture" || String(n.type ?? "") === "architecture";
}

function isArchitectureBoundary(n: Node) {
  return (
    String((n.data as any)?.kind ?? "") === "architecture_boundary" ||
    String(n.type ?? "") === "architecture_boundary"
  );
}

function isDataArchitectureNode(n: Node) {
  return String((n.data as any)?.kind ?? "") === "data_arch_object" || String(n.type ?? "") === "data_arch_object";
}

function isDataArchitectureContainer(n: Node) {
  return String((n.data as any)?.kind ?? "") === "data_arch_container" || String(n.type ?? "") === "data_arch_container";
}

function detachFromParent(n: Node): Node {
  const nn: any = { ...n };
  delete nn.parentId;
  delete nn.parentNode; // legacy @xyflow/react (<12) snapshots
  delete nn.extent;
  return nn;
}

function normalizeParentRefs(nodes: Node[]): Node[] {
  return nodes.map((n) => {
    const nn: any = { ...n };

    // legacy snapshots stored `parentNode`; @xyflow/react v12 uses `parentId`
    if (!nn.parentId && nn.parentNode) nn.parentId = nn.parentNode;
    delete nn.parentNode;

    return nn as Node;
  });
}

// used only for stable “don’t detach if still inside swimlane”
function swimlaneRectAbs(laneNode: Node) {
  const d = laneNode.data as any;
  const w = Number(d?.width ?? (laneNode.style as any)?.width ?? 1100);
  const h = Number(d?.height ?? (laneNode.style as any)?.height ?? 620);
  const pos = (laneNode as any).positionAbsolute ?? laneNode.position ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y, w, h };
}
function pointInRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function stencilToKind(t: StencilType): string {
  switch (t) {
    case "start":
      return "start_end";
    case "process":
      return "process";
    case "decision":
      return "decision";
    case "data":
      return "data";
    case "database":
      return "database";
    case "connector":
      return "connector";
    default:
      return "process";
  }
}

function labelForStencil(t: StencilType) {
  switch (t) {
    case "start":
      return "Start / End";
    case "process":
      return "Process";
    case "decision":
      return "Decision";
    case "data":
      return "Data";
    case "database":
      return "Database";
    case "connector":
      return "Connector";
    default:
      return "Step";
  }
}

function isErdStencil(raw: string) {
  const t = String(raw ?? "").trim();
  return (
    t === "erd_entity" ||
    t === "erd_weak_entity" ||
    t === "erd_attribute" ||
    t === "erd_key_attribute" ||
    t === "erd_multivalued_attribute" ||
    t === "erd_relationship"
  );
}

function isFlowchartStencil(raw: string) {
  return String(raw ?? "").trim().startsWith("fc_");
}

function isOrgStencil(raw: string) {
  return String(raw ?? "").trim().startsWith("org_");
}

function isArchitectureStencil(raw: string) {
  return String(raw ?? "").trim().startsWith("arch_");
}

function isDataArchitectureStencil(raw: string) {
  return String(raw ?? "").trim().startsWith("da_");
}

function flowchartNodeForStencil(t: FlowchartStencilType) {
  switch (t) {
    case "fc_start_end":
      return { kind: "start_end", label: "Start / End", meta: { color: "#dcfce7", border: "#0f172a" } };
    case "fc_process":
      return { kind: "process", label: "Process", meta: { color: "#e2e8f0", border: "#0f172a" } };
    case "fc_decision":
      return { kind: "decision", label: "Decision", meta: { color: "#fef08a", border: "#0f172a" } };
    case "fc_user_input":
      return { kind: "user_input", label: "User Input", meta: { color: "#e2e8f0", border: "#0f172a" } };
    case "fc_system_task":
      return { kind: "system_task", label: "System Task", meta: { color: "#e2e8f0", border: "#0f172a" } };
    case "fc_async_callback":
      return { kind: "async_callback", label: "Async / Callback", meta: { color: "#fbcfe8", border: "#0f172a" } };
    case "fc_error_cancel":
      return { kind: "error_cancel", label: "Error / Cancel", meta: { color: "#fecaca", border: "#0f172a" } };
    case "fc_documents":
      return { kind: "documents", label: "Documents", meta: { color: "#e2e8f0", border: "#0f172a" } };
    case "fc_data":
      return { kind: "data", label: "Data", meta: { color: "#cffafe", border: "#0f172a" } };
    case "fc_database":
      return { kind: "database", label: "Database", meta: { color: "#cffafe", border: "#0f172a" } };
    case "fc_connector":
      return { kind: "connector", label: "Connector", meta: { color: "#e2e8f0", border: "#0f172a" } };
  }
}

function orgNodeForStencil(t: OrgStencilType) {
  switch (t) {
    case "org_person":
      return {
        type: "org_person",
        data: {
          kind: "org_person",
          department: "Engineering",
          deptColor: "#2563eb",
          name: "Employee Name",
          title: "Job Title",
          avatarUrl: null,
          employmentType: "full_time",
          parentNodeId: null,
          division: null,
          group: null,
          collapsed: false,
          size: { w: 280, h: 130 },
        },
      };
    case "org_contractor":
      return {
        type: "org_person",
        data: {
          kind: "org_person",
          department: "Engineering",
          deptColor: "#2563eb",
          name: "Contractor",
          title: "Role (Temp)",
          avatarUrl: null,
          employmentType: "contractor",
          parentNodeId: null,
          division: null,
          group: null,
          collapsed: false,
          size: { w: 280, h: 130 },
        },
      };
    case "org_team":
      return { type: "org_group", data: { kind: "org_group", label: "Team / Function", color: "#2563eb", size: { w: 420, h: 44 } } };
    case "org_division":
      return { type: "org_group", data: { kind: "org_group", label: "Division", color: "#0f172a", size: { w: 520, h: 44 } } };
  }
}

function archNodeForStencil(t: ArchitectureStencilType) {
  const node = (nodeKind: string, layer: string, label: string, subtitle?: string) => ({
    type: "architecture",
    data: { kind: "architecture", nodeKind, layer, label, subtitle, size: undefined },
  });

  if (t === "arch_boundary_network") {
    return { type: "architecture_boundary", data: { kind: "architecture_boundary", boundaryKind: "network", label: "Cloud Network", size: { w: 1400, h: 760 } } };
  }
  if (t === "arch_boundary_region") {
    return { type: "architecture_boundary", data: { kind: "architecture_boundary", boundaryKind: "region", label: "Region", size: { w: 1100, h: 560 } } };
  }
  if (t === "arch_boundary_cluster") {
    return { type: "architecture_boundary", data: { kind: "architecture_boundary", boundaryKind: "cluster", label: "Cluster / VPC", size: { w: 960, h: 460 } } };
  }
  if (t === "arch_boundary_group") {
    return { type: "architecture_boundary", data: { kind: "architecture_boundary", boundaryKind: "group", label: "Group", size: { w: 520, h: 340 } } };
  }

  switch (t) {
    case "arch_user":
      return node("user", "client_edge", "Users", "Browser / Mobile");
    case "arch_web":
      return node("web", "client_edge", "Web App", "Frontend");
    case "arch_mobile":
      return node("mobile", "client_edge", "Mobile App", "iOS / Android");
    case "arch_cdn":
      return node("cdn", "client_edge", "CDN", "Edge cache");
    case "arch_waf":
      return node("waf", "security_routing", "WAF", "Rate limit");
    case "arch_api_gateway":
      return node("api_gateway", "security_routing", "API Gateway", "Routing");
    case "arch_auth_oidc":
      return node("auth_oidc", "security_routing", "Auth (OIDC)", "OAuth2 / IdP");
    case "arch_service":
      return node("service", "compute_logic", "Microservice", "Service");
    case "arch_k8s":
      return { type: "architecture_boundary", data: { kind: "architecture_boundary", boundaryKind: "cluster", label: "K8s Cluster", size: { w: 960, h: 520 } } };
    case "arch_lambda":
      return node("lambda", "compute_logic", "Serverless", "Function");
    case "arch_event_bus":
      return node("event_bus", "async_messaging", "Event Bus", "Pub/Sub");
    case "arch_queue":
      return node("queue", "async_messaging", "Queue/Topic", "Async");
    case "arch_cdc_stream":
      return node("cdc_stream", "async_messaging", "CDC Stream", "Change events");
    case "arch_saga":
      return node("saga", "async_messaging", "Saga", "Orchestrator");
    case "arch_sql_db":
      return node("sql_db", "persistence", "SQL DB", "RDS/Postgres");
    case "arch_nosql_db":
      return node("nosql_db", "persistence", "NoSQL DB", "Dynamo/Mongo");
    case "arch_object_store":
      return node("object_store", "persistence", "Object Store", "S3/Lake");
    case "arch_search":
      return node("search", "persistence", "Search", "OpenSearch/Elastic");
    case "arch_observability":
      return node("observability", "observability", "Observability", "Dashboards");
    case "arch_metrics":
      return node("metrics", "observability", "Metrics", "Prometheus/CloudWatch");
    case "arch_logging":
      return node("logging", "observability", "Logging", "Logs/SIEM");
    default:
      return node("service", "compute_logic", "Component", "");
  }
}

function dataArchNodeForStencil(t: DataArchitectureStencilType, provider: string) {
  const p = String(provider ?? "generic");
  const prov = p === "aws" || p === "azure" || p === "gcp" ? p : "generic";

  const mk = (layer: string) => {
    const c = (DATA_LAYER_COLORS as any)[layer] ?? DATA_LAYER_COLORS.processing;
    return { color: c.fill, border: c.border };
  };

  // Only reference icon paths that exist in your repo icon packs (no guessing).
  const aws = {
    object_store: "/icon-packs/aws/icons/s3.svg",
    event_stream: "/icon-packs/aws/icons/kinesis-data-streams.svg",
    sql_db: "/icon-packs/aws/icons/rds.svg",
    nosql_db: "/icon-packs/aws/icons/dynamodb.svg",
    transform: "/icon-packs/aws/icons/lambda.svg",
    observability: "/icon-packs/aws/icons/cloudwatch.svg",
  };
  const azure = {
    object_store: "/icon-packs/azure/icons/storage-accounts.svg",
    event_stream: "/icon-packs/azure/icons/event-hubs.svg",
    sql_db: "/icon-packs/azure/icons/sql-database.svg",
    nosql_db: "/icon-packs/azure/icons/cosmos-db.svg",
    transform: "/icon-packs/azure/icons/functions.svg",
    observability: "/icon-packs/azure/icons/monitor.svg",
  };
  const gcp = {
    object_store: "/icon-packs/gcp/icons/storage.svg",
    sql_db: "/icon-packs/gcp/icons/databases.svg",
    transform: "/icon-packs/gcp/icons/operations.svg",
    observability: "/icon-packs/gcp/icons/observability.svg",
    event_stream: "/icon-packs/gcp/icons/integration.svg",
  };

  const iconFor = (objType: string) => {
    const key = String(objType);
    if (prov === "aws") return (aws as any)[key] ?? null;
    if (prov === "azure") return (azure as any)[key] ?? null;
    if (prov === "gcp") return (gcp as any)[key] ?? null;
    return null;
  };

  if (t === "da_container") {
    return {
      type: "data_arch_container",
      data: {
        kind: "data_arch_container",
        label: "Container",
        containerStyle: prov === "azure" ? "resource_group" : prov === "aws" ? "platform" : "lakehouse",
        size: { w: 1100, h: 560 },
        meta: { border: "#111827" },
      },
      style: { zIndex: 5 },
    };
  }

  const map: Record<
    DataArchitectureStencilType,
    { objectType: any; layer: any; label: string; subtitle: string; freq?: any; sec?: any }
  > = {
    da_source_file: { objectType: "file_source", layer: "source", label: "Files", subtitle: "CSV/JSON/Logs", freq: "batch", sec: "internal" },
    da_source_db: { objectType: "database_source", layer: "source", label: "Database", subtitle: "OLTP / legacy", freq: "batch", sec: "confidential" },
    da_source_api: { objectType: "api_source", layer: "source", label: "API Source", subtitle: "REST/GraphQL", freq: "near_real_time", sec: "internal" },
    da_source_stream: { objectType: "stream_source", layer: "source", label: "Stream Source", subtitle: "Events", freq: "stream", sec: "internal" },
    da_ingest_stream: { objectType: "event_stream", layer: "ingestion", label: "Event Stream", subtitle: "Ingest events", freq: "stream", sec: "internal" },
    da_ingest_queue: { objectType: "queue", layer: "ingestion", label: "Queue", subtitle: "Decouple producers", freq: "stream", sec: "internal" },
    da_process_etl: { objectType: "etl", layer: "processing", label: "ETL / Orchestration", subtitle: "Pipelines", freq: "batch", sec: "internal" },
    da_process_transform: { objectType: "transform", layer: "processing", label: "Transform", subtitle: "dbt / Spark / SQL", freq: "batch", sec: "internal" },
    da_store_object: { objectType: "object_store", layer: "storage", label: "Object Store", subtitle: "Lake / raw data", freq: "batch", sec: "confidential" },
    da_store_warehouse: { objectType: "warehouse", layer: "storage", label: "Warehouse", subtitle: "Curated datasets", freq: "batch", sec: "confidential" },
    da_store_sql: { objectType: "sql_db", layer: "storage", label: "SQL DB", subtitle: "Serving / ops", freq: "batch", sec: "confidential" },
    da_analytics_bi: { objectType: "bi", layer: "analytics", label: "BI", subtitle: "Dashboards", freq: "near_real_time", sec: "internal" },
    da_analytics_ml: { objectType: "ml", layer: "analytics", label: "ML", subtitle: "Train / infer", freq: "batch", sec: "internal" },
    da_govern_catalog: { objectType: "catalog", layer: "governance", label: "Catalog", subtitle: "Metadata / lineage", freq: "batch", sec: "internal" },
    da_govern_quality: { objectType: "quality", layer: "governance", label: "Data Quality", subtitle: "Checks / alerts", freq: "batch", sec: "internal" },
    da_security: { objectType: "security", layer: "security", label: "Security", subtitle: "RBAC / policies", freq: "batch", sec: "restricted" },
    da_container: { objectType: "warehouse", layer: "governance", label: "Container", subtitle: "", freq: "batch", sec: "internal" },
  };

  const def = map[t];
  const meta = mk(def.layer);
  const iconSrc = iconFor(def.objectType);

  return {
    type: "data_arch_object",
    data: {
      kind: "data_arch_object",
      objectType: def.objectType,
      provider: prov,
      layer: def.layer,
      label: def.label,
      subtitle: def.subtitle,
      size: { w: 240, h: 104 },
      meta: { ...meta, iconSrc: iconSrc ?? undefined, frequency: def.freq, security: def.sec },
    },
    style: { zIndex: 30 },
  };
}

/** Edge with optional label */
function LabeledEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd } = props;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 14,
  });

  const label = String(((props.data as any)?.label ?? props.label ?? "") as string).trim();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...(style as any), zIndex: 25 }} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "white",
              border: "1px solid rgba(0,0,0,0.15)",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              pointerEvents: "all",
              userSelect: "none",
              zIndex: 30,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
const EDGE_TYPES = { labeled: LabeledEdge, erd: ErdEdge };

function Canvas(props: any) {
  const rf = useReactFlow();

  // Allow parent to access the ReactFlow API (for guided actions like "Add" and template load).
  const didReportRef = useRef(false);
  useEffect(() => {
    if (didReportRef.current) return;
    if (typeof props?.onReady === "function") {
      try {
        props.onReady(rf);
      } catch {}
    }
    didReportRef.current = true;
  }, [rf, props]);

  const isStyledArchitecture = Boolean(props.isArchitecture);
  const isDataArchitecture = Boolean(props.isDataArchitecture);
  const canvasStyle: React.CSSProperties = isStyledArchitecture
    ? {
        width: "100%",
        height: "100%",
        backgroundColor: String(props.archProvider ?? "generic") !== "generic" ? "#fbfcff" : "#ffffff",
        backgroundImage:
          "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }
    : isDataArchitecture
      ? {
          width: "100%",
          height: "100%",
          backgroundColor: String(props.daProvider ?? "generic") !== "generic" ? "#fbfcff" : "#ffffff",
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }
    : { width: "100%", height: "100%", background: props.theme.canvasBg };

  // ✅ CRITICAL FIX: Fit view ONCE only (never during drag updates)
  const didFitRef = useRef(false);
  useEffect(() => {
    if (didFitRef.current) return;
    // wait one tick so ReactFlow has initialized its internal store
    const t = setTimeout(() => {
      try {
        rf.fitView({ padding: 0.25, maxZoom: 1.2 });
      } catch {}
      didFitRef.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, [rf]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!props.canEdit) return alert("Read-only on this device (no edit key).");

      const stencilRaw = event.dataTransfer.getData("application/jhatpat-stencil");
      if (!stencilRaw) return;

      const bounds = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
      const abs = rf.screenToFlowPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });

      const isErdMode = Boolean(props.isErd);
      const isFlowchartMode = Boolean(props.isFlowchart);
      const isOrgMode = Boolean(props.isOrg);
      const isArchitectureMode = Boolean(props.isArchitecture);
      const isDataArchMode = Boolean(props.isDataArchitecture);
      const t = String(stencilRaw).trim();

      const newNode: Node = (() => {
        if (isErdMode && isErdStencil(t)) {
          const baseId = uid();

          if (t === "erd_relationship") {
            return {
              id: `erd_rel_${baseId}`,
              type: "erd_relationship",
              position: abs,
              data: { kind: "erd_relationship", label: "Relationship", identifying: false, size: undefined },
              style: { zIndex: 30 },
            } as any;
          }

          if (t === "erd_attribute" || t === "erd_key_attribute" || t === "erd_multivalued_attribute") {
            return {
              id: `erd_attr_${baseId}`,
              type: "erd_attribute",
              position: abs,
              data: {
                kind: "erd_attribute",
                label: t === "erd_key_attribute" ? "Key" : "Attribute",
                key: t === "erd_key_attribute",
                multivalued: t === "erd_multivalued_attribute",
                composite: false,
                size: undefined,
              },
              style: { zIndex: 30 },
            } as any;
          }

          // entity / weak entity
          return {
            id: `erd_ent_${baseId}`,
            type: "erd_entity",
            position: abs,
            data: {
              kind: "erd_entity",
              label: t === "erd_weak_entity" ? "Weak Entity" : "Entity",
              weak: t === "erd_weak_entity",
              fields: undefined,
              size: undefined,
            },
            style: { zIndex: 30 },
          } as any;
        }

        if (isFlowchartMode && isFlowchartStencil(t)) {
          const baseId = uid();
          const def = flowchartNodeForStencil(t as FlowchartStencilType);

          return {
            id: `fc_${baseId}`,
            type: "flowchart",
            position: abs,
            data: { kind: def.kind, label: def.label, meta: def.meta, size: undefined },
            style: { zIndex: 30 },
          } as any;
        }

        if (isOrgMode && isOrgStencil(t)) {
          const baseId = uid();
          const def = orgNodeForStencil(t as OrgStencilType);
          return {
            id: `org_${baseId}`,
            type: def.type,
            position: abs,
            data: def.data,
            style: { zIndex: 30 },
          } as any;
        }

        if (isArchitectureMode && isArchitectureStencil(t)) {
          const baseId = uid();
          const def = archNodeForStencil(t as ArchitectureStencilType);
          const isBoundary = def.type === "architecture_boundary";
          const sz = (def.data as any)?.size ?? null;
          return {
            id: `arch_${baseId}`,
            type: def.type,
            position: abs,
            data: def.data,
            style: { zIndex: isBoundary ? 5 : 30, ...(isBoundary && sz ? { width: sz.w, height: sz.h } : {}) },
          } as any;
        }

        if (isDataArchMode && isDataArchitectureStencil(t)) {
          const baseId = uid();
          const def = dataArchNodeForStencil(t as DataArchitectureStencilType, String(props.daProvider ?? "generic"));
          const isContainer = def.type === "data_arch_container";
          const sz = (def.data as any)?.size ?? null;
          return {
            id: `da_${baseId}`,
            type: def.type,
            position: abs,
            data: def.data,
            style: { zIndex: isContainer ? 5 : 30, ...(sz ? { width: sz.w, height: sz.h } : {}) },
          } as any;
        }

        const stencil = t as StencilType;
        const kind = stencilToKind(stencil);

        return {
          id: `flow_${uid()}`,
          type: "flow",
          position: abs,
          data: {
            kind,
            label: labelForStencil(stencil),
            meta: { color: "#ffffff", border: "#0f172a" },
            size: undefined,
          },
          style: { zIndex: 30 },
        } as any;
      })();

      // ✅ Swimlane: if dropped inside lane, parent + clamp immediately (ERD ignores lanes)
      if (props.isSwimlane) {
        const hit = findLaneAtPoint(props.nodesRef.current as any, abs.x, abs.y);
        if (hit) {
          const snappedAbs = snapNodeIntoLane({
            dragged: newNode as any,
            laneNode: hit.laneNode as any,
            laneIndex: hit.laneIndex,
          });

          newNode.parentId = hit.laneNode.id;
          newNode.extent = "parent" as any;
          newNode.position = toChildPosition({ x: snappedAbs.x, y: snappedAbs.y }, hit.laneNode);
          newNode.data = { ...(newNode.data as any), laneIndex: hit.laneIndex };
        }
      }

      props.setNodes((nds: Node[]) => [...nds, newNode]);
      props.requestAutosaveSoon?.();
    },
    [rf, props]
  );

  return (
    <ReactFlow
      nodes={props.visibleNodes}
      edges={props.visibleEdges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={props.onNodesChange}
      onEdgesChange={props.onEdgesChange}
      onConnect={props.onConnect}
      onSelectionChange={props.onSelectionChange}
      onNodeDragStart={props.onNodeDragStart}
      // ✅ IMPORTANT: we DO NOT clamp onNodeDrag anymore (stops “dancing”)
      onNodeDragStop={props.onNodeDragStop}
      // We handle Backspace/Delete ourselves so the swimlane container can't be deleted by accident.
      deleteKeyCode={null as any}
      nodesConnectable
      connectionMode={ConnectionMode.Loose}
      connectionLineType={ConnectionLineType.Step}
      defaultEdgeOptions={{
        type: props.isErd ? "erd" : "labeled",
        markerEnd: props.isErd ? undefined : { type: MarkerType.ArrowClosed },
        style: {
          strokeWidth: 2,
          stroke: props.isErd ? "#111827" : props.isFlowchart || props.isOrg || props.isArchitecture || props.isDataArchitecture ? "#334155" : props.theme.accent,
        },
      }}
      // ❌ DO NOT keep fitView prop here (this was the jitter cause)
      style={canvasStyle}
      onDragOver={onDragOver}
      onDrop={onDrop}
      snapToGrid
      snapGrid={props.isErd || props.isFlowchart || props.isOrg || props.isArchitecture || props.isDataArchitecture ? [15, 15] : [20, 20]}
      translateExtent={[
        [-50000, -50000],
        [50000, 50000],
      ]}
    >
      {props.isSwimlane ? <SwimlaneOverlay nodes={props.visibleNodes} theme={props.theme} /> : null}
      {props.isArchitecture || props.isDataArchitecture ? null : (
        <Background
          variant={"dots" as any}
          gap={props.isErd || props.isFlowchart || props.isOrg || props.isArchitecture ? 18 : 22}
          size={1}
          color={props.theme.gridDot}
        />
      )}
      <Controls position="bottom-left" showInteractive={false} />
      <MiniMap />
    </ReactFlow>
  );
}

export default function DiagramEditorClient({ diagram }: { diagram: any }) {
  const diagramType = String(diagram?.diagram_type ?? "swimlane");
  const isSwimlane = diagramType === "swimlane";
  const isErd = diagramType === "erd";
  const isFlowchart = diagramType === "flowchart";
  const isOrgChart = diagramType === "org_chart";
  const isArchitecture = diagramType === "system_architecture";
  const isDataArchitecture = diagramType === "data_architecture";
  const notation = useErdSettingsStore((s) => s.notation);
  const setNotation = useErdSettingsStore((s) => s.setNotation);
  const fcDirection = useFlowchartSettingsStore((s) => s.direction);
  const fcShowLegend = useFlowchartSettingsStore((s) => s.showLegend);
  const fcToggleLegend = useFlowchartSettingsStore((s) => s.toggleLegend);
  const fcSetDirection = useFlowchartSettingsStore((s) => s.setDirection);
  const orgChartType = useOrgChartSettingsStore((s) => s.chartType);
  const orgShowLegend = useOrgChartSettingsStore((s) => s.showLegend);
  const orgToggleLegend = useOrgChartSettingsStore((s) => s.toggleLegend);
  const orgSetChartType = useOrgChartSettingsStore((s) => s.setChartType);
  const archDirection = useArchitectureSettingsStore((s) => s.direction);
  const archProvider = useArchitectureSettingsStore((s) => s.provider);
  const archShowLegend = useArchitectureSettingsStore((s) => s.showLegend);
  const archToggleLegend = useArchitectureSettingsStore((s) => s.toggleLegend);
  const archSetDirection = useArchitectureSettingsStore((s) => s.setDirection);
  const archSetProvider = useArchitectureSettingsStore((s) => s.setProvider);
  const daDirection = useDataArchitectureStore((s) => s.direction);
  const daProvider = useDataArchitectureStore((s) => s.provider);
  const daShowLegend = useDataArchitectureStore((s) => s.showLegend);
  const daToggleLegend = useDataArchitectureStore((s) => s.toggleLegend);
  const daSetDirection = useDataArchitectureStore((s) => s.setDirection);
  const daSetProvider = useDataArchitectureStore((s) => s.setProvider);
  const setIconManifest = useIconPackStore((s) => s.setManifest);

  const [title, setTitle] = useState<string>(diagram?.name ?? "Untitled Diagram");
  const [themeId] = useState<string>(diagram?.current_snapshot?.meta?.themeId ?? "paper");
  const theme: DiagramTheme = useMemo(() => THEMES.find((t) => t.id === themeId) ?? THEMES[1], [themeId]);

  const [editKeyState, setEditKeyState] = useState<string | null>(null);

  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const importJsonRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const local = getEditKey(diagram.id);
    setEditKeyState(local);

    const url = new URL(window.location.href);
    const q = url.searchParams.get("editKey");
    if (q && q.trim().length) {
      setEditKey(diagram.id, q.trim());
      setEditKeyState(q.trim());
      url.searchParams.delete("editKey");
      window.history.replaceState({}, "", url.toString());
    }
  }, [diagram.id]);

  const canEdit = Boolean(editKeyState);

  // Load provider icon-pack manifest (optional). This enables official vendor icon rendering without bundling icons.
  useEffect(() => {
    if (!isArchitecture) return;
    const providerRaw = String(archProvider ?? "generic");
    if (providerRaw === "generic") return;
    if (providerRaw !== "aws" && providerRaw !== "azure" && providerRaw !== "gcp" && providerRaw !== "cncf") return;
    const provider = providerRaw;

    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/icon-packs/${provider}/manifest.json`, { cache: "no-store" });
        if (!alive) return;
        if (!res.ok) return setIconManifest(provider, null);
        const json = await res.json().catch(() => null);
        if (!alive) return;
        if (!isIconPackManifestV1(json)) return setIconManifest(provider, null);
        setIconManifest(provider, json);
      } catch {
        if (!alive) return;
        setIconManifest(provider, null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [archProvider, isArchitecture, setIconManifest]);

  // Restore architecture-specific view settings (provider/direction) from snapshot meta, if present.
  useEffect(() => {
    if (!isArchitecture) return;
    const meta = diagram?.current_snapshot?.meta ?? null;
    const arch = meta && typeof meta === "object" ? (meta as any).arch : null;
    const provider = arch && typeof arch.provider === "string" ? arch.provider : null;
    const direction = arch && typeof arch.direction === "string" ? arch.direction : null;
    if (provider) archSetProvider(provider as any);
    if (direction) archSetDirection(direction as any);
  }, [archSetDirection, archSetProvider, diagram?.current_snapshot?.meta, isArchitecture]);

  const initialSnap: Snap = useMemo(() => {
    const snap = diagram?.current_snapshot;
    if (snap?.nodes && snap?.edges) return { ...snap, nodes: normalizeParentRefs(snap.nodes as any) as any };

    if (isSwimlane) {
      const laneHeaderColors = ["Lane 1", "Lane 2", "Lane 3"].map((_, i) => laneColorForIndex(i));
      return {
        nodes: [
          createOrUpdateSwimlaneNode({
            existingId: "swimlane_root",
            orientation: "horizontal",
            lanes: ["Lane 1", "Lane 2", "Lane 3"],
            origin: { x: 120, y: 120 },
            width: 1100,
            height: 620,
            label: "Swim Lanes",
          }) as any,
        ].map((n: any) => ({ ...n, data: { ...(n.data ?? {}), laneHeaderColors } })),
        edges: [],
        meta: { themeId, layoutMode: "free" },
      };
    }

     return { nodes: [], edges: [], meta: { themeId, layoutMode: "free" } };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialSnap.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialSnap.edges);

  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  useEffect(() => void (nodesRef.current = nodes), [nodes]);
  useEffect(() => void (edgesRef.current = edges), [edges]);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeIds[0]) ?? null, [nodes, selectedNodeIds]);

  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  useEffect(() => setFocusNodeId(getFocusParam()), []);

  const { visibleNodes, visibleEdges } = useMemo(() => computeVisibility(nodes as any, edges as any), [nodes, edges]);

  useEffect(() => {
    if (!isErd) return;
    setEdges((eds) =>
      eds.map((e: any) => {
        if (String(e.type ?? "") !== "erd") return e;
        const d = (e.data ?? {}) as any;
        return {
          ...e,
          data: { ...d, kind: "erd_relation", notation },
          style: { ...(e.style ?? {}), stroke: "#111827", strokeWidth: 2.2 },
        };
      })
    );
  }, [isErd, notation, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const isGroup = String((n.data as any)?.kind ?? "") === "org_group" || String(n.type ?? "") === "org_group";
        const isBoundary =
          String((n.data as any)?.kind ?? "") === "architecture_boundary" || String(n.type ?? "") === "architecture_boundary";
        const zIndex = isSwimlaneContainer(n) ? 0 : isBoundary ? 5 : isGroup ? 8 : 30;

        if (isSwimlaneContainer(n)) {
          const d = (n.data ?? {}) as any;
          const lanes = Array.isArray(d.lanes) && d.lanes.length ? d.lanes : ["Lane 1"];
          const colors = Array.isArray(d.laneHeaderColors) ? [...d.laneHeaderColors] : [];
          while (colors.length < lanes.length) colors.push(laneColorForIndex(colors.length));
          return {
            ...n,
            data: { ...d, theme, laneHeaderColors: colors, kind: "swimlane" },
            style: { ...(n.style as any), zIndex, background: "transparent", border: "none" },
          };
        }

        const nextData: any = { ...(n.data ?? {}), theme };
        if (isArchitecture) nextData.archProvider = archProvider;
        return { ...n, data: nextData, style: { ...(n.style as any), zIndex } };
      })
    );
  }, [archProvider, isArchitecture, theme, setNodes]);

  const sanitizeSnap = useCallback((snap: Snap): Snap => {
    return {
      ...snap,
      nodes: normalizeParentRefs(stripNonSerializableFromNodes(snap.nodes as any) as any) as any,
      edges: stripNonSerializableFromEdges(snap.edges as any) as any,
    };
  }, []);

  const autosaveNow = useCallback(async () => {
    if (!editKeyState) return;

    const snap: Snap = sanitizeSnap({
      nodes: nodesRef.current as any,
      edges: edgesRef.current as any,
      meta: {
        themeId,
        layoutMode: "free",
        ...(isArchitecture ? { arch: { provider: archProvider, direction: archDirection } } : {}),
      },
    });

    const res = await fetch(`/api/diagrams/${diagram.id}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-edit-key": editKeyState },
      body: JSON.stringify({ name: title, snapshot: snap }),
    }).catch(() => null);

    if (res && !res.ok) {
      if (res.status === 401 || res.status === 403) setEditKeyState(null);
    } else {
      upsertRecent({ id: diagram.id, name: title, updatedAt: Date.now() });
    }
  }, [archDirection, archProvider, diagram.id, editKeyState, isArchitecture, sanitizeSnap, themeId, title]);

  const debouncedSaveRef = useRef<any>(null);
  const requestAutosaveSoon = useCallback(() => {
    if (!editKeyState) return;
    if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);
    debouncedSaveRef.current = setTimeout(() => autosaveNow(), 250);
  }, [autosaveNow, editKeyState]);

  const exportJson = useCallback(() => {
    const snap: Snap = sanitizeSnap({
      nodes: nodesRef.current as any,
      edges: edgesRef.current as any,
      meta: {
        themeId,
        layoutMode: "free",
        ...(isArchitecture ? { arch: { provider: archProvider, direction: archDirection } } : {}),
      },
    });

    const payload = { diagram_type: diagramType, name: title, ...snap };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    saveAs(blob, `${(title || "diagram").replaceAll(/[^\w.-]+/g, "_")}.json`);
  }, [archDirection, archProvider, diagramType, isArchitecture, sanitizeSnap, themeId, title]);

  const importJson = useCallback(
    async (file: File) => {
      if (!canEdit) {
        alert("Read-only on this device (no edit key).");
        return;
      }

      const filename = String(file?.name ?? "");
      const lower = filename.toLowerCase();
      const mime = String((file as any)?.type ?? "").toLowerCase();
      const looksJsonByName = lower.endsWith(".json");
      const looksJsonByMime = mime.includes("application/json") || mime.includes("text/json") || mime.includes("+json");
      if (!looksJsonByName && !looksJsonByMime) {
        alert(`Unsupported file type.\n\nPlease upload a .json file.\n\nSelected: ${filename || "(unknown filename)"}`);
        return;
      }

      let parsed: any;
      try {
        const text = await file.text();
        parsed = JSON.parse(text);
      } catch (e: any) {
        alert(`Invalid JSON file.\n\n${e?.message ?? String(e)}`);
        return;
      }

      const replace = confirm("Import JSON will replace the current diagram canvas. Continue?");
      if (!replace) return;

      const result = importDiagramFromJson(
        {
          diagramType: diagramType as DiagramType,
          themeId,
          erdNotation: notation,
          flowchartDirection: fcDirection,
          orgChartType: orgChartType,
        },
        parsed
      );

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const nextName = String((parsed as any).name ?? (parsed as any).title ?? "").trim();
        if (nextName) setTitle(nextName.slice(0, 120));
      }

      // Apply snapshot
      setNodes(result.snapshot.nodes as any);
      setEdges(result.snapshot.edges as any);
      setSelectedNodeIds([]);
      setSelectedEdgeIds([]);
      requestAutosaveSoon();

      if (result.warnings.length) {
        alert(["Imported with warnings:", ...result.warnings].join("\n"));
      }
    },
    [
      canEdit,
      diagramType,
      fcDirection,
      notation,
      orgChartType,
      requestAutosaveSoon,
      setEdges,
      setNodes,
      themeId,
    ]
  );

  useEffect(() => {
    if (!editKeyState) return;
    const t = setInterval(() => autosaveNow(), 6000);
    return () => clearInterval(t);
  }, [autosaveNow, editKeyState]);

  const onSelectionChange = useCallback((sel: { nodes?: any[]; edges?: any[] }) => {
    const nextNodeIds = (sel.nodes ?? []).map((n) => n.id).sort();
    const nextEdgeIds = (sel.edges ?? []).map((e) => e.id).sort();
    setSelectedNodeIds((prev) => (sameIds(prev, nextNodeIds) ? prev : nextNodeIds));
    setSelectedEdgeIds((prev) => (sameIds(prev, nextEdgeIds) ? prev : nextEdgeIds));
  }, []);

  const deleteSelection = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");

    const byId = new Map((nodesRef.current ?? []).map((n) => [n.id, n]));

    const selectedNodes = selectedNodeIds.map((id) => byId.get(id)).filter(Boolean) as Node[];
    const selectedEdgesSet = new Set(selectedEdgeIds);

    // Never delete swimlane container via keyboard.
    const removableNodeIds = new Set(
      selectedNodes.filter((n) => !isSwimlaneContainer(n)).map((n) => n.id)
    );

    if (removableNodeIds.size === 0 && selectedEdgesSet.size === 0) return;

    setNodes((nds) => nds.filter((n) => !removableNodeIds.has(n.id)));
    setEdges((eds) =>
      eds.filter((e) => {
        if (selectedEdgesSet.has(e.id)) return false;
        if (removableNodeIds.has(e.source) || removableNodeIds.has(e.target)) return false;
        return true;
      })
    );

    setSelectedNodeIds((prev) => prev.filter((id) => !removableNodeIds.has(id)));
    setSelectedEdgeIds([]);
    requestAutosaveSoon();
  }, [canEdit, requestAutosaveSoon, selectedEdgeIds, selectedNodeIds, setEdges, setNodes]);

  useEffect(() => {
    const isEditingText = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName?.toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select";
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditingText()) return;

      e.preventDefault();
      deleteSelection();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true } as any);
  }, [deleteSelection]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const src = nodesRef.current.find((n) => n.id === connection.source);
      const tgt = nodesRef.current.find((n) => n.id === connection.target);
      if (!src || !tgt) return;
      if (isSwimlaneContainer(src) || isSwimlaneContainer(tgt)) return;

      const srcKind = String((src.data as any)?.kind ?? "").toLowerCase();
      const tgtKind = String((tgt.data as any)?.kind ?? "").toLowerCase();
      const asyncEdge =
        isFlowchart &&
        (srcKind.includes("async") || srcKind.includes("callback") || tgtKind.includes("async") || tgtKind.includes("callback"));

      const srcNodeKind = String((src.data as any)?.nodeKind ?? "").toLowerCase();
      const tgtNodeKind = String((tgt.data as any)?.nodeKind ?? "").toLowerCase();
      const archAsync =
        isArchitecture &&
        (srcNodeKind.includes("event") ||
          srcNodeKind.includes("queue") ||
          srcNodeKind.includes("cdc") ||
          srcNodeKind.includes("saga") ||
          tgtNodeKind.includes("event") ||
          tgtNodeKind.includes("queue") ||
          tgtNodeKind.includes("cdc") ||
          tgtNodeKind.includes("saga"));

      const isOrgPersonSrc = String((src.data as any)?.kind ?? "") === "org_person" || String(src.type ?? "") === "org_person";
      const isOrgPersonTgt = String((tgt.data as any)?.kind ?? "") === "org_person" || String(tgt.type ?? "") === "org_person";

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: isErd ? "erd" : "labeled",
            markerEnd: isErd ? undefined : { type: MarkerType.ArrowClosed },
            style: {
              strokeWidth: 2,
              stroke: isErd ? "#111827" : isFlowchart || isOrgChart ? "#334155" : theme.accent,
              ...(asyncEdge || archAsync ? { strokeDasharray: "6 4" } : {}),
            },
            data: isErd
              ? {
                  kind: "erd_relation",
                  notation,
                  sourceCardinality: "1..N",
                  targetCardinality: "1..1",
                  label: "",
                }
              : isFlowchart
                ? { label: "", async: asyncEdge }
                : isArchitecture
                  ? { label: "", async: archAsync }
                : isOrgChart
                  ? { label: "", secondary: false }
                  : { label: "" },
          } as any,
          eds
        )
      );

      // Org chart: if connecting manager -> report, set primary manager for visibility/layout.
      if (isOrgChart && isOrgPersonSrc && isOrgPersonTgt) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== tgt.id) return n;
            return { ...n, data: { ...(n.data as any), parentNodeId: src.id } };
          })
        );
      }
      requestAutosaveSoon();
    },
    [setEdges, requestAutosaveSoon, theme.accent, isArchitecture, isErd, isFlowchart, isOrgChart, notation, setNodes]
  );

  const updateErdEntity = useCallback(
    (id: string, patch: any) => {
      if (!canEdit) return alert("Read-only on this device (no edit key).");
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== id) return n;
          return { ...n, data: { ...(n.data as any), ...patch } };
        })
      );
      requestAutosaveSoon();
    },
    [canEdit, requestAutosaveSoon, setNodes]
  );

  const exportErdJson = useCallback(() => {
    const payload = sanitizeSnap({
      nodes: nodesRef.current as any,
      edges: edgesRef.current as any,
      meta: { themeId, layoutMode: "free", erd: { notation } } as any,
    });
    saveAs(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `${title || "erd"}.json`);
  }, [notation, sanitizeSnap, themeId, title]);

  const exportErdSql = useCallback(() => {
    const ddl = exportPostgresDDL(nodesRef.current as any, edgesRef.current as any);
    saveAs(new Blob([ddl], { type: "text/plain;charset=utf-8" }), `${title || "erd"}.sql`);
  }, [title]);

  const exportErdPdf = useCallback(async () => {
    const el = document.querySelector(".react-flow") as HTMLElement | null;
    if (!el) return alert("Canvas not found");

    const [{ toPng }, pdf] = await Promise.all([import("html-to-image"), import("pdf-lib")]);
    const { PDFDocument, StandardFonts, rgb } = pdf as any;

    const pngDataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#ffffff" });
    const pngBytes = Uint8Array.from(atob(pngDataUrl.split(",")[1]), (c) => c.charCodeAt(0));

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const img = await doc.embedPng(pngBytes);
    const imgDims = img.scale(1);

    // Page 1: diagram image (fit to letter landscape)
    const page1 = doc.addPage([792, 612]);
    const margin = 24;
    const maxW = page1.getWidth() - margin * 2;
    const maxH = page1.getHeight() - margin * 2;
    const scale = Math.min(maxW / imgDims.width, maxH / imgDims.height);
    const w = imgDims.width * scale;
    const h = imgDims.height * scale;
    page1.drawImage(img, { x: margin + (maxW - w) / 2, y: margin + (maxH - h) / 2, width: w, height: h });

    // Next pages: data dictionary
    const entities = (nodesRef.current as any[]).filter(
      (n) => String((n.data as any)?.kind ?? "") === "erd_entity" || String(n.type ?? "") === "erd_entity"
    );

    const pageW = 612;
    const pageH = 792;
    let page = doc.addPage([pageW, pageH]);
    let y = pageH - 40;

    const newPage = () => {
      page = doc.addPage([pageW, pageH]);
      y = pageH - 40;
    };

    page.drawText(`${title || "ERD"} — Data Dictionary`, { x: 40, y, size: 16, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
    y -= 26;
    page.drawText(`Notation: ${notation === "crows_foot" ? "Crow’s Foot" : "Chen"}`, { x: 40, y, size: 10, font, color: rgb(0.2, 0.25, 0.33) });
    y -= 22;

    for (const ent of entities) {
      const name = String((ent.data as any)?.label ?? ent.id);
      const fields = Array.isArray((ent.data as any)?.fields) ? (ent.data as any).fields : [];

      if (y < 120) newPage();

      page.drawText(name, { x: 40, y, size: 13, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
      y -= 18;

      const header = "Field".padEnd(28) + "Type".padEnd(18) + "PK FK  Null  Unique  Ref";
      page.drawText(header, { x: 40, y, size: 9.5, font: fontBold, color: rgb(0.2, 0.25, 0.33) });
      y -= 12;

      for (const f of fields) {
        if (y < 80) newPage();
        const field = String(f?.name ?? "");
        const type = String(f?.type ?? "");
        const pk = f?.pk ? "Y" : "-";
        const fk = f?.fk ? "Y" : "-";
        const nullable = f?.nullable === false ? "N" : "Y";
        const unique = f?.unique ? "Y" : "-";
        const ref = f?.ref?.entityId ? `${String(f.ref.entityId)}.${String(f.ref.field ?? "")}` : "";
        const line = `${field}`.padEnd(28) + `${type}`.padEnd(18) + `${pk}  ${fk}   ${nullable}     ${unique}      ${ref}`;
        page.drawText(line, { x: 40, y, size: 9.5, font, color: rgb(0.06, 0.09, 0.16) });
        y -= 12;
      }

      y -= 10;
    }

    const pdfBytes = await doc.save();
    saveAs(new Blob([pdfBytes], { type: "application/pdf" }), `${title || "erd"}.pdf`);
  }, [notation, title]);

  const importErdSql = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");
    const sql = prompt("Paste PostgreSQL DDL (CREATE TABLE ...) to import:");
    if (!sql) return;
    const res = importPostgresDDL(sql);
    if (res.warnings.length) alert(res.warnings.join("\n"));
    setNodes(autoLayoutGrid(res.nodes));
    setEdges(res.edges);
    requestAutosaveSoon();
  }, [canEdit, requestAutosaveSoon, setEdges, setNodes]);

  const autoLayoutErd = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");
    const ents = (nodesRef.current as any[]).filter(
      (n) => String((n.data as any)?.kind ?? "") === "erd_entity" || String(n.type ?? "") === "erd_entity"
    );
    const others = (nodesRef.current as any[]).filter(
      (n) => !(String((n.data as any)?.kind ?? "") === "erd_entity" || String(n.type ?? "") === "erd_entity")
    );
    const laid = autoLayoutGrid(ents as any);
    setNodes([...(laid as any), ...(others as any)]);
    requestAutosaveSoon();
  }, [canEdit, requestAutosaveSoon, setNodes]);

  const dragRestoreRef = useRef<Map<string, { parentId: string; laneIndex: number }>>(new Map());

  const onNodeDragStart = useCallback(
    (_evt: any, dragged: Node) => {
      if (!dragged?.id) return;

      // Swimlane detach logic
      if (isSwimlane) {
        if (isSwimlaneContainer(dragged)) return;

        const parentId = ((dragged as any)?.parentId ?? (dragged as any)?.parentNode) as string | undefined;
        const laneIndex = (dragged.data as any)?.laneIndex as number | undefined;
        if (!parentId || typeof laneIndex !== "number") return;

        // If it was nested in the swimlane, detach during drag so it can move freely (no "sticky" extent clamp).
        // We'll snap/re-parent on drag stop.
        dragRestoreRef.current.set(dragged.id, { parentId, laneIndex });

        const abs = (dragged as any).positionAbsolute ?? dragged.position ?? null;
        if (!abs) return;

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== dragged.id) return n;
            const detached = detachFromParent(n);
            return {
              ...detached,
              position: { x: abs.x, y: abs.y },
              style: { ...(detached.style as any), zIndex: 30 },
            } as any;
          })
        );
        return;
      }

      // Data Architecture: detach nested node during drag so it can move between containers cleanly.
      if (isDataArchitecture) {
        const parentId = ((dragged as any)?.parentId ?? (dragged as any)?.parentNode) as string | undefined;
        if (!parentId) return;
        if (!(isDataArchitectureNode(dragged) || isDataArchitectureContainer(dragged))) return;

        const abs = (dragged as any).positionAbsolute ?? dragged.position ?? null;
        if (!abs) return;

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== dragged.id) return n;
            const detached = detachFromParent(n);
            return {
              ...detached,
              position: { x: abs.x, y: abs.y },
              data: { ...(detached.data as any), parentNodeId: null },
              style: { ...(detached.style as any), zIndex: isDataArchitectureContainer(detached) ? 5 : 30 },
            } as any;
          })
        );
        return;
      }

      // Architecture: detach a nested node during drag so it can move between boundaries cleanly.
      if (isArchitecture) {
        const parentId = ((dragged as any)?.parentId ?? (dragged as any)?.parentNode) as string | undefined;
        if (!parentId) return;
        if (!(isArchitectureNode(dragged) || isArchitectureBoundary(dragged))) return;

        const abs = (dragged as any).positionAbsolute ?? dragged.position ?? null;
        if (!abs) return;

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== dragged.id) return n;
            const detached = detachFromParent(n);
            return {
              ...detached,
              position: { x: abs.x, y: abs.y },
              data: { ...(detached.data as any), parentNodeId: null },
              style: { ...(detached.style as any), zIndex: isArchitectureBoundary(detached) ? 5 : 30 },
            } as any;
          })
        );
      }
    },
    [isArchitecture, isDataArchitecture, isSwimlane, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_evt: any, dragged: Node) => {
      if (!dragged?.id) return;

      if (!isSwimlane && !isArchitecture && !isDataArchitecture) {
        requestAutosaveSoon();
        return;
      }

      // Data Architecture container nesting
      if (isDataArchitecture) {
        const isObj = isDataArchitectureNode(dragged);
        const isCont = isDataArchitectureContainer(dragged);
        if (!isObj && !isCont) {
          requestAutosaveSoon();
          return;
        }

        const r = nodeRectAbs(dragged);
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;

        const containers = (nodesRef.current as Node[])
          .filter((n) => isDataArchitectureContainer(n) && n.id !== dragged.id)
          .map((b) => ({ b, rect: nodeRectAbs(b) }))
          .filter(({ rect }) => pointInRect(cx, cy, rect))
          .sort((a, b) => a.rect.w * a.rect.h - b.rect.w * b.rect.h);

        const hit = containers[0]?.b ?? null;

        if (!hit) {
          // Detach
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id !== dragged.id) return n;
              const abs = (dragged as any).positionAbsolute ?? dragged.position ?? { x: n.position.x, y: n.position.y };
              const detached = detachFromParent(n);
              return {
                ...detached,
                position: { x: abs.x, y: abs.y },
                data: { ...(detached.data as any), parentNodeId: null },
                style: { ...(detached.style as any), zIndex: isDataArchitectureContainer(detached) ? 5 : 30 },
              } as any;
            })
          );
          requestAutosaveSoon();
          return;
        }

        // Re-parent into container
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== dragged.id) return n;
            const abs = (dragged as any).positionAbsolute ?? dragged.position ?? { x: n.position.x, y: n.position.y };
            return {
              ...n,
              parentId: hit.id,
              extent: "parent" as any,
              position: toChildPosition({ x: abs.x, y: abs.y }, hit),
              data: { ...(n.data as any), parentNodeId: hit.id },
              style: { ...(n.style as any), zIndex: isCont ? 5 : 30 },
            } as any;
          })
        );

        requestAutosaveSoon();
        return;
      }

      // Architecture boundary nesting
      if (isArchitecture) {
        const isArch = isArchitectureNode(dragged);
        const isBound = isArchitectureBoundary(dragged);
        if (!isArch && !isBound) {
          requestAutosaveSoon();
          return;
        }

        const r = nodeRectAbs(dragged);
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;

        const boundaries = (nodesRef.current as Node[])
          .filter((n) => isArchitectureBoundary(n) && n.id !== dragged.id)
          .map((b) => ({ b, rect: nodeRectAbs(b) }))
          .filter(({ rect }) => pointInRect(cx, cy, rect))
          .sort((a, b) => a.rect.w * a.rect.h - b.rect.w * b.rect.h); // smallest container wins

        const hit = boundaries[0]?.b ?? null;

        if (!hit) {
          // Detach
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id !== dragged.id) return n;
              const abs = (dragged as any).positionAbsolute ?? dragged.position ?? { x: n.position.x, y: n.position.y };
              const detached = detachFromParent(n);
              return {
                ...detached,
                position: { x: abs.x, y: abs.y },
                data: { ...(detached.data as any), parentNodeId: null },
                style: { ...(detached.style as any), zIndex: isArchitectureBoundary(detached) ? 5 : 30 },
              } as any;
            })
          );
          requestAutosaveSoon();
          return;
        }

        // Re-parent into boundary
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== dragged.id) return n;
            const abs = (dragged as any).positionAbsolute ?? dragged.position ?? { x: n.position.x, y: n.position.y };
            return {
              ...n,
              parentId: hit.id,
              extent: "parent" as any,
              position: toChildPosition({ x: abs.x, y: abs.y }, hit),
              data: { ...(n.data as any), parentNodeId: hit.id },
              style: { ...(n.style as any), zIndex: isBound ? 5 : 30 },
            } as any;
          })
        );

        requestAutosaveSoon();
        return;
      }

      // Swimlane snap logic
      if (isSwimlaneContainer(dragged)) {
        requestAutosaveSoon();
        return;
      }

      const r = nodeRectAbs(dragged);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;

      const currentParentId = ((dragged as any)?.parentId ?? (dragged as any)?.parentNode) as string | undefined;
      const currentLaneIndex = (dragged.data as any)?.laneIndex as number | undefined;

      const restore = dragRestoreRef.current.get(dragged.id) ?? null;
      if (restore) dragRestoreRef.current.delete(dragged.id);

      const laneNode = (nodesRef.current as Node[]).find((n) => isSwimlaneContainer(n)) ?? null;

      const hit = findLaneAtPoint(nodesRef.current as any, cx, cy);

      if (!hit) {
        const fallbackLaneIndex =
          typeof currentLaneIndex === "number" ? currentLaneIndex : restore?.laneIndex;
        const fallbackParentId = currentParentId ?? restore?.parentId;

        if (laneNode && fallbackParentId === laneNode.id && typeof fallbackLaneIndex === "number") {
          const laneRect = swimlaneRectAbs(laneNode);
          if (pointInRect(cx, cy, laneRect)) {
            const abs = (dragged as any).positionAbsolute ?? dragged.position ?? { x: 0, y: 0 };
            const w = (dragged.data as any)?.size?.w ?? (dragged as any)?.width ?? (dragged as any)?.measured?.width ?? 170;
            const h = (dragged.data as any)?.size?.h ?? (dragged as any)?.height ?? (dragged as any)?.measured?.height ?? 70;

            const clamped = clampAbsToLane({
              laneNode,
              laneIndex: fallbackLaneIndex,
              abs: { x: abs.x, y: abs.y },
              nodeSize: { w, h },
            });

            setNodes((nds) =>
              nds.map((n) => {
                if (n.id !== dragged.id) return n;
                return {
                  ...n,
                  parentId: laneNode.id,
                  extent: "parent" as any,
                  position: toChildPosition({ x: clamped.x, y: clamped.y }, laneNode),
                  data: { ...(n.data as any), laneIndex: fallbackLaneIndex },
                  style: { ...(n.style as any), zIndex: 30 },
                } as any;
              })
            );

            requestAutosaveSoon();
            return;
          }
        }

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== dragged.id) return n;

            const abs = (dragged as any).positionAbsolute ?? dragged.position ?? { x: n.position.x, y: n.position.y };
            const detached = detachFromParent(n);

            return {
              ...detached,
              position: { x: abs.x, y: abs.y },
              data: { ...(detached.data as any), laneIndex: undefined },
              style: { ...(detached.style as any), zIndex: 30 },
            } as any;
          })
        );

        requestAutosaveSoon();
        return;
      }

      const snappedAbs = snapNodeIntoLane({
        dragged: dragged as any,
        laneNode: hit.laneNode as any,
        laneIndex: hit.laneIndex,
      });

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== dragged.id) return n;

          return {
            ...n,
            parentId: hit.laneNode.id,
            extent: "parent" as any,
            position: toChildPosition({ x: snappedAbs.x, y: snappedAbs.y }, hit.laneNode),
            data: { ...(n.data as any), laneIndex: hit.laneIndex },
            style: { ...(n.style as any), zIndex: 30 },
          };
        })
      );

      requestAutosaveSoon();
    },
    [isArchitecture, isDataArchitecture, isSwimlane, setNodes, requestAutosaveSoon]
  );

  const actions: EditorActions = useMemo(
    () => ({
      theme,

      creatingChildFor: null,
      createChildForNode: async () => alert("Not used in swimlane mode"),
      openChild: () => {},

      renameNode: (nodeId: string, label: string) => {
        setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data as any), label } } : n)));
        requestAutosaveSoon();
      },

      resizeNode: (nodeId: string, width: number, height: number) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: { ...(n.data as any), size: { w: Math.round(width), h: Math.round(height) } },
                  ...(isArchitectureBoundary(n) || isDataArchitectureNode(n) || isDataArchitectureContainer(n)
                    ? { style: { ...(n.style as any), width: Math.round(width), height: Math.round(height) } }
                    : {}),
                }
              : n
          )
        );
        requestAutosaveSoon();
      },

      updateNodeData: (nodeId: string, patch: Record<string, any>) => {
        setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data as any), ...patch } } : n)));
        requestAutosaveSoon();
      },

      toggleCollapsed: (nodeId: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== nodeId) return n;
            const collapsed = Boolean((n.data as any)?.collapsed);
            return { ...n, data: { ...(n.data as any), collapsed: !collapsed } };
          })
        );
        requestAutosaveSoon();
      },

      renameSwimlaneHeader: (laneNodeId: string, label: string) => {
        const next = label.trim() || "Swim Lanes";
        setNodes((nds) => nds.map((n) => (n.id === laneNodeId ? { ...n, data: { ...(n.data as any), label: next } } : n)));
        requestAutosaveSoon();
      },

      upsertSwimlanes: (orientation: LaneOrientation) => {
        setNodes((nds) => {
          const existing = nds.find((n) => isSwimlaneContainer(n));
          const existingData: any = existing?.data ?? {};
          const lanes = existingData?.lanes ?? ["Lane 1", "Lane 2", "Lane 3"];

          const colors = Array.isArray(existingData.laneHeaderColors) ? [...existingData.laneHeaderColors] : [];
          while (colors.length < lanes.length) colors.push(laneColorForIndex(colors.length));

          const laneNode = createOrUpdateSwimlaneNode({
            existingId: existing?.id,
            orientation,
            lanes,
            origin: existing?.position ?? { x: 120, y: 120 },
            theme,
            label: existingData?.label ?? "Swim Lanes",
            dividers: existingData?.dividers ?? 0,
            dividerPositions: existingData?.dividerPositions,
            locked: existingData?.locked ?? false,
            width: existingData?.width,
            height: existingData?.height,
          });

          const filtered = nds.filter((n) => !isSwimlaneContainer(n));
          return [{ ...(laneNode as any), data: { ...((laneNode as any).data ?? {}), laneHeaderColors: colors } }, ...filtered];
        });

        requestAutosaveSoon();
      },

      aiGenerateSwimlanes: async () => {},

      renameLane: (laneNodeId: string, laneIndex: number, name: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;
            const d = n.data as any as SwimlaneNodeData;
            const next = [...(d.lanes ?? [])];
            next[laneIndex] = name;

            const laneHeaderColors = Array.isArray((d as any).laneHeaderColors) ? [...(d as any).laneHeaderColors] : [];
            while (laneHeaderColors.length < next.length) laneHeaderColors.push(laneColorForIndex(laneHeaderColors.length));

            return { ...n, data: { ...(n.data as any), lanes: next, laneHeaderColors } };
          })
        );
        requestAutosaveSoon();
      },

      setLaneDividers: () => {},
      setLaneDividerPositions: () => {},
      toggleLaneLock: () => {},

      resizeLaneContainer: (laneNodeId: string, width: number, height: number) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === laneNodeId ? { ...n, data: { ...(n.data as any), width, height }, style: { ...(n.style as any), width, height } } : n
          )
        );
        requestAutosaveSoon();
      },

      addLane: (laneNodeId: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;

            const d = n.data as any as SwimlaneNodeData;
            const lanes = Array.isArray(d.lanes) ? [...d.lanes] : ["Lane 1"];
            lanes.push(`Lane ${lanes.length + 1}`);

            const laneHeaderColors = Array.isArray((d as any).laneHeaderColors) ? [...(d as any).laneHeaderColors] : [];
            while (laneHeaderColors.length < lanes.length) laneHeaderColors.push(laneColorForIndex(laneHeaderColors.length));

            let width = Number(d.width ?? 1100);
            let height = Number(d.height ?? 620);

            if (d.orientation === "vertical") {
              width = Math.max(width, lanes.length * 220);
            } else {
              const header = 54;
              height = Math.max(height, header + lanes.length * 160);
            }

            return { ...n, data: { ...(n.data as any), lanes, laneHeaderColors, width, height }, style: { ...(n.style as any), width, height } };
          })
        );
        requestAutosaveSoon();
      },

      removeLane: (laneNodeId: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;

            const d = n.data as any as SwimlaneNodeData;
            const lanes = Array.isArray(d.lanes) ? [...d.lanes] : ["Lane 1"];
            if (lanes.length <= 1) return n;
            lanes.pop();

            const laneHeaderColors = Array.isArray((d as any).laneHeaderColors) ? [...(d as any).laneHeaderColors] : [];
            laneHeaderColors.length = lanes.length;

            let width = Number(d.width ?? 1100);
            let height = Number(d.height ?? 620);

            if (d.orientation === "vertical") {
              width = Math.max(760, lanes.length * 220);
            } else {
              const header = 54;
              height = Math.max(560, header + lanes.length * 160);
            }

            return { ...n, data: { ...(n.data as any), lanes, laneHeaderColors, width, height }, style: { ...(n.style as any), width, height } };
          })
        );
        requestAutosaveSoon();
      },

      openAiFullProcessModal: () => {},
    }),
    [theme, requestAutosaveSoon, setNodes]
  );

  const changeLabel = useCallback(
    (id: string, next: string) => {
      actions.renameNode(id, next);
    },
    [actions]
  );

  const changeFill = useCallback(
    (id: string, next: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), meta: { ...((n.data as any)?.meta ?? {}), color: next } } } : n))
      );
      requestAutosaveSoon();
    },
    [setNodes, requestAutosaveSoon]
  );

  const changeStroke = useCallback(
    (id: string, next: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), meta: { ...((n.data as any)?.meta ?? {}), border: next } } } : n))
      );
      requestAutosaveSoon();
    },
    [setNodes, requestAutosaveSoon]
  );

  const buildNodesWithInlinedIconsForExport = useCallback(async () => {
    if (!isDataArchitecture) return nodesRef.current as any;

    const current = (nodesRef.current ?? []) as any[];
    const targets = current
      .map((n) => ({ id: String(n?.id ?? ""), iconSrc: String(n?.data?.meta?.iconSrc ?? "").trim() }))
      .filter((x) => x.id && x.iconSrc.startsWith("/"));

    if (!targets.length) return current as any;

    const cache = new Map<string, string>();

    // Fetch icons in parallel, but de-dupe by URL.
    await Promise.all(
      [...new Set(targets.map((t) => t.iconSrc))].map(async (src) => {
        try {
          const res = await fetch(src);
          if (!res.ok) return;
          const txt = await res.text();
          if (!txt || !txt.trim().startsWith("<")) return;
          cache.set(src, svgTextToDataUri(txt));
        } catch {
          // keep original
        }
      })
    );

    if (!cache.size) return current as any;

    return current.map((n) => {
      const src = String(n?.data?.meta?.iconSrc ?? "").trim();
      const next = cache.get(src);
      if (!next) return n;
      return {
        ...n,
        data: {
          ...(n.data ?? {}),
          meta: { ...((n.data as any)?.meta ?? {}), iconSrc: next },
        },
      };
    });
  }, [isDataArchitecture]);

  const exportSimpleSvgFallback = useCallback(async () => {
    const exportNodes = await buildNodesWithInlinedIconsForExport();
    const svg = exportSimpleSvg(exportNodes as any, edgesRef.current as any, { title });
    saveAs(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${title || "diagram"}.svg`);
  }, [buildNodesWithInlinedIconsForExport, title]);

  const exportFlowchartMmd = useCallback(() => {
    const mmd = exportFlowchartMermaid({
      nodes: nodesRef.current as any,
      edges: edgesRef.current as any,
      direction: fcDirection,
      includeLegend: true,
    });
    saveAs(new Blob([mmd], { type: "text/plain;charset=utf-8" }), `${title || "flowchart"}.mmd`);
  }, [fcDirection, title]);

  const exportOrgMmd = useCallback(() => {
    const mmd = exportOrgMermaid({
      nodes: nodesRef.current as any,
      edges: edgesRef.current as any,
      direction: "TB",
    });
    saveAs(new Blob([mmd], { type: "text/plain;charset=utf-8" }), `${title || "org-chart"}.mmd`);
  }, [title]);

  const exportArchitectureMmd = useCallback(() => {
    const mmd = exportArchitectureMermaid({
      nodes: nodesRef.current as any,
      edges: edgesRef.current as any,
      direction: archDirection,
    });
    saveAs(new Blob([mmd], { type: "text/plain;charset=utf-8" }), `${title || "architecture"}.mmd`);
  }, [archDirection, title]);

  const autoLayoutArchitectureNow = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");
    setNodes((nds) => autoLayoutArchitecture(nds as any, archDirection) as any);
    requestAutosaveSoon();
  }, [archDirection, canEdit, requestAutosaveSoon, setNodes]);

  const autoLayoutDataArchitectureNow = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");
    const next = autoLayoutDataArchitecture({ nodes: nodesRef.current as any, edges: edgesRef.current as any, direction: daDirection }) as any;
    setNodes(next);
    requestAutosaveSoon();
  }, [canEdit, daDirection, requestAutosaveSoon, setNodes]);

  const rfApiRef = useRef<any>(null);
  const onCanvasReady = useCallback((rf: any) => {
    rfApiRef.current = rf;
  }, []);

  const addDataArchitectureStencil = useCallback(
    (stencil: DataArchitectureStencilType) => {
      if (!isDataArchitecture) return;
      if (!canEdit) return alert("Read-only on this device (no edit key).");

      const rf = rfApiRef.current as any;
      const containerEl = document.querySelector(".react-flow") as HTMLElement | null;
      const rect = containerEl?.getBoundingClientRect?.() ?? null;
      const center = rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: 380, y: 240 };

      const flowPos = rf?.screenToFlowPosition ? rf.screenToFlowPosition(center) : { x: 380, y: 240 };

      const base = dataArchNodeForStencil(stencil as any, daProvider) as any as Node;
      const nextId = `da_${uid()}`;
      const layer = String((base.data as any)?.layer ?? "").toLowerCase();

      const currentNodes = (nodesRef.current ?? []) as any[];
      const containers = currentNodes.filter((n) => String((n.data as any)?.kind ?? "") === "data_arch_container");
      const domainContainer = containers.find((c) => String((c.data as any)?.containerStyle ?? "") === "domain");
      const mainContainer = containers.find((c) => String((c.data as any)?.containerStyle ?? "") !== "domain") ?? containers[0];
      const parent = stencil === "da_container" ? null : layer === "analytics" ? domainContainer : mainContainer;

      const absPos = { x: Number(flowPos.x ?? 0), y: Number(flowPos.y ?? 0) };
      const childPos = parent ? toChildPosition(absPos, parent as any) : absPos;

      const node: any = {
        ...base,
        id: nextId,
        position: { x: childPos.x, y: childPos.y },
        ...(parent ? { parentId: parent.id, extent: "parent" } : {}),
      };

      setNodes((nds) => [...nds, node]);

      // Beginner-friendly behavior: auto-connect new nodes into the main flow when possible.
      if (stencil !== "da_container") {
        const order: Record<string, number> = {
          source: 0,
          ingestion: 1,
          processing: 2,
          storage: 3,
          analytics: 4,
          governance: 5,
          security: 6,
        };

        const newOrder = order[layer] ?? 2;
        const objects = currentNodes.filter((n) => String((n.data as any)?.kind ?? "") === "data_arch_object");
        const candidates = objects.filter((n) => {
          const l = String((n.data as any)?.layer ?? "").toLowerCase();
          const o = order[l] ?? -1;
          return o >= 0 && o < newOrder;
        });

        const absX = (n: any) => {
          const p = (n as any).positionAbsolute ?? n.position ?? { x: 0, y: 0 };
          const parentId = (n as any).parentId ?? (n as any).parentNode;
          if (!parentId) return Number(p.x ?? 0);
          const parent = currentNodes.find((x) => x?.id === parentId);
          if (!parent) return Number(p.x ?? 0);
          const pp = (parent as any).positionAbsolute ?? parent.position ?? { x: 0, y: 0 };
          return Number(pp.x ?? 0) + Number(p.x ?? 0);
        };

        if (candidates.length) {
          const best = candidates.map((n) => ({ n, x: absX(n) })).sort((a, b) => b.x - a.x)[0]?.n;

          if (best?.id) {
            const eid = `e_${uid()}`;
            setEdges((eds) =>
              addEdge(
                {
                  id: eid,
                  type: "labeled",
                  source: best.id,
                  target: nextId,
                  markerEnd: { type: MarkerType.ArrowClosed },
                  style: { strokeWidth: 2, stroke: "#334155" },
                  data: { label: "" },
                } as any,
                eds
              )
            );
          }
        }
      }

      requestAutosaveSoon();

      // Keep the canvas tidy for beginners.
      setTimeout(() => {
        try {
          if ((currentNodes?.length ?? 0) < 4) rf?.fitView?.({ padding: 0.22, maxZoom: 1.2 });
        } catch {}
      }, 0);
    },
    [canEdit, daProvider, isDataArchitecture, requestAutosaveSoon, setEdges, setNodes]
  );

  const loadDataArchitectureTemplate = useCallback(
    (templateId: DataArchitectureTemplateId) => {
      if (!isDataArchitecture) return;
      if (!canEdit) return alert("Read-only on this device (no edit key).");
      const ok = confirm("Load template? This will replace the current diagram canvas.");
      if (!ok) return;

      const tpl = getDataArchitectureTemplate(templateId as any);
      daSetProvider(tpl.provider as any);
      daSetDirection(tpl.direction as any);
      setTitle(tpl.title);
      setNodes(tpl.nodes as any);
      setEdges(tpl.edges as any);
      requestAutosaveSoon();

      const rf = rfApiRef.current as any;
      setTimeout(() => {
        try {
          rf?.fitView?.({ padding: 0.22, maxZoom: 1.1 });
        } catch {}
      }, 0);
    },
    [canEdit, daSetDirection, daSetProvider, isDataArchitecture, requestAutosaveSoon, setEdges, setNodes]
  );

  const autoLayoutOrgChart = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");
    setNodes((nds) => autoLayoutOrg(nds as any, orgChartType) as any);
    requestAutosaveSoon();
  }, [canEdit, orgChartType, requestAutosaveSoon, setNodes]);

  const editSelectedEdge = useCallback(() => {
    if (!canEdit) return alert("Read-only on this device (no edit key).");
    const edgeId = selectedEdgeIds[0];
    if (!edgeId) return;
    const edge = (edgesRef.current ?? []).find((e) => e.id === edgeId) as any;
    if (!edge) return;

    const currentLabel = String(edge?.data?.label ?? "");
    const nextLabel = prompt("Edge label (e.g. Yes/No, Success/Fail):", currentLabel);
    if (nextLabel === null) return;

    const mode = isOrgChart ? "secondary manager (matrix)" : "async (dashed)";
    const currentDashed = Boolean(isOrgChart ? edge?.data?.secondary : edge?.data?.async);
    const nextDashed = confirm(
      `Dashed ${mode} edge?\n\nOK = Dashed\nCancel = Solid\n\nCurrently: ${currentDashed ? "Dashed" : "Solid"}`
    );

    setEdges((eds) =>
      eds.map((e: any) => {
        if (e.id !== edgeId) return e;
        const style = { ...(e.style ?? {}) } as any;
        if (nextDashed) style.strokeDasharray = "6 4";
        else delete style.strokeDasharray;
        return {
          ...e,
          data: {
            ...(e.data ?? {}),
            label: String(nextLabel).trim(),
            ...(isOrgChart ? { secondary: nextDashed } : { async: nextDashed }),
          },
          style,
        };
      })
    );

    requestAutosaveSoon();
  }, [canEdit, isOrgChart, requestAutosaveSoon, selectedEdgeIds, setEdges]);

  return (
    <DiagramEditorProvider value={actions}>
      <div className="w-full h-[calc(100vh-64px)] flex bg-slate-50">
        {isErd ? (
          <ErdStencilSidebar />
        ) : isArchitecture ? (
          <ArchitectureStencilSidebar />
        ) : isDataArchitecture ? (
          <DataArchitectureStencilSidebar onAddStencil={addDataArchitectureStencil} onLoadTemplate={loadDataArchitectureTemplate} />
        ) : isOrgChart ? (
          <OrgChartStencilSidebar />
        ) : isFlowchart ? (
          <FlowchartStencilSidebar />
        ) : (
          <StencilSidebar
            onAddHorizontalSwimlanes={() => actions.upsertSwimlanes("horizontal")}
            onAddVerticalSwimlanes={() => actions.upsertSwimlanes("vertical")}
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:thin]">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={TOOLBAR_INPUT}
                placeholder="Untitled diagram"
              />

            {!canEdit ? (
              <div className="flex items-center gap-2">
                <div className={TOOLBAR_BADGE}>Read-only (no edit key)</div>
                <button
                  className={TOOLBAR_BTN_SUBTLE + " text-xs"}
                  onClick={() => {
                    const k = prompt("Paste edit key to enable editing on this device:");
                    if (!k) return;
                    setEditKey(diagram.id, k.trim());
                    setEditKeyState(k.trim());
                  }}
                >
                  Claim Edit Access
                </button>
              </div>
            ) : null}

            <button
              className={TOOLBAR_BTN}
              onClick={() => setPropertiesOpen((v) => !v)}
              title="Toggle properties panel"
            >
              {propertiesOpen ? "Hide Properties" : "Show Properties"}
            </button>

            <a
              href={
                isErd
                  ? "/help/diagrams/erd"
                  : isSwimlane
                    ? "/help/diagrams/swimlanes"
                  : isArchitecture
                      ? "/help/diagrams/system-architecture"
                      : isDataArchitecture
                        ? "/help/diagrams/data-architecture"
                    : isOrgChart
                      ? "/help/diagrams/org-chart"
                    : isFlowchart
                      ? "/help/diagrams/flowchart"
                      : "/help"
              }
              className={TOOLBAR_BTN_SUBTLE}
              title="Open user guide"
            >
              Help
            </a>

            {isErd ? (
              <>
                <button
                  className={TOOLBAR_BTN}
                  onClick={() => setNotation(notation === "crows_foot" ? "chen" : "crows_foot")}
                  title="Toggle ERD notation"
                >
                  Notation: {notation === "crows_foot" ? "Crow’s Foot" : "Chen"}
                </button>
                <button className={TOOLBAR_BTN} onClick={exportErdJson}>
                  Export JSON
                </button>
                <button className={TOOLBAR_BTN} onClick={exportErdSql}>
                  Export SQL
                </button>
                <button className={TOOLBAR_BTN} onClick={exportErdPdf}>
                  Export PDF
                </button>
                <button className={TOOLBAR_BTN} onClick={importErdSql}>
                  Import SQL
                </button>
                <button className={TOOLBAR_BTN} onClick={autoLayoutErd}>
                  Auto-Layout
                </button>
              </>
            ) : null}

            {isFlowchart ? (
              <>
                <button
                  className={TOOLBAR_BTN}
                  onClick={() => fcSetDirection(fcDirection === "TB" ? "LR" : "TB")}
                  title="Toggle layout direction (used by Mermaid export)"
                >
                  Direction: {fcDirection === "TB" ? "Vertical" : "Horizontal"}
                </button>
                <button
                  className={TOOLBAR_BTN}
                  onClick={fcToggleLegend}
                  title="Toggle legend overlay"
                >
                  {fcShowLegend ? "Hide Legend" : "Show Legend"}
                </button>
                {selectedEdgeIds.length === 1 ? (
                  <button
                    className={TOOLBAR_BTN}
                    onClick={editSelectedEdge}
                    title="Edit selected edge label and async style"
                  >
                    Edit Edge
                  </button>
                ) : null}
                <button className={TOOLBAR_BTN} onClick={exportFlowchartMmd}>
                  Export Mermaid
                </button>
              </>
            ) : null}

            {isOrgChart ? (
              <>
                <select
                  value={orgChartType}
                  onChange={(e) => orgSetChartType(e.target.value as any)}
                  className={TOOLBAR_BTN}
                  title="Select org chart structure (used by Auto-Layout)"
                >
                  <option value="functional">Functional Top-Down</option>
                  <option value="divisional">Divisional Structure</option>
                  <option value="matrix">Matrix (dual reporting)</option>
                  <option value="flat">Flat Org Chart</option>
                </select>
                <button
                  className={TOOLBAR_BTN}
                  onClick={orgToggleLegend}
                  title="Toggle legend overlay"
                >
                  {orgShowLegend ? "Hide Legend" : "Show Legend"}
                </button>
                {selectedEdgeIds.length === 1 ? (
                  <button
                    className={TOOLBAR_BTN}
                    onClick={editSelectedEdge}
                    title="Edit selected edge label and secondary/dashed style"
                  >
                    Edit Edge
                  </button>
                ) : null}
                <button className={TOOLBAR_BTN} onClick={autoLayoutOrgChart}>
                  Auto-Layout
                </button>
                <button className={TOOLBAR_BTN} onClick={exportOrgMmd}>
                  Export Mermaid
                </button>
              </>
            ) : null}

            {isArchitecture ? (
              <>
                <button
                  className={TOOLBAR_BTN}
                  onClick={() => archSetDirection(archDirection === "LR" ? "TB" : "LR")}
                  title="Toggle direction for layered architecture"
                >
                  Direction: {archDirection === "LR" ? "Left → Right" : "Top → Bottom"}
                </button>
                <button
                  className={TOOLBAR_BTN}
                  onClick={archToggleLegend}
                  title="Toggle legend overlay"
                >
                  {archShowLegend ? "Hide Legend" : "Show Legend"}
                </button>
                {selectedEdgeIds.length === 1 ? (
                  <button
                    className={TOOLBAR_BTN}
                    onClick={editSelectedEdge}
                    title="Edit selected edge label and async dashed style"
                  >
                    Edit Edge
                  </button>
                ) : null}
                <button className={TOOLBAR_BTN} onClick={autoLayoutArchitectureNow}>
                  Auto-Layout
                </button>
                <button className={TOOLBAR_BTN} onClick={exportArchitectureMmd}>
                  Export Mermaid
                </button>
              </>
            ) : null}

            {isDataArchitecture ? (
              <>
                <button
                  className={TOOLBAR_BTN}
                  onClick={() => daSetDirection(daDirection === "LR" ? "TB" : "LR")}
                  title="Toggle layout direction (used by Auto-Layout)"
                >
                  Direction: {daDirection === "LR" ? "Left → Right" : "Top → Bottom"}
                </button>
                <button className={TOOLBAR_BTN} onClick={daToggleLegend} title="Toggle legend overlay">
                  {daShowLegend ? "Hide Legend" : "Show Legend"}
                </button>
                {selectedEdgeIds.length === 1 ? (
                  <button className={TOOLBAR_BTN} onClick={editSelectedEdge} title="Edit selected edge label and async/dashed style">
                    Edit Edge
                  </button>
                ) : null}
                <button className={TOOLBAR_BTN} onClick={autoLayoutDataArchitectureNow}>
                  Auto-Layout
                </button>
              </>
            ) : null}

            <input
              ref={importJsonRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                // allow re-selecting the same file
                e.target.value = "";
                if (!f) return;
                importJson(f).catch((err) => alert(err?.message ?? String(err)));
              }}
            />
            <button
              className={TOOLBAR_BTN}
              onClick={() => importJsonRef.current?.click()}
              title="Upload a JSON file and convert it into this diagram type"
            >
              Import JSON
            </button>
            <button
              className={TOOLBAR_BTN}
              onClick={exportJson}
              title="Download the current diagram as JSON (re-importable)"
            >
              Export JSON
            </button>
            <button className={TOOLBAR_BTN} onClick={() => exportSimpleSvgFallback()}>
              Export SVG
            </button>
            <button
              className={TOOLBAR_BTN}
              onClick={() => {
                buildNodesWithInlinedIconsForExport()
                  .then((exportNodes) => exportSimpleSvg(exportNodes as any, edgesRef.current as any, { title }))
                  .then((svg) => svgStringToPngBlob(svg, 3))
                  .then((blob) => saveAs(blob, `${title || "diagram"}.png`))
                  .catch((e) => alert(e?.message ?? String(e)));
              }}
            >
              Export PNG (HD)
            </button>
          </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ReactFlowProvider>
              <Canvas
                theme={theme}
                visibleNodes={visibleNodes}
                visibleEdges={visibleEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                setNodes={setNodes}
                canEdit={canEdit}
                requestAutosaveSoon={requestAutosaveSoon}
                nodesRef={nodesRef}
                isSwimlane={isSwimlane}
                isErd={isErd}
                isFlowchart={isFlowchart}
                isOrg={isOrgChart}
                isArchitecture={isArchitecture}
                isDataArchitecture={isDataArchitecture}
                archProvider={isArchitecture ? archProvider : undefined}
                daProvider={isDataArchitecture ? daProvider : undefined}
                onReady={onCanvasReady}
              />
            </ReactFlowProvider>
            {isFlowchart && fcShowLegend ? <FlowchartLegend /> : null}
            {isOrgChart && orgShowLegend ? <OrgLegend /> : null}
            {isArchitecture && archShowLegend ? <ArchitectureLegend /> : null}
            {isDataArchitecture && daShowLegend ? <DataArchitectureLegend /> : null}
          </div>
        </div>

        <div
          className={[
            "h-full transition-all duration-200 ease-out overflow-hidden bg-transparent",
            propertiesOpen ? "w-[360px]" : "w-[44px]",
          ].join(" ")}
        >
          {!propertiesOpen ? (
            <div className="h-full flex flex-col items-center justify-start pt-4 gap-2">
              <button
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white/90 shadow-sm hover:bg-white hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs font-extrabold"
                onClick={() => setPropertiesOpen(true)}
                title="Show properties"
              >
                ☰
              </button>
            </div>
          ) : (
            isErd ? (
              <ErdPropertiesPanel selectedNode={selectedNode as any} allNodes={nodes as any} onUpdateEntity={updateErdEntity} />
            ) : isArchitecture ? (
              <ArchitecturePropertiesPanel
                selectedNode={selectedNode}
                onUpdate={(id, patch) => {
                  if (!canEdit) return alert("Read-only on this device (no edit key).");
                  setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n)));
                  requestAutosaveSoon();
                }}
                onResize={(id, w, h) => actions.resizeNode(id, w, h)}
              />
            ) : isDataArchitecture ? (
              <DataArchitecturePropertiesPanel
                selectedNode={selectedNode}
                onUpdate={(id, patch) => {
                  if (!canEdit) return alert("Read-only on this device (no edit key).");
                  setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n)));
                  requestAutosaveSoon();
                }}
                onResize={(id, w, h) => actions.resizeNode(id, w, h)}
              />
            ) : isOrgChart ? (
              <OrgPropertiesPanel
                selectedNode={selectedNode}
                allNodes={nodes as any}
                onUpdate={(id, patch) => {
                  if (!canEdit) return alert("Read-only on this device (no edit key).");
                  setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n)));
                  requestAutosaveSoon();
                }}
                onResize={(id, w, h) => actions.resizeNode(id, w, h)}
              />
            ) : (
              <PropertiesPanel
                selectedNode={selectedNode}
                onChangeLabel={changeLabel}
                onChangeFill={changeFill}
                onChangeStroke={changeStroke}
                onRenameLane={(laneNodeId, laneIndex, next) => actions.renameLane(laneNodeId, laneIndex, next)}
                onRenameSwimlaneHeader={(laneNodeId, next) => actions.renameSwimlaneHeader(laneNodeId, next)}
                onResizeSwimlane={(laneNodeId, w, h) => actions.resizeLaneContainer(laneNodeId, w, h)}
                onResizeFlowNode={(nodeId, w, h) => actions.resizeNode(nodeId, w, h)}
              />
            )
          )}
        </div>
      </div>
    </DiagramEditorProvider>
  );
}
