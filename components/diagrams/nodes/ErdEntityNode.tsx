"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export type ErdEntityNodeData = {
  kind: "erd_entity";
  label: string;
  weak?: boolean;
  fields?: any[];
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

export default memo(function ErdEntityNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as ErdEntityNodeData;

  const label = String(d.label ?? "Entity");
  const weak = Boolean(d.weak);

  const fields = useMemo(() => {
    const f = Array.isArray(d.fields) ? d.fields : [];
    if (f.length) return f;
    return [
      { name: "id", type: "uuid", pk: true, nullable: false },
      { name: "name", type: "text", nullable: false },
    ];
  }, [d.fields]);

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 280);
    const h = Number(d.size?.h ?? 220);
    return { w: Math.max(220, Math.min(860, w)), h: Math.max(160, Math.min(860, h)) };
  }, [d.size?.h, d.size?.w]);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  useEffect(() => setDraft(label), [label]);

  const commit = useCallback(() => {
    const next = draft.trim() || "Entity";
    setEditing(false);
    editor.renameNode(id, next);
  }, [draft, editor, id]);

  const border = weak ? "4px double #111827" : "2px solid #111827";

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={160}
        maxWidth={860}
        maxHeight={860}
        onResizeEnd={(_, params: any) => {
          const w = Number(params?.width ?? params?.size?.width);
          const h = Number(params?.height ?? params?.size?.height);
          if (Number.isFinite(w) && Number.isFinite(h)) editor.resizeNode(id, w, h);
        }}
      />

      <div
        style={{
          width: dims.w,
          height: dims.h,
          background: "#ffffff",
          border,
          borderRadius: 16,
          boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.18)" : "0 12px 24px rgba(0,0,0,0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
        }}
      >
        <Handles />

        <div
          style={{
            padding: "10px 12px",
            background: "#fecaca",
            borderBottom: "2px solid rgba(17,24,39,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {!editing ? (
            <div
              style={{
                fontWeight: 900,
                fontSize: 14,
                color: "#0f172a",
                letterSpacing: 0.2,
                cursor: "text",
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              title="Double-click to rename entity"
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

          {weak ? (
            <div
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 900,
                color: "#92400e",
                background: "#fffbeb",
                border: "1px solid rgba(146,64,14,0.25)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
              title="Weak Entity"
            >
              weak
            </div>
          ) : null}
        </div>

        <div style={{ overflow: "auto" }}>
          {fields.map((f: any, i: number) => {
            const name = String(f.name ?? `field_${i}`);
            const type = String(f.type ?? "");
            const pk = Boolean(f.pk);
            const fk = Boolean(f.fk);

            return (
              <div
                key={`${name}_${i}`}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "7px 10px",
                  borderBottom: "1px solid rgba(15,23,42,0.10)",
                  background: i % 2 === 0 ? "#ffffff" : "#f3f4f6",
                }}
              >
                <div
                  style={{
                    width: "58%",
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#0f172a",
                    textDecoration: pk ? "underline" : "none",
                    textDecorationThickness: pk ? "2px" : undefined,
                  }}
                  title={pk ? "Primary key" : ""}
                >
                  {name}
                  {f.nullable === false ? (
                    <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(15,23,42,0.55)" }}> *</span>
                  ) : null}
                </div>
                <div style={{ width: "28%", fontSize: 12, fontWeight: 800, color: "rgba(15,23,42,0.72)" }}>
                  {type || <span style={{ color: "rgba(15,23,42,0.35)" }}>type</span>}
                </div>
                <div style={{ width: "14%", display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  {pk ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: "#eef2ff",
                        border: "1px solid rgba(79,70,229,0.25)",
                        color: "#3730a3",
                      }}
                    >
                      PK
                    </span>
                  ) : null}
                  {fk ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: "#ecfeff",
                        border: "1px solid rgba(6,182,212,0.25)",
                        color: "#155e75",
                      }}
                    >
                      FK
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
