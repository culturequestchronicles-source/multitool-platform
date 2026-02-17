"use client";

import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

type FlowMeta = {
  color?: string;
  border?: string;
};

type FlowNodeData = {
  kind: string;
  label: string;
  meta?: FlowMeta;
  size?: { w: number; h: number }; // ✅ persisted node size
};

function classifyKind(kind: string) {
  const k = String(kind || "").toLowerCase();
  const isDecision = k.includes("gateway") || k.includes("decision");
  const isStartEnd = k.includes("start") || k.includes("end");
  const isDatabase = k.includes("database");
  const isData = k === "data" || k.includes("data_io") || k.includes("parallelogram");
  const isConnector = k.includes("connector");
  return { isDecision, isStartEnd, isDatabase, isData, isConnector };
}

function defaultDims(cls: ReturnType<typeof classifyKind>) {
  // ✅ reduced defaults (your issue g)
  if (cls.isDecision) return { w: 110, h: 110 };
  if (cls.isDatabase) return { w: 170, h: 78 };
  if (cls.isStartEnd) return { w: 170, h: 70 };
  if (cls.isData) return { w: 170, h: 70 };
  if (cls.isConnector) return { w: 150, h: 58 };
  return { w: 170, h: 70 };
}

function Handles() {
  const common: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 999,
    border: "2px solid #111827",
    background: "#fff",
  };
  const src: React.CSSProperties = { ...common, background: "#111827" };

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

export default memo(function SwimFlowNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as FlowNodeData;

  const fill = d.meta?.color ?? "#ffffff";
  const border = d.meta?.border ?? "#0f172a";

  const kind = String(d.kind ?? "process");
  const label = String(d.label ?? "Step");
  const cls = useMemo(() => classifyKind(kind), [kind]);

  // ✅ final size = persisted size OR default dims
  const dims = useMemo(() => {
    const def = defaultDims(cls);
    const w = Number(d.size?.w ?? def.w);
    const h = Number(d.size?.h ?? def.h);
    return { w: Math.max(90, Math.min(800, w)), h: Math.max(50, Math.min(800, h)) };
  }, [cls, d.size?.w, d.size?.h]);

  // ✅ inline label editing (issue d)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  useEffect(() => setDraft(label), [label]);

  const commit = useCallback(() => {
    const next = draft.trim() || "Step";
    setEditing(false);
    editor.renameNode(id, next);
  }, [draft, editor, id]);

  const base: React.CSSProperties = {
    width: dims.w,
    height: dims.h,
    background: fill,
    border: `2px solid ${border}`,
    boxShadow: selected ? "0 14px 28px rgba(0,0,0,0.18)" : "0 10px 22px rgba(0,0,0,0.10)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    zIndex: 30,
  };

  const LabelBlock = (
    <div style={{ textAlign: "center", padding: 10, width: "100%" }}>
      {!editing ? (
        <div
          style={{
            fontWeight: 900,
            fontSize: 15,
            color: "#0f172a",
            lineHeight: 1.15,
            cursor: "text",
            padding: "2px 6px",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          title="Double-click to edit label"
        >
          {label}
        </div>
      ) : (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
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
          onBlur={commit}
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
            fontSize: 14,
            fontWeight: 800,
            outline: "none",
          }}
        />
      )}

      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: "rgba(15,23,42,0.55)" }}>
        {kind.replaceAll("_", " ")}
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {/* ✅ NodeResizer persists to data.size via editor.resizeNode (issue g foundation) */}
      <NodeResizer
        isVisible={selected}
        minWidth={90}
        minHeight={50}
        maxWidth={800}
        maxHeight={800}
        onResizeEnd={(_, __, size) => editor.resizeNode(id, size.width, size.height)}
      />

      {/* Shapes */}
      {cls.isDecision ? (
        <div style={{ ...base, borderRadius: 12, transform: "rotate(45deg)" }}>
          <Handles />
          <div style={{ transform: "rotate(-45deg)" }}>{LabelBlock}</div>
        </div>
      ) : cls.isDatabase ? (
        <div style={{ ...base, borderRadius: 18, overflow: "hidden" }}>
          <Handles />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 14,
              right: 14,
              height: 16,
              border: `2px solid ${border}`,
              borderRadius: 999,
              background: "rgba(255,255,255,0.3)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 14,
              right: 14,
              height: 16,
              border: `2px solid ${border}`,
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              opacity: 0.9,
            }}
          />
          {LabelBlock}
        </div>
      ) : cls.isData ? (
        <div style={{ ...base, borderRadius: 18, clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}>
          <Handles />
          {LabelBlock}
        </div>
      ) : cls.isStartEnd ? (
        <div style={{ ...base, borderRadius: 999 }}>
          <Handles />
          {LabelBlock}
        </div>
      ) : (
        <div style={{ ...base, borderRadius: 18 }}>
          <Handles />
          {LabelBlock}
        </div>
      )}
    </div>
  );
});
