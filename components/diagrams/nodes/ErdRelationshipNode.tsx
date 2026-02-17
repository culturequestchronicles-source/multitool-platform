"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export type ErdRelationshipNodeData = {
  kind: "erd_relationship";
  label: string;
  identifying?: boolean;
  size?: { w: number; h: number };
};

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
      <Handle id="t-left" type="target" position={Position.Left} style={{ ...common, left: -6 }} />
      <Handle id="t-right" type="target" position={Position.Right} style={{ ...common, right: -6 }} />
      <Handle id="t-top" type="target" position={Position.Top} style={{ ...common, top: -6 }} />
      <Handle id="t-bottom" type="target" position={Position.Bottom} style={{ ...common, bottom: -6 }} />

      <Handle id="s-left" type="source" position={Position.Left} style={{ ...src, left: -6, top: "55%" }} />
      <Handle id="s-right" type="source" position={Position.Right} style={{ ...src, right: -6, top: "55%" }} />
      <Handle id="s-top" type="source" position={Position.Top} style={{ ...src, top: -6, left: "55%" }} />
      <Handle id="s-bottom" type="source" position={Position.Bottom} style={{ ...src, bottom: -6, left: "55%" }} />
    </>
  );
}

export default memo(function ErdRelationshipNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as ErdRelationshipNodeData;

  const label = String(d.label ?? "Relationship");
  const identifying = Boolean(d.identifying);

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 160);
    const h = Number(d.size?.h ?? 160);
    return { w: Math.max(120, Math.min(420, w)), h: Math.max(120, Math.min(420, h)) };
  }, [d.size?.h, d.size?.w]);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  useEffect(() => setDraft(label), [label]);

  const commit = useCallback(() => {
    const next = draft.trim() || "Relationship";
    setEditing(false);
    editor.renameNode(id, next);
  }, [draft, editor, id]);

  const border = identifying ? "4px double #111827" : "2px solid #111827";

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={120}
        maxWidth={420}
        maxHeight={420}
        onResizeEnd={(_, __, size) => editor.resizeNode(id, size.width, size.height)}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          background: "#ffffff",
          border,
          borderRadius: 14,
          transform: "rotate(45deg)",
          boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.16)" : "0 10px 20px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        <Handles />

        <div style={{ transform: "rotate(-45deg)", width: "90%", textAlign: "center" }}>
          {!editing ? (
            <div
              style={{
                fontWeight: 900,
                fontSize: 13,
                color: "#0f172a",
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
                textAlign: "center",
              }}
            />
          )}

          {identifying ? (
            <div style={{ marginTop: 6, fontSize: 11, fontWeight: 900, color: "rgba(15,23,42,0.55)" }}>
              identifying
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

