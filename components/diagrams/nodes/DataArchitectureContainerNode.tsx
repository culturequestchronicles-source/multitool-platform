"use client";

import React, { memo, useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { NodeResizer } from "@xyflow/react";
import type { DataArchitectureNodeData } from "@/lib/diagrams/dataArchitecture";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export default memo(function DataArchitectureContainerNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as Partial<DataArchitectureNodeData>;

  const label = String(d.label ?? "Container");
  const style = String(d.containerStyle ?? "lakehouse");
  const border = String(d.meta?.border ?? "#111827");

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 980);
    const h = Number(d.size?.h ?? 520);
    return { w: Math.max(340, Math.min(5200, w)), h: Math.max(220, Math.min(4200, h)) };
  }, [d.size?.h, d.size?.w]);

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={340}
        minHeight={220}
        maxWidth={5200}
        maxHeight={4200}
        onResizeEnd={(_, __, size?: any) => {
          if (!size) return;
          editor.resizeNode(id, size.width, size.height);
        }}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: 22,
          border: `2px dashed ${border}`,
          background: "rgba(255,255,255,0.22)",
          boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.10)" : "0 10px 22px rgba(0,0,0,0.06)",
          position: "relative",
          padding: 14,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(15,23,42,0.14)",
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: 0.3,
          }}
        >
          <span style={{ textTransform: "uppercase", color: "#334155" }}>{style}</span>
          <span style={{ color: "#0f172a" }}>{label}</span>
        </div>
      </div>
    </div>
  );
});

