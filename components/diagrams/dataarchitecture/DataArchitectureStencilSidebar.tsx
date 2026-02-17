"use client";

import React from "react";
import Link from "next/link";
import {
  Database,
  FileText,
  Globe,
  Radio,
  Layers3,
  Filter,
  Warehouse,
  Boxes,
  BarChart3,
  Brain,
  Shield,
  BadgeCheck,
  RectangleHorizontal,
} from "lucide-react";
import { useDataArchitectureStore } from "@/lib/diagrams/dataArchitectureStore";
import type { DataArchitectureTemplateId } from "@/lib/diagrams/dataArchitectureTemplates";

export type DataArchitectureStencilType =
  | "da_source_file"
  | "da_source_db"
  | "da_source_api"
  | "da_source_stream"
  | "da_ingest_stream"
  | "da_ingest_queue"
  | "da_process_etl"
  | "da_process_transform"
  | "da_store_object"
  | "da_store_warehouse"
  | "da_store_sql"
  | "da_analytics_bi"
  | "da_analytics_ml"
  | "da_govern_catalog"
  | "da_govern_quality"
  | "da_security"
  | "da_container";

export type { DataArchitectureTemplateId };

function Item({
  type,
  label,
  hint,
  Icon,
  swatch,
  onAdd,
}: {
  type: DataArchitectureStencilType;
  label: string;
  hint: string;
  Icon: any;
  swatch: string;
  onAdd?: (t: DataArchitectureStencilType) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/jhatpat-stencil", type);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 cursor-grab active:cursor-grabbing shadow-sm hover:bg-white hover:shadow transition"
      title="Drag onto canvas"
    >
      <div className="h-9 w-1.5 rounded-full" style={{ background: swatch }} aria-hidden="true" />
      <div className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900 truncate">{label}</div>
        <div className="text-[11px] text-slate-500 truncate">{hint}</div>
      </div>
      {onAdd ? (
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-900 shadow-sm hover:shadow"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdd(type);
          }}
          title="Add to canvas"
        >
          + Add
        </button>
      ) : null}
    </div>
  );
}

