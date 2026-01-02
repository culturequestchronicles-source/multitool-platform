"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";
import type { BpmnNodeData } from "@/lib/diagrams/bpmnRules";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

type Shape =
  | "rect"
  | "diamond"
  | "circle"
  | "parallelogram"
  | "document"
  | "cylinder"
  | "delay"
  | "smallCircle";

function shapeFor(kind: BpmnNodeData["kind"]): Shape {
  if (kind.includes("gateway")) return "diamond";
  if (kind === "fork_join") return "diamond";
  if (kind === "delay") return "delay";
  if (kind === "connector") return "smallCircle";
  if (kind === "database") return "cylinder";
  if (kind === "document") return "document";
  if (kind === "data_io") return "parallelogram";
  if (kind.endsWith("event")) return "circle";
  if (kind.startsWith("intermediate_")) return "circle";
  if (kind === "loop_start" || kind === "loop_end") return "circle";
  return "rect";
}

function subtitleFor(kind: BpmnNodeData["kind"]) {
  switch (kind) {
    case "start_event":
      return "Start Event";
    case "end_event":
      return "End Event";
    case "task":
      return "Task";
    case "subprocess":
      return "Sub-process";
    case "intermediate_message":
      return "Message Event";
    case "intermediate_timer":
      return "Timer Event";
    case "gateway_xor_split":
      return "XOR Split";
    case "gateway_xor_merge":
      return "XOR Merge";
    case "data_io":
      return "Data Input/Output";
    case "document":
      return "Document";
    case "database":
      return "Database";
    case "connector":
      return "Connector";
    case "fork_join":
      return "Fork/Join";
    case "delay":
      return "Delay";
    case "loop_start":
      return "Loop Start";
    case "loop_end":
      return "Loop End";
    default:
      return "Step";
  }
}

/**
 * ✅ IMPORTANT (for @xyflow/react v12):
 * NodeProps is no longer "NodeProps<Data>" like old reactflow.
 * So we use NodeProps without generics and type props.data manually.
 */
