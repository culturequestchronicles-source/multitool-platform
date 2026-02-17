"use client";

import React from "react";
import Link from "next/link";
import { useArchitectureSettingsStore } from "@/lib/diagrams/architectureStore";
import { useIconPackStore } from "@/lib/diagrams/iconPackStore";
import {
  Globe,
  Smartphone,
  Shield,
  Waypoints,
  KeyRound,
  Boxes,
  SquareFunction,
  Network,
  Database,
  Table,
  HardDrive,
  Search,
  Activity,
  BarChart3,
  Bug,
  Mail,
  Workflow,
  Layers3,
} from "lucide-react";

export type ArchitectureStencilType =
  | "arch_boundary_network"
  | "arch_user"
  | "arch_web"
  | "arch_mobile"
  | "arch_cdn"
  | "arch_waf"
  | "arch_api_gateway"
  | "arch_auth_oidc"
  | "arch_service"
  | "arch_k8s"
  | "arch_lambda"
  | "arch_event_bus"
  | "arch_queue"
  | "arch_cdc_stream"
  | "arch_saga"
  | "arch_sql_db"
  | "arch_nosql_db"
  | "arch_object_store"
  | "arch_search"
  | "arch_observability"
  | "arch_metrics"
  | "arch_logging"
  | "arch_boundary_group"
  | "arch_boundary_region"
  | "arch_boundary_cluster";

function StencilItem({
  type,
  label,
  hint,
  Icon,
  swatch,
}: {
  type: ArchitectureStencilType;
  label: string;
  hint: string;
  Icon: any;
  swatch?: string;
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
      <div
        className="h-9 w-1.5 rounded-full"
        style={{ background: swatch ?? "rgba(15,23,42,0.10)" }}
        aria-hidden="true"
      />
      <div
        className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition"
        style={{ backgroundColor: swatch ? `${swatch}12` : undefined, borderColor: swatch ? `${swatch}55` : undefined }}
      >
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-[11px] text-slate-500">{hint}</div>
      </div>
    </div>
  );
}

