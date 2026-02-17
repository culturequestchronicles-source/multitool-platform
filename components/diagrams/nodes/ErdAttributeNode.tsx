"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export type ErdAttributeNodeData = {
  kind: "erd_attribute";
  label: string;
  key?: boolean;
  multivalued?: boolean;
  composite?: boolean;
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

export default memo(function ErdAttributeNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as ErdAttributeNodeData;

  const label = String(d.label ?? "Attribute");
  const key = Boolean(d.key);
  const multivalued = Boolean(d.multivalued);

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 200);
    const h = Number(d.size?.h ?? 90);
    return { w: Math.max(160, Math.min(520, w)), h: Math.max(70, Math.min(320, h)) };
  }, [d.size?.h, d.size?.w]);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  useEffect(() => setDraft(label), [label]);

  const commit = useCallback(() => {
    const next = draft.trim() || "Attribute";
    setEditing(false);
    editor.renameNode(id, next);
  }, [draft, editor, id]);

  const outerBorder = "2px solid #111827";
  const innerRing = multivalued ? "inset 0 0 0 3px rgba(17,24,39,0.95)" : "none";

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={70}
        maxWidth={520}
        maxHeight={320}
        onResizeEnd={(_, __, size) => editor.resizeNode(id, size.width, size.height)}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          background: "#ffffff",
          border: outerBorder,
          borderRadius: 999,
          boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.16)" : "0 10px 20px rgba(0,0,0,0.10)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
          boxSizing: "border-box",
        }}
      >
        <Handles />

        {/* Inner ring for multivalued attributes */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: 999,
            boxShadow: innerRing,
            pointerEvents: "none",
          }}
        />

        {!editing ? (
          <div
            style={{
              fontWeight: 900,
              fontSize: 14,
              color: "#0f172a",
              textAlign: "center",
              textDecoration: key ? "underline" : "none",
              textDecorationThickness: key ? "2px" : undefined,
              cursor: "text",
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
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              fontSize: 13,
              fontWeight: 800,
              outline: "none",
              textAlign: "center",
            }}
          />
        )}
      </div>
    </div>
  );
});

