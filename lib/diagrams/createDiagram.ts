// lib/diagrams/createDiagram.ts
import { MarkerType } from "@xyflow/react";

export type DiagramType =
  | "business_process_flow"
  | "swimlane"
  | "system_architecture"
  | "org_chart"
  | "decision_flow"
  | "erd"
  | "data_architecture"
  | "data_model"
  | "flowchart";

export function buildStarterSnapshot(opts: { diagram_type: DiagramType; name: string }) {
  const baseMeta = { themeId: "paper", layoutMode: "free" as const };

  // BPMN-like starter
  const bpmnStarter = {
    nodes: [
      {
        id: "start",
        type: "bpmn",
        position: { x: 140, y: 200 },
        data: { kind: "start_event", label: "Start", collapsed: false, meta: { color: "#ECFDF5" } },
        style: { zIndex: 10 },
      },
      {
        id: "end",
        type: "bpmn",
        position: { x: 560, y: 260 },
        data: { kind: "end_event", label: "End", collapsed: false, meta: { color: "#FEF2F2" } },
        style: { zIndex: 10 },
      },
    ],
    edges: [
      {
        id: "e-start-end",
        source: "start",
        target: "end",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "" },
      },
    ],
    meta: baseMeta,
  };

  // Swimlane starter: creates the lane container node and leaves content empty
  const swimlaneStarter = {
    nodes: [
      {
        id: "swimlane_root",
        type: "swimlane",
        position: { x: 120, y: 120 },
        data: {
          kind: "swimlane",
          label: "Swim Lanes",
          orientation: "horizontal",
          lanes: ["Lane 1", "Lane 2", "Lane 3"],
          dividers: 0,
          dividerPositions: [],
          width: 980,
          height: 560,
          locked: false,
        },
        style: { width: 980, height: 560, zIndex: 0 },
        draggable: true,
      },
    ],
    edges: [],
    meta: baseMeta,
  };

  const erdStarter = {
    nodes: [
      {
        id: "erd_entity_1",
        type: "erd_entity",
        position: { x: 160, y: 160 },
        data: {
          kind: "erd_entity",
          label: "users",
          weak: false,
          fields: [
            { name: "id", type: "uuid", pk: true, nullable: false },
            { name: "email", type: "text", unique: true, nullable: false },
          ],
          size: { w: 320, h: 220 },
        },
        style: { zIndex: 30 },
      },
    ],
    edges: [],
    meta: baseMeta,
  };

  const flowchartStarter = {
    nodes: [
      {
        id: "fc_start",
        type: "flowchart",
        position: { x: 140, y: 180 },
        data: { kind: "start_end", label: "Start", meta: { color: "#dcfce7", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_input",
        type: "flowchart",
        position: { x: 380, y: 180 },
        data: { kind: "user_input", label: "User enters details", meta: { color: "#e2e8f0", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_validate",
        type: "flowchart",
        position: { x: 640, y: 180 },
        data: { kind: "system_task", label: "Validate & normalize", meta: { color: "#e2e8f0", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_decision",
        type: "flowchart",
        position: { x: 900, y: 160 },
        data: { kind: "decision", label: "Valid?", meta: { color: "#fef08a", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_api",
        type: "flowchart",
        position: { x: 1140, y: 180 },
        data: { kind: "async_callback", label: "API call (async)", meta: { color: "#fbcfe8", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_render",
        type: "flowchart",
        position: { x: 1380, y: 180 },
        data: { kind: "process", label: "Render success", meta: { color: "#e2e8f0", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_error",
        type: "flowchart",
        position: { x: 1140, y: 390 },
        data: { kind: "error_cancel", label: "Show error / cancel", meta: { color: "#fecaca", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
      {
        id: "fc_end",
        type: "flowchart",
        position: { x: 1620, y: 180 },
        data: { kind: "start_end", label: "End", meta: { color: "#dcfce7", border: "#0f172a" } },
        style: { zIndex: 30 },
      },
    ],
    edges: [
      {
        id: "e-fc-start-input",
        source: "fc_start",
        target: "fc_input",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "" },
      },
      {
        id: "e-fc-input-validate",
        source: "fc_input",
        target: "fc_validate",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "" },
      },
      {
        id: "e-fc-validate-decision",
        source: "fc_validate",
        target: "fc_decision",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "" },
      },
      {
        id: "e-fc-decision-yes",
        source: "fc_decision",
        target: "fc_api",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "Yes" },
      },
      {
        id: "e-fc-decision-no",
        source: "fc_decision",
        target: "fc_error",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "No" },
      },
      {
        id: "e-fc-api-render",
        source: "fc_api",
        target: "fc_render",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeDasharray: "6 4" },
        data: { label: "Callback", async: true },
      },
      {
        id: "e-fc-render-end",
        source: "fc_render",
        target: "fc_end",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "" },
      },
      {
        id: "e-fc-error-end",
        source: "fc_error",
        target: "fc_end",
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: "" },
      },
    ],
    meta: baseMeta,
  };

  const orgChartStarter = {
    nodes: [
      {
        id: "org_ceo",
        type: "org_person",
        position: { x: 220, y: 140 },
        data: {
          kind: "org_person",
          department: "Executive",
          deptColor: "#0f172a",
          name: "CEO",
          title: "Chief Executive Officer",
          employmentType: "full_time",
          parentNodeId: null,
          division: null,
          group: "core",
          size: { w: 280, h: 130 },
          collapsed: false,
        },
        style: { zIndex: 30 },
      },
      {
        id: "org_eng_vp",
        type: "org_person",
        position: { x: 160, y: 340 },
        data: {
          kind: "org_person",
          department: "Engineering",
          deptColor: "#2563eb",
          name: "VP Engineering",
          title: "Engineering Lead",
          employmentType: "full_time",
          parentNodeId: "org_ceo",
          division: "Core Product",
          group: "core",
          size: { w: 280, h: 130 },
          collapsed: false,
        },
        style: { zIndex: 30 },
      },
      {
        id: "org_hr_vp",
        type: "org_person",
        position: { x: 520, y: 340 },
        data: {
          kind: "org_person",
          department: "HR",
          deptColor: "#f97316",
          name: "VP People",
          title: "People Operations",
          employmentType: "full_time",
          parentNodeId: "org_ceo",
          division: "Corporate",
          group: "staff",
          size: { w: 280, h: 130 },
          collapsed: false,
        },
        style: { zIndex: 30 },
      },
      {
        id: "org_eng_mgr",
        type: "org_person",
        position: { x: 40, y: 540 },
        data: {
          kind: "org_person",
          department: "Engineering",
          deptColor: "#2563eb",
          name: "Eng Manager",
          title: "Platform",
          employmentType: "full_time",
          parentNodeId: "org_eng_vp",
          division: "Core Product",
          group: "core",
          size: { w: 280, h: 130 },
          collapsed: false,
        },
        style: { zIndex: 30 },
      },
      {
        id: "org_contractor",
        type: "org_person",
        position: { x: 320, y: 540 },
        data: {
          kind: "org_person",
          department: "Engineering",
          deptColor: "#2563eb",
          name: "Contractor",
          title: "Frontend (Temp)",
          employmentType: "contractor",
          parentNodeId: "org_eng_vp",
          division: "Core Product",
          group: "core",
          size: { w: 280, h: 130 },
          collapsed: false,
        },
        style: { zIndex: 30 },
      },
    ],
    edges: [
      { id: "e-ceo-eng", source: "org_ceo", target: "org_eng_vp", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-ceo-hr", source: "org_ceo", target: "org_hr_vp", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-eng-mgr", source: "org_eng_vp", target: "org_eng_mgr", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-eng-ctr", source: "org_eng_vp", target: "org_contractor", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
    ],
    meta: baseMeta,
  };

  const architectureStarter = {
    nodes: [
      {
        id: "arch_region_a",
        type: "architecture_boundary",
        position: { x: 520, y: 120 },
        data: { kind: "architecture_boundary", boundaryKind: "region", label: "Region A (Primary)", size: { w: 1180, h: 620 } },
        style: { zIndex: 5, width: 1180, height: 620 },
      },
      {
        id: "arch_region_b",
        type: "architecture_boundary",
        position: { x: 520, y: 780 },
        data: { kind: "architecture_boundary", boundaryKind: "region", label: "Region B (Failover)", size: { w: 1180, h: 420 } },
        style: { zIndex: 5, width: 1180, height: 420 },
      },
      {
        id: "arch_users",
        type: "architecture",
        position: { x: 120, y: 220 },
        data: { kind: "architecture", nodeKind: "user", layer: "client_edge", label: "Users", subtitle: "Browser / Mobile" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_cdn",
        type: "architecture",
        position: { x: 360, y: 220 },
        data: { kind: "architecture", nodeKind: "cdn", layer: "client_edge", label: "CDN", subtitle: "Edge cache" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_waf",
        type: "architecture",
        position: { x: 360, y: 360 },
        data: { kind: "architecture", nodeKind: "waf", layer: "security_routing", label: "WAF", subtitle: "Rate limit + rules" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_api_gw",
        type: "architecture",
        position: { x: 640, y: 220 },
        data: { kind: "architecture", nodeKind: "api_gateway", layer: "security_routing", label: "API Gateway", subtitle: "REST / gRPC" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_auth",
        type: "architecture",
        position: { x: 640, y: 360 },
        data: { kind: "architecture", nodeKind: "auth_oidc", layer: "security_routing", label: "Auth (OIDC)", subtitle: "OAuth2 / IdP" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_cmd",
        type: "architecture",
        position: { x: 920, y: 200 },
        data: { kind: "architecture", nodeKind: "service", layer: "compute_logic", label: "Command API", subtitle: "Write path (CQRS)" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_query",
        type: "architecture",
        position: { x: 920, y: 340 },
        data: { kind: "architecture", nodeKind: "service", layer: "compute_logic", label: "Query API", subtitle: "Read path (CQRS)" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_write_db",
        type: "architecture",
        position: { x: 1200, y: 200 },
        data: { kind: "architecture", nodeKind: "sql_db", layer: "persistence", label: "Write DB", subtitle: "SQL (RDS)" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_cdc",
        type: "architecture",
        position: { x: 1200, y: 340 },
        data: { kind: "architecture", nodeKind: "cdc_stream", layer: "async_messaging", label: "CDC Stream", subtitle: "Debezium/DMS" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_read_store",
        type: "architecture",
        position: { x: 1480, y: 340 },
        data: { kind: "architecture", nodeKind: "search", layer: "persistence", label: "Read Model", subtitle: "Search/NoSQL" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_event_bus",
        type: "architecture",
        position: { x: 1200, y: 500 },
        data: { kind: "architecture", nodeKind: "event_bus", layer: "async_messaging", label: "Event Bus", subtitle: "Events" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_saga",
        type: "architecture",
        position: { x: 920, y: 500 },
        data: { kind: "architecture", nodeKind: "saga", layer: "async_messaging", label: "Saga", subtitle: "Orchestrator" },
        style: { zIndex: 30 },
      },
      {
        id: "arch_obs",
        type: "architecture",
        position: { x: 1480, y: 200 },
        data: { kind: "architecture", nodeKind: "observability", layer: "observability", label: "Observability", subtitle: "Metrics/Logs/Traces" },
        style: { zIndex: 30 },
      },
    ],
    edges: [
      { id: "e-u-cdn", source: "arch_users", target: "arch_cdn", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-cdn-waf", source: "arch_cdn", target: "arch_waf", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-waf-gw", source: "arch_waf", target: "arch_api_gw", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-gw-auth", source: "arch_api_gw", target: "arch_auth", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "OIDC" } },
      { id: "e-gw-cmd", source: "arch_api_gw", target: "arch_cmd", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "Commands" } },
      { id: "e-gw-query", source: "arch_api_gw", target: "arch_query", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "Queries" } },
      { id: "e-cmd-write", source: "arch_cmd", target: "arch_write_db", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "Write" } },
      { id: "e-write-cdc", source: "arch_write_db", target: "arch_cdc", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: "6 4" }, data: { label: "CDC", async: true } },
      { id: "e-cdc-read", source: "arch_cdc", target: "arch_read_store", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: "6 4" }, data: { label: "Build read model", async: true } },
      { id: "e-query-read", source: "arch_query", target: "arch_read_store", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "Read" } },
      { id: "e-cmd-bus", source: "arch_cmd", target: "arch_event_bus", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: "6 4" }, data: { label: "Domain events", async: true } },
      { id: "e-bus-saga", source: "arch_event_bus", target: "arch_saga", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: "6 4" }, data: { label: "Trigger saga", async: true } },
      { id: "e-any-obs", source: "arch_api_gw", target: "arch_obs", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "Traces/logs" } },
    ],
    meta: baseMeta,
  };

  const dataArchitectureStarter = {
    nodes: [
      {
        id: "da_container_1",
        type: "data_arch_container",
        position: { x: 120, y: 120 },
        data: {
          kind: "data_arch_container",
          label: "Lakehouse Platform",
          containerStyle: "lakehouse",
          size: { w: 1480, h: 720 },
          meta: { border: "#111827" },
        },
        style: { width: 1480, height: 720, zIndex: 5 },
      },
      {
        id: "da_sources",
        type: "data_arch_object",
        position: { x: 80, y: 80 },
        parentId: "da_container_1",
        extent: "parent",
        data: {
          kind: "data_arch_object",
          objectType: "api_source",
          layer: "source",
          label: "Sources",
          subtitle: "Apps / DBs / Files",
          meta: { color: "#f1f5f9", border: "#334155", frequency: "batch", security: "internal" },
          size: { w: 220, h: 96 },
        },
        style: { width: 220, height: 96, zIndex: 30 },
      },
      {
        id: "da_ingest",
        type: "data_arch_object",
        position: { x: 380, y: 80 },
        parentId: "da_container_1",
        extent: "parent",
        data: {
          kind: "data_arch_object",
          objectType: "event_stream",
          layer: "ingestion",
          label: "Ingestion",
          subtitle: "Streams / Queues",
          meta: { color: "#ecfeff", border: "#0891b2", frequency: "stream", security: "internal" },
          size: { w: 240, h: 96 },
        },
        style: { width: 240, height: 96, zIndex: 30 },
      },
      {
        id: "da_process",
        type: "data_arch_object",
        position: { x: 700, y: 80 },
        parentId: "da_container_1",
        extent: "parent",
        data: {
          kind: "data_arch_object",
          objectType: "transform",
          layer: "processing",
          label: "Transform",
          subtitle: "ETL / Spark / dbt",
          meta: { color: "#f5f3ff", border: "#7c3aed", frequency: "batch", security: "internal" },
          size: { w: 260, h: 96 },
        },
        style: { width: 260, height: 96, zIndex: 30 },
      },
      {
        id: "da_store",
        type: "data_arch_object",
        position: { x: 1060, y: 80 },
        parentId: "da_container_1",
        extent: "parent",
        data: {
          kind: "data_arch_object",
          objectType: "warehouse",
          layer: "storage",
          label: "Storage",
          subtitle: "Lake / Warehouse",
          meta: { color: "#ecfdf5", border: "#16a34a", frequency: "batch", security: "confidential" },
          size: { w: 240, h: 96 },
        },
        style: { width: 240, height: 96, zIndex: 30 },
      },
      {
        id: "da_analytics",
        type: "data_arch_object",
        position: { x: 1060, y: 230 },
        parentId: "da_container_1",
        extent: "parent",
        data: {
          kind: "data_arch_object",
          objectType: "bi",
          layer: "analytics",
          label: "Analytics",
          subtitle: "BI / ML / Apps",
          meta: { color: "#fff7ed", border: "#f97316", frequency: "near_real_time", security: "internal" },
          size: { w: 240, h: 96 },
        },
        style: { width: 240, height: 96, zIndex: 30 },
      },
      {
        id: "da_catalog",
        type: "data_arch_object",
        position: { x: 80, y: 230 },
        parentId: "da_container_1",
        extent: "parent",
        data: {
          kind: "data_arch_object",
          objectType: "catalog",
          layer: "governance",
          label: "Catalog",
          subtitle: "Metadata / lineage",
          meta: { color: "#eef2ff", border: "#4f46e5", frequency: "batch", security: "internal" },
          size: { w: 220, h: 96 },
        },
        style: { width: 220, height: 96, zIndex: 30 },
      },
    ],
    edges: [
      { id: "e-da-s-i", source: "da_sources", target: "da_ingest", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "" } },
      { id: "e-da-i-p", source: "da_ingest", target: "da_process", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: "6 4" }, data: { label: "events", async: true } },
      { id: "e-da-p-s", source: "da_process", target: "da_store", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "load" } },
      { id: "e-da-s-a", source: "da_store", target: "da_analytics", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, data: { label: "serve" } },
      { id: "e-da-c-all", source: "da_catalog", target: "da_store", type: "labeled", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: "6 4" }, data: { label: "lineage", async: true } },
    ],
    meta: baseMeta,
  };

  // For now: treat these diagram types as "bpmn-style canvas" until you add dedicated palettes
  // (ERD palette / Architecture palette etc can be added later)
  const diagram_type = opts.diagram_type;

  if (diagram_type === "swimlane") return swimlaneStarter;
  if (diagram_type === "erd") return erdStarter;
  if (diagram_type === "flowchart") return flowchartStarter;
  if (diagram_type === "org_chart") return orgChartStarter;
  if (diagram_type === "system_architecture") return architectureStarter;
  if (diagram_type === "data_architecture") return dataArchitectureStarter;

  // everything else starts as a simple flow canvas
  return bpmnStarter;
}