export default function EditableBpmnNode(props: NodeProps) {
  const editor = useDiagramEditor();

  const data = props.data as BpmnNodeData & { theme?: DiagramTheme; meta?: any; __focusGlow?: any };

  const theme: DiagramTheme =
    data?.theme ??
    editor.theme ??
    THEMES.find((t) => t.id === "paper") ??
    THEMES[0];

  const kind = data.kind;
  const isSubprocess = kind === "subprocess";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label ?? "");
  useEffect(() => setDraft(data.label ?? ""), [data.label]);

  const shape = shapeFor(kind);
  const isDiamond = shape === "diamond";
  const isCircle = shape === "circle" || shape === "smallCircle";
  const isSmallCircle = shape === "smallCircle";

  const canHaveIncoming = kind !== "start_event";
  const canHaveOutgoing = kind !== "end_event";

  const ring = useMemo(() => {
    if (kind === "start_event") return `2px solid ${theme.accent}`;
    if (kind === "end_event") return `4px solid ${theme.accent}`;
    if (kind.startsWith("intermediate_")) return `3px double ${theme.accent}`;
    if (kind === "loop_start" || kind === "loop_end") return `2px dashed ${theme.nodeBorder}`;
    return `2px solid ${theme.nodeBorder}`;
  }, [kind, theme.accent, theme.nodeBorder]);

  const focusGlow = data?.__focusGlow
    ? `0 0 0 5px rgba(0,0,0,0.14), 0 14px 30px rgba(0,0,0,0.14)`
    : undefined;

  const colorOverride = String(data?.meta?.color ?? "").trim();
  const nodeBg = /^#([0-9a-fA-F]{6})$/.test(colorOverride) ? colorOverride : theme.nodeBg;

  const baseW = isDiamond ? 120 : isSmallCircle ? 110 : isCircle ? 140 : 190;
  const basePad = isDiamond ? "22px" : "14px 16px";

  const outerStyle: React.CSSProperties = {
    color: theme.text,
    border: ring,
    background: nodeBg,
    borderRadius: isCircle ? 999 : 14,
    padding: basePad,
    minWidth: baseW,
    boxShadow: focusGlow ?? "0 10px 25px rgba(0,0,0,0.10)",
    transform: isDiamond ? "rotate(45deg)" : undefined,
    userSelect: "none",
    position: "relative",
    zIndex: 20,
  };

  // ✅ FIX: never return undefined for CSSProperties
  const clipStyle: React.CSSProperties =
    shape === "parallelogram"
      ? { clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }
      : {};

  const innerStyle: React.CSSProperties = isDiamond
    ? { transform: "rotate(-45deg)", textAlign: "center" }
    : { textAlign: "center" };

  const subtitle = subtitleFor(kind);

  const commit = () => {
    const trimmed = draft.trim();
    const next = trimmed.length ? trimmed : data.label ?? "";
    setEditing(false);
    editor.renameNode(props.id, next);
  };

  const stopRFPointer = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleStyle: React.CSSProperties = { zIndex: 30 };

  return (
    <div
      style={{ ...outerStyle, ...clipStyle }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Double-click to rename"
    >
      {(shape === "document" || shape === "cylinder" || shape === "delay") && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 }}>
          {shape === "document" && (
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" width="100%" height="100%">
              <path
                d="M2,2 H98 V50 C88,44 78,56 68,50 C58,44 48,56 38,50 C28,44 18,56 2,50 Z"
                fill="transparent"
                stroke={theme.nodeBorder}
                strokeWidth="2"
              />
            </svg>
          )}
          {shape === "cylinder" && (
            <svg viewBox="0 0 100 70" preserveAspectRatio="none" width="100%" height="100%">
              <ellipse cx="50" cy="12" rx="46" ry="10" fill="transparent" stroke={theme.nodeBorder} strokeWidth="2" />
              <path d="M4,12 V58 C4,64 96,64 96,58 V12" fill="transparent" stroke={theme.nodeBorder} strokeWidth="2" />
              <ellipse cx="50" cy="58" rx="46" ry="10" fill="transparent" stroke={theme.nodeBorder} strokeWidth="2" />
            </svg>
          )}
          {shape === "delay" && (
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" width="100%" height="100%">
              <path d="M10,10 H70 A20,20 0 0 1 70,50 H10 Z" fill="transparent" stroke={theme.nodeBorder} strokeWidth="2" />
            </svg>
          )}
        </div>
      )}

      {canHaveIncoming && (
        <>
          <Handle type="target" position={Position.Top} style={handleStyle} />
          <Handle type="target" position={Position.Left} style={handleStyle} />
          <Handle type="target" position={Position.Right} style={handleStyle} />
          <Handle type="target" position={Position.Bottom} style={handleStyle} />
        </>
      )}

      <div style={innerStyle}>
        {!editing ? (
          <div style={{ fontSize: 18, fontWeight: 800 }}>{data.label ?? ""}</div>
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
                setDraft(data.label ?? "");
                setEditing(false);
              }
            }}
            onBlur={commit}
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
      </div>

      {canHaveOutgoing && (
        <>
          <Handle type="source" position={Position.Top} style={handleStyle} />
          <Handle type="source" position={Position.Left} style={handleStyle} />
          <Handle type="source" position={Position.Right} style={handleStyle} />
          <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </>
      )}

      {isSubprocess && (
        <button
          type="button"
          onPointerDownCapture={stopRFPointer}
          onMouseDownCapture={stopRFPointer}
          onClick={(e) => {
            stopRFPointer(e);
            editor.toggleCollapsed(props.id);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            borderRadius: 999,
            border: `1px solid ${theme.nodeBorder}`,
            padding: "4px 10px",
            fontSize: 12,
            background: theme.nodeBg,
            color: theme.text,
            cursor: "pointer",
            zIndex: 40,
          }}
          title="Collapse/Expand"
        >
          {(data as any)?.collapsed ? "Expand" : "Collapse"}
        </button>
      )}
    </div>
  );
}
