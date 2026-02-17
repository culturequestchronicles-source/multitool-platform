"use client";

import React, { memo, useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export type OrgGroupNodeData = {
  kind: "org_group";
  label: string;
  color?: string;
  size?: { w: number; h: number };
};

export default memo(function OrgGroupNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const d = (props.data ?? {}) as Partial<OrgGroupNodeData>;
  const label = String(d.label ?? "Group");
  const color = String(d.color ?? "#0f172a");

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 360);
    const h = Number(d.size?.h ?? 44);
    return { w: Math.max(220, Math.min(900, w)), h: Math.max(36, Math.min(120, h)) };
  }, [d.size?.h, d.size?.w]);

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={Boolean((props as any)?.selected)}
        minWidth={220}
        minHeight={36}
        maxWidth={900}
        maxHeight={120}
        onResizeEnd={(_, __, size) => editor.resizeNode(props.id, size.width, size.height)}
      />
      <div
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: 16,
          border: "1px solid rgba(15,23,42,0.18)",
          background: "rgba(248,250,252,0.95)",
          boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 999, background: color, marginRight: 10 }} />
        <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 13 }}>{label}</div>
      </div>
    </div>
  );
});
