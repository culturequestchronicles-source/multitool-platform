"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";
import { useIconPackStore } from "@/lib/diagrams/iconPackStore";
import { normalizeIconSrc } from "@/lib/diagrams/iconPacks";
import {
  Globe,
  Smartphone,
  Shield,
  Waypoints,
  KeyRound,
  Boxes,
  SquareFunction,
  Workflow,
  Mail,
  Activity,
  Table,
  Database,
  HardDrive,
  Search,
  BarChart3,
  Bug,
} from "lucide-react";

export type ArchitectureNodeKind =
  | "user"
  | "web"
  | "mobile"
  | "cdn"
  | "waf"
  | "api_gateway"
  | "auth_oidc"
  | "service"
  | "lambda"
  | "event_bus"
  | "queue"
  | "cdc_stream"
  | "saga"
  | "sql_db"
  | "nosql_db"
  | "object_store"
  | "search"
  | "observability"
  | "metrics"
  | "logging";

export type ArchitectureLayer =
  | "client_edge"
  | "security_routing"
  | "compute_logic"
  | "async_messaging"
  | "persistence"
  | "observability";

export type ArchitectureNodeData = {
  kind: "architecture";
  nodeKind: ArchitectureNodeKind;
  layer: ArchitectureLayer;
  label: string;
  subtitle?: string;
  meta?: { fill?: string; border?: string; iconKey?: string };
  size?: { w: number; h: number };
  collapsed?: boolean;
  parentNodeId?: string | null;
};

function providerAccent(provider: string, fallback: string) {
  switch (provider) {
    case "aws":
      return "#FF9900";
    case "azure":
      return "#0078D4";
    case "gcp":
      return "#4285F4";
    case "cncf":
      return "#00ADEF";
    default:
      return fallback;
  }
}

function NodeKindIcon({ kind, inverted }: { kind: ArchitectureNodeKind; inverted?: boolean }) {
  const cls = inverted ? "h-5 w-5 text-white" : "h-5 w-5 text-slate-800";
  switch (kind) {
    case "user":
    case "web":
    case "cdn":
      return <Globe className={cls} />;
    case "mobile":
      return <Smartphone className={cls} />;
    case "waf":
      return <Shield className={cls} />;
    case "api_gateway":
      return <Waypoints className={cls} />;
    case "auth_oidc":
      return <KeyRound className={cls} />;
    case "service":
      return <Boxes className={cls} />;
    case "lambda":
      return <SquareFunction className={cls} />;
    case "event_bus":
    case "saga":
    case "observability":
      return <Workflow className={cls} />;
    case "queue":
      return <Mail className={cls} />;
    case "cdc_stream":
      return <Activity className={cls} />;
    case "sql_db":
      return <Table className={cls} />;
    case "nosql_db":
      return <Database className={cls} />;
    case "object_store":
      return <HardDrive className={cls} />;
    case "search":
      return <Search className={cls} />;
    case "metrics":
      return <BarChart3 className={cls} />;
    case "logging":
      return <Bug className={cls} />;
  }
}

function defaultFill(layer: ArchitectureLayer) {
  switch (layer) {
    case "client_edge":
      return "#EEF2FF"; // indigo-50
    case "security_routing":
      return "#ECFEFF"; // cyan-50
    case "compute_logic":
      return "#F1F5F9"; // slate-100
    case "async_messaging":
      return "#FDF2F8"; // pink-50
    case "persistence":
      return "#FFFBEB"; // amber-50
    case "observability":
      return "#F0FDF4"; // green-50
  }
}

function layerAccent(layer: ArchitectureLayer) {
  switch (layer) {
    case "client_edge":
      return "#6366f1";
    case "security_routing":
      return "#06b6d4";
    case "compute_logic":
      return "#64748b";
    case "async_messaging":
      return "#ec4899";
    case "persistence":
      return "#f59e0b";
    case "observability":
      return "#22c55e";
  }
}

function Handles() {
  const common: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 999,
    border: "2px solid #0f172a",
    background: "#fff",
  };
  const src: React.CSSProperties = { ...common, background: "#0f172a" };
  return (
    <>
      <Handle id="t-top" type="target" position={Position.Top} style={{ ...common, top: -6 }} />
      <Handle id="t-right" type="target" position={Position.Right} style={{ ...common, right: -6 }} />
      <Handle id="t-bottom" type="target" position={Position.Bottom} style={{ ...common, bottom: -6 }} />
      <Handle id="t-left" type="target" position={Position.Left} style={{ ...common, left: -6 }} />

      <Handle id="s-top" type="source" position={Position.Top} style={{ ...src, top: -6, left: "55%" }} />
      <Handle id="s-right" type="source" position={Position.Right} style={{ ...src, right: -6, top: "55%" }} />
      <Handle id="s-bottom" type="source" position={Position.Bottom} style={{ ...src, bottom: -6, left: "55%" }} />
      <Handle id="s-left" type="source" position={Position.Left} style={{ ...src, left: -6, top: "55%" }} />
    </>
  );
}

