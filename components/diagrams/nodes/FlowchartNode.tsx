"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

type FlowMeta = {
  color?: string;
  border?: string;
};

export type FlowchartNodeData = {
  kind: string;
  label: string;
  meta?: FlowMeta;
  size?: { w: number; h: number };
};

function classifyKind(kind: string) {
  const k = String(kind || "").toLowerCase();
  const isDecision = k.includes("decision");
  const isStartEnd = k.includes("start") || k.includes("end");
  const isDatabase = k.includes("database");
  const isData = k === "data" || k.includes("data_io") || k.includes("parallelogram");
  const isConnector = k.includes("connector");
  const isAsync = k.includes("async") || k.includes("callback") || k.includes("api_call");
  const isError = k.includes("error") || k.includes("cancel") || k.includes("timeout") || k.includes("failure");
  const isDocuments = k.includes("documents") || k.includes("document_stack") || k.includes("stacked_document");
  const isUserInput = k.includes("user_input") || k.includes("manual_input");
  const isSystemTask = k.includes("system_task") || k.includes("automated");
  return { isDecision, isStartEnd, isDatabase, isData, isConnector, isAsync, isError, isDocuments, isUserInput, isSystemTask };
}

function defaultDims(cls: ReturnType<typeof classifyKind>) {
  if (cls.isDecision) return { w: 120, h: 120 };
  if (cls.isDatabase) return { w: 190, h: 82 };
  if (cls.isStartEnd) return { w: 180, h: 72 };
  if (cls.isData) return { w: 200, h: 78 };
  if (cls.isDocuments) return { w: 220, h: 90 };
  if (cls.isAsync) return { w: 220, h: 78 };
  if (cls.isError) return { w: 220, h: 78 };
  if (cls.isUserInput) return { w: 220, h: 78 };
  if (cls.isSystemTask) return { w: 220, h: 78 };
  if (cls.isConnector) return { w: 160, h: 62 };
  return { w: 220, h: 78 };
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

export default memo(function FlowchartNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as FlowchartNodeData;

  const kind = String(d.kind ?? "process");
  const label = String(d.label ?? "Step");
  const cls = useMemo(() => classifyKind(kind), [kind]);

  const dims = useMemo(() => {
    const def = defaultDims(cls);
    const w = Number(d.size?.w ?? def.w);
    const h = Number(d.size?.h ?? def.h);
    return { w: Math.max(120, Math.min(860, w)), h: Math.max(60, Math.min(860, h)) };
  }, [cls, d.size?.h, d.size?.w]);

  const fill = d.meta?.color ?? "#e2e8f0";
  const border = d.meta?.border ?? "#0f172a";

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
    boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.18)" : "0 10px 22px rgba(0,0,0,0.10)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    zIndex: 30,
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  };

  const LabelBlock = (
    <div style={{ textAlign: "center", padding: 10, width: "100%" }}>
      {!editing ? (
        <div
          style={{
            fontWeight: 900,
            fontSize: 14,
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
            fontSize: 13,
            fontWeight: 800,
            outline: "none",
            background: "#fff",
          }}
        />
      )}

      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: "rgba(15,23,42,0.55)" }}>
        {kind.replaceAll("_", " ")}
      </div>
    </div>
  );

  const borderStyle: React.CSSProperties = cls.isAsync ? { borderStyle: "dashed", borderWidth: 2.5 } : {};

  const body = cls.isDecision ? (
    <div style={{ ...base, ...borderStyle, borderRadius: 12, transform: "rotate(45deg)" }}>
      <Handles />
      <div style={{ transform: "rotate(-45deg)" }}>{LabelBlock}</div>
    </div>
  ) : cls.isDatabase ? (
    <div style={{ ...base, ...borderStyle, borderRadius: 18, overflow: "hidden" }}>
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
          background: "rgba(255,255,255,0.30)",
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
    <div style={{ ...base, ...borderStyle, borderRadius: 18, clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}>
      <Handles />
      {LabelBlock}
    </div>
  ) : cls.isDocuments ? (
    <div style={{ position: "relative", width: dims.w + 10, height: dims.h + 10 }}>
      <div style={{ ...base, borderRadius: 18, position: "absolute", left: 8, top: 8, opacity: 0.55, zIndex: 0 }} />
      <div style={{ ...base, borderRadius: 18, position: "absolute", left: 4, top: 4, opacity: 0.75, zIndex: 10 }} />
      <div style={{ ...base, ...borderStyle, borderRadius: 18, position: "absolute", left: 0, top: 0, zIndex: 30 }}>
        <Handles />
        {LabelBlock}
      </div>
    </div>
  ) : cls.isUserInput ? (
    <div style={{ ...base, ...borderStyle, borderRadius: 18, clipPath: "polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%)" }}>
      <Handles />
      {LabelBlock}
    </div>
  ) : cls.isStartEnd ? (
    <div style={{ ...base, ...borderStyle, borderRadius: 999 }}>
      <Handles />
      {LabelBlock}
    </div>
  ) : (
    <div style={{ ...base, ...borderStyle, borderRadius: 18 }}>
      <Handles />
      {LabelBlock}
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={60}
        maxWidth={860}
        maxHeight={860}
        onResizeEnd={(_, params: any) => {
          const w = Number(params?.width ?? params?.size?.width);
          const h = Number(params?.height ?? params?.size?.height);
          if (Number.isFinite(w) && Number.isFinite(h)) editor.resizeNode(id, w, h);
        }}
      />
      {body}
    </div>
  );
});
