"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export type OrgPersonNodeData = {
  kind: "org_person";
  name: string;
  title: string;
  department: string;
  deptColor?: string;
  avatarUrl?: string | null;
  employmentType?: "full_time" | "contractor";
  collapsed?: boolean;
  parentNodeId?: string | null;
  division?: string | null;
  group?: "core" | "staff" | null;
  size?: { w: number; h: number };
};

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
      {/* Org charts: top-down reporting. Target = top (incoming), Source = bottom (outgoing). */}
      <Handle id="t-top" type="target" position={Position.Top} style={{ ...common, top: -7, left: "50%" }} />
      <Handle id="s-bottom" type="source" position={Position.Bottom} style={{ ...src, bottom: -7, left: "50%" }} />
    </>
  );
}

export default memo(function OrgPersonNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const { data, selected, id } = props;
  const d = (data ?? {}) as Partial<OrgPersonNodeData>;

  const dept = String(d.department ?? "Department");
  const deptColor = String(d.deptColor ?? "#0f172a");
  const name = String(d.name ?? "Employee Name");
  const title = String(d.title ?? "Job Title");
  const employmentType = (d.employmentType ?? "full_time") as OrgPersonNodeData["employmentType"];
  const collapsed = Boolean((d as any)?.collapsed);

  const dims = useMemo(() => {
    const w = Number(d.size?.w ?? 260);
    const h = Number(d.size?.h ?? 120);
    return { w: Math.max(220, Math.min(520, w)), h: Math.max(110, Math.min(320, h)) };
  }, [d.size?.h, d.size?.w]);

  const [editing, setEditing] = useState<"name" | "title" | null>(null);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (editing === "name") setDraft(name);
    if (editing === "title") setDraft(title);
  }, [editing, name, title]);

  const commit = useCallback(() => {
    if (!editing) return;
    const next = draft.trim();
    const patch = editing === "name" ? { name: next || "Employee Name" } : { title: next || "Job Title" };
    setEditing(null);
    editor.updateNodeData(id, patch);
  }, [draft, editor, editing, id]);

  const shell: React.CSSProperties = {
    width: dims.w,
    height: dims.h,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#ffffff",
    boxShadow: selected ? "0 18px 36px rgba(0,0,0,0.18)" : "0 10px 22px rgba(0,0,0,0.10)",
    // Important: keep handles visible (no clipping). We clip internal content in a nested wrapper instead.
    overflow: "visible",
    position: "relative",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
    color: "#0f172a",
  };

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={110}
        maxWidth={520}
        maxHeight={320}
        onResizeEnd={(_, __, size) => editor.resizeNode(id, size.width, size.height)}
      />

      <div style={shell}>
        <Handles />

        <div style={{ borderRadius: 18, overflow: "hidden", width: "100%", height: "100%", background: "#ffffff" }}>
        {/* Department banner */}
        <div
          style={{
            height: 34,
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: deptColor,
            color: "white",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: 0.4,
          }}
        >
          <div style={{ textTransform: "uppercase" }}>{dept}</div>
          {employmentType === "contractor" ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              Contractor
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 12, padding: 12, alignItems: "center" }}>
          {/* Avatar */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: "2px solid rgba(15,23,42,0.18)",
              background: "linear-gradient(135deg, #e2e8f0, #f8fafc)",
              overflow: "hidden",
              flex: "0 0 auto",
            }}
            title="Avatar"
          >
            {d.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(d.avatarUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
          </div>

          {/* Text */}
          <div style={{ minWidth: 0, flex: 1 }}>
            {editing !== "name" ? (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditing("name");
                }}
                title="Double-click to edit name"
                style={{
                  fontWeight: 950,
                  fontSize: 14,
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "text",
                }}
              >
                {name}
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
                    setEditing(null);
                  }
                }}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.22)",
                  padding: "6px 10px",
                  fontSize: 13,
                  fontWeight: 900,
                  outline: "none",
                }}
              />
            )}

            {editing !== "title" ? (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditing("title");
                }}
                title="Double-click to edit title"
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(15,23,42,0.68)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "text",
                }}
              >
                {title}
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
                    setEditing(null);
                  }
                }}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.22)",
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 800,
                  outline: "none",
                }}
              />
            )}
          </div>
        </div>

        {/* Expand/Collapse marker */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.toggleCollapsed(id);
          }}
          title={collapsed ? "Expand branch" : "Collapse branch"}
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            width: 26,
            height: 26,
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.25)",
            background: "white",
            boxShadow: "0 8px 16px rgba(0,0,0,0.10)",
            fontWeight: 950,
            fontSize: 16,
            lineHeight: "26px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          {collapsed ? "+" : "−"}
        </button>
        </div>
      </div>
    </div>
  );
});