export default function DataArchitectureStencilSidebar(props: {
  onAddStencil?: (t: DataArchitectureStencilType) => void;
  onLoadTemplate?: (id: DataArchitectureTemplateId) => void;
}) {
  const provider = useDataArchitectureStore((s) => s.provider);
  const setProvider = useDataArchitectureStore((s) => s.setProvider);
  const [q, setQ] = React.useState("");
  const [template, setTemplate] = React.useState<DataArchitectureTemplateId>("aws_lakehouse");

  const onAdd = props.onAddStencil;
  const onLoadTemplate = props.onLoadTemplate;

  const query = q.trim().toLowerCase();
  const matches = (label: string, hint: string) => {
    if (!query) return true;
    return `${label} ${hint}`.toLowerCase().includes(query);
  };

  return (
    <div className="w-[300px] h-full min-h-0 border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-slate-500 uppercase">Stencil / Shape Library</div>
        <div className="mt-1 text-sm font-semibold text-slate-900">Data Architecture</div>
        <div className="mt-1 text-xs text-slate-600 leading-relaxed">
          Drag data objects onto the canvas. Use containers to group domains (e.g., Lakehouse, Resource Group).
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm">
          <div className="text-[11px] font-extrabold text-slate-700">Quick start (recommended)</div>
          <div className="mt-1 text-[11px] text-slate-600 leading-relaxed">
            Pick a template, then tweak labels and add/remove steps. No diagramming knowledge needed.
          </div>
          <div className="mt-2 flex gap-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="flex-1 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="aws_lakehouse">AWS Lakehouse (starter)</option>
              <option value="azure_synapse">Azure Synapse (starter)</option>
              <option value="gcp_modern">GCP Modern Data (starter)</option>
            </select>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800"
              onClick={() => onLoadTemplate?.(template)}
              title="Replace the canvas with a professional starter template"
            >
              Load
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-white"
              onClick={() => onAdd?.("da_source_file")}
            >
              + Source
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-white"
              onClick={() => onAdd?.("da_ingest_stream")}
            >
              + Ingestion
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-white"
              onClick={() => onAdd?.("da_process_transform")}
            >
              + Processing
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-white"
              onClick={() => onAdd?.("da_store_warehouse")}
            >
              + Storage
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-white"
              onClick={() => onAdd?.("da_analytics_bi")}
            >
              + Analytics
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-white"
              onClick={() => onAdd?.("da_container")}
            >
              + Container
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[11px] font-semibold text-slate-600 mb-1">Style</div>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="generic">Generic</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">Google Cloud</option>
          </select>
          <div className="mt-1 text-[11px] text-slate-500">
            Uses same icon-packs folder under <code className="rounded bg-slate-100 px-1.5 py-0.5">public/icon-packs</code>.
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 space-y-2 overflow-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur py-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shapes…"
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-1">Sources</div>
        {matches("Files", "CSV/JSON/Logs") ? <Item type="da_source_file" label="Files" hint="CSV/JSON/Logs" Icon={FileText} swatch="#334155" onAdd={onAdd} /> : null}
        {matches("Databases", "OLTP / legacy") ? <Item type="da_source_db" label="Databases" hint="OLTP / legacy" Icon={Database} swatch="#334155" onAdd={onAdd} /> : null}
        {matches("APIs", "REST/GraphQL") ? <Item type="da_source_api" label="APIs" hint="REST/GraphQL" Icon={Globe} swatch="#334155" onAdd={onAdd} /> : null}
        {matches("Streams", "Events / telemetry") ? <Item type="da_source_stream" label="Streams" hint="Events / telemetry" Icon={Radio} swatch="#334155" onAdd={onAdd} /> : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Ingestion</div>
        {matches("Event Stream", "Kinesis / Event Hubs / PubSub") ? (
          <Item type="da_ingest_stream" label="Event Stream" hint="Kinesis / Event Hubs / PubSub" Icon={Layers3} swatch="#0891b2" onAdd={onAdd} />
        ) : null}
        {matches("Queue", "SQS / Service Bus") ? <Item type="da_ingest_queue" label="Queue" hint="SQS / Service Bus" Icon={Boxes} swatch="#0891b2" onAdd={onAdd} /> : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Processing</div>
        {matches("ETL / Orchestration", "Jobs / pipelines") ? (
          <Item type="da_process_etl" label="ETL / Orchestration" hint="Jobs / pipelines" Icon={Filter} swatch="#7c3aed" onAdd={onAdd} />
        ) : null}
        {matches("Transform", "dbt / Spark / SQL") ? <Item type="da_process_transform" label="Transform" hint="dbt / Spark / SQL" Icon={Filter} swatch="#7c3aed" onAdd={onAdd} /> : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Storage</div>
        {matches("Object Store", "S3 / ADLS / GCS") ? <Item type="da_store_object" label="Object Store" hint="S3 / ADLS / GCS" Icon={Boxes} swatch="#16a34a" onAdd={onAdd} /> : null}
        {matches("SQL DB", "RDS / Azure SQL") ? <Item type="da_store_sql" label="SQL DB" hint="RDS / Azure SQL" Icon={Database} swatch="#16a34a" onAdd={onAdd} /> : null}
        {matches("Warehouse", "Snowflake / BigQuery") ? <Item type="da_store_warehouse" label="Warehouse" hint="Snowflake / BigQuery" Icon={Warehouse} swatch="#16a34a" onAdd={onAdd} /> : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Analytics</div>
        {matches("BI", "Dashboards / reports") ? <Item type="da_analytics_bi" label="BI" hint="Dashboards / reports" Icon={BarChart3} swatch="#f97316" onAdd={onAdd} /> : null}
        {matches("ML", "Training / inference") ? <Item type="da_analytics_ml" label="ML" hint="Training / inference" Icon={Brain} swatch="#f97316" onAdd={onAdd} /> : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Governance</div>
        {matches("Catalog", "Metadata / lineage") ? <Item type="da_govern_catalog" label="Catalog" hint="Metadata / lineage" Icon={BadgeCheck} swatch="#4f46e5" onAdd={onAdd} /> : null}
        {matches("Data Quality", "Validation / alerts") ? (
          <Item type="da_govern_quality" label="Data Quality" hint="Validation / alerts" Icon={BadgeCheck} swatch="#4f46e5" onAdd={onAdd} />
        ) : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Security</div>
        {matches("Security", "RBAC / policies") ? <Item type="da_security" label="Security" hint="RBAC / policies" Icon={Shield} swatch="#e11d48" onAdd={onAdd} /> : null}

        <div className="text-xs font-semibold text-slate-500 uppercase px-1 pt-3">Containers</div>
        {matches("Container", "Group nodes into a boundary") ? (
          <Item type="da_container" label="Container" hint="Group nodes into a boundary" Icon={RectangleHorizontal} swatch="#111827" onAdd={onAdd} />
        ) : null}
      </div>

      <div className="mt-auto p-3 border-t border-slate-200 bg-gradient-to-t from-white/70 to-transparent">
        <div className="text-[11px] text-slate-600 leading-relaxed">
          Tip: Use containers to match AWS/Azure reference diagrams (lakehouse / resource groups / domains).
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/help/diagrams/data-architecture"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-white hover:shadow transition"
          >
            User Guide
          </Link>
          <Link
            href="/help/diagrams/system-architecture/icon-packs"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-white hover:shadow transition"
          >
            Icon Packs Guide
          </Link>
          <Link
            href="/tools/diagrams"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-white hover:shadow transition"
          >
            Recents
          </Link>
        </div>
      </div>
    </div>
  );
}