export default function ArchitectureStencilSidebar() {
  const provider = useArchitectureSettingsStore((s) => s.provider);
  const setProvider = useArchitectureSettingsStore((s) => s.setProvider);
  const iconManifest = useIconPackStore((s) => {
    const p = String(provider ?? "generic");
    if (p !== "aws" && p !== "azure" && p !== "gcp" && p !== "cncf") return undefined;
    return s.manifests[p];
  });

  return (
    <div className="w-[300px] h-full min-h-0 border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Stencil / Shape Library</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">System Architecture</div>
        <div className="mt-1 text-xs text-gray-500 leading-relaxed">
          Drag components onto the canvas. Connect with orthogonal edges. Use dashed edges for async/event flows.
        </div>

        <div className="mt-3">
          <div className="text-[11px] font-semibold text-gray-600 mb-1">Style</div>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="generic">Generic</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">Google Cloud</option>
            <option value="cncf">CNCF</option>
          </select>
          {String(provider ?? "generic") !== "generic" && iconManifest === null ? (
            <div className="mt-1 text-[11px] text-rose-700">
              Icon pack not found: `public/icon-packs/{String(provider)}/manifest.json`
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 space-y-2 overflow-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-1">Client / Edge</div>
        <StencilItem type="arch_user" label="Users" Icon={Globe} hint="Browsers / external clients" swatch="#6366f1" />
        <StencilItem type="arch_web" label="Web App" Icon={Globe} hint="SPA/SSR frontend" swatch="#6366f1" />
        <StencilItem type="arch_mobile" label="Mobile App" Icon={Smartphone} hint="iOS/Android" swatch="#6366f1" />
        <StencilItem type="arch_cdn" label="CDN" Icon={Network} hint="CDN / edge caching" swatch="#6366f1" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Security / Routing</div>
        <StencilItem type="arch_waf" label="WAF" Icon={Shield} hint="WAF / rate limiting" swatch="#06b6d4" />
        <StencilItem type="arch_api_gateway" label="API Gateway" Icon={Waypoints} hint="Routing / throttling" swatch="#06b6d4" />
        <StencilItem type="arch_auth_oidc" label="Auth (OIDC)" Icon={KeyRound} hint="OAuth2 / OIDC IdP" swatch="#06b6d4" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Compute / Logic</div>
        <StencilItem type="arch_service" label="Microservice" Icon={Boxes} hint="Service / module" swatch="#64748b" />
        <StencilItem type="arch_k8s" label="K8s Cluster" Icon={Layers3} hint="Cluster boundary node" swatch="#64748b" />
        <StencilItem type="arch_lambda" label="Serverless" Icon={SquareFunction} hint="Lambda / function" swatch="#64748b" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Async / Patterns</div>
        <StencilItem type="arch_event_bus" label="Event Bus" Icon={Workflow} hint="EventBridge / pub-sub" swatch="#ec4899" />
        <StencilItem type="arch_queue" label="Queue" Icon={Mail} hint="SQS / RabbitMQ / Kafka topic" swatch="#ec4899" />
        <StencilItem type="arch_cdc_stream" label="CDC Stream" Icon={Activity} hint="Debezium / DMS / Kinesis" swatch="#ec4899" />
        <StencilItem type="arch_saga" label="Saga Orchestrator" Icon={Workflow} hint="Distributed transaction flow" swatch="#ec4899" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Persistence</div>
        <StencilItem type="arch_sql_db" label="SQL DB" Icon={Table} hint="RDS / Postgres / MySQL" swatch="#f59e0b" />
        <StencilItem type="arch_nosql_db" label="NoSQL DB" Icon={Database} hint="DynamoDB / MongoDB" swatch="#f59e0b" />
        <StencilItem type="arch_object_store" label="Object Store" Icon={HardDrive} hint="S3 / blob storage / lake" swatch="#f59e0b" />
        <StencilItem type="arch_search" label="Search" Icon={Search} hint="OpenSearch / Elastic" swatch="#f59e0b" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Observability</div>
        <StencilItem type="arch_observability" label="Observability" Icon={BarChart3} hint="Dashboards / tracing hub" swatch="#22c55e" />
        <StencilItem type="arch_metrics" label="Metrics" Icon={BarChart3} hint="Prometheus / CloudWatch metrics" swatch="#22c55e" />
        <StencilItem type="arch_logging" label="Logging" Icon={Bug} hint="Logs / SIEM" swatch="#22c55e" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Boundaries</div>
        <StencilItem type="arch_boundary_network" label="Cloud/Network Box" Icon={Network} hint="Top-level container" swatch="#3b82f6" />
        <StencilItem type="arch_boundary_group" label="Group Box" Icon={Layers3} hint="Section grouping (e.g., Frontend)" swatch="#3b82f6" />
        <StencilItem type="arch_boundary_region" label="Region Boundary" Icon={Layers3} hint="Multi-region / multi-AZ" swatch="#3b82f6" />
        <StencilItem type="arch_boundary_cluster" label="VPC / Cluster Boundary" Icon={Layers3} hint="Network/cluster grouping" swatch="#3b82f6" />
      </div>

      <div className="shrink-0 p-3 border-t bg-white">
        <div className="text-[11px] text-gray-500 leading-relaxed">
          Tip: Put <b>CQRS</b> as separate Command/Query services and separate write/read stores. Use <b>CDC Stream</b> to
          feed the read model/search.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/help/diagrams/system-architecture"
            className="inline-flex items-center justify-center rounded-xl border bg-white px-3 py-2 text-xs font-bold text-gray-900 hover:bg-gray-50"
          >
            User Guide
          </Link>
          <Link
            href="/help/how-to"
            className="inline-flex items-center justify-center rounded-xl border bg-white px-3 py-2 text-xs font-bold text-gray-900 hover:bg-gray-50"
          >
            How-to
          </Link>
          <Link
            href="/tools/diagrams"
            className="inline-flex items-center justify-center rounded-xl border bg-white px-3 py-2 text-xs font-bold text-gray-900 hover:bg-gray-50"
          >
            Recents
          </Link>
        </div>
      </div>
    </div>
  );
}
