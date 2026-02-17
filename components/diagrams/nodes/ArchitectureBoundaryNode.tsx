"use client";

import React, { memo, useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export type ArchitectureBoundaryKind = "network" | "region" | "cluster" | "group";

export type ArchitectureBoundaryNodeData = {
  kind: "architecture_boundary";
  boundaryKind: ArchitectureBoundaryKind;
  label: string;
  size?: { w: number; h: number };
  meta?: { border?: string };
  collapsed?: boolean;
  parentNodeId?: string | null;
};

export default memo(function ArchitectureBoundaryNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as Partial<ArchitectureBoundaryNodeData>;

  const theme = (d as any)?.theme as any;
  const archProvider = String((d as any)?.archProvider ?? "generic");
  const styled = archProvider !== "generic";

  const label = String(d.label ?? "Boundary");
  const boundaryKind = (d.boundaryKind ?? "region") as ArchitectureBoundaryKind;
  const border = String(d.meta?.border ?? (styled ? String(theme?.accent ?? "#2563eb") : "#334155"));

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 820);
    const h = Number(d.size?.h ?? 420);
    return { w: Math.max(340, Math.min(4000, w)), h: Math.max(220, Math.min(2600, h)) };
  }, [d.size?.h, d.size?.w]);

  const collapsed = Boolean((d as any)?.collapsed);

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={340}
        minHeight={220}
        maxWidth={4000}
        maxHeight={2600}
        onResizeEnd={(_, __, size?: any) => {
          if (!size) return;
          editor.resizeNode(id, size.width, size.height);
        }}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: styled ? 10 : 22,
          border: styled ? `2px dashed ${border}` : `2px dashed ${border}`,
          background: styled ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.35)",
          boxShadow: styled
            ? selected
              ? "0 10px 24px rgba(0,0,0,0.10)"
              : "0 4px 10px rgba(0,0,0,0.06)"
            : selected
              ? "0 18px 36px rgba(0,0,0,0.10)"
              : "0 10px 22px rgba(0,0,0,0.06)",
          position: "relative",
          padding: styled ? 18 : 14,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
          color: "#0f172a",
        }}
      >
        {styled ? (
          <div
            style={{
              position: "absolute",
              left: 18,
              top: -10,
              padding: "4px 10px",
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(15,23,42,0.16)",
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span style={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 11, fontWeight: 950, color: "#1e293b" }}>
              {boundaryKind}
            </span>
            <span style={{ fontSize: 12, fontWeight: 950, color: "#0f172a" }}>{label}</span>
          </div>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(15,23,42,0.14)",
              fontSize: 12,
              fontWeight: 950,
              letterSpacing: 0.3,
            }}
          >
            <span style={{ textTransform: "uppercase", color: "#334155" }}>{boundaryKind}</span>
            <span style={{ color: "#0f172a" }}>{label}</span>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.toggleCollapsed(id);
          }}
          title={collapsed ? "Expand boundary" : "Collapse boundary"}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 30,
            height: 30,
            borderRadius: styled ? 8 : 999,
            border: "1px solid rgba(15,23,42,0.20)",
            background: "rgba(255,255,255,0.95)",
            boxShadow: styled ? "0 4px 10px rgba(0,0,0,0.08)" : "0 8px 16px rgba(0,0,0,0.08)",
            fontWeight: 950,
            fontSize: 16,
            lineHeight: "30px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          {collapsed ? "+" : "−"}
        </button>
      </div>
    </div>
  );
});
