"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import type { NodeProps } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";
import { getDividerPositions, moveDivider, type SwimlaneNodeData } from "@/lib/diagrams/swimlanes";

/**
 * ✅ @xyflow/react v12 NodeProps is NOT generic (unlike old reactflow).
 * So we use NodeProps without generics and cast props.data.
 * This makes it build-safe for Vercel/Next.js.
 */
export default function SwimlaneNode(props: NodeProps) {
  const editor = useDiagramEditor();

  const d = (props.data ?? {}) as SwimlaneNodeData & {
    theme?: any;
  };

  const theme = d?.theme ?? editor.theme;

  const orientation: "horizontal" | "vertical" =
    d.orientation === "vertical" ? "vertical" : "horizontal";

  const lanes: string[] =
    Array.isArray(d.lanes) && d.lanes.length ? d.lanes : ["Lane 1"];

  const laneCount = Math.max(1, lanes.length);

  const width = Number.isFinite(Number(d.width)) ? Number(d.width) : 1100;
  const height = Number.isFinite(Number(d.height)) ? Number(d.height) : 520;

  // Header + lane-name column sizing
  const headerH = 54;
  const laneNameCol = orientation === "horizontal" ? 170 : 140;

  const laneBandW =
    orientation === "vertical"
      ? (width - laneNameCol) / laneCount
      : width - laneNameCol;

  const laneBandH =
    orientation === "horizontal"
      ? (height - headerH) / laneCount
      : height - headerH;

  // Header editing
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState<string>(
    String(d.label ?? "Swim Lanes")
  );

  useEffect(() => {
    setHeaderDraft(String(d.label ?? "Swim Lanes"));
  }, [d.label]);

  // Divider positions (fractions)
  const dividerPositions = useMemo(() => getDividerPositions(d), [d]);

  const stop = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const commitHeader = useCallback(() => {
    const next = headerDraft.trim() || "Swim Lanes";
    setEditingHeader(false);

    // optional chaining so it won't crash if not implemented yet
    editor.renameSwimlaneHeader?.(props.id, next);
  }, [editor, headerDraft, props.id]);

  // Divider drag state
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        border: `2px solid ${theme.laneBorder}`,
        background: theme.laneBg,
        position: "relative",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        overflow: "hidden",
        // keep it "container-like"
        zIndex: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: headerH,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.85)",
          borderBottom: `2px solid ${theme.laneBorder}`,
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingHeader(true);
        }}
        title="Double-click to rename swimlane"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!editingHeader ? (
            <div style={{ fontWeight: 900, fontSize: 16, color: theme.text }}>
              {String(d.label ?? "Swim Lanes")}
            </div>
          ) : (
            <input
              autoFocus
              value={headerDraft}
              onChange={(e) => setHeaderDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitHeader();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setEditingHeader(false);
                  setHeaderDraft(String(d.label ?? "Swim Lanes"));
                }
              }}
              onBlur={commitHeader}
              style={{
                width: 240,
                padding: "6px 10px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                fontSize: 14,
                fontWeight: 800,
                outline: "none",
              }}
            />
          )}

          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
            {orientation === "horizontal" ? "Horizontal" : "Vertical"} •{" "}
            {laneCount} lanes
          </div>
        </div>

        {/* Lane controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onPointerDownCapture={stop}
            onMouseDownCapture={stop}
            onClick={(e) => {
              stop(e);
              editor.addLane(props.id);
            }}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
              background: "white",
            }}
            title="Add lane"
          >
            + Lane
          </button>
          <button
            onPointerDownCapture={stop}
            onMouseDownCapture={stop}
            onClick={(e) => {
              stop(e);
              editor.removeLane(props.id);
            }}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
              background: "white",
            }}
            title="Remove lane"
          >
            − Lane
          </button>
        </div>
      </div>

      {/* Lane-name column divider */}
      <div
        style={{
          position: "absolute",
          top: headerH,
          bottom: 0,
          left: laneNameCol,
          width: 2,
          background: theme.laneBorder,
        }}
      />

      {/* Lanes */}
      {lanes.map((name, idx) => {
        const isH = orientation === "horizontal";
        const top = headerH + (isH ? idx * laneBandH : 0);
        const left = isH ? 0 : laneNameCol + idx * laneBandW;

        const bandW = isH ? width : laneBandW;
        const bandH = isH ? laneBandH : height - headerH;

        const nameBox: React.CSSProperties = {
          position: "absolute",
          top,
          left: 0,
          width: laneNameCol,
          height: bandH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
          borderBottom:
            isH && idx < laneCount - 1 ? `2px solid ${theme.laneBorder}` : undefined,
          borderRight: `2px solid ${theme.laneBorder}`,
          background: "rgba(255,255,255,0.6)",
          userSelect: "none",
        };

        const contentBox: React.CSSProperties = {
          position: "absolute",
          top,
          left: isH ? laneNameCol : left,
          width: isH ? width - laneNameCol : bandW,
          height: bandH,
          borderBottom:
            isH && idx < laneCount - 1 ? `2px solid ${theme.laneBorder}` : undefined,
        };

        return (
          <React.Fragment key={idx}>
            {/* Lane name area */}
            <div
              style={nameBox}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const next = prompt("Lane name:", name);
                if (next !== null) editor.renameLane(props.id, idx, next.trim() || name);
              }}
              title="Double-click to rename lane"
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: theme.text,
                  textAlign: "center",
                  lineHeight: 1.15,
                }}
              >
                {name}
              </div>
            </div>

            {/* Lane content area */}
            <div style={contentBox} />
          </React.Fragment>
        );
      })}

      {/* Internal dividers (draggable dots) */}
      {dividerPositions.map((p: number, i: number) => {
        const isH = orientation === "horizontal";
        const x = isH ? laneNameCol + p * (width - laneNameCol) : laneNameCol;
        const y = isH ? headerH : headerH + p * (height - headerH);

        return (
          <div key={i}>
            {/* divider line */}
            <div
              style={{
                position: "absolute",
                left: isH ? x : laneNameCol,
                top: isH ? headerH : y,
                width: isH ? 2 : width - laneNameCol,
                height: isH ? height - headerH : 2,
                background: theme.laneBorder,
                opacity: 0.9,
              }}
            />

            {/* drag dot */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as any).setPointerCapture?.(e.pointerId);
                setDraggingIdx(i);
              }}
              onPointerMove={(e) => {
                if (draggingIdx !== i) return;
                e.stopPropagation();

                const container = e.currentTarget.parentElement as HTMLElement | null;
                if (!container) return;

                const rect = container.getBoundingClientRect();

                const rel = isH
                  ? (e.clientX - rect.left - laneNameCol) / (rect.width - laneNameCol)
                  : (e.clientY - rect.top - headerH) / (rect.height - headerH);

                const next = Math.min(0.95, Math.max(0.05, rel));
                const moved = moveDivider(dividerPositions, i, next);

                editor.setLaneDividerPositions(props.id, moved);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setDraggingIdx(null);
              }}
              style={{
                position: "absolute",
                left: isH ? x - 6 : laneNameCol + 10,
                top: isH ? headerH + 10 : y - 6,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: theme.accent,
                boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
                cursor: isH ? "ew-resize" : "ns-resize",
                touchAction: "none",
              }}
              title="Drag divider"
            />
          </div>
        );
      })}
    </div>
  );
}
