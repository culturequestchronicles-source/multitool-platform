"use client";

import React, { memo, useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
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
} from "lucide-react";
import { DATA_LAYER_COLORS, type DataArchitectureNodeData } from "@/lib/diagrams/dataArchitecture";
import { useDataArchitectureStore } from "@/lib/diagrams/dataArchitectureStore";

function iconKeyFor(objectType: string) {
  const t = String(objectType ?? "");
  if (t === "file_source") return "file";
  if (t === "database_source") return "database";
  if (t === "api_source") return "api";
  if (t === "stream_source") return "stream";
  if (t === "event_stream") return "event_stream";
  if (t === "queue") return "queue";
  if (t === "etl") return "etl";
  if (t === "transform") return "transform";
  if (t === "object_store") return "object_store";
  if (t === "sql_db") return "sql_db";
  if (t === "warehouse") return "warehouse";
  if (t === "bi") return "bi";
  if (t === "ml") return "ml";
  if (t === "catalog" || t === "quality" || t === "observability") return "govern";
  if (t === "security") return "security";
  return "default";
}

export default memo(function DataArchitectureNode(props: NodeProps) {
  const provider = useDataArchitectureStore((s) => s.provider);
  const { data, selected } = props;
  const d = (data ?? {}) as Partial<DataArchitectureNodeData>;

  const label = String(d.label ?? "Data Object");
  const subtitle = String(d.subtitle ?? "");
  const layer = String(d.layer ?? "processing") as any;
  const objectType = String(d.objectType ?? "");

  const layerColor = DATA_LAYER_COLORS[layer as any] ?? DATA_LAYER_COLORS.processing;
  const fill = String(d.meta?.color ?? layerColor.fill);
  const border = String(d.meta?.border ?? layerColor.border);

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 220);
    const h = Number(d.size?.h ?? 96);
    return { w: Math.max(160, Math.min(720, w)), h: Math.max(72, Math.min(520, h)) };
  }, [d.size?.h, d.size?.w]);

  const iconSrc = String(d.meta?.iconSrc ?? "");
  const iconKey = useMemo(() => iconKeyFor(objectType), [objectType]);

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={72}
        maxWidth={720}
        maxHeight={520}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: 14,
          border: `2px solid ${border}`,
          background: fill,
          boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.12)" : "0 10px 22px rgba(0,0,0,0.08)",
          position: "relative",
          padding: 12,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
          color: provider === "generic" ? "#0f172a" : "#0f172a",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
              overflow: "hidden",
            }}
            aria-hidden="true"
          >
            {iconSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconSrc} alt="" style={{ width: 26, height: 26, objectFit: "contain" }} />
            ) : iconKey === "file" ? (
              <FileText size={20} color="#0f172a" />
            ) : iconKey === "database" || iconKey === "sql_db" ? (
              <Database size={20} color="#0f172a" />
            ) : iconKey === "api" ? (
              <Globe size={20} color="#0f172a" />
            ) : iconKey === "stream" ? (
              <Radio size={20} color="#0f172a" />
            ) : iconKey === "event_stream" ? (
              <Layers3 size={20} color="#0f172a" />
            ) : iconKey === "etl" || iconKey === "transform" ? (
              <Filter size={20} color="#0f172a" />
            ) : iconKey === "warehouse" ? (
              <Warehouse size={20} color="#0f172a" />
            ) : iconKey === "bi" ? (
              <BarChart3 size={20} color="#0f172a" />
            ) : iconKey === "ml" ? (
              <Brain size={20} color="#0f172a" />
            ) : iconKey === "govern" ? (
              <BadgeCheck size={20} color="#0f172a" />
            ) : iconKey === "security" ? (
              <Shield size={20} color="#0f172a" />
            ) : (
              <Boxes size={20} color="#0f172a" />
            )}
          </div>

          <div style={{ minWidth: 0, flex: "1 1 auto" }}>
            <div style={{ fontWeight: 950, fontSize: 14, lineHeight: 1.15, color: "#0f172a" }}>{label}</div>
            {subtitle ? (
              <div style={{ marginTop: 2, fontSize: 11, fontWeight: 700, color: "rgba(15,23,42,0.70)" }}>
                {subtitle}
              </div>
            ) : null}
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 950,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.14)",
                  background: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {layerColor.label}
              </span>
              {String(d.meta?.frequency ?? "").trim() ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(15,23,42,0.14)",
                    background: "rgba(255,255,255,0.55)",
                  }}
                >
                  {String(d.meta?.frequency)}
                </span>
              ) : null}
              {String(d.meta?.security ?? "").trim() ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(15,23,42,0.14)",
                    background: "rgba(255,255,255,0.55)",
                  }}
                >
                  {String(d.meta?.security)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* handles */}
        <Handle type="source" position={Position.Right} id="right" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.75)" }} />
        <Handle type="target" position={Position.Left} id="left" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.75)" }} />
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.75)" }} />
        <Handle type="target" position={Position.Top} id="top" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.75)" }} />
      </div>
    </div>
  );
});