export default memo(function ArchitectureNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as Partial<ArchitectureNodeData>;

  const theme = (d as any)?.theme as any;
  const archProvider = String((d as any)?.archProvider ?? "generic");
  const styled = archProvider !== "generic";
  const manifest = useIconPackStore((s) =>
    archProvider === "aws" || archProvider === "azure" || archProvider === "gcp" || archProvider === "cncf" ? s.manifests[archProvider] : null
  );

  const nodeKind = (d.nodeKind ?? "service") as ArchitectureNodeKind;
  const layer = (d.layer ?? "compute_logic") as ArchitectureLayer;
  const label = String(d.label ?? "Component");
  const subtitle = String(d.subtitle ?? "");

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 240);
    const h = Number(d.size?.h ?? 110);
    return { w: Math.max(180, Math.min(520, w)), h: Math.max(90, Math.min(340, h)) };
  }, [d.size?.h, d.size?.w]);

  const fill = String(d.meta?.fill ?? (styled ? "#ffffff" : defaultFill(layer)));
  const border = String(d.meta?.border ?? (styled ? "#334155" : "#0f172a"));
  const accent = styled ? providerAccent(archProvider, String(theme?.accent ?? "#2563eb")) : String(theme?.accent ?? "#2563eb");
  const iconKey = String(d.meta?.iconKey ?? nodeKind);
  const iconSrc = styled && manifest ? normalizeIconSrc(manifest.nodes?.[iconKey]?.src) : null;
  const iconAlt = styled && manifest ? String(manifest.nodes?.[iconKey]?.alt ?? label) : label;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  useEffect(() => setDraft(label), [label]);

  const commit = useCallback(() => {
    const next = draft.trim() || "Component";
    setEditing(false);
    editor.renameNode(id, next);
  }, [draft, editor, id]);

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={90}
        maxWidth={520}
        maxHeight={340}
        onResizeEnd={(_, __, size?: any) => {
          if (!size) return;
          editor.resizeNode(id, size.width, size.height);
        }}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: styled ? 10 : 18,
          border: styled ? `1.5px solid ${border}` : `2px solid ${border}`,
          background: fill,
          boxShadow: styled
            ? selected
              ? "0 12px 26px rgba(0,0,0,0.16)"
              : "0 2px 10px rgba(0,0,0,0.08)"
            : selected
              ? "0 18px 36px rgba(0,0,0,0.18)"
              : "0 10px 22px rgba(0,0,0,0.10)",
          padding: styled ? 14 : 12,
          position: "relative",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
          color: "#0f172a",
        }}
      >
        {styled ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: 4,
              background: layerAccent(layer),
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              opacity: 0.9,
            }}
          />
        ) : null}
        <Handles />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: styled ? 999 : 12,
                border: styled ? `1px solid rgba(15,23,42,0.14)` : "1px solid rgba(15,23,42,0.18)",
                background: iconSrc ? "transparent" : styled ? accent : "rgba(255,255,255,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto",
              }}
            >
              {iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconSrc} alt={iconAlt} style={{ width: 22, height: 22, display: "block" }} />
              ) : (
                <NodeKindIcon kind={nodeKind} inverted={styled} />
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              {!editing ? (
                <div
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                  }}
                  title="Double-click to edit label"
                  style={{
                    fontWeight: 950,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "text",
                  }}
                >
                  {label}
                </div>
              ) : (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commit();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setEditing(false);
                      setDraft(label);
                    }
                  }}
                  style={{
                    width: Math.min(260, dims.w - 120),
                    padding: "6px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(15,23,42,0.20)",
                    outline: "none",
                    fontSize: 13,
                    fontWeight: 900,
                    background: "rgba(255,255,255,0.9)",
                  }}
                />
              )}

              {subtitle ? (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: styled ? "rgba(15,23,42,0.72)" : "rgba(15,23,42,0.65)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {subtitle}
                </div>
              ) : (
                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: styled ? "rgba(15,23,42,0.55)" : "rgba(15,23,42,0.45)" }}>
                  {layer.replaceAll("_", " ")}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: styled ? "1px solid rgba(15,23,42,0.18)" : "1px solid rgba(15,23,42,0.16)",
              background: styled ? "rgba(248,250,252,0.85)" : "rgba(255,255,255,0.55)",
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              flex: "0 0 auto",
            }}
          >
            {nodeKind.replaceAll("_", " ")}
          </div>
        </div>
      </div>
    </div>
  );
});
