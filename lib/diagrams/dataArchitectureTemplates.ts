import type { Edge, Node } from "@xyflow/react";
import type { DataArchitectureProvider } from "@/lib/diagrams/dataArchitecture";

export type DataArchitectureTemplateId = "aws_lakehouse" | "azure_synapse" | "gcp_modern";

type Template = {
  id: DataArchitectureTemplateId;
  title: string;
  provider: DataArchitectureProvider;
  direction: "LR" | "TB";
  nodes: Node[];
  edges: Edge[];
};

function baseTemplate(provider: DataArchitectureProvider): Template {
  // Keep this minimal and deterministic (no guessing). Icons are only used when we know the file exists in repo.
  const isAws = provider === "aws";
  const isAzure = provider === "azure";
  const isGcp = provider === "gcp";

  const icon = (key: string) => {
    if (isAws) {
      const map: Record<string, string> = {
        object_store: "/icon-packs/aws/icons/s3.svg",
        event_stream: "/icon-packs/aws/icons/kinesis-data-streams.svg",
        sql_db: "/icon-packs/aws/icons/rds.svg",
        nosql_db: "/icon-packs/aws/icons/dynamodb.svg",
        transform: "/icon-packs/aws/icons/lambda.svg",
        observability: "/icon-packs/aws/icons/cloudwatch.svg",
      };
      return map[key] ?? undefined;
    }
    if (isAzure) {
      const map: Record<string, string> = {
        object_store: "/icon-packs/azure/icons/storage-accounts.svg",
        event_stream: "/icon-packs/azure/icons/event-hubs.svg",
        sql_db: "/icon-packs/azure/icons/sql-database.svg",
        nosql_db: "/icon-packs/azure/icons/cosmos-db.svg",
        transform: "/icon-packs/azure/icons/functions.svg",
        observability: "/icon-packs/azure/icons/monitor.svg",
      };
      return map[key] ?? undefined;
    }
    if (isGcp) {
      const map: Record<string, string> = {
        object_store: "/icon-packs/gcp/icons/storage.svg",
        sql_db: "/icon-packs/gcp/icons/databases.svg",
        transform: "/icon-packs/gcp/icons/operations.svg",
        observability: "/icon-packs/gcp/icons/observability.svg",
        event_stream: "/icon-packs/gcp/icons/integration.svg",
      };
      return map[key] ?? undefined;
    }
    return undefined;
  };

  const mainContainerStyle = isAzure ? "resource_group" : isAws ? "platform" : isGcp ? "workspace" : "lakehouse";

  const nodes: Node[] = [
    {
      id: "da_main",
      type: "data_arch_container",
      position: { x: 200, y: 140 },
      data: {
        kind: "data_arch_container",
        label: isAzure ? "Data Platform Resource Group" : isGcp ? "Data Platform Workspace" : "CPE Lakehouse",
        containerStyle: mainContainerStyle,
        size: { w: 1200, h: 620 },
        meta: { border: "#111827" },
      },
      style: { zIndex: 5 },
    },
    {
      id: "da_domain",
      type: "data_arch_container",
      position: { x: 1480, y: 140 },
      data: {
        kind: "data_arch_container",
        label: "Data Usage & Integrations",
        containerStyle: "domain",
        size: { w: 780, h: 620 },
        meta: { border: "#111827" },
      },
      style: { zIndex: 5 },
    },
    {
      id: "da_files",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 60, y: 120 },
      data: {
        kind: "data_arch_object",
        objectType: "file_source",
        provider,
        layer: "source",
        label: "Files",
        subtitle: "CSV/JSON/Logs",
        size: { w: 240, h: 104 },
        meta: { color: "rgba(241,245,249,0.95)", border: "#334155", frequency: "batch", security: "internal" },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_oltp",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 60, y: 250 },
      data: {
        kind: "data_arch_object",
        objectType: "sql_db",
        provider,
        layer: "source",
        label: isAzure ? "OLTP (Azure SQL)" : isGcp ? "OLTP (Cloud SQL)" : "OLTP DB",
        subtitle: "Orders / Billing",
        size: { w: 240, h: 104 },
        meta: {
          color: "rgba(241,245,249,0.95)",
          border: "#334155",
          iconSrc: icon("sql_db"),
          frequency: "near_real_time",
          security: "confidential",
        },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_api",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 60, y: 380 },
      data: {
        kind: "data_arch_object",
        objectType: "api_source",
        provider,
        layer: "source",
        label: "Partner API",
        subtitle: "REST/GraphQL",
        size: { w: 240, h: 104 },
        meta: { color: "rgba(241,245,249,0.95)", border: "#334155", frequency: "near_real_time", security: "internal" },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_stream",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 340, y: 200 },
      data: {
        kind: "data_arch_object",
        objectType: "event_stream",
        provider,
        layer: "ingestion",
        label: isAzure ? "Event Hubs" : isGcp ? "Pub/Sub" : "Event Stream",
        subtitle: isAzure ? "Ingest / buffer" : isGcp ? "Ingest / buffer" : "Kinesis / Event Hubs",
        size: { w: 270, h: 104 },
        meta: {
          color: "rgba(224,242,254,0.92)",
          border: "#0284c7",
          iconSrc: icon("event_stream"),
          frequency: "stream",
          security: "internal",
        },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_etl",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 650, y: 170 },
      data: {
        kind: "data_arch_object",
        objectType: "etl",
        provider,
        layer: "processing",
        label: isAzure ? "Pipelines" : isGcp ? "Pipelines" : "ETL / Orchestration",
        subtitle: isAzure ? "ADF / Synapse" : isGcp ? "Dataflow / Composer" : "Jobs / workflows",
        size: { w: 300, h: 104 },
        meta: { color: "rgba(237,233,254,0.92)", border: "#7c3aed", frequency: "batch", security: "internal" },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_transform",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 650, y: 310 },
      data: {
        kind: "data_arch_object",
        objectType: "transform",
        provider,
        layer: "processing",
        label: "Transform",
        subtitle: "dbt / Spark / SQL",
        size: { w: 300, h: 104 },
        meta: { color: "rgba(237,233,254,0.92)", border: "#7c3aed", iconSrc: icon("transform"), frequency: "batch", security: "internal" },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_lake",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 990, y: 190 },
      data: {
        kind: "data_arch_object",
        objectType: "object_store",
        provider,
        layer: "storage",
        label: isAzure ? "Data Lake" : isGcp ? "Object Store" : "Data Lake",
        subtitle: isAzure ? "ADLS Gen2" : isGcp ? "GCS" : "Raw / Bronze",
        size: { w: 260, h: 104 },
        meta: {
          color: "rgba(220,252,231,0.92)",
          border: "#16a34a",
          iconSrc: icon("object_store"),
          frequency: "batch",
          security: "confidential",
        },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_wh",
      type: "data_arch_object",
      parentId: "da_main",
      extent: "parent",
      position: { x: 990, y: 320 },
      data: {
        kind: "data_arch_object",
        objectType: "warehouse",
        provider,
        layer: "storage",
        label: isAzure ? "Warehouse" : isGcp ? "Warehouse" : "Warehouse",
        subtitle: isAzure ? "Synapse SQL" : isGcp ? "BigQuery" : "Curated / Gold",
        size: { w: 260, h: 104 },
        meta: { color: "rgba(220,252,231,0.92)", border: "#16a34a", frequency: "batch", security: "confidential" },
      },
      style: { zIndex: 30 },
    },
    {
      id: "da_bi",
      type: "data_arch_object",
      parentId: "da_domain",
      extent: "parent",
      position: { x: 120, y: 210 },
      data: {
        kind: "data_arch_object",
        objectType: "bi",
        provider,
        layer: "analytics",
        label: isAzure ? "Power BI" : isGcp ? "Looker" : "BI / Dashboards",
        subtitle: "Dashboards",
        size: { w: 280, h: 104 },
        meta: { color: "rgba(255,237,213,0.92)", border: "#f97316", frequency: "near_real_time", security: "internal" },
      },
      style: { zIndex: 30 },
    },
  ];

  const edges: Edge[] = [
    { id: "e_files_stream", type: "labeled", source: "da_files", target: "da_stream", data: { label: "ingest" }, style: { strokeWidth: 2, stroke: "#334155" } },
    { id: "e_oltp_stream", type: "labeled", source: "da_oltp", target: "da_stream", data: { label: "cdc", async: true }, style: { strokeWidth: 2, stroke: "#334155", strokeDasharray: "6 4" } },
    { id: "e_api_stream", type: "labeled", source: "da_api", target: "da_stream", data: { label: "events", async: true }, style: { strokeWidth: 2, stroke: "#334155", strokeDasharray: "6 4" } },
    { id: "e_stream_etl", type: "labeled", source: "da_stream", target: "da_etl", data: { label: "buffer" }, style: { strokeWidth: 2, stroke: "#334155" } },
    { id: "e_etl_transform", type: "labeled", source: "da_etl", target: "da_transform", data: { label: "batch" }, style: { strokeWidth: 2, stroke: "#334155" } },
    { id: "e_transform_lake", type: "labeled", source: "da_transform", target: "da_lake", data: { label: "write" }, style: { strokeWidth: 2, stroke: "#334155" } },
    { id: "e_lake_wh", type: "labeled", source: "da_lake", target: "da_wh", data: { label: "curate" }, style: { strokeWidth: 2, stroke: "#334155" } },
    { id: "e_wh_bi", type: "labeled", source: "da_wh", target: "da_bi", data: { label: "serve" }, style: { strokeWidth: 2, stroke: "#334155" } },
  ];

  const id: DataArchitectureTemplateId = isAzure ? "azure_synapse" : isGcp ? "gcp_modern" : "aws_lakehouse";
  const title = isAzure ? "Data Architecture Diagram (Azure sample)" : isGcp ? "Data Architecture Diagram (GCP sample)" : "Data Architecture Diagram (AWS sample)";

  return { id, title, provider, direction: "LR", nodes, edges };
}

export function getDataArchitectureTemplate(templateId: DataArchitectureTemplateId): Template {
  if (templateId === "azure_synapse") return baseTemplate("azure");
  if (templateId === "gcp_modern") return baseTemplate("gcp");
  return baseTemplate("aws");
}

