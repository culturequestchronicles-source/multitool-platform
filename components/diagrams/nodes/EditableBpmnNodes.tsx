"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";
import type { BpmnNodeData } from "@/lib/diagrams/bpmnRules";

function shapeFor(kind: BpmnNodeData["kind"]) {
  if (kind.includes("gateway")) return "diamond";
  if (kind.endsWith("event")) return "circle";
  if (kind.startsWith("intermediate_")) return "circle";
  return "rect";
}

type Props = NodeProps<BpmnNodeData & { theme?: DiagramTheme }> & {
  onRename?: (nodeId: string, label: string) => void;
  onToggleCollapsed?: (nodeId: string) => void;

  onCreateChild?: (nodeId: string) => void;
  onOpenChild?: (childDiagramId: string) => void;
  creatingChildFor?: string | null;
};

export default function EditableBpmnNode(props: Props) {
  const theme: DiagramTheme =
    (props.data as any)?.theme ?? THEMES.find((t) => t.id === "paper") ?? THEMES[0];

  const kind = props.data.kind;
  const isSubprocess = kind === "subprocess";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(props.data.label ?? "");
  useEffect(() => setDraft(props.data.label ?? ""), [props.data.label]);

  const shape = shapeFor(kind);
  const isDiamond = shape === "diamond";
  const isCircle = shape === "circle";

  const canHaveIncoming = kind !== "start_event";
  const canHaveOutgoing = kind !== "end_event";

  const ring = useMemo(() => {
    if (kind === "start_event") return `2px solid ${theme.accent}`;
    if (kind === "end_event") return `4px solid ${theme.accent}`;
    if (kind.startsWith("intermediate_")) return `3px double ${theme.accent}`;
    return `2px solid ${theme.nodeBorder}`;
  }, [kind, theme.accent, theme.nodeBorder]);

  const focusGlow = (props.data as any)?.__focusGlow
    ? `0 0 0 5px rgba(0,0,0,0.14), 0 14px 30px rgba(0,0,0,0.14)`
    : undefined;

  const outerStyle: React.CSSProperties = {
    color: theme.text,
    border: ring,
    background: theme.nodeBg,
    borderRadius: isCircle ? 999 : 14,
    padding: isDiamond ? "22px" : "14px 16px",
    minWidth: isDiamond ? 120 : isCircle ? 130 : 180,
    boxShadow: focusGlow ?? "0 10px 25px rgba(0,0,0,0.10)",
    transform: isDiamond ? "rotate(45deg)" : undefined,
    userSelect: "none",
    position: "relative",
    opacity: (props.data as any)?.collapsed ? 0.95 : 1,
  };

  const innerStyle: React.CSSProperties = isDiamond
    ? { transform: "rotate(-45deg)", textAlign: "center" }
    : { textAlign: "center" };

  const subtitle =
    kind === "start_event"
      ? "Start Event"
      : kind === "end_event"
      ? "End Event"
      : kind === "task"
      ? "Task"
      : kind === "subprocess"
      ? "Sub-process"
      : kind === "intermediate_message"
      ? "Message Event"
      : kind === "intermediate_timer"
      ? "Timer Event"
      : kind === "gateway_xor_split"
      ? "XOR Split"
      : "XOR Merge";

  const commit = () => {
    const trimmed = draft.trim();
    const next = trimmed.length ? trimmed : props.data.label ?? "";
    setEditing(false);
    props.onRename?.(props.id, next);
  };

  const childDiagramId = (props.data as any)?.childDiagramId as string | null | undefined;
  const isCreating = props.creatingChildFor === props.id;

  const stopAll = (e: any) => {
    e.stopPropagation();
    e.preventDefault?.();
  };

  return (
    <div
      style={outerStyle}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Double-click to rename"
    >
      {canHaveIncoming && <Handle type="target" position={Position.Top} />}

      <div style={innerStyle}>
        {kind === "intermediate_message" && (
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>✉</div>
        )}
        {kind === "intermediate_timer" && (
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>⏱</div>
        )}

        {!editing ? (
          <div style={{ fontSize: 18, fontWeight: 800 }}>{props.data.label ?? ""}</div>
        ) : (
          <input
            className="nodrag nopan"
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
                setDraft(props.data.label ?? "");
                setEditing(false);
              }
            }}
            onBlur={() => commit()}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 12,
              border: `1px solid ${theme.nodeBorder}`,
              outline: "none",
              fontSize: 16,
              fontWeight: 700,
              color: theme.text,
              background: "transparent",
              textAlign: "center",
            }}
          />
        )}

        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{subtitle}</div>

        {isSubprocess && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: isDiamond ? "translateX(-50%) rotate(-45deg)" : "translateX(-50%)",
              width: 22,
              height: 14,
              border: `2px solid ${theme.nodeBorder}`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 12,
              background: theme.nodeBg,
            }}
            title="Sub-process"
          >
            +
          </div>
        )}
      </div>

      {canHaveOutgoing && <Handle type="source" position={Position.Bottom} />}

      {isSubprocess && (
        <button
          className="nodrag nopan"
          onPointerDown={stopAll}
          onMouseDown={stopAll}
          onClick={(e) => {
            stopAll(e);
            props.onToggleCollapsed?.(props.id);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            borderRadius: 999,
            border: `1px solid ${theme.nodeBorder}`,
            padding: "4px 8px",
            fontSize: 11,
            background: theme.nodeBg,
            color: theme.text,
            cursor: "pointer",
            zIndex: 50,
          }}
          title="Collapse/Expand"
        >
          {(props.data as any)?.collapsed ? "Expand" : "Collapse"}
        </button>
      )}

      {/* ✅ Create/Open child directly on node */}
      {isSubprocess && (
        <div
          className="nodrag nopan"
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            display: "flex",
            gap: 8,
            zIndex: 50,
            pointerEvents: "all",
          }}
          onPointerDown={stopAll}
          onMouseDown={stopAll}
          onClick={stopAll}
        >
          {!childDiagramId ? (
            <button
              className="nodrag nopan"
              disabled={isCreating}
              onPointerDown={stopAll}
              onMouseDown={stopAll}
              onClick={(e) => {
                stopAll(e);
                props.onCreateChild?.(props.id);
              }}
              style={{
                borderRadius: 999,
                border: `1px solid ${theme.nodeBorder}`,
                padding: "6px 12px",
                fontSize: 12,
                background: "#000000",
                color: "#ffffff",
                opacity: isCreating ? 0.7 : 1,
                cursor: isCreating ? "not-allowed" : "pointer",
              }}
              title="Create a child diagram for this subprocess"
            >
              {isCreating ? "Creating…" : "Create child"}
            </button>
          ) : (
            <button
              className="nodrag nopan"
              onPointerDown={stopAll}
              onMouseDown={stopAll}
              onClick={(e) => {
                stopAll(e);
                props.onOpenChild?.(childDiagramId);
              }}
              style={{
                borderRadius: 999,
                border: `1px solid ${theme.nodeBorder}`,
                padding: "6px 12px",
                fontSize: 12,
                background: theme.nodeBg,
                color: theme.text,
                cursor: "pointer",
              }}
              title="Open child diagram"
            >
              Open child
            </button>
          )}
        </div>
      )}
    </div>
  );
}
